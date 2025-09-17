import React, { useState, useEffect } from 'react';
import { recommendationsService } from '../../services/ai/recommendations.service';

interface PatientProfile {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitalSigns: {
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
  lastAppointment: string;
}

interface Recommendation {
  id: string;
  type: 'medication' | 'lifestyle' | 'screening' | 'followup' | 'referral';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  evidence: string[];
  actionRequired: boolean;
  deadline?: string;
}

interface TreatmentPlan {
  patientId: string;
  recommendations: Recommendation[];
  generatedAt: string;
  validUntil: string;
  version: number;
}

export const RecommendationsPanel: React.FC = () => {
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    id: 'patient-1',
    age: 45,
    gender: 'male',
    medicalHistory: ['diabetes', 'hypertension'],
    currentMedications: ['metformin', 'lisinopril'],
    allergies: ['penicillin'],
    vitalSigns: {
      bloodPressure: { systolic: 145, diastolic: 90 },
      heartRate: 85,
      temperature: 36.5,
      weight: 80,
      height: 175
    },
    lastAppointment: new Date().toISOString()
  });

  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adherenceStats, setAdherenceStats] = useState<any>(null);

  useEffect(() => {
    generateRecommendations();
    loadAdherenceStats();
  }, []);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const plan = await recommendationsService.generateRecommendations(patientProfile);
      setTreatmentPlan(plan);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadAdherenceStats = async () => {
    try {
      const stats = await recommendationsService.getAdherenceStats(patientProfile.id);
      setAdherenceStats(stats);
    } catch (error) {
      console.error('Error loading adherence stats:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'lifestyle': return '🏃';
      case 'screening': return '🔍';
      case 'followup': return '📅';
      case 'referral': return '👨‍⚕️';
      default: return '📋';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'medication': return 'Medicamento';
      case 'lifestyle': return 'Estilo de Vida';
      case 'screening': return 'Tamizaje';
      case 'followup': return 'Seguimiento';
      case 'referral': return 'Referencia';
      default: return 'General';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Perfil del paciente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Perfil del Paciente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Edad</span>
            <div className="text-lg font-semibold">{patientProfile.age} años</div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Género</span>
            <div className="text-lg font-semibold capitalize">{patientProfile.gender}</div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">IMC</span>
            <div className="text-lg font-semibold">
              {(patientProfile.vitalSigns.weight / Math.pow(patientProfile.vitalSigns.height / 100, 2)).toFixed(1)}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Presión Arterial</span>
            <div className="text-lg font-semibold">
              {patientProfile.vitalSigns.bloodPressure.systolic}/{patientProfile.vitalSigns.bloodPressure.diastolic}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de adherencia */}
      {adherenceStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estadísticas de Adherencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{adherenceStats.totalRecommendations}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{adherenceStats.completed}</div>
              <div className="text-sm text-gray-500">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{adherenceStats.pending}</div>
              <div className="text-sm text-gray-500">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{adherenceStats.overdue}</div>
              <div className="text-sm text-gray-500">Vencidas</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tasa de adherencia</span>
              <span>{(adherenceStats.adherenceRate * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${adherenceStats.adherenceRate * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Plan de tratamiento */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Plan de Tratamiento Inteligente
          </h3>
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : 'Actualizar'}
          </button>
        </div>

        {treatmentPlan && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Generado el {formatDate(treatmentPlan.generatedAt)} • 
              Válido hasta {formatDate(treatmentPlan.validUntil)} • 
              Versión {treatmentPlan.version}
            </div>

            {treatmentPlan.recommendations.map((recommendation, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
                    <span className="text-lg">{getPriorityIcon(recommendation.priority)}</span>
                    <h4 className="font-semibold">{recommendation.title}</h4>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {getTypeName(recommendation.type)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(recommendation.confidence * 100).toFixed(1)}% confianza
                    </div>
                    {recommendation.deadline && (
                      <div className={`text-xs ${
                        isOverdue(recommendation.deadline) ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {isOverdue(recommendation.deadline) ? 'Vencido' : 'Vence'} {formatDate(recommendation.deadline)}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm mb-3">{recommendation.description}</p>
                
                {recommendation.evidence.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-1">Evidencia:</h5>
                    <div className="text-xs text-gray-600">
                      {recommendation.evidence.join(', ')}
                    </div>
                  </div>
                )}

                {recommendation.actionRequired && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-sm text-blue-800">
                      <strong>Acción requerida:</strong> Esta recomendación requiere atención inmediata.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
