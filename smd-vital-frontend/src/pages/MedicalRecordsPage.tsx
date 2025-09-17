import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRolePermissions } from '../hooks/useRolePermissions';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
  Stack,
  Avatar,
  Divider,
  Badge,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  LocalHospital,
  Schedule,
  Person,
  Description,
  CheckCircle,
  Pending,
  Archive,
  Medication,
  MonitorHeart,
  Height,
  Scale,
  Thermostat,
  Favorite,
} from '@mui/icons-material';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
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
  status: 'draft' | 'completed' | 'archived';
}

export const MedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    canViewMedicalRecords, 
    canCreateMedicalRecords, 
    canEditMedicalRecords, 
    canViewAllMedicalRecords,
    isPatient,
    isDoctor,
    isNurse,
    isAdmin
  } = useRolePermissions();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Datos simulados de expedientes médicos
  const medicalRecords: MedicalRecord[] = [
    {
      id: '1',
      patientId: 'patient-1',
      patientName: 'María González',
      doctorId: 'doctor-1',
      doctorName: 'Dr. Carlos López',
      date: '2024-01-15',
      type: 'consultation',
      diagnosis: 'Hipertensión arterial',
      symptoms: ['Dolor de cabeza', 'Mareos', 'Fatiga'],
      treatment: 'Control de presión arterial, dieta baja en sodio',
      medications: ['Losartán 50mg', 'Hidroclorotiazida 25mg'],
      notes: 'Paciente con hipertensión leve, requiere seguimiento mensual',
      vitalSigns: {
        bloodPressure: '140/90',
        heartRate: 85,
        temperature: 36.5,
        weight: 70,
        height: 165
      },
      status: 'completed'
    },
    {
      id: '2',
      patientId: 'patient-2',
      patientName: 'Juan Pérez',
      doctorId: 'doctor-2',
      doctorName: 'Dr. Ana Martínez',
      date: '2024-01-14',
      type: 'follow_up',
      diagnosis: 'Diabetes tipo 2',
      symptoms: ['Sed excesiva', 'Poliuria', 'Pérdida de peso'],
      treatment: 'Control glucémico, ejercicio regular',
      medications: ['Metformina 850mg'],
      notes: 'Paciente con diabetes controlada, glucosa en ayunas: 120 mg/dL',
      vitalSigns: {
        bloodPressure: '130/80',
        heartRate: 78,
        temperature: 36.2,
        weight: 75,
        height: 170
      },
      status: 'completed'
    },
    {
      id: '3',
      patientId: 'patient-3',
      patientName: 'Laura Rodríguez',
      doctorId: 'doctor-1',
      doctorName: 'Dr. Carlos López',
      date: '2024-01-13',
      type: 'emergency',
      diagnosis: 'Migraña severa',
      symptoms: ['Dolor de cabeza intenso', 'Náuseas', 'Fotofobia'],
      treatment: 'Reposo, medicación analgésica',
      medications: ['Ibuprofeno 600mg', 'Sumatriptán 50mg'],
      notes: 'Crisis migrañosa severa, paciente refiere mejoría con medicación',
      vitalSigns: {
        bloodPressure: '110/70',
        heartRate: 72,
        temperature: 36.8,
        weight: 60,
        height: 160
      },
      status: 'draft'
    }
  ];

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'primary';
      case 'follow_up': return 'success';
      case 'emergency': return 'error';
      case 'procedure': return 'secondary';
      case 'vaccination': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <LocalHospital />;
      case 'follow_up': return <Schedule />;
      case 'emergency': return <MonitorHeart />;
      case 'procedure': return <Description />;
      case 'vaccination': return <Medication />;
      default: return <Description />;
    }
  };

  // Verificar permisos usando el nuevo sistema
  const canCreateRecord = canCreateMedicalRecords;
  const canEditRecord = canEditMedicalRecords;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Registros Médicos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isPatient 
              ? 'Tu historial médico personal' 
              : isDoctor
              ? 'Gestión de expedientes médicos de tus pacientes'
              : isNurse
              ? 'Actualización de expedientes médicos'
              : isAdmin
              ? 'Administración completa de expedientes médicos'
              : 'Gestión de expedientes médicos'
            }
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 'Vista Lista' : 'Vista Grid'}
          </Button>
          {canCreateRecord && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => alert('Función de nuevo registro en desarrollo')}
            >
              Nuevo Registro
            </Button>
          )}
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por paciente, diagnóstico o doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Tipo"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">Todos los tipos</MenuItem>
              <MenuItem value="consultation">Consulta</MenuItem>
              <MenuItem value="follow_up">Seguimiento</MenuItem>
              <MenuItem value="emergency">Emergencia</MenuItem>
              <MenuItem value="procedure">Procedimiento</MenuItem>
              <MenuItem value="vaccination">Vacunación</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Estado"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
              <MenuItem value="draft">Borrador</MenuItem>
              <MenuItem value="archived">Archivado</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {filteredRecords.filter(r => r.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Pending color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {filteredRecords.filter(r => r.status === 'draft').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Borradores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Archive color="disabled" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {filteredRecords.filter(r => r.status === 'archived').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Archivados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {filteredRecords.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Records Display */}
      {filteredRecords.length > 0 ? (
        viewMode === 'grid' ? (
          <Grid container spacing={3}>
          {filteredRecords.map((record) => (
              <Grid item xs={12} sm={6} lg={4} key={record.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: `${getTypeColor(record.type)}.main`, width: 32, height: 32 }}>
                          {getTypeIcon(record.type)}
                        </Avatar>
                        <Chip
                          label={getTypeLabel(record.type)}
                          color={getTypeColor(record.type) as any}
                          size="small"
                        />
                      </Box>
                      <Chip
                        label={getStatusText(record.status)}
                        color={getStatusColor(record.status) as any}
                        size="small"
                        icon={record.status === 'completed' ? <CheckCircle /> : 
                              record.status === 'draft' ? <Pending /> : 
                              <Archive />}
                      />
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {record.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {record.doctorName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Schedule sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(record.date).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Diagnóstico:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {record.diagnosis}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Síntomas:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {record.symptoms.join(', ')}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Medicamentos:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {record.medications.join(', ')}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {canEditRecord && (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => alert('Función de editar en desarrollo')}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ID: {record.id}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper>
            <List>
              {filteredRecords.map((record, index) => (
                <React.Fragment key={record.id}>
                  <ListItem
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: `${getTypeColor(record.type)}.main` }}>
                        {getTypeIcon(record.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            {record.patientName}
                          </Typography>
                          <Chip
                            label={getTypeLabel(record.type)}
                            color={getTypeColor(record.type) as any}
                            size="small"
                          />
                          <Chip
                            label={getStatusText(record.status)}
                            color={getStatusColor(record.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {record.doctorName} • {new Date(record.date).toLocaleDateString('es-ES')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.diagnosis}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton onClick={() => setSelectedRecord(record)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {canEditRecord && (
                        <Tooltip title="Editar">
                          <IconButton onClick={() => alert('Función de editar en desarrollo')}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItem>
                  {index < filteredRecords.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Description sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No hay expedientes médicos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'No se encontraron expedientes con los filtros aplicados'
              : 'Aún no hay expedientes médicos registrados'
            }
          </Typography>
          {canCreateRecord && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => alert('Función de crear expediente en desarrollo')}
            >
              Crear primer expediente
            </Button>
          )}
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecord && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: `${getTypeColor(selectedRecord.type)}.main` }}>
                  {getTypeIcon(selectedRecord.type)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedRecord.patientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.doctorName}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Fecha:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedRecord.date).toLocaleDateString('es-ES')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Diagnóstico:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.diagnosis}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Síntomas:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.symptoms.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Tratamiento:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.treatment}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Medicamentos:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.medications.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Notas:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.notes}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Signos Vitales:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MonitorHeart color="primary" />
                        <Typography variant="body2">
                          {selectedRecord.vitalSigns.bloodPressure}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Favorite color="error" />
                        <Typography variant="body2">
                          {selectedRecord.vitalSigns.heartRate} bpm
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Thermostat color="warning" />
                        <Typography variant="body2">
                          {selectedRecord.vitalSigns.temperature}°C
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Scale color="info" />
                        <Typography variant="body2">
                          {selectedRecord.vitalSigns.weight} kg
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRecord(null)}>
                Cerrar
              </Button>
              {canEditRecord && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => {
                    setSelectedRecord(null);
                    alert('Función de editar en desarrollo');
                  }}
                >
                  Editar
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};