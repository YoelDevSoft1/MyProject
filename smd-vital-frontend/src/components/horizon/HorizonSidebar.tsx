// ========================================
// HORIZON UI SIDEBAR COMPONENT
// ========================================

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
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
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';

interface HorizonSidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary' | 'persistent';
  width?: number;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  children?: MenuItem[];
  roles?: string[];
}

export const HorizonSidebar: React.FC<HorizonSidebarProps> = ({
  open,
  onClose,
  variant = 'permanent',
  width = 280,
}) => {
  const { user, logout } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      id: 'appointments',
      title: 'Citas Médicas',
      icon: <CalendarToday />,
      path: '/appointments',
      badge: 3,
      roles: ['doctor', 'nurse', 'admin'],
    },
    {
      id: 'medical-records',
      title: 'Expedientes',
      icon: <Description />,
      path: '/medical-records',
      badge: 5,
      roles: ['doctor', 'nurse', 'admin'],
    },
    {
      id: 'payments',
      title: 'Pagos',
      icon: <AttachMoney />,
      path: '/payments',
      roles: ['admin', 'patient'],
    },
    {
      id: 'ai-tools',
      title: 'IA Médica',
      icon: <Psychology />,
      path: '/ai',
      roles: ['doctor', 'nurse', 'admin'],
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: <Notifications />,
      path: '/notifications',
      badge: 12,
    },
    {
      id: 'admin',
      title: 'Administración',
      icon: <AdminPanelSettings />,
      path: '/admin',
      roles: ['admin'],
      children: [
        {
          id: 'users',
          title: 'Usuarios',
          icon: <Person />,
          path: '/admin/users',
        },
        {
          id: 'settings',
          title: 'Configuración',
          icon: <Settings />,
          path: '/admin/settings',
        },
      ],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    if (isDoctor && item.roles.includes('doctor')) return true;
    if (isNurse && item.roles.includes('nurse')) return true;
    if (isPatient && item.roles.includes('patient')) return true;
    return false;
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      // Navigate to path
      window.location.href = item.path;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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

  const renderMenuItem = (item: MenuItem, level = 0) => (
    <React.Fragment key={item.id}>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => handleItemClick(item)}
          sx={{
            pl: 2 + level * 2,
            py: 1.5,
            borderRadius: 2,
            mb: 0.5,
            mx: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiListItemIcon-root': {
                color: 'white',
              },
              '& .MuiListItemText-primary': {
                color: 'white',
              },
            },
            ...(level > 0 && {
              backgroundColor: 'grey.50',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }),
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontWeight: level > 0 ? 400 : 500,
              fontSize: level > 0 ? '0.875rem' : '0.95rem',
            }}
          />
          {item.badge && (
            <Badge
              badgeContent={item.badge}
              color="error"
              sx={{ mr: 1 }}
            />
          )}
          {item.children && (
            expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItemButton>
      </ListItem>
      
      {item.children && (
        <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <List sx={{ px: 1, py: 2 }}>
          {filteredMenuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'white',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
        
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 2 }}>
          v1.0.0 • 2024
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
