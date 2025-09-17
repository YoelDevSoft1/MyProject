// ========================================
// SISTEMA RESPONSIVE PERFECTO PARA SMD VITAL
// ========================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Hidden,
  Collapse,
  Fade,
  Slide,
  Chip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Stack,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close,
  Dashboard,
  CalendarToday,
  Description,
  AttachMoney,
  Notifications,
  Person,
  Settings,
  Logout,
  LocalHospital,
  Psychology,
  AdminPanelSettings,
  Add,
  Search,
  FilterList,
  MoreVert,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';

// ========================================
// HOOK PARA DETECCIÓN DE DISPOSITIVO
// ========================================

export const useDeviceDetection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    deviceType: isSmallMobile ? 'small-mobile' : 
                isMobile ? 'mobile' : 
                isTablet ? 'tablet' : 'desktop',
  };
};

// ========================================
// NAVEGACIÓN RESPONSIVE PERFECTA
// ========================================

interface ResponsiveNavigationProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  user,
  onLogout,
  children,
}) => {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigationItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Citas', icon: <CalendarToday />, path: '/appointments' },
    { text: 'Expedientes', icon: <Description />, path: '/medical-records' },
    { text: 'Pagos', icon: <AttachMoney />, path: '/payments' },
    { text: 'Notificaciones', icon: <Notifications />, path: '/notifications' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del Drawer */}
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <LocalHospital sx={{ fontSize: isMobile ? 32 : 40, mr: 1 }} />
          <Typography variant={isMobile ? 'h6' : 'h5'} component="div" sx={{ fontWeight: 'bold' }}>
            SMD Vital
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Sistema Médico Digital
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              mr: 2,
            }}
          >
            {user?.first_name?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant={isMobile ? 'body2' : 'subtitle1'} noWrap>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role || 'Usuario'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: isMobile ? 1 : 1.5,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: isMobile ? 36 : 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: isMobile ? '0.875rem' : '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          v1.0.0 • 2024
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${isTablet ? 240 : 280}px)` },
          ml: { md: `${isTablet ? 240 : 280}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ px: isMobile ? 1 : 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {isMobile ? 'SMD Vital' : 'Panel de Control'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Hidden smDown>
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Hidden>

            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.first_name?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <Person sx={{ mr: 2 }} />
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings sx={{ mr: 2 }} />
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>
          <Logout sx={{ mr: 2 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: isTablet ? 240 : 280 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isMobile ? 280 : 320,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isTablet ? 240 : 280,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${isTablet ? 240 : 280}px)` },
          backgroundColor: 'grey.50',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// ========================================
// GRID RESPONSIVE PERFECTO
// ========================================

interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number;
  minHeight?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 3,
  minHeight = 'auto',
}) => {
  const { isMobile, isTablet } = useDeviceDetection();

  return (
    <Grid
      container
      spacing={isMobile ? 2 : spacing}
      sx={{ minHeight }}
    >
      {React.Children.map(children, (child, index) => (
        <Grid
          item
          xs={12}
          sm={isMobile ? 12 : 6}
          md={isTablet ? 6 : 4}
          lg={4}
          xl={3}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

// ========================================
// CARD RESPONSIVE PERFECTA
// ========================================

interface ResponsiveCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  elevation?: number;
  hover?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  elevation = 1,
  hover = true,
}) => {
  const { isMobile } = useDeviceDetection();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: isMobile ? 2 : 3,
        boxShadow: `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.1)`,
        transition: 'all 0.3s ease',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 ${elevation * 3}px ${elevation * 6}px rgba(0,0,0,0.15)`,
          },
        }),
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                component="h3"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        
        {actions && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {actions}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ========================================
// FAB RESPONSIVE PERFECTO
// ========================================

interface ResponsiveFabProps {
  actions: Array<{
    icon: React.ReactNode;
    name: string;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  }>;
  mainAction?: {
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  };
}

export const ResponsiveFab: React.FC<ResponsiveFabProps> = ({
  actions,
  mainAction,
}) => {
  const { isMobile } = useDeviceDetection();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <SpeedDial
        ariaLabel="Acciones rápidas"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={mainAction?.icon || <Add />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              setOpen(false);
            }}
            sx={{ color: action.color }}
          />
        ))}
      </SpeedDial>
    );
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {actions.map((action, index) => (
        <Fade in={open} timeout={300 + index * 100}>
          <Fab
            key={action.name}
            color={action.color}
            onClick={action.onClick}
            sx={{
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {action.icon}
          </Fab>
        </Fade>
      ))}
      <Fab
        color={mainAction?.color || 'primary'}
        onClick={() => setOpen(!open)}
        sx={{
          width: 64,
          height: 64,
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        {open ? <Close /> : (mainAction?.icon || <Add />)}
      </Fab>
    </Box>
  );
};

// ========================================
// TABLA RESPONSIVE PERFECTA
// ========================================

interface ResponsiveTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  onRowClick?: (row: any) => void;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  onRowClick,
}) => {
  const { isMobile } = useDeviceDetection();

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((row, index) => (
          <Card
            key={index}
            sx={{
              p: 2,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              '&:hover': onRowClick ? {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              } : {},
            }}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => (
              <Box key={column.key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  {column.label}:
                </Typography>
                <Typography variant="body2">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </Typography>
              </Box>
            ))}
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

// ========================================
// HOOK PARA RESPONSIVE
// ========================================

export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getSpacing = (mobile: number, tablet?: number, desktop?: number) => {
    if (isSmallMobile) return mobile;
    if (isMobile) return mobile;
    if (isTablet) return tablet || mobile;
    return desktop || tablet || mobile;
  };

  const getPadding = (mobile: number, tablet?: number, desktop?: number) => {
    return getSpacing(mobile, tablet, desktop);
  };

  const getFontSize = (mobile: string, tablet?: string, desktop?: string) => {
    if (isSmallMobile) return mobile;
    if (isMobile) return mobile;
    if (isTablet) return tablet || mobile;
    return desktop || tablet || mobile;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    getSpacing,
    getPadding,
    getFontSize,
    deviceType: isSmallMobile ? 'small-mobile' : 
                isMobile ? 'mobile' : 
                isTablet ? 'tablet' : 'desktop',
  };
};
