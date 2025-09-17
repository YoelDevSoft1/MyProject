import React, { useState } from 'react';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
  }[];
  notes: string;
  status: 'active' | 'completed' | 'cancelled';
  validUntil: Date;
}

interface PrescriptionFormProps {
  prescription?: Prescription;
  onClose: () => void;
  onSave: (prescription: Prescription) => void;
  user: any;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  prescription,
  onClose,
  onSave,
  user
}) => {
  const [formData, setFormData] = useState({
    patientName: prescription?.patientName || '',
    notes: prescription?.notes || '',
    validUntil: prescription?.validUntil ? 
      new Date(prescription.validUntil).toISOString().split('T')[0] : 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
    medications: prescription?.medications || []
  });

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const frequencyOptions = [
    { value: 'once_daily', label: 'Una vez al día' },
    { value: 'twice_daily', label: 'Dos veces al día' },
    { value: 'three_times_daily', label: 'Tres veces al día' },
    { value: 'four_times_daily', label: 'Cuatro veces al día' },
    { value: 'every_6_hours', label: 'Cada 6 horas' },
    { value: 'every_8_hours', label: 'Cada 8 horas' },
    { value: 'every_12_hours', label: 'Cada 12 horas' },
    { value: 'as_needed', label: 'Según necesidad' }
  ];

  const durationOptions = [
    { value: '3_days', label: '3 días' },
    { value: '5_days', label: '5 días' },
    { value: '7_days', label: '7 días' },
    { value: '10_days', label: '10 días' },
    { value: '14_days', label: '14 días' },
    { value: '21_days', label: '21 días' },
    { value: '30_days', label: '30 días' },
    { value: '60_days', label: '60 días' },
    { value: '90_days', label: '90 días' },
    { value: 'ongoing', label: 'Continuo' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicationChange = (field: string, value: any) => {
    setNewMedication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim()) {
      const medication = {
        id: Date.now().toString(),
        ...newMedication,
        name: newMedication.name.trim()
      };

      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, medication]
      }));

      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1
      });
    }
  };

  const removeMedication = (id: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newPrescription: Prescription = {
        id: prescription?.id || Date.now().toString(),
        patientId: prescription?.patientId || 'p1',
        patientName: formData.patientName,
        doctorId: user?.id || 'd1',
        doctorName: user?.name || 'Dr. Usuario',
        date: prescription?.date || new Date(),
        medications: formData.medications,
        notes: formData.notes,
        status: prescription?.status || 'active',
        validUntil: new Date(formData.validUntil)
      };

      onSave(newPrescription);
    } catch (error) {
      console.error('Error saving prescription:', error);
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
              {prescription ? 'Editar Prescripción' : 'Nueva Prescripción Médica'}
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
                Paciente
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válida hasta
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Medications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medicamentos</h3>
            
            {/* Add New Medication */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Agregar Medicamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Medicamento
                  </label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => handleMedicationChange('name', e.target.value)}
                    placeholder="Ej: Paracetamol"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosis
                  </label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => handleMedicationChange('dosage', e.target.value)}
                    placeholder="Ej: 500mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => handleMedicationChange('frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración
                  </label>
                  <select
                    value={newMedication.duration}
                    onChange={(e) => handleMedicationChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMedication.quantity}
                    onChange={(e) => handleMedicationChange('quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addMedication}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrucciones Especiales
                </label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => handleMedicationChange('instructions', e.target.value)}
                  rows={2}
                  placeholder="Ej: Tomar con alimentos, evitar alcohol..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-3">
              {formData.medications.map((medication) => (
                <div key={medication.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium text-gray-900">{medication.name}</h4>
                        <span className="text-sm text-gray-500">{medication.dosage}</span>
                        <span className="text-sm text-blue-600">
                          {frequencyOptions.find(f => f.value === medication.frequency)?.label}
                        </span>
                        <span className="text-sm text-green-600">
                          {durationOptions.find(d => d.value === medication.duration)?.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          Cantidad: {medication.quantity}
                        </span>
                      </div>
                      {medication.instructions && (
                        <p className="text-sm text-gray-600 italic">
                          Instrucciones: {medication.instructions}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedication(medication.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notas adicionales sobre la prescripción..."
            />
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
              disabled={isSubmitting || formData.medications.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Prescripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
