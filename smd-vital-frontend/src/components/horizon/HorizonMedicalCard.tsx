// ========================================
// HORIZON UI MEDICAL CARD COMPONENT
// ========================================

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Zoom,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  Star,
  Favorite,
  Share,
  LocalHospital,
  Psychology,
  MonitorHeart,
  Description,
  CalendarToday,
  People,
  AttachMoney,
} from '@mui/icons-material';

interface HorizonMedicalCardProps {
  title?: string;
  subtitle?: string;
  value?: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  progress?: number;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outlined' | 'elevated' | 'medical';
  hover?: boolean;
  onClick?: () => void;
  medicalType?: 'appointment' | 'patient' | 'record' | 'payment' | 'ai' | 'general';
}

export const HorizonMedicalCard: React.FC<HorizonMedicalCardProps> = ({
  title,
  subtitle,
  value,
  change,
  icon,
  color = 'primary',
  progress,
  actions,
  children,
  variant = 'default',
  hover = true,
  onClick,
  medicalType = 'general',
}) => {
  const getMedicalIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <CalendarToday />;
      case 'patient': return <People />;
      case 'record': return <Description />;
      case 'payment': return <AttachMoney />;
      case 'ai': return <Psychology />;
      default: return <LocalHospital />;
    }
  };

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: 20,
      transition: 'all 0.2s linear',
      cursor: onClick ? 'pointer' : 'default',
      ...(hover && {
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
        },
      }),
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${getColorValue(color, 500)} 0%, ${getColorValue(color, 700)} 100%)`,
          color: 'white',
          '& .MuiTypography-root': {
            color: 'white',
          },
        };
      case 'outlined':
        return {
          ...baseStyles,
          border: `2px solid ${getColorValue(color, 200)}`,
          backgroundColor: 'transparent',
        };
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.16)',
        };
      case 'medical':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: '1px solid rgba(112, 144, 176, 0.1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          },
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#FFFFFF',
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        };
    }
  };

  const getColorValue = (color: string, shade: number) => {
    const colorMap: any = {
      primary: {
        200: '#E9E3FF',
        500: '#422AFB',
        700: '#02044A',
      },
      secondary: {
        200: '#E9E3FF',
        500: '#7551FF',
        700: '#190793',
      },
      success: {
        200: '#E6FAF5',
        500: '#01B574',
        700: '#00A86B',
      },
      warning: {
        200: '#FFF6DA',
        500: '#FFB547',
        700: '#FFA726',
      },
      error: {
        200: '#FEEFEE',
        500: '#EE5D50',
        700: '#E31A1A',
      },
      info: {
        200: '#EFF4FB',
        500: '#3965FF',
        700: '#1976D2',
      },
    };
    return colorMap[color]?.[shade] || colorMap.primary[shade];
  };

  return (
    <Zoom in={true} timeout={600}>
      <Card
        sx={getCardStyles()}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          {(title || subtitle || icon) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {icon && (
                <Avatar
                  sx={{
                    bgcolor: variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : `${color}.main`,
                    color: variant === 'gradient' ? 'white' : 'white',
                    width: 48,
                    height: 48,
                    mr: 2,
                  }}
                >
                  {icon}
                </Avatar>
              )}
              <Box sx={{ flexGrow: 1 }}>
                {title && (
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          )}

          {/* Value and Change */}
          {value && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {value}
              </Typography>
              {change && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  {change.type === 'increase' ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={change.type === 'increase' ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 600 }}
                  >
                    {change.value}%
                  </Typography>
                  {change.period && (
                    <Typography variant="caption" color="text.secondary">
                      {change.period}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          )}

          {/* Progress */}
          {progress !== undefined && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: `${color}.main`,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {progress}% completado
              </Typography>
            </Box>
          )}

          {/* Medical Type Badge */}
          {medicalType !== 'general' && (
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={getMedicalIcon(medicalType)}
                label={medicalType === 'appointment' ? 'Cita' :
                       medicalType === 'patient' ? 'Paciente' :
                       medicalType === 'record' ? 'Expediente' :
                       medicalType === 'payment' ? 'Pago' :
                       medicalType === 'ai' ? 'IA Médica' : 'Médico'}
                color={color as any}
                size="small"
                variant="outlined"
              />
            </Box>
          )}

          {/* Content */}
          {children}

          {/* Actions */}
          {actions && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              {actions}
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

// ========================================
// HORIZON UI MEDICAL STATS CARD
// ========================================

interface HorizonMedicalStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  subtitle?: string;
  progress?: number;
  medicalType?: 'appointment' | 'patient' | 'record' | 'payment' | 'ai' | 'general';
}

export const HorizonMedicalStatsCard: React.FC<HorizonMedicalStatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
  progress,
  medicalType = 'general',
}) => {
  return (
    <HorizonMedicalCard
      title={title}
      subtitle={subtitle}
      value={value}
      change={trend}
      icon={icon}
      color={color}
      progress={progress}
      variant="medical"
      medicalType={medicalType}
    />
  );
};

// ========================================
// HORIZON UI MEDICAL GRADIENT CARD
// ========================================

interface HorizonMedicalGradientCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  actions?: React.ReactNode;
  medicalType?: 'appointment' | 'patient' | 'record' | 'payment' | 'ai' | 'general';
}

export const HorizonMedicalGradientCard: React.FC<HorizonMedicalGradientCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  actions,
  medicalType = 'general',
}) => {
  return (
    <HorizonMedicalCard
      title={title}
      subtitle={subtitle}
      value={value}
      icon={icon}
      color={color}
      variant="gradient"
      actions={actions}
      medicalType={medicalType}
    />
  );
};
