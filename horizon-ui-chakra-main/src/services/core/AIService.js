/**
 * SMD VITAL - Servicio de IA Médica Avanzado
 * ===========================================
 * 
 * Servicio completo para inteligencia artificial médica
 * con análisis de síntomas, diagnósticos asistidos y recomendaciones.
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import apiService from '../apiService';

class AIService {
  constructor() {
    this.models = {
      symptom_analysis: 'gpt-4-medical',
      diagnosis_assistance: 'claude-3-medical',
      treatment_recommendations: 'gpt-4-medical',
      drug_interactions: 'specialized-medical-ai'
    };
    this.cache = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
  }

  // =====================================================
  // 1. ANÁLISIS DE SÍNTOMAS
  // =====================================================

  /**
   * Analizar síntomas con IA
   */
  async analyzeSymptoms(symptoms, patientContext = {}) {
    try {
      const cacheKey = `symptoms_${JSON.stringify(symptoms)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const analysisData = {
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
        patient_context: {
          age: patientContext.age,
          gender: patientContext.gender,
          medical_history: patientContext.medical_history || [],
          current_medications: patientContext.current_medications || [],
          allergies: patientContext.allergies || []
        },
        analysis_type: 'symptom_analysis',
        model: this.models.symptom_analysis
      };

      const response = await apiService.post('/ai/analyze-symptoms', analysisData);
      const result = response.data;

      // Cachear resultado
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  }

  /**
   * Obtener posibles diagnósticos basados en síntomas
   */
  async getPossibleDiagnoses(symptoms, patientContext = {}) {
    try {
      const analysis = await this.analyzeSymptoms(symptoms, patientContext);
      
      return {
        possible_diagnoses: analysis.diagnoses || [],
        confidence_scores: analysis.confidence || [],
        urgency_level: analysis.urgency || 'low',
        recommendations: analysis.recommendations || [],
        follow_up_questions: analysis.follow_up_questions || [],
        analysis_id: analysis.analysis_id
      };
    } catch (error) {
      console.error('Error getting possible diagnoses:', error);
      throw error;
    }
  }

  // =====================================================
  // 2. ASISTENCIA EN DIAGNÓSTICO
  // =====================================================

  /**
   * Asistir en diagnóstico médico
   */
  async assistDiagnosis(clinicalData) {
    try {
      const {
        symptoms,
        vital_signs,
        lab_results,
        medical_history,
        physical_examination,
        patient_demographics
      } = clinicalData;

      const diagnosisData = {
        clinical_presentation: {
          symptoms: symptoms || [],
          vital_signs: vital_signs || {},
          physical_examination: physical_examination || {}
        },
        lab_results: lab_results || [],
        patient_history: {
          medical_history: medical_history || [],
          demographics: patient_demographics || {}
        },
        analysis_type: 'diagnosis_assistance',
        model: this.models.diagnosis_assistance
      };

      const response = await apiService.post('/ai/assist-diagnosis', diagnosisData);
      return response.data;
    } catch (error) {
      console.error('Error assisting diagnosis:', error);
      throw error;
    }
  }

  /**
   * Generar preguntas de seguimiento para diagnóstico
   */
  async generateFollowUpQuestions(diagnosisContext) {
    try {
      const response = await apiService.post('/ai/follow-up-questions', {
        current_diagnosis: diagnosisContext.current_diagnosis,
        symptoms: diagnosisContext.symptoms,
        patient_responses: diagnosisContext.patient_responses || {},
        model: this.models.diagnosis_assistance
      });

      return response.data;
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      throw error;
    }
  }

  // =====================================================
  // 3. RECOMENDACIONES DE TRATAMIENTO
  // =====================================================

  /**
   * Generar recomendaciones de tratamiento
   */
  async generateTreatmentRecommendations(treatmentData) {
    try {
      const {
        diagnosis,
        patient_profile,
        contraindications,
        preferences
      } = treatmentData;

      const treatmentRequest = {
        diagnosis: diagnosis,
        patient_profile: {
          age: patient_profile.age,
          gender: patient_profile.gender,
          weight: patient_profile.weight,
          allergies: patient_profile.allergies || [],
          current_medications: patient_profile.current_medications || [],
          medical_conditions: patient_profile.medical_conditions || []
        },
        contraindications: contraindications || [],
        treatment_preferences: preferences || {},
        analysis_type: 'treatment_recommendations',
        model: this.models.treatment_recommendations
      };

      const response = await apiService.post('/ai/treatment-recommendations', treatmentRequest);
      return response.data;
    } catch (error) {
      console.error('Error generating treatment recommendations:', error);
      throw error;
    }
  }

  /**
   * Verificar interacciones medicamentosas
   */
  async checkDrugInteractions(medications) {
    try {
      const response = await apiService.post('/ai/drug-interactions', {
        medications: medications,
        model: this.models.drug_interactions
      });

      return response.data;
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      throw error;
    }
  }

  // =====================================================
  // 4. CHAT MÉDICO INTELIGENTE
  // =====================================================

  /**
   * Iniciar sesión de chat médico
   */
  async startMedicalChat(patientId, initialContext = {}) {
    try {
      const response = await apiService.post('/ai/chat/sessions', {
        patient_id: patientId,
        initial_context: initialContext,
        session_type: 'medical_consultation'
      });

      const session = response.data;
      
      // Cachear sesión
      this.setCache(`session_${session.id}`, session);

      return session;
    } catch (error) {
      console.error('Error starting medical chat:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje al chat médico
   */
  async sendChatMessage(sessionId, message, context = {}) {
    try {
      const response = await apiService.post(`/ai/chat/sessions/${sessionId}/messages`, {
        message: message,
        context: context,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de chat
   */
  async getChatHistory(sessionId) {
    try {
      const response = await apiService.get(`/ai/chat/sessions/${sessionId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Cerrar sesión de chat
   */
  async endMedicalChat(sessionId) {
    try {
      const response = await apiService.post(`/ai/chat/sessions/${sessionId}/end`);
      
      // Limpiar cache
      this.cache.delete(`session_${sessionId}`);
      
      return response.data;
    } catch (error) {
      console.error('Error ending medical chat:', error);
      throw error;
    }
  }

  // =====================================================
  // 5. ANÁLISIS DE IMÁGENES MÉDICAS
  // =====================================================

  /**
   * Analizar imagen médica
   */
  async analyzeMedicalImage(imageData, imageType, analysisType = 'general') {
    try {
      const response = await apiService.post('/ai/analyze-image', {
        image_data: imageData,
        image_type: imageType, // 'xray', 'ct', 'mri', 'ultrasound', 'photo'
        analysis_type: analysisType,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing medical image:', error);
      throw error;
    }
  }

  /**
   * Detectar anomalías en imagen
   */
  async detectAnomalies(imageData, imageType) {
    try {
      const analysis = await this.analyzeMedicalImage(imageData, imageType, 'anomaly_detection');
      
      return {
        anomalies_detected: analysis.anomalies || [],
        confidence_scores: analysis.confidence || [],
        recommendations: analysis.recommendations || [],
        analysis_metadata: analysis.metadata || {}
      };
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  // =====================================================
  // 6. PREDICCIÓN Y ALERTAS
  // =====================================================

  /**
   * Predecir riesgo de complicaciones
   */
  async predictComplicationRisk(patientData, condition) {
    try {
      const response = await apiService.post('/ai/predict-complications', {
        patient_data: patientData,
        condition: condition,
        prediction_type: 'complication_risk'
      });

      return response.data;
    } catch (error) {
      console.error('Error predicting complication risk:', error);
      throw error;
    }
  }

  /**
   * Generar alertas médicas
   */
  async generateMedicalAlerts(patientData, thresholds = {}) {
    try {
      const response = await apiService.post('/ai/generate-alerts', {
        patient_data: patientData,
        alert_thresholds: thresholds,
        alert_types: ['vital_signs', 'medication', 'appointment', 'lab_results']
      });

      return response.data;
    } catch (error) {
      console.error('Error generating medical alerts:', error);
      throw error;
    }
  }

  // =====================================================
  // 7. EDUCACIÓN MÉDICA Y RECURSOS
  // =====================================================

  /**
   * Generar contenido educativo personalizado
   */
  async generateEducationalContent(patientProfile, topics) {
    try {
      const response = await apiService.post('/ai/educational-content', {
        patient_profile: patientProfile,
        topics: topics,
        content_type: 'personalized_education',
        language: patientProfile.preferred_language || 'es'
      });

      return response.data;
    } catch (error) {
      console.error('Error generating educational content:', error);
      throw error;
    }
  }

  /**
   * Obtener recursos médicos relevantes
   */
  async getRelevantResources(condition, patientLevel = 'patient') {
    try {
      const response = await apiService.get('/ai/resources', {
        params: {
          condition: condition,
          level: patientLevel,
          language: 'es'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting relevant resources:', error);
      return [];
    }
  }

  // =====================================================
  // 8. REPORTES Y ANALYTICS
  // =====================================================

  /**
   * Generar reporte de consulta con IA
   */
  async generateConsultationReport(consultationData) {
    try {
      const response = await apiService.post('/ai/generate-report', {
        consultation_data: consultationData,
        report_type: 'consultation_summary',
        include_recommendations: true,
        include_educational_content: true
      });

      return response.data;
    } catch (error) {
      console.error('Error generating consultation report:', error);
      throw error;
    }
  }

  /**
   * Obtener analytics de uso de IA
   */
  async getAIAnalytics(period = '30d') {
    try {
      const response = await apiService.get(`/ai/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error getting AI analytics:', error);
      return {
        total_queries: 0,
        successful_queries: 0,
        failed_queries: 0,
        average_response_time: 0,
        most_common_queries: [],
        user_satisfaction: 0
      };
    }
  }

  // =====================================================
  // 9. CONFIGURACIÓN Y PERSONALIZACIÓN
  // =====================================================

  /**
   * Configurar modelo de IA
   */
  async configureAIModel(modelType, configuration) {
    try {
      const response = await apiService.post('/ai/configure-model', {
        model_type: modelType,
        configuration: configuration
      });

      // Actualizar configuración local
      if (this.models[modelType]) {
        this.models[modelType] = configuration.model_name;
      }

      return response.data;
    } catch (error) {
      console.error('Error configuring AI model:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración actual
   */
  async getAIConfiguration() {
    try {
      const response = await apiService.get('/ai/configuration');
      return response.data;
    } catch (error) {
      console.error('Error getting AI configuration:', error);
      return this.models;
    }
  }

  // =====================================================
  // 10. UTILIDADES Y CACHE
  // =====================================================

  /**
   * Obtener del cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.sessionTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Guardar en cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpiar cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Obtener modelos disponibles
   */
  getAvailableModels() {
    return Object.keys(this.models);
  }

  /**
   * Verificar estado del servicio de IA
   */
  async checkAIHealth() {
    try {
      const response = await apiService.get('/ai/health');
      return response.data;
    } catch (error) {
      console.error('Error checking AI health:', error);
      return {
        status: 'unavailable',
        models: {},
        last_check: new Date().toISOString()
      };
    }
  }
}

// Instancia singleton
const aiService = new AIService();

export default aiService;
