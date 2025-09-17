import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Stack,
  Alert,
  LinearProgress,
} from '@mui/material';
import { 
  CalendarToday,
  People,
  Description,
  AttachMoney,
  Schedule,
  CheckCircle, 
  Pending,
  LocalHospital,
  Psychology,
  TrendingUp,
  Add,
  MoreVert,
} from '@mui/icons-material';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    canViewAppointments, 
    canViewMedicalRecords, 
    canViewAITools, 
    canViewPayments, 
    canViewNotifications,
    canCreateMedicalRecords,
    canViewAllAppointments
  } = useRolePermissions();

  // Datos simulados para el dashboard (sin llamadas a API)
  const stats = [
    {
      title: 'Citas Hoy',
      value: '3',
      subtitle: '2 completadas, 1 pendiente',
      icon: CalendarToday,
      color: 'primary',
      trend: '+15%',
    },
    {
      title: 'Pacientes Activos',
      value: '24',
      subtitle: '+3 este mes',
      icon: People,
      color: 'success',
      trend: '+12%',
    },
    {
      title: 'Expedientes',
      value: '5',
      subtitle: 'Pendientes de revisión',
      icon: Description,
      color: 'warning',
      trend: '-2%',
    },
    {
      title: 'Ingresos',
      value: '$2,450',
      subtitle: '+12% este mes',
      icon: AttachMoney,
      color: 'info',
      trend: '+18%',
    },
  ];

  // Datos simulados de citas de hoy
  const todayAppointments = [
    {
      id: '1',
      time: '09:00',
      patient: 'María González',
      age: 45,
      reason: 'Consulta general',
      status: 'completed',
      priority: 'normal'
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Carlos López',
      age: 32,
      reason: 'Seguimiento',
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Ana Martínez',
      age: 28,
      reason: 'Primera consulta',
      status: 'pending',
      priority: 'normal'
    }
  ];

  // Datos simulados de expedientes médicos recientes
  const recentMedicalRecords = [
    {
      id: '1',
      patient: 'María González',
      date: '2024-01-15',
      diagnosis: 'Hipertensión controlada',
      type: 'Consulta',
      status: 'completed'
    },
    {
      id: '2',
      patient: 'Carlos López',
      date: '2024-01-14',
      diagnosis: 'Diabetes tipo 2',
      type: 'Seguimiento',
      status: 'draft'
    },
    {
      id: '3',
      patient: 'Ana Martínez',
      date: '2024-01-13',
      diagnosis: 'Migraña crónica',
      type: 'Primera consulta',
      status: 'completed'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <Schedule color="primary" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'draft':
        return <Description color="disabled" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En Progreso';
      case 'pending':
        return 'Pendiente';
      case 'draft':
        return 'Borrador';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Panel Médico - Dr. {user?.first_name || 'Usuario'}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Gestiona tus pacientes, citas y expedientes médicos desde aquí.
        </Typography>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      color: 'white',
                      mr: 2,
                    }}
                  >
                    <stat.icon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={stat.trend}
                    size="small"
                    color={stat.trend.startsWith('+') ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Citas de Hoy
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Agenda médica del día
              </Typography>
              
            {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon>
                      {getStatusIcon(appointment.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                          {appointment.time} - {appointment.patient}
                              </Typography>
                              <Chip
                                label={appointment.priority === 'urgent' ? 'Urgente' : 
                         appointment.priority === 'high' ? 'Alta' : 'Normal'}
                                size="small"
                                color={getPriorityColor(appointment.priority)}
                              />
                            </Box>
                          }
                          secondary={`${appointment.age} años - ${appointment.reason}`}
                        />
                      </ListItem>
                      {index < todayAppointments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarToday sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay citas programadas para hoy
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Medical Records */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Description sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Expedientes Recientes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Últimos expedientes médicos
              </Typography>
              
            {recentMedicalRecords.length > 0 ? (
                <List>
                  {recentMedicalRecords.map((record, index) => (
                    <React.Fragment key={record.id}>
                      <ListItem
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon>
                      {getStatusIcon(record.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                          {record.patient} - {record.date}
                              </Typography>
                              <Chip
                                label={getStatusText(record.status)}
                                size="small"
                                color={record.status === 'completed' ? 'success' : 
                                       record.status === 'draft' ? 'warning' : 'default'}
                              />
                            </Box>
                          }
                          secondary={`${record.diagnosis} - ${record.type}`}
                        />
                      </ListItem>
                      {index < recentMedicalRecords.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay expedientes recientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Acciones Rápidas
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Herramientas médicas y funcionalidades
          </Typography>
          
          <Grid container spacing={2}>
            {canViewAllAppointments && (
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  fullWidth
                  sx={{ py: 2 }}
                  onClick={() => alert('Función de gestionar citas en desarrollo')}
                >
                  Gestionar Citas
                </Button>
              </Grid>
            )}
            {canCreateMedicalRecords && (
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Description />}
                  fullWidth
                  sx={{ py: 2 }}
                  onClick={() => alert('Función de nuevo expediente en desarrollo')}
                >
                  Nuevo Expediente
                </Button>
              </Grid>
            )}
            {canViewAITools && (
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Psychology />}
                  fullWidth
                  sx={{ py: 2 }}
                  onClick={() => alert('Función de IA médica en desarrollo')}
                >
                  IA Médica
                </Button>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<LocalHospital />}
                fullWidth
                sx={{ py: 2 }}
                onClick={() => alert('Funciones avanzadas en desarrollo')}
              >
                Funciones Avanzadas
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
