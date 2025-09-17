import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Iconos SVG reutilizables
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient' as 'admin' | 'doctor' | 'nurse' | 'patient',
    acceptTerms: false,
  });
  const { register, isLoading, error, clearError } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      return false;
    }
    if (!formData.lastName.trim()) {
      return false;
    }
    if (!formData.email.trim()) {
      return false;
    }
    if (formData.password.length < 6) {
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      return false;
    }
    if (!formData.acceptTerms) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const registerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };
      
      console.log('RegisterForm - Sending data:', registerData);
      console.log('RegisterForm - Form data:', formData);
      
      await register(registerData);
      // La redirección se maneja automáticamente en el hook useAuth
    } catch (error) {
      // El error se maneja automáticamente en el store
      console.error('Registration error:', error);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 max-w-4xl w-full">
        {/* Columna Izquierda (Formulario) */}
        <div className="flex flex-col justify-center p-8 md:p-14 flex-1">
          <span className="mb-3 text-4xl font-bold">Crear Cuenta</span>
          <span className="font-light text-gray-500 mb-8">
            Únete a SMD Vital y comienza a gestionar tu salud
          </span>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <UserIcon />
                </span>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 font-light rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <UserIcon />
                </span>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 font-light rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <MailIcon />
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full pl-12 pr-4 py-3 font-light rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@correo.com"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                className="w-full pl-12 pr-4 py-3 font-light rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Teléfono (opcional)"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <LockIcon />
              </span>
              <input
                name="password"
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 font-light rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Contraseña (mín. 6 caracteres)"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <LockIcon />
              </span>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 font-light rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmar contraseña"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuario
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                disabled={isLoading}
              >
                <option value="patient">Paciente</option>
                <option value="nurse">Enfermero/a</option>
                <option value="doctor">Doctor/a</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                Acepto los{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  política de privacidad
                </a>
              </label>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm font-medium text-center animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
            
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>

        {/* Columna Derecha (Imagen) */}
        <div className="relative hidden md:block">
          <img 
            src="https://placehold.co/400x560/3b82f6/ffffff?text=SMD+Vital"
            alt="Registro SMD Vital"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover" 
          />
          <div className="absolute hidden bottom-10 right-6 p-6 bg-white bg-opacity-30 backdrop-blur-sm rounded drop-shadow-lg md:block">
            <span className="text-white text-xl">"Tu salud, nuestra prioridad."</span>
          </div>
        </div>
      </div>
    </div>
  );
};