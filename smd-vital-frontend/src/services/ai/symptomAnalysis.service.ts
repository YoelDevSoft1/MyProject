interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: number; // en días
  frequency: 'constant' | 'intermittent' | 'occasional';
}

interface DiagnosisSuggestion {
  condition: string;
  probability: number;
  description: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface VitalSigns {
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
}

export class SymptomAnalysisService {
  private baseUrl = '/api/ai/symptom-analysis';

  // Base de datos de síntomas y condiciones médicas
  private symptomDatabase = {
    'fever': {
      name: 'Fiebre',
      conditions: [
        { condition: 'Infección viral', probability: 0.7, urgency: 'medium' },
        { condition: 'Infección bacteriana', probability: 0.6, urgency: 'high' },
        { condition: 'Gripe', probability: 0.8, urgency: 'low' }
      ]
    },
    'headache': {
      name: 'Dolor de cabeza',
      conditions: [
        { condition: 'Migraña', probability: 0.6, urgency: 'low' },
        { condition: 'Tensión muscular', probability: 0.7, urgency: 'low' },
        { condition: 'Hipertensión', probability: 0.4, urgency: 'medium' }
      ]
    },
    'chest_pain': {
      name: 'Dolor en el pecho',
      conditions: [
        { condition: 'Angina de pecho', probability: 0.5, urgency: 'high' },
        { condition: 'Infarto de miocardio', probability: 0.3, urgency: 'critical' },
        { condition: 'Reflujo gastroesofágico', probability: 0.6, urgency: 'low' }
      ]
    },
    'shortness_breath': {
      name: 'Dificultad para respirar',
      conditions: [
        { condition: 'Asma', probability: 0.7, urgency: 'high' },
        { condition: 'Neumonía', probability: 0.6, urgency: 'high' },
        { condition: 'Ansiedad', probability: 0.5, urgency: 'low' }
      ]
    }
  };

  // Analizar síntomas y sugerir diagnósticos
  async analyzeSymptoms(symptoms: Symptom[], vitalSigns?: VitalSigns): Promise<DiagnosisSuggestion[]> {
    try {
      // Simular análisis con IA (en producción sería una llamada real a la API)
      const suggestions: DiagnosisSuggestion[] = [];
      
      // Analizar cada síntoma
      for (const symptom of symptoms) {
        const symptomData = this.symptomDatabase[symptom.id as keyof typeof this.symptomDatabase];
        if (symptomData) {
          for (const condition of symptomData.conditions) {
            // Ajustar probabilidad basada en severidad y duración
            let adjustedProbability = condition.probability;
            
            if (symptom.severity === 'severe') adjustedProbability += 0.2;
            if (symptom.severity === 'mild') adjustedProbability -= 0.1;
            if (symptom.duration > 7) adjustedProbability += 0.1;
            if (symptom.frequency === 'constant') adjustedProbability += 0.1;
            
            // Ajustar basado en signos vitales
            if (vitalSigns) {
              if (symptom.id === 'fever' && vitalSigns.temperature > 38.5) {
                adjustedProbability += 0.2;
              }
              if (symptom.id === 'chest_pain' && vitalSigns.heartRate > 100) {
                adjustedProbability += 0.15;
              }
            }
            
            // Asegurar que la probabilidad esté entre 0 y 1
            adjustedProbability = Math.min(1, Math.max(0, adjustedProbability));
            
            suggestions.push({
              condition: condition.condition,
              probability: adjustedProbability,
              description: this.getConditionDescription(condition.condition),
              recommendations: this.getRecommendations(condition.condition, symptom.severity),
              urgency: this.calculateUrgency(condition.urgency, symptom.severity, vitalSigns)
            });
          }
        }
      }
      
      // Ordenar por probabilidad y urgencia
      return suggestions
        .sort((a, b) => {
          if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
          if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
          return b.probability - a.probability;
        })
        .slice(0, 5); // Top 5 sugerencias
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw new Error('Error al analizar síntomas');
    }
  }

