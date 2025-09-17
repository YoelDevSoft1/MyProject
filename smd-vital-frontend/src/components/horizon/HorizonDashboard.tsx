// ========================================
// HORIZON UI DASHBOARD COMPONENT
// ========================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Button,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Fade,
  Zoom,
  Tooltip,
  Badge,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  Refresh,
  Add,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  People,
  Description,
  AttachMoney,
  Notifications,
  LocalHospital,
  Psychology,
  MonitorHeart,
  Schedule,
  CheckCircle,
  Pending,
  Warning,
  Star,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { HorizonCard, HorizonStatsCard, HorizonGradientCard } from './HorizonCard';
import { HorizonMedicalCard, HorizonMedicalStatsCard, HorizonMedicalGradientCard } from './HorizonMedicalCard';

export const HorizonDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    canViewAppointments, 
    canViewMedicalRecords, 
    canViewAITools, 
    canViewPayments, 
    canViewNotifications,
    canCreateMedicalRecords,
    isPatient,
    isDoctor,
    isNurse,
    isAdmin
  } = useRolePermissions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Datos simulados
  const stats = [
    {
      title: 'Citas Hoy',
      value: '8',
      subtitle: '6 completadas, 2 pendientes',
      icon: <CalendarToday />,
      color: 'primary' as const,
      trend: { value: 25, type: 'increase' as const, period: 'vs ayer' },
      progress: 75,
    },
    {
      title: 'Pacientes Activos',
      value: '142',
      subtitle: '+12 este mes',
      icon: <People />,
      color: 'success' as const,
      trend: { value: 8.5, type: 'increase' as const, period: 'vs mes pasado' },
      progress: 85,
    },
    {
      title: 'Expedientes',
      value: '23',
      subtitle: 'Pendientes de revisión',
      icon: <Description />,
      color: 'warning' as const,
      trend: { value: 3, type: 'decrease' as const, period: 'vs semana pasada' },
      progress: 60,
    },
    {
      title: 'Ingresos',
      value: '$12,450',
      subtitle: '+18% este mes',
      icon: <AttachMoney />,
      color: 'info' as const,
      trend: { value: 22, type: 'increase' as const, period: 'vs mes pasado' },
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
      doctor: 'Dr. Carlos López',
      avatar: 'MG',
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Carlos López',
      age: 32,
      reason: 'Seguimiento diabetes',
      status: 'in_progress',
      priority: 'high',
      doctor: 'Dr. Ana Martínez',
      avatar: 'CL',
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Ana Martínez',
      age: 28,
      reason: 'Primera consulta',
      status: 'pending',
      priority: 'normal',
      doctor: 'Dr. Carlos López',
      avatar: 'AM',
    },
    {
      id: '4',
      time: '15:30',
      patient: 'Pedro Sánchez',
      age: 55,
      reason: 'Control presión',
      status: 'pending',
      priority: 'urgent',
      doctor: 'Dr. Ana Martínez',
      avatar: 'PS',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'appointment',
      title: 'Nueva cita programada',
      description: 'María González - 16:00',
      time: 'Hace 5 min',
      icon: <CalendarToday color="primary" />,
      unread: true,
    },
    {
      id: '2',
      type: 'medical-record',
      title: 'Expediente actualizado',
      description: 'Carlos López - Diabetes tipo 2',
      time: 'Hace 1 hora',
      icon: <Description color="success" />,
      unread: true,
    },
    {
      id: '3',
      type: 'payment',
      title: 'Pago recibido',
      description: '$150 - Consulta Dr. Ana Martínez',
      time: 'Hace 2 horas',
      icon: <AttachMoney color="info" />,
      unread: false,
    },
    {
      id: '4',
      type: 'notification',
      title: 'Recordatorio de cita',
      description: 'Ana Martínez - Mañana 14:00',
      time: 'Hace 3 horas',
      icon: <Notifications color="warning" />,
      unread: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'in_progress': return <Schedule color="primary" />;
      case 'pending': return <Pending color="warning" />;
      default: return <Schedule color="disabled" />;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            ¡Bienvenido, Dr. {user?.first_name || 'Usuario'}! 👋
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              Nueva Cita
            </Button>
          )}
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <HorizonMedicalStatsCard
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              progress={stat.progress}
              medicalType={index === 0 ? 'appointment' : 
                         index === 1 ? 'patient' : 
                         index === 2 ? 'record' : 'payment'}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Citas de Hoy */}
        <Grid item xs={12} lg={8}>
          <Fade in={true} timeout={800}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
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
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {appointment.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemIcon>
                          {getStatusIcon(appointment.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" fontWeight="medium">
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
                                {appointment.doctor}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </ListItem>
                      {index < todayAppointments.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Actividades Recientes */}
        <Grid item xs={12} lg={4}>
          <Fade in={true} timeout={1000}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Notifications sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    Actividades Recientes
                  </Typography>
                  <Badge badgeContent={recentActivities.filter(a => a.unread).length} color="error" sx={{ ml: 'auto' }}>
                    <Box />
                  </Badge>
                </Box>
                
                <List sx={{ p: 0 }}>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: activity.unread ? 'primary.50' : 'transparent',
                          border: activity.unread ? '1px solid' : 'none',
                          borderColor: 'primary.main',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon>
                          {activity.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={activity.unread ? 'bold' : 'medium'}>
                                {activity.title}
                              </Typography>
                              {activity.unread && (
                                <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="div">
                                {activity.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};
