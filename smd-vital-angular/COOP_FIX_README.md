# Solución para Error Cross-Origin-Opener-Policy (COOP) en Docker

## Problema
El error `Cross-Origin-Opener-Policy policy would block the window.postMessage call` ocurre cuando Google OAuth intenta comunicarse con la aplicación Angular ejecutándose en Docker.

## Solución Implementada

### 1. Configuración de Nginx para Desarrollo
Se creó `nginx-dev.conf` con headers de seguridad específicos para Google OAuth:

```nginx
# Headers específicos para Google OAuth
add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
add_header Cross-Origin-Embedder-Policy "unsafe-none" always;
add_header Cross-Origin-Resource-Policy "cross-origin" always;
```

### 2. Dockerfile Actualizado
El `Dockerfile.dev` ahora:
- Usa nginx para servir la aplicación
- Incluye la configuración específica para desarrollo
- Maneja mejor los headers de seguridad

### 3. Configuración de Angular
- Actualizada la configuración de Google OAuth con scope específico
- Mejor manejo de errores en el componente de login
- Detección automática del entorno Docker

## Cómo Usar

### Opción 1: Script de PowerShell (Windows)
```powershell
.\dev-server.ps1
```

### Opción 2: Docker Compose Directo
```bash
docker-compose up --build
```

### Opción 3: Script Bash (Linux/Mac)
```bash
./dev-server.sh
```

## Verificación

1. La aplicación estará disponible en `http://localhost:3001`
2. El botón de Google OAuth debería funcionar sin errores de COOP
3. Los logs mostrarán "🐳 Detectado entorno Docker" si todo está configurado correctamente

## Archivos Modificados

- `nginx-dev.conf` - Nueva configuración de nginx para desarrollo
- `Dockerfile.dev` - Actualizado para usar nginx
- `docker-compose.yml` - Puerto actualizado a 80
- `src/app/app.config.ts` - Configuración mejorada de Google OAuth
- `src/app/features/auth/login/login.component.ts` - Mejor manejo de errores
- `src/environments/environment.ts` - URLs dinámicas para desarrollo

## Troubleshooting

Si el problema persiste:

1. Verifica que el backend esté ejecutándose en el puerto 8001
2. Revisa los logs del contenedor: `docker-compose logs smd-vital-angular`
3. Asegúrate de que el Google Client ID esté configurado correctamente
4. Verifica que las URLs de redirección en Google Console incluyan `http://localhost:3001`

## Notas de Seguridad

Esta configuración es específica para desarrollo. En producción:
- Usa headers de seguridad más estrictos
- Configura HTTPS
- Implementa validación adicional de tokens
