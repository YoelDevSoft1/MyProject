import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PrescriptionForm } from '../components/prescriptions/PrescriptionForm';
import { MedicalTemplateForm } from '../components/templates/MedicalTemplateForm';
import { AlertSystem } from '../components/alerts/AlertSystem';
import { MedicalReportGenerator } from '../components/reports/MedicalReportGenerator';

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

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'appointment' | 'medication' | 'test_result' | 'system' | 'patient';
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Date;
}

export const MedicalAdvancedPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'templates' | 'alerts' | 'reports'>('prescriptions');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Datos de ejemplo
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      patientId: 'p1',
      patientName: 'María González',
      doctorId: 'd1',
      doctorName: 'Dr. Juan Pérez',
      date: new Date(),
      medications: [
        {
          id: 'm1',
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'three_times_daily',
          duration: '7_days',
          instructions: 'Tomar con alimentos',
          quantity: 21
        }
      ],
      notes: 'Tratamiento para dolor de cabeza',
      status: 'active',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [templates, setTemplates] = useState<MedicalTemplate[]>([
    {
      id: '1',
      name: 'Consulta General',
      description: 'Plantilla para consultas médicas generales',
      category: 'consultation',
      sections: [
        {
          id: 's1',
          title: 'Motivo de Consulta',
          type: 'textarea',
          required: true,
          placeholder: 'Describa el motivo de la consulta...'
        },
        {
          id: 's2',
          title: 'Presión Arterial',
          type: 'text',
          required: false,
          placeholder: '120/80'
        }
      ],
      createdBy: 'd1',
      createdAt: new Date(),
      isPublic: true,
      usageCount: 15
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Medicamento por Agotarse',
      message: 'El Paracetamol de María González se agotará en 3 días',
      timestamp: new Date(),
      isRead: false,
      priority: 'high',
      category: 'medication',
      actionRequired: true,
      actionUrl: '/prescriptions/1'
    },
    {
      id: '2',
      type: 'info',
      title: 'Cita Programada',
      message: 'Tienes una cita con Juan Pérez mañana a las 10:00 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      priority: 'medium',
      category: 'appointment',
      actionRequired: false
    }
  ]);

  const handleSavePrescription = (prescription: Prescription) => {
    if (prescription.id) {
      setPrescriptions(prev => prev.map(p => p.id === prescription.id ? prescription : p));
    } else {
      setPrescriptions(prev => [...prev, { ...prescription, id: Date.now().toString() }]);
    }
    setShowPrescriptionForm(false);
  };

  const handleSaveTemplate = (template: MedicalTemplate) => {
    if (template.id) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates(prev => [...prev, { ...template, id: Date.now().toString() }]);
    }
    setShowTemplateForm(false);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleAlertAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert?.actionUrl) {
      // Navegar a la URL de acción
      console.log('Navegando a:', alert.actionUrl);
    }
  };

  const handleGenerateReport = async (config: any) => {
    setIsGeneratingReport(true);
    // Simular generación de reporte
    setTimeout(() => {
      setIsGeneratingReport(false);
      alert('Reporte generado exitosamente');
    }, 3000);
  };

  const tabs = [
    { id: 'prescriptions', label: 'Prescripciones', icon: '💊' },
    { id: 'templates', label: 'Plantillas', icon: '📋' },
    { id: 'alerts', label: 'Alertas', icon: '🔔' },
    { id: 'reports', label: 'Reportes', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionalidades Médicas Avanzadas</h1>
          <p className="text-gray-600">
            Herramientas profesionales para la gestión médica
          </p>
        </div>
      </div>

      {/* Tabs */}
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
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Prescripciones Médicas</h2>
              <button
                onClick={() => setShowPrescriptionForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Nueva Prescripción</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{prescription.patientName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Dr. {prescription.doctorName}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Válida hasta: {new Date(prescription.validUntil).toLocaleDateString()}
                  </p>
                  <div className="space-y-1">
                    {prescription.medications.map((med) => (
                      <div key={med.id} className="text-sm text-gray-700">
                        <span className="font-medium">{med.name}</span>
                        <span className="text-gray-500 ml-2">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Plantillas Médicas</h2>
              <button
                onClick={() => setShowTemplateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Nueva Plantilla</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className="text-xs text-gray-500">
                      {template.usageCount} usos
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.sections.length} campos
                    </span>
                    {template.isPublic && (
                      <span className="text-xs text-blue-600">Pública</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Sistema de Alertas</h2>
            <AlertSystem
              alerts={alerts}
              onMarkAsRead={handleMarkAlertAsRead}
              onDismiss={handleDismissAlert}
              onAction={handleAlertAction}
            />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Generador de Reportes</h2>
            <MedicalReportGenerator
              onGenerate={handleGenerateReport}
              isGenerating={isGeneratingReport}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showPrescriptionForm && (
        <PrescriptionForm
          onClose={() => setShowPrescriptionForm(false)}
          onSave={handleSavePrescription}
          user={user}
        />
      )}

      {showTemplateForm && (
        <MedicalTemplateForm
          onClose={() => setShowTemplateForm(false)}
          onSave={handleSaveTemplate}
          user={user}
        />
      )}
    </div>
  );
};
