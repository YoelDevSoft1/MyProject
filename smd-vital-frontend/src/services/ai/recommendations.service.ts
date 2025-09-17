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

export class RecommendationsService {
  private baseUrl = '/api/ai/recommendations';

  // Generar recomendaciones personalizadas para un paciente
  async generateRecommendations(patient: PatientProfile): Promise<TreatmentPlan> {
    const recommendations: Recommendation[] = [];
    
    // Análisis de edad y género
    recommendations.push(...this.getAgeBasedRecommendations(patient));
    
    // Análisis de historial médico
    recommendations.push(...this.getHistoryBasedRecommendations(patient));
    
    // Análisis de medicamentos actuales
    recommendations.push(...this.getMedicationRecommendations(patient));
    
    // Análisis de signos vitales
    recommendations.push(...this.getVitalSignsRecommendations(patient));
    
    // Análisis de alergias
    recommendations.push(...this.getAllergyRecommendations(patient));
    
    // Ordenar por prioridad y confianza
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });

    return {
      patientId: patient.id,
      recommendations: recommendations.slice(0, 10), // Top 10 recomendaciones
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      version: 1
    };
  }

  // Recomendaciones basadas en edad y género
  private getAgeBasedRecommendations(patient: PatientProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (patient.age >= 50) {
      recommendations.push({
        id: 'colorectal-screening',
        type: 'screening',
        title: 'Tamizaje de cáncer colorrectal',
        description: 'Recomendado para pacientes mayores de 50 años',
        priority: 'medium',
        confidence: 0.9,
        evidence: ['USPSTF Guidelines 2021'],
        actionRequired: true,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    if (patient.age >= 40 && patient.gender === 'female') {
      recommendations.push({
        id: 'mammography',
        type: 'screening',
        title: 'Mamografía anual',
        description: 'Screening de cáncer de mama recomendado',
        priority: 'high',
        confidence: 0.95,
        evidence: ['ACS Guidelines 2023'],
        actionRequired: true,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    if (patient.age >= 65) {
      recommendations.push({
        id: 'pneumococcal-vaccine',
        type: 'medication',
        title: 'Vacuna neumocócica',
        description: 'Protección contra neumonía neumocócica',
        priority: 'high',
        confidence: 0.85,
        evidence: ['CDC Immunization Schedule'],
        actionRequired: true
      });
    }
    
    return recommendations;
  }

  // Recomendaciones basadas en historial médico
  private getHistoryBasedRecommendations(patient: PatientProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (patient.medicalHistory.includes('diabetes')) {
      recommendations.push({
        id: 'hba1c-monitoring',
        type: 'followup',
        title: 'Monitoreo de HbA1c',
        description: 'Control trimestral de hemoglobina glicosilada',
        priority: 'high',
        confidence: 0.9,
        evidence: ['ADA Guidelines 2023'],
        actionRequired: true,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    if (patient.medicalHistory.includes('hypertension')) {
      recommendations.push({
        id: 'bp-monitoring',
        type: 'lifestyle',
        title: 'Monitoreo de presión arterial',
        description: 'Medición diaria de presión arterial en casa',
        priority: 'medium',
        confidence: 0.8,
        evidence: ['AHA Guidelines 2022'],
        actionRequired: false
      });
    }
    
    if (patient.medicalHistory.includes('heart_disease')) {
      recommendations.push({
        id: 'cardiac-rehab',
        type: 'referral',
        title: 'Rehabilitación cardíaca',
        description: 'Programa de ejercicio supervisado',
        priority: 'high',
        confidence: 0.85,
        evidence: ['AHA/ACC Guidelines'],
        actionRequired: true
      });
    }
    
    return recommendations;
  }

  // Recomendaciones basadas en medicamentos actuales
  private getMedicationRecommendations(patient: PatientProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (patient.currentMedications.includes('metformin')) {
      recommendations.push({
        id: 'b12-supplement',
        type: 'medication',
        title: 'Suplemento de vitamina B12',
        description: 'Metformina puede causar deficiencia de B12',
        priority: 'medium',
        confidence: 0.8,
        evidence: ['Diabetes Care 2022'],
        actionRequired: true
      });
    }
    
    if (patient.currentMedications.includes('warfarin')) {
      recommendations.push({
        id: 'inr-monitoring',
        type: 'followup',
        title: 'Monitoreo de INR',
        description: 'Control regular del tiempo de protrombina',
        priority: 'high',
        confidence: 0.95,
        evidence: ['ACCP Guidelines'],
        actionRequired: true,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return recommendations;
  }

  // Recomendaciones basadas en signos vitales
  private getVitalSignsRecommendations(patient: PatientProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { bloodPressure, heartRate, temperature, weight, height } = patient.vitalSigns;
    
    // Análisis de presión arterial
    if (bloodPressure.systolic >= 140 || bloodPressure.diastolic >= 90) {
      recommendations.push({
        id: 'hypertension-management',
        type: 'lifestyle',
        title: 'Manejo de hipertensión',
        description: 'Presión arterial elevada detectada',
        priority: 'high',
        confidence: 0.9,
        evidence: ['AHA Guidelines 2022'],
        actionRequired: true
      });
    }
    
    // Análisis de frecuencia cardíaca
    if (heartRate > 100) {
      recommendations.push({
        id: 'tachycardia-evaluation',
        type: 'referral',
        title: 'Evaluación de taquicardia',
        description: 'Frecuencia cardíaca elevada',
        priority: 'medium',
        confidence: 0.7,
        evidence: ['ACC/AHA Guidelines'],
        actionRequired: true
      });
    }
    
    // Análisis de IMC
    const bmi = weight / Math.pow(height / 100, 2);
    if (bmi >= 30) {
      recommendations.push({
        id: 'weight-management',
        type: 'lifestyle',
        title: 'Programa de manejo de peso',
        description: 'IMC indica obesidad',
        priority: 'medium',
        confidence: 0.8,
        evidence: ['WHO Guidelines'],
        actionRequired: false
      });
    }
    
    return recommendations;
  }

  // Recomendaciones basadas en alergias
  private getAllergyRecommendations(patient: PatientProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (patient.allergies.includes('penicillin')) {
      recommendations.push({
        id: 'penicillin-alert',
        type: 'medication',
        title: 'Alerta de alergia a penicilina',
        description: 'Evitar antibióticos del grupo de penicilinas',
        priority: 'critical',
        confidence: 1.0,
        evidence: ['Patient Medical Record'],
        actionRequired: true
      });
    }
    
    if (patient.allergies.includes('sulfa')) {
      recommendations.push({
        id: 'sulfa-alert',
        type: 'medication',
        title: 'Alerta de alergia a sulfonamidas',
        description: 'Evitar medicamentos que contengan sulfonamidas',
        priority: 'critical',
        confidence: 1.0,
        evidence: ['Patient Medical Record'],
        actionRequired: true
      });
    }
    
    return recommendations;
  }

  // Obtener recomendaciones basadas en síntomas
  async getSymptomBasedRecommendations(symptoms: string[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    if (symptoms.includes('fever')) {
      recommendations.push({
        id: 'fever-management',
        type: 'lifestyle',
        title: 'Manejo de fiebre',
        description: 'Monitoreo de temperatura y hidratación',
        priority: 'medium',
        confidence: 0.8,
        evidence: ['CDC Guidelines'],
        actionRequired: false
      });
    }
    
    if (symptoms.includes('chest_pain')) {
      recommendations.push({
        id: 'chest-pain-evaluation',
        type: 'referral',
        title: 'Evaluación de dolor torácico',
        description: 'Evaluación cardiológica urgente',
        priority: 'critical',
        confidence: 0.9,
        evidence: ['AHA Guidelines'],
        actionRequired: true
      });
    }
    
    return recommendations;
  }

  // Actualizar recomendaciones basadas en nueva información
  async updateRecommendations(patientId: string, newData: Partial<PatientProfile>): Promise<TreatmentPlan> {
    // En producción, esto actualizaría las recomendaciones existentes
    const updatedPatient = { ...newData, id: patientId } as PatientProfile;
    return this.generateRecommendations(updatedPatient);
  }

  // Obtener estadísticas de adherencia a recomendaciones
  async getAdherenceStats(patientId: string): Promise<{
    totalRecommendations: number;
    completed: number;
    pending: number;
    overdue: number;
    adherenceRate: number;
  }> {
    // Simular estadísticas de adherencia
    return {
      totalRecommendations: 15,
      completed: 10,
      pending: 3,
      overdue: 2,
      adherenceRate: 0.67
    };
  }
}

export const recommendationsService = new RecommendationsService();
