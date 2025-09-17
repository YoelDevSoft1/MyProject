// ========================================
// SISTEMA DE ANIMACIONES PERFECTO PARA SMD VITAL
// ========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Grow,
  Collapse,
  Tooltip,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Close,
  Refresh,
  Favorite,
  Star,
  TrendingUp,
  TrendingDown,
  LocalHospital,
  Psychology,
  MonitorHeart,
  Description,
  CalendarToday,
  People,
  AttachMoney,
} from '@mui/icons-material';

// ========================================
// COMPONENTE DE NOTIFICACIONES ANIMADAS
// ========================================

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const AnimatedNotification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      default: return <Info color="info" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return 'success.main';
      case 'error': return 'error.main';
      case 'warning': return 'warning.main';
      case 'info': return 'info.main';
      default: return 'info.main';
    }
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  return (
    <Slide direction="left" in={open} timeout={300}>
      <Card
        sx={{
          minWidth: 300,
          maxWidth: 400,
          mb: 2,
          borderLeft: 4,
          borderLeftColor: getColor(),
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderRadius: 2,
          animation: 'slideInRight 0.3s ease-out',
          '@keyframes slideInRight': {
            '0%': {
              transform: 'translateX(100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateX(0)',
              opacity: 1,
            },
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{ mr: 2, mt: 0.5 }}>
              {getIcon()}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {message}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleClose}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );
};

// ========================================
// COMPONENTE DE CARGA ANIMADA
// ========================================

interface LoadingAnimationProps {
  message?: string;
  size?: number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = 'Cargando...',
  size = 40,
  color = 'primary',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        animation: 'fadeIn 0.5s ease-in',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      <CircularProgress
        size={size}
        color={color}
        sx={{
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

// ========================================
// COMPONENTE DE ESTADÍSTICAS ANIMADAS
// ========================================

interface AnimatedStatProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export const AnimatedStat: React.FC<AnimatedStatProps> = ({
  value,
  label,
  icon,
  color,
  trend,
  trendValue,
  delay = 0,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const timer = setTimeout(() => {
        const increment = value / 50;
        const counter = setInterval(() => {
          setCount(prev => {
            if (prev >= value) {
              clearInterval(counter);
              return value;
            }
            return Math.min(prev + increment, value);
          });
        }, 50);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, value, delay]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  return (
    <Zoom in={isVisible} timeout={600 + delay}>
      <Card
        ref={ref}
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: `${color}.main`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              {icon}
            </Box>
          </Box>
          
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: `${color}.main`,
              mb: 1,
              animation: 'countUp 1s ease-out',
              '@keyframes countUp': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {typeof value === 'number' ? Math.floor(count) : value}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {label}
          </Typography>
          
          {trend && trendValue && (
            <Chip
              icon={getTrendIcon()}
              label={trendValue}
              color={getTrendColor() as any}
              size="small"
              variant="outlined"
            />
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

// ========================================
// COMPONENTE DE BOTÓN ANIMADO
// ========================================

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  animation?: 'bounce' | 'pulse' | 'shake' | 'glow';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  animation,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getAnimationStyle = () => {
    if (!animation) return {};
    
    switch (animation) {
      case 'bounce':
        return {
          animation: 'bounce 1s infinite',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(-10px)' },
            '60%': { transform: 'translateY(-5px)' },
          },
        };
      case 'pulse':
        return {
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
          },
        };
      case 'shake':
        return {
          animation: isPressed ? 'shake 0.5s ease-in-out' : 'none',
          '@keyframes shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-5px)' },
            '75%': { transform: 'translateX(5px)' },
          },
        };
      case 'glow':
        return {
          animation: 'glow 2s ease-in-out infinite alternate',
          '@keyframes glow': {
            '0%': { boxShadow: '0 0 5px rgba(0,0,0,0.2)' },
            '100%': { boxShadow: '0 0 20px rgba(0,0,0,0.4)' },
          },
        };
      default:
        return {};
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      startIcon={loading ? <CircularProgress size={16} /> : icon}
      sx={{
        borderRadius: 2,
        px: 3,
        py: 1.5,
        fontWeight: 'bold',
        textTransform: 'none',
        transition: 'all 0.3s ease',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        ...getAnimationStyle(),
      }}
    >
      {children}
    </Button>
  );
};

// ========================================
// COMPONENTE DE CARD ANIMADA
// ========================================

interface AnimatedCardProps {
  children: React.ReactNode;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hover = true,
  delay = 0,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getSlideDirection = () => {
    switch (direction) {
      case 'up': return 'up';
      case 'down': return 'down';
      case 'left': return 'right';
      case 'right': return 'left';
      default: return 'up';
    }
  };

  return (
    <Slide
      direction={getSlideDirection()}
      in={isVisible}
      timeout={600 + delay}
    >
      <Card
        ref={ref}
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          ...(hover && {
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            },
          }),
        }}
      >
        {children}
      </Card>
    </Slide>
  );
};

// ========================================
// COMPONENTE DE PROGRESS ANIMADO
// ========================================

interface AnimatedProgressProps {
  value: number;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  variant?: 'linear' | 'circular';
  size?: number;
  thickness?: number;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  label,
  color = 'primary',
  variant = 'linear',
  size = 40,
  thickness = 4,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  if (variant === 'circular') {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={size}
          thickness={thickness}
          color={color}
          sx={{
            animation: 'progressAnimation 1s ease-out',
            '@keyframes progressAnimation': {
              '0%': { strokeDasharray: '0 100' },
              '100%': { strokeDasharray: `${progress} 100` },
            },
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
        {label && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            {label}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            animation: 'progressBarAnimation 1s ease-out',
            '@keyframes progressBarAnimation': {
              '0%': { transform: 'scaleX(0)' },
              '100%': { transform: 'scaleX(1)' },
            },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {Math.round(progress)}% completado
      </Typography>
    </Box>
  );
};

// ========================================
// HOOK PARA ANIMACIONES
// ========================================

export const useAnimation = (delay: number = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return { ref, isVisible };
};
