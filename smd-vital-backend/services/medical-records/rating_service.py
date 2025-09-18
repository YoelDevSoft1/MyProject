"""
SMD VITAL - Rating Service
Servicio para manejo de calificaciones de doctores con agregaciones optimizadas
"""

import uuid
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

@dataclass
class DoctorRating:
    id: str
    doctor_id: str
    patient_id: str
    appointment_id: str
    rating: int
    comment: Optional[str]
    categories: Dict[str, int]
    created_at: datetime
    is_verified: bool

@dataclass
class RatingAggregate:
    doctor_id: str
    total_ratings: int
    average_rating: float
    rating_distribution: Dict[str, int]
    category_averages: Dict[str, float]
    confidence_score: float
    last_updated: datetime

class RatingService:
    def __init__(self, db, redis_client=None, event_bus=None):
        self.db = db
        self.redis = redis_client
        self.event_bus = event_bus
        self.cache_ttl = 3600  # 1 hora
    
    async def submit_rating(
        self,
        doctor_id: str,
        patient_id: str,
        appointment_id: str,
        rating: int,
        comment: str = "",
        categories: Optional[Dict[str, int]] = None
    ) -> DoctorRating:
        """
        Enviar calificación de un doctor
        """
        try:
            # Validar rating
            if not (1 <= rating <= 5):
                raise ValueError("Rating must be between 1 and 5")
            
            # Verificar que la cita esté completada
            appointment = await self._verify_appointment_completed(appointment_id)
            if not appointment:
                raise ValueError("Can only rate completed appointments")
            
            # Verificar que el paciente sea el correcto
            if appointment['patient_id'] != patient_id:
                raise ValueError("Patient ID does not match appointment")
            
            # Verificar que el doctor sea el correcto
            if appointment['doctor_id'] != doctor_id:
                raise ValueError("Doctor ID does not match appointment")
            
            # Verificar que no se haya calificado ya
            existing_rating = await self._get_existing_rating(appointment_id)
            if existing_rating:
                raise ValueError("Appointment already rated")
            
            # Crear calificación
            rating_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            query = """
                INSERT INTO doctor_ratings (
                    id, doctor_id, patient_id, appointment_id,
                    rating, comment, categories, created_at, is_verified
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) RETURNING *
            """
            
            values = (
                rating_id, doctor_id, patient_id, appointment_id,
                rating, comment, json.dumps(categories or {}), now, True
            )
            
            result = await self.db.fetch_one(query, values)
            
            if result:
                doctor_rating = DoctorRating(
                    id=result['id'],
                    doctor_id=result['doctor_id'],
                    patient_id=result['patient_id'],
                    appointment_id=result['appointment_id'],
                    rating=result['rating'],
                    comment=result['comment'],
                    categories=json.loads(result['categories']),
                    created_at=result['created_at'],
                    is_verified=result['is_verified']
                )
                
                # Actualizar agregaciones (el trigger se encarga de esto)
                # Pero también podemos disparar un evento
                if self.event_bus:
                    await self.event_bus.publish('rating.submitted', {
                        'rating_id': rating_id,
                        'doctor_id': doctor_id,
                        'rating': rating,
                        'categories': categories or {}
                    })
                
                # Invalidar caché del doctor
                await self._invalidate_doctor_cache(doctor_id)
                
                logger.info(f"Rating submitted: {rating_id} for doctor {doctor_id}")
                return doctor_rating
            else:
                raise Exception("Failed to submit rating")
                
        except Exception as e:
            logger.error(f"Error submitting rating: {e}")
            raise
    
    async def get_doctor_ratings(
        self, 
        doctor_id: str, 
        limit: int = 50,
        verified_only: bool = True
    ) -> List[DoctorRating]:
        """
        Obtener calificaciones de un doctor
        """
        try:
            base_query = "SELECT * FROM doctor_ratings WHERE doctor_id = %s"
            params = [doctor_id]
            
            if verified_only:
                base_query += " AND is_verified = TRUE"
            
            base_query += " ORDER BY created_at DESC LIMIT %s"
            params.append(limit)
            
            results = await self.db.fetch_all(base_query, params)
            
            ratings = []
            for result in results:
                rating = DoctorRating(
                    id=result['id'],
                    doctor_id=result['doctor_id'],
                    patient_id=result['patient_id'],
                    appointment_id=result['appointment_id'],
                    rating=result['rating'],
                    comment=result['comment'],
                    categories=json.loads(result['categories']),
                    created_at=result['created_at'],
                    is_verified=result['is_verified']
                )
                ratings.append(rating)
            
            return ratings
            
        except Exception as e:
            logger.error(f"Error getting doctor ratings: {e}")
            raise
    
    async def get_doctor_rating_aggregate(self, doctor_id: str) -> Optional[RatingAggregate]:
        """
        Obtener agregaciones de calificaciones de un doctor
        """
        try:
            # Intentar obtener desde caché
            cache_key = f"doctor_rating_aggregate:{doctor_id}"
            if self.redis:
                cached_data = await self.redis.get(cache_key)
                if cached_data:
                    data = json.loads(cached_data)
                    return RatingAggregate(
                        doctor_id=data['doctor_id'],
                        total_ratings=data['total_ratings'],
                        average_rating=data['average_rating'],
                        rating_distribution=data['rating_distribution'],
                        category_averages=data['category_averages'],
                        confidence_score=data['confidence_score'],
                        last_updated=datetime.fromisoformat(data['last_updated'])
                    )
            
            # Obtener desde base de datos
            query = "SELECT * FROM doctor_rating_aggregates WHERE doctor_id = %s"
            result = await self.db.fetch_one(query, [doctor_id])
            
            if result:
                aggregate = RatingAggregate(
                    doctor_id=result['doctor_id'],
                    total_ratings=result['total_ratings'],
                    average_rating=float(result['average_rating']),
                    rating_distribution=result['rating_distribution'],
                    category_averages=result['category_averages'],
                    confidence_score=float(result['confidence_score']),
                    last_updated=result['last_updated']
                )
                
                # Cachear resultado
                if self.redis:
                    cache_data = {
                        'doctor_id': aggregate.doctor_id,
                        'total_ratings': aggregate.total_ratings,
                        'average_rating': aggregate.average_rating,
                        'rating_distribution': aggregate.rating_distribution,
                        'category_averages': aggregate.category_averages,
                        'confidence_score': aggregate.confidence_score,
                        'last_updated': aggregate.last_updated.isoformat()
                    }
                    await self.redis.setex(cache_key, self.cache_ttl, json.dumps(cache_data))
                
                return aggregate
            return None
            
        except Exception as e:
            logger.error(f"Error getting doctor rating aggregate: {e}")
            raise
    
    async def get_top_rated_doctors(
        self, 
        specialty: Optional[str] = None,
        min_ratings: int = 5,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Obtener doctores mejor calificados
        """
        try:
            # Construir query con JOIN a users para obtener especialidad
            base_query = """
                SELECT 
                    dra.doctor_id,
                    dra.average_rating,
                    dra.total_ratings,
                    dra.confidence_score,
                    u.first_name,
                    u.last_name,
                    u.specialty
                FROM doctor_rating_aggregates dra
                JOIN users u ON dra.doctor_id = u.id
                WHERE dra.total_ratings >= %s
            """
            params = [min_ratings]
            
            if specialty:
                base_query += " AND u.specialty = %s"
                params.append(specialty)
            
            base_query += " ORDER BY dra.average_rating DESC, dra.confidence_score DESC LIMIT %s"
            params.append(limit)
            
            results = await self.db.fetch_all(base_query, params)
            
            doctors = []
            for result in results:
                doctor = {
                    'doctor_id': result['doctor_id'],
                    'name': f"Dr. {result['first_name']} {result['last_name']}",
                    'specialty': result['specialty'],
                    'average_rating': float(result['average_rating']),
                    'total_ratings': result['total_ratings'],
                    'confidence_score': float(result['confidence_score'])
                }
                doctors.append(doctor)
            
            return doctors
            
        except Exception as e:
            logger.error(f"Error getting top rated doctors: {e}")
            raise
    
    async def get_rating_statistics(self) -> Dict[str, Any]:
        """
        Obtener estadísticas generales de calificaciones
        """
        try:
            # Estadísticas generales
            stats_query = """
                SELECT 
                    COUNT(*) as total_ratings,
                    AVG(rating) as average_rating,
                    COUNT(DISTINCT doctor_id) as rated_doctors,
                    COUNT(DISTINCT patient_id) as rating_patients
                FROM doctor_ratings 
                WHERE is_verified = TRUE
            """
            
            stats_result = await self.db.fetch_one(stats_query)
            
            # Distribución de ratings
            distribution_query = """
                SELECT rating, COUNT(*) as count
                FROM doctor_ratings 
                WHERE is_verified = TRUE
                GROUP BY rating
                ORDER BY rating
            """
            
            distribution_results = await self.db.fetch_all(distribution_query)
            
            distribution = {str(i): 0 for i in range(1, 6)}
            for result in distribution_results:
                distribution[str(result['rating'])] = result['count']
            
            return {
                'total_ratings': stats_result['total_ratings'],
                'average_rating': float(stats_result['average_rating']) if stats_result['average_rating'] else 0,
                'rated_doctors': stats_result['rated_doctors'],
                'rating_patients': stats_result['rating_patients'],
                'rating_distribution': distribution
            }
            
        except Exception as e:
            logger.error(f"Error getting rating statistics: {e}")
            raise
    
    async def update_doctor_aggregates(self, doctor_id: str) -> bool:
        """
        Actualizar agregaciones de un doctor específico
        """
        try:
            # Llamar a la función de PostgreSQL
            await self.db.execute(
                "SELECT update_doctor_rating_aggregates(%s)",
                [doctor_id]
            )
            
            # Invalidar caché
            await self._invalidate_doctor_cache(doctor_id)
            
            logger.info(f"Updated aggregates for doctor: {doctor_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating doctor aggregates: {e}")
            raise
    
    async def _verify_appointment_completed(self, appointment_id: str) -> Optional[Dict[str, Any]]:
        """
        Verificar que la cita esté completada
        """
        query = """
            SELECT patient_id, doctor_id, status 
            FROM appointments 
            WHERE id = %s AND status = 'completed'
        """
        result = await self.db.fetch_one(query, [appointment_id])
        return result
    
    async def _get_existing_rating(self, appointment_id: str) -> Optional[Dict[str, Any]]:
        """
        Verificar si ya existe una calificación para esta cita
        """
        query = "SELECT id FROM doctor_ratings WHERE appointment_id = %s"
        result = await self.db.fetch_one(query, [appointment_id])
        return result
    
    async def _invalidate_doctor_cache(self, doctor_id: str):
        """
        Invalidar caché del doctor
        """
        if self.redis:
            cache_key = f"doctor_rating_aggregate:{doctor_id}"
            await self.redis.delete(cache_key)
    
    def calculate_confidence_score(self, total_ratings: int, average_rating: float) -> float:
        """
        Calcular score de confianza usando Bayesian average
        """
        if total_ratings == 0:
            return 0.0
        
        # Bayesian average con prior de 3.5 y peso de 10
        prior_mean = 3.5
        prior_weight = 10
        
        bayesian_avg = (prior_weight * prior_mean + total_ratings * average_rating) / (prior_weight + total_ratings)
        
        # Confidence basado en número de ratings (0-1)
        confidence = min(1.0, total_ratings / 50.0)
        
        return round(confidence, 2)
