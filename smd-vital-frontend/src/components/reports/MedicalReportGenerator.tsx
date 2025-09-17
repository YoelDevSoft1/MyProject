import React, { useState } from 'react';

interface ReportConfig {
  type: 'patient_summary' | 'appointment_report' | 'medication_report' | 'vital_signs' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    patientId?: string;
    doctorId?: string;
    category?: string;
    status?: string;
  };
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeImages: boolean;
}

interface MedicalReportGeneratorProps {
  onGenerate: (config: ReportConfig) => void;
  isGenerating: boolean;
}

export const MedicalReportGenerator: React.FC<MedicalReportGeneratorProps> = ({
  onGenerate,
  isGenerating
}) => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'patient_summary',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días atrás
      end: new Date().toISOString().split('T')[0] // hoy
    },
    filters: {},
    format: 'pdf',
    includeCharts: true,
    includeImages: false
  });

  const reportTypes = [
    { value: 'patient_summary', label: 'Resumen del Paciente', description: 'Historial completo del paciente' },
    { value: 'appointment_report', label: 'Reporte de Citas', description: 'Todas las citas en un período' },
    { value: 'medication_report', label: 'Reporte de Medicamentos', description: 'Prescripciones y medicamentos' },
    { value: 'vital_signs', label: 'Signos Vitales', description: 'Evolución de signos vitales' },
    { value: 'custom', label: 'Reporte Personalizado', description: 'Configurar campos específicos' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Generador de Reportes Médicos</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Reporte
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((type) => (
              <div
                key={type.value}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  config.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('type', type.value)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={config.type === type.value}
                    onChange={() => handleInputChange('type', type.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{type.label}</h3>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rango de Fechas
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={config.dateRange.start}
                onChange={(e) => handleInputChange('dateRange', {
                  ...config.dateRange,
                  start: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fecha de Fin</label>
              <input
                type="date"
                value={config.dateRange.end}
                onChange={(e) => handleInputChange('dateRange', {
                  ...config.dateRange,
                  end: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filtros Adicionales
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">ID del Paciente</label>
              <input
                type="text"
                value={config.filters.patientId || ''}
                onChange={(e) => handleFilterChange('patientId', e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ID del Doctor</label>
              <input
                type="text"
                value={config.filters.doctorId || ''}
                onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Categoría</label>
              <select
                value={config.filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="consultation">Consulta</option>
                <option value="follow_up">Seguimiento</option>
                <option value="emergency">Emergencia</option>
                <option value="procedure">Procedimiento</option>
                <option value="vaccination">Vacunación</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Estado</label>
              <select
                value={config.filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendiente</option>
                <option value="cancelled">Cancelado</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>
        </div>

        {/* Format and Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Formato de Salida
          </label>
          <div className="flex space-x-4">
            {formatOptions.map((format) => (
              <div
                key={format.value}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  config.format === format.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('format', format.value)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={config.format === format.value}
                    onChange={() => handleInputChange('format', format.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-2">
                    <span className="text-lg mr-2">{format.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{format.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Opciones Adicionales
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeCharts"
                checked={config.includeCharts}
                onChange={(e) => handleInputChange('includeCharts', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeCharts" className="ml-2 block text-sm text-gray-700">
                Incluir gráficos y estadísticas
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeImages"
                checked={config.includeImages}
                onChange={(e) => handleInputChange('includeImages', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeImages" className="ml-2 block text-sm text-gray-700">
                Incluir imágenes y archivos adjuntos
              </label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>Generar Reporte</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
