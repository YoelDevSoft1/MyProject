// ========================================
// DASHBOARD PERFECTO PARA SMD VITAL BOGOTÁ
// ========================================

import React, { useState, useEffect } from 'react';
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
  Fade,
  Zoom,
  Tooltip,
  Badge,
  CircularProgress,
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
  TrendingDown,
  Add,
  MoreVert,
  Refresh,
  Notifications,
  Warning,
  Info,
  Star,
  AccessTime,
  Favorite,
  MonitorHeart,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const PerfectDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    canViewAppointments, 
    canViewMedicalRecords, 
    canViewAITools, 
    canViewPayments, 
    canViewNotifications,
    canCreateMedicalRecords,
    canViewAllAppointments,
    isPatient,
    isDoctor,
    isNurse,
    isAdmin
  } = useRolePermissions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Datos simulados con métricas realistas
  const stats = [
    {
      title: 'Citas Hoy',
      value: '8',
      subtitle: '6 completadas, 2 pendientes',
      icon: CalendarToday,
      color: 'primary',
      trend: '+25%',
      trendDirection: 'up',
      progress: 75,
    },
    {
      title: 'Pacientes Activos',
      value: '142',
      subtitle: '+12 este mes',
      icon: People,
      color: 'success',
      trend: '+8.5%',
      trendDirection: 'up',
      progress: 85,
    },
    {
      title: 'Expedientes',
      value: '23',
      subtitle: 'Pendientes de revisión',
      icon: Description,
      color: 'warning',
      trend: '-3%',
      trendDirection: 'down',
      progress: 60,
    },
    {
      title: 'Ingresos',
      value: '$12.450.000 COP',
      subtitle: '+18% este mes',
      icon: AttachMoney,
      color: 'info',
      trend: '+22%',
      trendDirection: 'up',
      progress: 90,
    },
  ];

  const todayAppointments = [
    {
      id: '1',
      time: '09:00',
      patient: 'María González',
      age: 45,
      reason: 'Consulta general',
      status: 'completed',
      priority: 'normal',
      duration: '30 min',
      doctor: 'Dr. Carlos López',
      location: 'Sede Principal - Bogotá',
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Carlos López',
      age: 32,
      reason: 'Seguimiento diabetes',
      status: 'in_progress',
      priority: 'high',
      duration: '45 min',
      doctor: 'Dr. Ana Martínez',
      location: 'Sede Principal - Bogotá',
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Ana Martínez',
      age: 28,
      reason: 'Primera consulta',
      status: 'pending',
      priority: 'normal',
      duration: '60 min',
      doctor: 'Dr. Carlos López',
      location: 'Sede Principal - Bogotá',
    },
    {
      id: '4',
      time: '15:30',
      patient: 'Pedro Sánchez',
      age: 55,
      reason: 'Control presión',
      status: 'pending',
      priority: 'urgent',
      duration: '30 min',
      doctor: 'Dr. Ana Martínez',
      location: 'Sede Principal - Bogotá',
    },
  ];

  const recentMedicalRecords = [
    {
      id: '1',
      patient: 'María González',
      date: '2024-01-15',
      diagnosis: 'Hipertensión controlada',
      type: 'Consulta',
      status: 'completed',
      doctor: 'Dr. Carlos López',
      priority: 'normal',
    },
    {
      id: '2',
      patient: 'Carlos López',
      date: '2024-01-14',
      diagnosis: 'Diabetes tipo 2',
      type: 'Seguimiento',
      status: 'draft',
      doctor: 'Dr. Ana Martínez',
      priority: 'high',
    },
    {
      id: '3',
      patient: 'Ana Martínez',
      date: '2024-01-13',
      diagnosis: 'Migraña crónica',
      type: 'Primera consulta',
      status: 'completed',
      doctor: 'Dr. Carlos López',
      priority: 'normal',
    },
  ];

  const notifications = [
    {
      id: '1',
      title: 'Nueva cita programada',
      message: 'María González - 16:00 - Sede Principal Bogotá',
      time: 'Hace 5 min',
      type: 'info',
      unread: true,
    },
    {
      id: '2',
      title: 'Expediente pendiente',
      message: 'Revisar expediente de Carlos López - Dr. Ana Martínez',
      time: 'Hace 1 hora',
      type: 'warning',
      unread: true,
    },
    {
      id: '3',
      title: 'Pago recibido',
      message: '$150.000 COP - Consulta Dr. Ana Martínez',
      time: 'Hace 2 horas',
      type: 'success',
      unread: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <AccessTime color="primary" />;
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
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'draft': return 'Borrador';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'success';
      default: return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info color="info" />;
      case 'warning': return <Warning color="warning" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Notifications />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header con acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            ¡Bienvenido a SMD Vital Bogotá, Dr. {user?.first_name || 'Usuario'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <Refresh className={refreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
          {canCreateMedicalRecords && (
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1.5,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Nueva Cita
            </Button>
          )}
        </Stack>
      </Box>

      {/* Stats Cards con animaciones */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Zoom in={true} timeout={600 + index * 100}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        color: 'white',
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <stat.icon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={stat.trend}
                      size="small"
                      color={stat.trendDirection === 'up' ? 'success' : 'error'}
                      icon={stat.trendDirection === 'up' ? <TrendingUp /> : <TrendingDown />}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {stat.subtitle}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: `${stat.color}.main`,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Citas de Hoy */}
        <Grid item xs={12} lg={6}>
          <Fade in={true} timeout={800}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    Citas de Hoy
                  </Typography>
                  <Chip 
                    label={`${todayAppointments.length} citas`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                
                {todayAppointments.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {todayAppointments.map((appointment, index) => (
                      <React.Fragment key={appointment.id}>
                        <ListItem
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: appointment.status === 'in_progress' ? 'primary.50' : 'transparent',
                            border: appointment.status === 'in_progress' ? '2px solid' : '1px solid',
                            borderColor: appointment.status === 'in_progress' ? 'primary.main' : 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'action.hover',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <ListItemIcon>
                            {getStatusIcon(appointment.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body1" fontWeight="medium" component="span">
                                  {appointment.time} - {appointment.patient}
                                </Typography>
                                <Chip
                                  label={appointment.priority === 'urgent' ? 'Urgente' : 
                                         appointment.priority === 'high' ? 'Alta' : 'Normal'}
                                  size="small"
                                  color={getPriorityColor(appointment.priority) as any}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" component="span">
                                  {appointment.age} años • {appointment.reason}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" component="div">
                                  {appointment.doctor} • {appointment.duration}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < todayAppointments.length - 1 && <Divider sx={{ my: 1 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarToday sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No hay citas programadas para hoy
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Notificaciones */}
        <Grid item xs={12} lg={6}>
          <Fade in={true} timeout={1000}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Notifications sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    Notificaciones
                  </Typography>
                  <Badge badgeContent={notifications.filter(n => n.unread).length} color="error" sx={{ ml: 'auto' }}>
                    <Box />
                  </Badge>
                </Box>
                
                <List sx={{ p: 0 }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: notification.unread ? 'primary.50' : 'transparent',
                          border: notification.unread ? '1px solid' : 'none',
                          borderColor: 'primary.main',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={notification.unread ? 'bold' : 'medium'} component="span">
                                {notification.title}
                              </Typography>
                              {notification.unread && (
                                <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="div">
                                {notification.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Expedientes Recientes */}
        <Grid item xs={12}>
          <Fade in={true} timeout={1200}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Description sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    Expedientes Recientes
                  </Typography>
                  <Chip 
                    label={`${recentMedicalRecords.length} expedientes`} 
                    size="small" 
                    color="info" 
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  {recentMedicalRecords.map((record) => (
                    <Grid item xs={12} md={4} key={record.id}>
                      <Card 
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 2 }}>
                            <Description />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {record.patient}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.doctor}
                            </Typography>
                          </Box>
                          <Chip
                            label={getStatusText(record.status)}
                            size="small"
                            color={record.status === 'completed' ? 'success' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {record.diagnosis}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(record.date).toLocaleDateString('es-ES')} • {record.type}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};
