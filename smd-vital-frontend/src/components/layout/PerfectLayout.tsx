// ========================================
// LAYOUT PERFECTO PARA SMD VITAL
// ========================================

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Menu as MenuIcon,
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
  ChevronLeft,
  ChevronRight,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const drawerWidth = 280;

interface PerfectLayoutProps {
  children: React.ReactNode;
}

export const PerfectLayout: React.FC<PerfectLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  const { user, logout } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleProfileMenuClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
        color: 'primary',
      },
    ];

    if (isPatient) {
      return [
        ...baseItems,
        {
          text: 'Mis Citas',
          icon: <CalendarToday />,
          path: '/appointments',
          color: 'success',
        },
        {
          text: 'Mi Historial',
          icon: <Description />,
          path: '/medical-records',
          color: 'info',
        },
        {
          text: 'Pagos',
          icon: <AttachMoney />,
          path: '/payments',
          color: 'warning',
        },
        {
          text: 'Notificaciones',
          icon: <Notifications />,
          path: '/notifications',
          color: 'secondary',
        },
      ];
    }

    if (isDoctor || isNurse) {
      return [
        ...baseItems,
        {
          text: 'Citas Médicas',
          icon: <CalendarToday />,
          path: '/appointments',
          color: 'success',
        },
        {
          text: 'Expedientes',
          icon: <Description />,
          path: '/medical-records',
          color: 'info',
        },
        {
          text: 'IA Médica',
          icon: <Psychology />,
          path: '/ai',
          color: 'secondary',
        },
        {
          text: 'Notificaciones',
          icon: <Notifications />,
          path: '/notifications',
          color: 'warning',
        },
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        {
          text: 'Citas',
          icon: <CalendarToday />,
          path: '/appointments',
          color: 'success',
        },
        {
          text: 'Expedientes',
          icon: <Description />,
          path: '/medical-records',
          color: 'info',
        },
        {
          text: 'Pagos',
          icon: <AttachMoney />,
          path: '/payments',
          color: 'warning',
        },
        {
          text: 'Administración',
          icon: <AdminPanelSettings />,
          path: '/admin',
          color: 'error',
        },
        {
          text: 'IA Médica',
          icon: <Psychology />,
          path: '/ai',
          color: 'secondary',
        },
      ];
    }

    return baseItems;
  };

  const getRoleColor = () => {
    if (isAdmin) return 'error';
    if (isDoctor) return 'primary';
    if (isNurse) return 'success';
    return 'info';
  };

  const getRoleText = () => {
    if (isAdmin) return 'Administrador';
    if (isDoctor) return 'Doctor';
    if (isNurse) return 'Enfermero/a';
    return 'Paciente';
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del Drawer */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <LocalHospital sx={{ fontSize: 40, mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            SMD Vital
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Sistema Médico Digital
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${getRoleColor()}.main`,
              width: 48,
              height: 48,
              mr: 2,
              fontSize: '1.2rem',
            }}
          >
            {user?.first_name?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip
              label={getRoleText()}
              color={getRoleColor() as any}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: `${item.color}.main`,
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.95rem',
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
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
            {isPatient ? 'Mi Panel Médico' : 
             isDoctor ? 'Panel del Doctor' : 
             isNurse ? 'Panel de Enfermería' : 
             isAdmin ? 'Panel de Administración' : 
             'Panel Principal'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificaciones">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Cambiar tema">
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Perfil">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: `${getRoleColor()}.main` }}>
                  {user?.first_name?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        TransitionComponent={Fade}
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
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
              width: drawerWidth,
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
              width: drawerWidth,
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'grey.50',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Slide direction="up" in={true} timeout={600}>
            <Box>{children}</Box>
          </Slide>
        </Box>
      </Box>
    </Box>
  );
};
