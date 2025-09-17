import React, { useState, useEffect } from 'react';
import { symptomAnalysisService } from '../../services/ai/symptomAnalysis.service';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: number;
  frequency: 'constant' | 'intermittent' | 'occasional';
}

interface DiagnosisSuggestion {
  condition: string;
  probability: number;
  description: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export const SymptomAnalyzer: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState<Partial<Symptom>>({});
  const [suggestions, setSuggestions] = useState<DiagnosisSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [commonSymptoms, setCommonSymptoms] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    setCommonSymptoms(symptomAnalysisService.getCommonSymptoms());
  }, []);

  const handleAddSymptom = () => {
    if (currentSymptom.id && currentSymptom.severity && currentSymptom.duration && currentSymptom.frequency) {
      setSymptoms([...symptoms, currentSymptom as Symptom]);
      setCurrentSymptom({});
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const results = await symptomAnalysisService.analyzeSymptoms(symptoms);
      setSuggestions(results);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Analizador de Síntomas con IA
        </h2>
        
        {/* Formulario para agregar síntomas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Síntoma
            </label>
            <select
              value={currentSymptom.id || ''}
              onChange={(e) => setCurrentSymptom({...currentSymptom, id: e.target.value, name: commonSymptoms.find(s => s.id === e.target.value)?.name || ''})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar síntoma</option>
              {commonSymptoms.map(symptom => (
                <option key={symptom.id} value={symptom.id}>
                  {symptom.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severidad
            </label>
            <select
              value={currentSymptom.severity || ''}
              onChange={(e) => setCurrentSymptom({...currentSymptom, severity: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="mild">Leve</option>
              <option value="moderate">Moderada</option>
              <option value="severe">Severa</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (días)
            </label>
            <input
              type="number"
              min="1"
              value={currentSymptom.duration || ''}
              onChange={(e) => setCurrentSymptom({...currentSymptom, duration: parseInt(e.target.value) || 0})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia
            </label>
            <select
              value={currentSymptom.frequency || ''}
              onChange={(e) => setCurrentSymptom({...currentSymptom, frequency: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="constant">Constante</option>
              <option value="intermittent">Intermittente</option>
              <option value="occasional">Ocasional</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleAddSymptom}
          disabled={!currentSymptom.id || !currentSymptom.severity || !currentSymptom.duration || !currentSymptom.frequency}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar Síntoma
        </button>
      </div>

      {/* Lista de síntomas agregados */}
      {symptoms.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Síntomas Agregados ({symptoms.length})
          </h3>
          <div className="space-y-2">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex-1">
                  <span className="font-medium">{symptom.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({symptom.severity}, {symptom.duration} días, {symptom.frequency})
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSymptom(index)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
          </button>
        </div>
      )}

      {/* Resultados del análisis */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sugerencias de Diagnóstico
          </h3>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getUrgencyColor(suggestion.urgency)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getUrgencyIcon(suggestion.urgency)}</span>
                    <h4 className="font-semibold">{suggestion.condition}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(suggestion.probability * 100).toFixed(1)}% probabilidad
                    </div>
                    <div className="text-xs capitalize">
                      {suggestion.urgency} urgencia
                    </div>
                  </div>
                </div>
                
                <p className="text-sm mb-3">{suggestion.description}</p>
                
                <div>
                  <h5 className="font-medium text-sm mb-2">Recomendaciones:</h5>
                  <ul className="text-sm space-y-1">
                    {suggestion.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Estas sugerencias son generadas por IA y deben ser validadas por un profesional médico. 
              No reemplazan la consulta médica profesional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
