"""
Medical Knowledge Base
"""

from typing import Dict, List, Optional, Any

class MedicalKnowledgeBase:
    """Medical knowledge base for AI service"""
    
    def __init__(self):
        self.symptoms_db = self._load_symptoms_database()
        self.diseases_db = self._load_diseases_database()
        self.medications_db = self._load_medications_database()
    
    def _load_symptoms_database(self) -> Dict[str, Any]:
        """Load symptoms database"""
        return {
            "cardiovascular": [
                "dolor en el pecho", "dificultad para respirar", "palpitaciones",
                "mareos", "desmayos", "hinchazón en las piernas", "fatiga"
            ],
            "respiratory": [
                "tos", "dificultad para respirar", "sibilancia", "dolor en el pecho",
                "fiebre", "escalofríos", "fatiga", "pérdida de apetito"
            ],
            "gastrointestinal": [
                "dolor abdominal", "náuseas", "vómitos", "diarrea", "estreñimiento",
                "acidez estomacal", "pérdida de apetito", "sangre en las heces"
            ]
        }
    
    def _load_diseases_database(self) -> Dict[str, Any]:
        """Load diseases database"""
        return {
            "cardiovascular": {
                "hipertensión": {
                    "symptoms": ["dolor de cabeza", "mareos", "fatiga"],
                    "risk_factors": ["edad", "obesidad", "sedentarismo", "tabaquismo"]
                },
                "diabetes": {
                    "symptoms": ["sed excesiva", "micción frecuente", "fatiga", "visión borrosa"],
                    "risk_factors": ["obesidad", "historia familiar", "sedentarismo"]
                }
            }
        }
    
    def _load_medications_database(self) -> Dict[str, Any]:
        """Load medications database"""
        return {
            "analgesics": {
                "acetaminofén": {
                    "indications": ["dolor", "fiebre"],
                    "dose_adult": "500-1000mg cada 6-8 horas",
                    "contraindications": ["enfermedad hepática severa"]
                }
            }
        }
    
    def get_symptoms_by_category(self, category: str) -> List[str]:
        """Get symptoms by category"""
        return self.symptoms_db.get(category, [])
    
    def get_disease_info(self, disease: str) -> Optional[Dict[str, Any]]:
        """Get disease information"""
        for category, diseases in self.diseases_db.items():
            if disease in diseases:
                return diseases[disease]
        return None