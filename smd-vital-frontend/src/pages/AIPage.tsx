import React, { useState } from 'react';
import { SymptomAnalyzer } from '../components/ai/SymptomAnalyzer';
import { ImageAnalysisPanel } from '../components/ai/ImageAnalysisPanel';
import { RecommendationsPanel } from '../components/ai/RecommendationsPanel';

export const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'images' | 'recommendations'>('symptoms');

  const tabs = [
    { id: 'symptoms', name: 'Análisis de Síntomas', icon: '🔍' },
    { id: 'images', name: 'Análisis de Imágenes', icon: '🖼️' },
    { id: 'recommendations', name: 'Recomendaciones IA', icon: '🤖' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Inteligencia Artificial Médica
          </h1>
          <p className="text-gray-600">
            Herramientas de IA para asistir en diagnósticos, análisis de imágenes y recomendaciones personalizadas
          </p>
        </div>

        {/* Navegación por pestañas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'symptoms' && (
          <div className="p-6">
            <SymptomAnalyzer />
          </div>
        )}

        {activeTab === 'images' && (
          <div className="p-6">
            <ImageAnalysisPanel />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="p-6">
            <RecommendationsPanel />
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ℹ️ Información Importante
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Disclamer:</strong> Las herramientas de IA en SMD Vital están diseñadas para asistir a los profesionales médicos, 
            no para reemplazar su juicio clínico. Todas las recomendaciones y análisis deben ser revisados y validados por un médico calificado.
          </p>
          <p>
            <strong>Precisión:</strong> Los algoritmos de IA se basan en patrones de datos médicos, pero pueden no ser 100% precisos 
            en todos los casos. Siempre considere el contexto clínico completo del paciente.
          </p>
          <p>
            <strong>Privacidad:</strong> Todos los datos médicos son procesados de forma segura y confidencial, 
            cumpliendo con las regulaciones de protección de datos médicos.
          </p>
        </div>
      </div>
    </div>
  );
};
