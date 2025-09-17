import React from 'react';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  type: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'vaccination';
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: string[];
  notes: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  status: 'draft' | 'completed' | 'archived';
}

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onEdit: () => void;
  onView: () => void;
  canEdit: boolean;
  userRole: string;
}

export const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  onEdit,
  onView,
  canEdit,
  userRole
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '🩺';
      case 'follow_up': return '🔄';
      case 'emergency': return '🚨';
      case 'procedure': return '⚕️';
      case 'vaccination': return '💉';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'vaccination': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'follow_up': return 'Seguimiento';
      case 'emergency': return 'Emergencia';
      case 'procedure': return 'Procedimiento';
      case 'vaccination': return 'Vacunación';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTypeIcon(record.type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900">
                {userRole === 'patient' ? record.doctorName : record.patientName}
              </h3>
              <p className="text-sm text-gray-600">
                {userRole === 'patient' ? 'Doctor' : 'Paciente'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.type)}`}>
              {getTypeLabel(record.type)}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
              {getStatusLabel(record.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📅</span>
          <span>{formatDate(record.date)}</span>
        </div>

        {/* Diagnosis */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Diagnóstico</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{record.diagnosis}</p>
        </div>

        {/* Symptoms */}
        {record.symptoms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Síntomas</h4>
            <div className="flex flex-wrap gap-1">
              {record.symptoms.slice(0, 3).map((symptom, index) => (
                <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {symptom}
                </span>
              ))}
              {record.symptoms.length > 3 && (
                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  +{record.symptoms.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Medications */}
        {record.medications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Medicamentos</h4>
            <div className="flex flex-wrap gap-1">
              {record.medications.slice(0, 2).map((medication, index) => (
                <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  {medication}
                </span>
              ))}
              {record.medications.length > 2 && (
                <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  +{record.medications.length - 2} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Vital Signs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Presión:</span>
            <span className="font-medium">{record.vitalSigns.bloodPressure}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pulso:</span>
            <span className="font-medium">{record.vitalSigns.heartRate} bpm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Temp:</span>
            <span className="font-medium">{record.vitalSigns.temperature}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Peso:</span>
            <span className="font-medium">{record.vitalSigns.weight} kg</span>
          </div>
        </div>

        {/* Attachments */}
        {record.attachments.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📎</span>
            <span>{record.attachments.length} archivo(s) adjunto(s)</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between items-center">
          <button
            onClick={onView}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>👁️</span>
            <span>Ver detalles</span>
          </button>
          {canEdit && (
            <button
              onClick={onEdit}
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>✏️</span>
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
