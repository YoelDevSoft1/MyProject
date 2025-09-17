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
  Tabs,
  Tab,
  Alert,
  Stack,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRowParams,
  GridFilterModel,
  GridSortModel,
} from '@mui/x-data-grid';
import {
  CalendarToday,
  List as ListIcon,
  Add,
  CheckCircle,
  Cancel,
  Edit,
  Visibility,
  Schedule,
  Warning,
} from '@mui/icons-material';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Datos simulados de citas médicas
  const appointments = [
    {
      id: '1',
      patient_name: 'María González',
      doctor_name: 'Dr. Carlos López',
      appointment_date: '2024-01-20',
      appointment_time: '09:00',
      status: 'confirmed',
      reason: 'Consulta general',
      priority: 'normal',
      age: 45,
      phone: '+57 300 123 4567',
      email: 'maria.gonzalez@email.com'
    },
    {
      id: '2',
      patient_name: 'Juan Pérez',
      doctor_name: 'Dr. Ana Martínez',
      appointment_date: '2024-01-20',
      appointment_time: '10:30',
      status: 'pending',
      reason: 'Seguimiento',
      priority: 'high',
      age: 32,
      phone: '+57 300 234 5678',
      email: 'juan.perez@email.com'
    },
    {
      id: '3',
      patient_name: 'Laura Rodríguez',
      doctor_name: 'Dr. Carlos López',
      appointment_date: '2024-01-21',
      appointment_time: '14:00',
      status: 'confirmed',
      reason: 'Primera consulta',
      priority: 'normal',
      age: 28,
      phone: '+57 300 345 6789',
      email: 'laura.rodriguez@email.com'
    },
    {
      id: '4',
      patient_name: 'Pedro Sánchez',
      doctor_name: 'Dr. Ana Martínez',
      appointment_date: '2024-01-21',
      appointment_time: '16:30',
      status: 'cancelled',
      reason: 'Consulta de seguimiento',
      priority: 'normal',
      age: 55,
      phone: '+57 300 456 7890',
      email: 'pedro.sanchez@email.com'
    },
    {
      id: '5',
      patient_name: 'Ana García',
      doctor_name: 'Dr. Carlos López',
      appointment_date: '2024-01-22',
      appointment_time: '08:00',
      status: 'confirmed',
      reason: 'Control de presión arterial',
      priority: 'urgent',
      age: 67,
      phone: '+57 300 567 8901',
      email: 'ana.garcia@email.com'
    },
    {
      id: '6',
      patient_name: 'Carlos Mendoza',
      doctor_name: 'Dr. Ana Martínez',
      appointment_date: '2024-01-22',
      appointment_time: '11:00',
      status: 'pending',
      reason: 'Consulta de seguimiento',
      priority: 'normal',
      age: 41,
      phone: '+57 300 678 9012',
      email: 'carlos.mendoza@email.com'
    }
  ];

  // Configuración de columnas del DataGrid
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'patient_name',
      headerName: 'Paciente',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.age} años
          </Typography>
        </Box>
      ),
    },
    {
      field: 'doctor_name',
      headerName: 'Doctor',
      width: 180,
    },
    {
      field: 'appointment_date',
      headerName: 'Fecha',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('es-ES')}
        </Typography>
      ),
    },
    {
      field: 'appointment_time',
      headerName: 'Hora',
      width: 100,
    },
    {
      field: 'reason',
      headerName: 'Motivo',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
          }
        };
        const getStatusText = (status: string) => {
          switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'pending': return 'Pendiente';
            case 'cancelled': return 'Cancelada';
            default: return status;
          }
        };
    return (
          <Chip
            label={getStatusText(params.value)}
            color={getStatusColor(params.value) as any}
            size="small"
            icon={params.value === 'confirmed' ? <CheckCircle /> : 
                  params.value === 'pending' ? <Schedule /> : 
                  <Cancel />}
          />
        );
      },
    },
    {
      field: 'priority',
      headerName: 'Prioridad',
      width: 120,
      renderCell: (params) => {
        const getPriorityColor = (priority: string) => {
          switch (priority) {
            case 'urgent': return 'error';
            case 'high': return 'warning';
            case 'normal': return 'success';
            default: return 'default';
          }
        };
        const getPriorityText = (priority: string) => {
          switch (priority) {
            case 'urgent': return 'Urgente';
            case 'high': return 'Alta';
            case 'normal': return 'Normal';
            default: return priority;
          }
        };
    return (
          <Chip
            label={getPriorityText(params.value)}
            color={getPriorityColor(params.value) as any}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="Ver"
          onClick={() => alert(`Ver cita ${params.id}`)}
        />,
        ...(isDoctor || isAdmin ? [
          <GridActionsCellItem
            icon={<Edit />}
            label="Editar"
            onClick={() => alert(`Editar cita ${params.id}`)}
          />,
          ...(params.row.status !== 'cancelled' ? [
            <GridActionsCellItem
              icon={params.row.status === 'confirmed' ? <Cancel /> : <CheckCircle />}
              label={params.row.status === 'confirmed' ? 'Cancelar' : 'Confirmar'}
              onClick={() => alert(`${params.row.status === 'confirmed' ? 'Cancelar' : 'Confirmar'} cita ${params.id}`)}
            />
          ] : [])
        ] : [])
      ],
    },
  ], [isDoctor, isAdmin]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Citas Médicas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isPatient 
              ? 'Gestiona tus citas médicas' 
              : isDoctor
              ? 'Gestiona las citas de tus pacientes'
              : isNurse
              ? 'Gestiona las citas asignadas'
              : isAdmin
              ? 'Administra todas las citas del sistema'
              : 'Gestiona las citas'
            }
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant={view === 'calendar' ? 'contained' : 'outlined'}
            startIcon={<CalendarToday />}
            onClick={() => setView('calendar')}
          >
            Calendario
          </Button>
          <Button
            variant={view === 'list' ? 'contained' : 'outlined'}
            startIcon={<ListIcon />}
            onClick={() => setView('list')}
          >
            Lista
          </Button>
          {(isDoctor || isAdmin) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => alert('Función de nueva cita en desarrollo')}
            >
              Nueva Cita
            </Button>
          )}
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmadas
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
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => a.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
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
                <Cancel color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => a.status === 'cancelled').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Canceladas
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
                <CalendarToday color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {appointments.length}
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

      {/* DataGrid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={appointments}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          components={{
            Toolbar: GridToolbar,
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      {/* Alert for empty state */}
      {appointments.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay citas médicas registradas. 
          {(isDoctor || isAdmin) && ' Haz clic en "Nueva Cita" para crear la primera cita.'}
        </Alert>
      )}
    </Box>
  );
};

export { AppointmentsPage };