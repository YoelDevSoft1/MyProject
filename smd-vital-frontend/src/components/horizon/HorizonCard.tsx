// ========================================
// HORIZON UI CARD COMPONENT
// ========================================

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Zoom,
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  Star,
  Favorite,
  Share,
} from '@mui/icons-material';

interface HorizonCardProps {
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
  variant?: 'default' | 'gradient' | 'outlined' | 'elevated';
  hover?: boolean;
  onClick?: () => void;
}

export const HorizonCard: React.FC<HorizonCardProps> = ({
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
}) => {
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: 16,
      transition: 'all 0.3s ease',
      cursor: onClick ? 'pointer' : 'default',
      ...(hover && {
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        };
    }
  };

  const getColorValue = (color: string, shade: number) => {
    const colorMap: any = {
      primary: {
        200: '#90CAF9',
        500: '#2196F3',
        700: '#1976D2',
      },
      secondary: {
        200: '#A5D6A7',
        500: '#4CAF50',
        700: '#388E3C',
      },
      success: {
        200: '#A5D6A7',
        500: '#4CAF50',
        700: '#388E3C',
      },
      warning: {
        200: '#FFE082',
        500: '#FFC107',
        700: '#FFA000',
      },
      error: {
        200: '#EF9A9A',
        500: '#F44336',
        700: '#D32F2F',
      },
      info: {
        200: '#81D4FA',
        500: '#03A9F4',
        700: '#0288D1',
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
        {(title || subtitle || icon) && (
          <CardHeader
            avatar={
              icon && (
                <Avatar
                  sx={{
                    bgcolor: variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : `${color}.main`,
                    color: variant === 'gradient' ? 'white' : 'white',
                    width: 48,
                    height: 48,
                  }}
                >
                  {icon}
                </Avatar>
              )
            }
            action={
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            }
            title={
              <Box>
                {title && (
                  <Typography variant="h6" component="h3" gutterBottom>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            }
            sx={{ pb: 1 }}
          />
        )}

        <CardContent sx={{ pt: 0 }}>
          {value && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {value}
              </Typography>
              {change && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                </Box>
              )}
            </Box>
          )}

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

          {children}
        </CardContent>

        {actions && (
          <CardActions sx={{ pt: 0 }}>
            {actions}
          </CardActions>
        )}
      </Card>
    </Zoom>
  );
};

// ========================================
// HORIZON UI STATS CARD
// ========================================

interface HorizonStatsCardProps {
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
}

export const HorizonStatsCard: React.FC<HorizonStatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
  progress,
}) => {
  return (
    <HorizonCard
      title={title}
      subtitle={subtitle}
      value={value}
      change={trend}
      icon={icon}
      color={color}
      progress={progress}
      variant="default"
    />
  );
};

// ========================================
// HORIZON UI GRADIENT CARD
// ========================================

interface HorizonGradientCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  actions?: React.ReactNode;
}

export const HorizonGradientCard: React.FC<HorizonGradientCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  actions,
}) => {
  return (
    <HorizonCard
      title={title}
      subtitle={subtitle}
      value={value}
      icon={icon}
      color={color}
      variant="gradient"
      actions={actions}
    />
  );
};