  // Obtener descripción de condición médica
  private getConditionDescription(condition: string): string {
    const descriptions: Record<string, string> = {
      'Infección viral': 'Infección causada por un virus que puede afectar diferentes partes del cuerpo.',
      'Infección bacteriana': 'Infección causada por bacterias que puede requerir tratamiento con antibióticos.',
      'Gripe': 'Enfermedad viral común que afecta el sistema respiratorio.',
      'Migraña': 'Dolor de cabeza intenso que puede estar acompañado de náuseas y sensibilidad a la luz.',
      'Tensión muscular': 'Dolor causado por tensión en los músculos del cuello y hombros.',
      'Hipertensión': 'Presión arterial elevada que puede causar dolores de cabeza.',
      'Angina de pecho': 'Dolor en el pecho causado por reducción del flujo sanguíneo al corazón.',
      'Infarto de miocardio': 'Ataque al corazón causado por bloqueo del flujo sanguíneo.',
      'Reflujo gastroesofágico': 'Retorno del ácido estomacal al esófago.',
      'Asma': 'Condición crónica que afecta las vías respiratorias.',
      'Neumonía': 'Infección que inflama los alvéolos pulmonares.',
      'Ansiedad': 'Trastorno de ansiedad que puede causar síntomas físicos.'
    };
    
    return descriptions[condition] || 'Condición médica que requiere evaluación profesional.';
  }

  // Obtener recomendaciones basadas en la condición
  private getRecommendations(condition: string, severity: string): string[] {
    const recommendations: Record<string, string[]> = {
      'Infección viral': [
        'Descansar adecuadamente',
        'Mantener hidratación',
        'Usar medicamentos para reducir la fiebre',
        'Consultar si los síntomas empeoran'
      ],
      'Infección bacteriana': [
        'Consultar médico inmediatamente',
        'Posible tratamiento con antibióticos',
        'Monitorear la temperatura',
        'Descansar y mantener hidratación'
      ],
      'Gripe': [
        'Reposo en cama',
        'Líquidos abundantes',
        'Medicamentos antivirales si es necesario',
        'Evitar contacto con otras personas'
      ],
      'Migraña': [
        'Descansar en habitación oscura',
        'Aplicar compresas frías',
        'Evitar desencadenantes conocidos',
        'Considerar medicamentos preventivos'
      ],
      'Angina de pecho': [
        'Buscar atención médica inmediata',
        'Evitar actividad física intensa',
        'Tomar medicamentos prescritos',
        'Monitorear signos vitales'
      ],
      'Infarto de miocardio': [
        'LLAMAR AL 911 INMEDIATAMENTE',
        'No conducir al hospital',
        'Masticar aspirina si está disponible',
        'Mantener calma y descansar'
      ]
    };
    
    return recommendations[condition] || [
      'Consultar con un profesional médico',
      'Monitorear síntomas',
      'Buscar atención si empeora'
    ];
  }

  // Calcular urgencia basada en múltiples factores
  private calculateUrgency(baseUrgency: string, severity: string, vitalSigns?: VitalSigns): 'low' | 'medium' | 'high' | 'critical' {
    let urgency = baseUrgency;
    
    // Ajustar por severidad del síntoma
    if (severity === 'severe' && urgency === 'low') urgency = 'medium';
    if (severity === 'severe' && urgency === 'medium') urgency = 'high';
    
    // Ajustar por signos vitales críticos
    if (vitalSigns) {
      if (vitalSigns.temperature > 40 || vitalSigns.heartRate > 120 || vitalSigns.oxygenSaturation < 90) {
        if (urgency === 'low') urgency = 'medium';
        if (urgency === 'medium') urgency = 'high';
        if (urgency === 'high') urgency = 'critical';
      }
    }
    
    return urgency as 'low' | 'medium' | 'high' | 'critical';
  }

  // Obtener síntomas comunes para autocompletado
  getCommonSymptoms(): Array<{id: string, name: string}> {
    return Object.entries(this.symptomDatabase).map(([id, data]) => ({
      id,
      name: data.name
    }));
  }

  // Analizar patrones en historial médico
  async analyzeMedicalHistory(patientId: string): Promise<{
    riskFactors: string[];
    recommendations: string[];
    alerts: string[];
  }> {
    // Simular análisis de historial médico
    return {
      riskFactors: [
        'Historial familiar de diabetes',
        'Presión arterial elevada',
        'Fumador activo'
      ],
      recommendations: [
        'Monitoreo regular de glucosa',
        'Control de presión arterial',
        'Programa de cesación tabáquica'
      ],
      alerts: [
        'Riesgo cardiovascular elevado',
        'Necesita seguimiento endocrinológico'
      ]
    };
  }
}

export const symptomAnalysisService = new SymptomAnalysisService();
