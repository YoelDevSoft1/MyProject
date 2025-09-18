# 🔐 Credenciales de Acceso SMD Vital

## ✅ Credenciales que Funcionan

### Doctor de Prueba
- **Email**: `testdoctor@smdvital.com`
- **Password**: `Test123!`
- **Rol**: Doctor

### Usuarios Existentes en la Base de Datos
- **Email**: `doctor@smdvital.com`
- **Password**: (Contraseña original - no se puede cambiar por seguridad)
- **Rol**: Doctor

- **Email**: `nurse@smdvital.com`
- **Password**: (Contraseña original - no se puede cambiar por seguridad)
- **Rol**: Enfermero

- **Email**: `patient@smdvital.com`
- **Password**: (Contraseña original - no se puede cambiar por seguridad)
- **Rol**: Paciente

## 🚀 Cómo Acceder al Sistema

1. **Ve a**: `http://localhost:3001/auth/sign-in`
2. **Usa las credenciales**:
   - **Email**: `testdoctor@smdvital.com`
   - **Password**: `Test123!`
3. **Después del login**, serás redirigido al dashboard
4. **Navega a**: `http://localhost:3001/admin/appointments`

## 🔧 Estado del Sistema

- ✅ **Backend**: Funcionando correctamente
- ✅ **Base de Datos**: Conectada y con datos
- ✅ **Autenticación**: Funcionando
- ✅ **Frontend**: Funcionando en puerto 3001
- ✅ **API Gateway**: Funcionando en puerto 8000

## 📝 Notas Importantes

- El sistema de autenticación tiene políticas de seguridad estrictas para las contraseñas
- Las contraseñas deben contener al menos:
  - Una letra mayúscula
  - Un carácter especial
  - No pueden contener patrones comunes como "password"
- El usuario `testdoctor@smdvital.com` fue creado específicamente para pruebas
