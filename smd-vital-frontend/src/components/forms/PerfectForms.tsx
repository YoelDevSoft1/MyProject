// ========================================
// FORMULARIOS PERFECTOS PARA SMD VITAL
// ========================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Chip,
  Alert,
  LinearProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Zoom,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  LocalHospital,
  Description,
  AttachMoney,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Warning,
  Info,
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';

// ========================================
// FORMULARIO DE REGISTRO PERFECTO
// ========================================

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin';
  specialty?: string;
  license?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export const PerfectRegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    specialty: '',
    license: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Información Personal',
    'Credenciales',
    'Información Profesional',
    'Términos y Condiciones',
  ];

  const validateField = (name: keyof RegisterFormData, value: any): string => {
    switch (name) {
      case 'firstName':
        return value.length < 2 ? 'El nombre debe tener al menos 2 caracteres' : '';
      case 'lastName':
        return value.length < 2 ? 'El apellido debe tener al menos 2 caracteres' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Ingrese un email válido' : '';
      case 'phone':
        const phoneRegex = /^\+?[\d\s-()]+$/;
        return !phoneRegex.test(value) ? 'Ingrese un teléfono válido' : '';
      case 'password':
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/(?=.*[a-z])/.test(value)) return 'Debe contener al menos una letra minúscula';
        if (!/(?=.*[A-Z])/.test(value)) return 'Debe contener al menos una letra mayúscula';
        if (!/(?=.*\d)/.test(value)) return 'Debe contener al menos un número';
        return '';
      case 'confirmPassword':
        return value !== formData.password ? 'Las contraseñas no coinciden' : '';
      case 'specialty':
        return formData.role !== 'patient' && value.length < 2 ? 'La especialidad es requerida' : '';
      case 'license':
        return (formData.role === 'doctor' || formData.role === 'nurse') && value.length < 5 ? 'El número de licencia es requerido' : '';
      case 'acceptTerms':
        return !value ? 'Debe aceptar los términos y condiciones' : '';
      case 'acceptPrivacy':
        return !value ? 'Debe aceptar la política de privacidad' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleNext = () => {
    const currentStepFields = getCurrentStepFields();
    let hasErrors = false;
    const newErrors: Partial<RegisterFormData> = {};

    currentStepFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    if (!hasErrors) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const getCurrentStepFields = (): (keyof RegisterFormData)[] => {
    switch (activeStep) {
      case 0: return ['firstName', 'lastName', 'email', 'phone'];
      case 1: return ['password', 'confirmPassword'];
      case 2: return ['role', 'specialty', 'license'];
      case 3: return ['acceptTerms', 'acceptPrivacy'];
      default: return [];
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      alert('¡Registro exitoso!');
    }, 2000);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['error', 'warning', 'info', 'success', 'success'];
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <Person sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Crear Cuenta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Únete a SMD Vital y comienza a gestionar tu práctica médica
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {/* Paso 1: Información Personal */}
          {activeStep === 0 && (
            <Fade in={true}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* Paso 2: Credenciales */}
          {activeStep === 1 && (
            <Fade in={true}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  {formData.password && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Fortaleza de la contraseña:
                        </Typography>
                        <Chip
                          label={strengthLabels[passwordStrength - 1] || 'Muy débil'}
                          color={strengthColors[passwordStrength - 1] as any}
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(passwordStrength / 5) * 100}
                        color={strengthColors[passwordStrength - 1] as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* Paso 3: Información Profesional */}
          {activeStep === 2 && (
            <Fade in={true}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel component="legend">Tipo de Usuario</FormLabel>
                    <RadioGroup
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      row
                    >
                      <FormControlLabel value="patient" control={<Radio />} label="Paciente" />
                      <FormControlLabel value="doctor" control={<Radio />} label="Doctor" />
                      <FormControlLabel value="nurse" control={<Radio />} label="Enfermero/a" />
                      <FormControlLabel value="admin" control={<Radio />} label="Administrador" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                {(formData.role === 'doctor' || formData.role === 'nurse') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Especialidad"
                        value={formData.specialty}
                        onChange={(e) => handleInputChange('specialty', e.target.value)}
                        error={!!errors.specialty}
                        helperText={errors.specialty}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalHospital color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Número de Licencia"
                        value={formData.license}
                        onChange={(e) => handleInputChange('license', e.target.value)}
                        error={!!errors.license}
                        helperText={errors.license}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Description color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Fade>
          )}

          {/* Paso 4: Términos y Condiciones */}
          {activeStep === 3 && (
            <Fade in={true}>
              <Box>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad.
                  </Typography>
                </Alert>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    />
                  }
                  label="Acepto los términos y condiciones de servicio"
                />
                {errors.acceptTerms && (
                  <Typography variant="caption" color="error" display="block">
                    {errors.acceptTerms}
                  </Typography>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptPrivacy}
                      onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                    />
                  }
                  label="Acepto la política de privacidad y el manejo de datos personales"
                />
                {errors.acceptPrivacy && (
                  <Typography variant="caption" color="error" display="block">
                    {errors.acceptPrivacy}
                  </Typography>
                )}
              </Box>
            </Fade>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 2 }}
          >
            Anterior
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <LinearProgress size={20} /> : <Save />}
              sx={{ 
                borderRadius: 2,
                px: 4,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Siguiente
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// ========================================
// FORMULARIO DE CITA MÉDICA PERFECTO
// ========================================

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  duration: number;
  notes: string;
  type: 'consultation' | 'follow_up' | 'emergency' | 'procedure';
}

export const PerfectAppointmentForm: React.FC = () => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    priority: 'normal',
    duration: 30,
    notes: '',
    type: 'consultation',
  });

  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});

  const handleInputChange = (name: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    // Validación y envío
    console.log('Enviando cita:', formData);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <CalendarToday sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Nueva Cita Médica
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Programa una nueva cita para tu paciente
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Paciente</InputLabel>
              <Select
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                label="Paciente"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="1">María González</MenuItem>
                <MenuItem value="2">Carlos López</MenuItem>
                <MenuItem value="3">Ana Martínez</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={formData.doctorId}
                onChange={(e) => handleInputChange('doctorId', e.target.value)}
                label="Doctor"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="1">Dr. Carlos López</MenuItem>
                <MenuItem value="2">Dr. Ana Martínez</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hora"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Motivo de la cita"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Prioridad"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duración (minutos)"
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas adicionales"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<Save />}
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
            }}
          >
            Crear Cita
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
