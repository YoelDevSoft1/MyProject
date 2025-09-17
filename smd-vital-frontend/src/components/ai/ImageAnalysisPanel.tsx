import React, { useState } from 'react';
import { imageAnalysisService } from '../../services/ai/imageAnalysis.service';

interface MedicalImage {
  id: string;
  type: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'ecg' | 'lab';
  url: string;
  patientId: string;
  uploadedAt: string;
}

interface ImageAnalysisResult {
  findings: string[];
  confidence: number;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  metadata: {
    imageType: string;
    analysisDate: string;
    processingTime: number;
  };
}

export const ImageAnalysisPanel: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<MedicalImage[]>([]);

  // Simular imágenes cargadas
  const mockImages: MedicalImage[] = [
    {
      id: '1',
      type: 'xray',
      url: '/api/images/xray-1.jpg',
      patientId: 'patient-1',
      uploadedAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'ecg',
      url: '/api/images/ecg-1.jpg',
      patientId: 'patient-1',
      uploadedAt: new Date().toISOString()
    },
    {
      id: '3',
      type: 'lab',
      url: '/api/images/lab-1.jpg',
      patientId: 'patient-1',
      uploadedAt: new Date().toISOString()
    }
  ];

  const handleImageSelect = (image: MedicalImage) => {
    setSelectedImage(image);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const result = await imageAnalysisService.analyzeImage(selectedImage);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'xray': return '🫁';
      case 'ct': return '🧠';
      case 'mri': return '🔬';
      case 'ultrasound': return '👶';
      case 'ecg': return '💓';
      case 'lab': return '🧪';
      default: return '📷';
    }
  };

  const getImageTypeName = (type: string) => {
    switch (type) {
      case 'xray': return 'Radiografía';
      case 'ct': return 'Tomografía';
      case 'mri': return 'Resonancia';
      case 'ultrasound': return 'Ultrasonido';
      case 'ecg': return 'Electrocardiograma';
      case 'lab': return 'Laboratorio';
      default: return 'Imagen';
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
          Análisis de Imágenes Médicas con IA
        </h2>
        
        {/* Selector de imágenes */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Seleccionar Imagen para Análisis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockImages.map((image) => (
              <div
                key={image.id}
                onClick={() => handleImageSelect(image)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedImage?.id === image.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getImageTypeIcon(image.type)}</span>
                  <div>
                    <div className="font-medium">{getImageTypeName(image.type)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de análisis */}
        {selectedImage && (
          <div className="mb-6">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
            </button>
          </div>
        )}

        {/* Resultados del análisis */}
        {analysisResult && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resultados del Análisis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo de imagen:</span>
                  <div>{analysisResult.metadata.imageType}</div>
                </div>
                <div>
                  <span className="font-medium">Confianza:</span>
                  <div>{(analysisResult.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="font-medium">Tiempo de procesamiento:</span>
                  <div>{analysisResult.metadata.processingTime}ms</div>
                </div>
              </div>
            </div>

            {/* Hallazgos */}
            <div className={`border rounded-lg p-4 ${getUrgencyColor(analysisResult.urgency)}`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">{getUrgencyIcon(analysisResult.urgency)}</span>
                <h4 className="font-semibold">Hallazgos Principales</h4>
              </div>
              <ul className="space-y-1">
                {analysisResult.findings.map((finding, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recomendaciones */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Recomendaciones</h4>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-blue-600">→</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Este análisis es generado por IA y debe ser revisado por un profesional médico. 
                No reemplaza la interpretación médica experta.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
