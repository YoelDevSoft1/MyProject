// Script de prueba para verificar la transformación de datos del usuario

// Simular los datos que devuelve el backend
const backendUserData = {
  id: "a9cdfe79-e160-4814-9d2c-c3bd9836f831",
  email: "test@example.com",
  username: "test",
  role: "user",
  is_active: true,
  is_verified: true,
  first_name: "Test",
  last_name: "User",
  profile_picture: "https://example.com/pic.jpg",
  created_at: "2025-09-17T14:05:59.161580",
  updated_at: "2025-09-17T14:05:59.161580"
};

// Función transformUserProfile (copiada del userService)
function transformUserProfile(userData) {
  if (!userData) return null;

  // Construir el nombre completo desde first_name y last_name
  let fullName = '';
  if (userData.first_name || userData.last_name) {
    fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  } else if (userData.name) {
    fullName = userData.name;
  } else if (userData.username) {
    fullName = userData.username;
  } else if (userData.email) {
    fullName = userData.email.split('@')[0];
  }

  return {
    id: userData.id || userData.user_id,
    email: userData.email,
    name: fullName || 'Usuario',
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    username: userData.username || userData.email?.split('@')[0] || '',
    role: userData.role || 'user',
    specialty: userData.specialty || '',
    phone: userData.phone || '',
    avatar: userData.avatar || userData.profile_picture || '',
    is_active: userData.is_active || false,
    is_verified: userData.is_verified || false,
    created_at: userData.created_at || '',
    updated_at: userData.updated_at || '',
    profile_complete: userData.profile_complete || false,
    notifications_enabled: userData.notifications_enabled || false,
    email_notifications: userData.email_notifications || false,
    sms_notifications: userData.sms_notifications || false,
    push_notifications: userData.push_notifications || false
  };
}

// Probar la transformación
console.log('Datos originales del backend:');
console.log(JSON.stringify(backendUserData, null, 2));

console.log('\nDatos transformados para el frontend:');
const transformedData = transformUserProfile(backendUserData);
console.log(JSON.stringify(transformedData, null, 2));

console.log('\nNombre completo generado:', transformedData.name);

