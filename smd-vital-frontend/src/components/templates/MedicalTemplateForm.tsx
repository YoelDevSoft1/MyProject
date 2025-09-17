import React, { useState } from 'react';

interface MedicalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'vaccination';
  sections: {
    id: string;
    title: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date';
    required: boolean;
    options?: string[];
    placeholder?: string;
    defaultValue?: any;
  }[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  usageCount: number;
}

interface MedicalTemplateFormProps {
  template?: MedicalTemplate;
  onClose: () => void;
  onSave: (template: MedicalTemplate) => void;
  user: any;
}

export const MedicalTemplateForm: React.FC<MedicalTemplateFormProps> = ({
  template,
  onClose,
  onSave,
  user
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'consultation',
    isPublic: template?.isPublic || false,
    sections: template?.sections || []
  });

  const [newSection, setNewSection] = useState({
    title: '',
    type: 'text' as const,
    required: false,
    options: [] as string[],
    placeholder: '',
    defaultValue: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    { value: 'consultation', label: 'Consulta General' },
    { value: 'follow_up', label: 'Seguimiento' },
    { value: 'emergency', label: 'Emergencia' },
    { value: 'procedure', label: 'Procedimiento' },
    { value: 'vaccination', label: 'Vacunación' }
  ];

  const fieldTypeOptions = [
    { value: 'text', label: 'Texto' },
    { value: 'textarea', label: 'Área de Texto' },
    { value: 'select', label: 'Selección' },
    { value: 'checkbox', label: 'Casilla de Verificación' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Fecha' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionChange = (field: string, value: any) => {
    setNewSection(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSection = () => {
    if (newSection.title.trim()) {
      const section = {
        id: Date.now().toString(),
        ...newSection,
        title: newSection.title.trim()
      };

      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, section]
      }));

      setNewSection({
        title: '',
        type: 'text',
        required: false,
        options: [],
        placeholder: '',
        defaultValue: ''
      });
    }
  };

  const removeSection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id)
    }));
  };

  const updateSection = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const addOption = (sectionId: string, option: string) => {
    if (option.trim()) {
      updateSection(sectionId, 'options', [
        ...(formData.sections.find(s => s.id === sectionId)?.options || []),
        option.trim()
      ]);
    }
  };

  const removeOption = (sectionId: string, optionIndex: number) => {
    const section = formData.sections.find(s => s.id === sectionId);
    if (section) {
      const newOptions = section.options?.filter((_, index) => index !== optionIndex) || [];
      updateSection(sectionId, 'options', newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newTemplate: MedicalTemplate = {
        id: template?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        sections: formData.sections,
        createdBy: user?.id || 'd1',
        createdAt: template?.createdAt || new Date(),
        isPublic: formData.isPublic,
        usageCount: template?.usageCount || 0
      };

      onSave(newTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {template ? 'Editar Plantilla' : 'Nueva Plantilla Médica'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Plantilla
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe el propósito de esta plantilla..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Plantilla pública (visible para otros usuarios)
            </label>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Campos de la Plantilla</h3>
            
            {/* Add New Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Agregar Campo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Campo
                  </label>
                  <input
                    type="text"
                    value={newSection.title}
                    onChange={(e) => handleSectionChange('title', e.target.value)}
                    placeholder="Ej: Presión Arterial"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Campo
                  </label>
                  <select
                    value={newSection.type}
                    onChange={(e) => handleSectionChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fieldTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={newSection.placeholder}
                    onChange={(e) => handleSectionChange('placeholder', e.target.value)}
                    placeholder="Ej: 120/80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addSection}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={newSection.required}
                  onChange={(e) => handleSectionChange('required', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                  Campo obligatorio
                </label>
              </div>
            </div>

            {/* Current Sections */}
            <div className="space-y-3">
              {formData.sections.map((section) => (
                <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        <span className="text-sm text-blue-600">
                          {fieldTypeOptions.find(t => t.value === section.type)?.label}
                        </span>
                        {section.required && (
                          <span className="text-sm text-red-600">Obligatorio</span>
                        )}
                      </div>
                      {section.placeholder && (
                        <p className="text-sm text-gray-500">
                          Placeholder: {section.placeholder}
                        </p>
                      )}
                      {section.type === 'select' && section.options && section.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">Opciones:</p>
                          <div className="flex flex-wrap gap-1">
                            {section.options.map((option, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {option}
                                <button
                                  type="button"
                                  onClick={() => removeOption(section.id, index)}
                                  className="ml-1 text-blue-500 hover:text-blue-700"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.sections.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
