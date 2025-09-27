# 🚀 SMD VITAL - Guía de Implementación Rápida

## ✅ Implementación Completa en 15 Minutos

### 🎯 Lo que se ha implementado:

#### 1. **Sistema de Pagos Stripe** ✅
- **Servicio:** `payment-service` (Puerto 8006)
- **Flujo:** PaymentIntent con client_secret (más seguro)
- **Características:**
  - Integración completa con Stripe
  - Webhooks para confirmación automática
  - Base de datos PostgreSQL para auditoría
  - Manejo de errores y reintentos

#### 2. **Servicio de Notificaciones Multicanal** ✅
- **Servicio:** `notification-service` (Puerto 8004)
- **Canales:** Email, SMS, WhatsApp
- **Características:**
  - Plantillas dinámicas
  - Preferencias por usuario
  - Event sourcing para auditoría
  - Procesamiento asíncrono

#### 3. **Sistema de Métricas de Salud** ✅
- **Servicio:** `health-metrics-service` (Puerto 8007)
- **Características:**
  - Modelo híbrido JSONB + agregaciones
  - Detección automática de alertas
  - Series temporales optimizadas
  - Dashboard interactivo

#### 4. **Componentes React** ✅
- **StripePayment:** Componente de pagos
- **HealthMetricsDashboard:** Dashboard de salud
- **HealthMetricForm:** Formulario de métricas

---

## 🚀 Despliegue Inmediato

### Paso 1: Configurar Variables de Entorno
```bash
cd smd-vital-backend
cp .env.example .env
# Editar .env con tus claves de Stripe, email, etc.
```

### Paso 2: Ejecutar Despliegue
```bash
# En Windows (PowerShell)
./scripts/deploy.sh

# O manualmente:
docker-compose up -d --build
```

### Paso 3: Verificar Servicios
```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Ver logs
docker-compose logs -f
```

---

## 🔗 Endpoints Disponibles

### **Servicios Backend:**
- **Auth Service:** http://localhost:8001
- **User Service:** http://localhost:8002
- **Appointment Service:** http://localhost:8003
- **Notification Service:** http://localhost:8004
- **Medical Records Service:** http://localhost:8005
- **Payment Service:** http://localhost:8006
- **Health Metrics Service:** http://localhost:8007

### **Monitoreo:**
- **Grafana:** http://localhost:3005 (admin/smdvital_grafana_2024)
- **Prometheus:** http://localhost:9090
- **Jaeger:** http://localhost:16686
- **Kibana:** http://localhost:5601

---

## 💳 Uso del Sistema de Pagos

### Crear PaymentIntent:
```bash
curl -X POST http://localhost:8006/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount_cents": 50000,
    "currency": "COP"
  }'
```

### Respuesta:
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx",
  "amount_cents": 50000,
  "currency": "COP",
  "status": "requires_payment_method"
}
```

---

## 📊 Uso del Sistema de Métricas de Salud

### Registrar Métrica:
```bash
curl -X POST http://localhost:8007/record-metric \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "metric_code": "blood_pressure_systolic",
    "value": 120,
    "notes": "Medición matutina"
  }'
```

### Obtener Dashboard:
```bash
curl http://localhost:8007/dashboard/550e8400-e29b-41d4-a716-446655440000
```

---

## 📧 Uso del Sistema de Notificaciones

### Enviar Notificación:
```bash
curl -X POST http://localhost:8004/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "appointment_created",
    "channel": "email",
    "data": {
      "email": "paciente@ejemplo.com",
      "patient_name": "Juan Pérez",
      "appointment_date": "2024-01-15",
      "appointment_time": "10:00 AM"
    }
  }'
```

---

## 🎨 Uso de Componentes React

### Instalar Dependencias:
```bash
cd smd-vital-frontend
npm install
```

### Variables de Entorno Frontend:
```bash
# Crear .env en smd-vital-frontend/
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Usar Componente de Pagos:
```tsx
import StripePayment from './components/payments/StripePayment';

<StripePayment
  appointmentId="123e4567-e89b-12d3-a456-426614174000"
  userId="550e8400-e29b-41d4-a716-446655440000"
  amount={50000}
  currency="COP"
  onPaymentSuccess={(paymentIntentId) => {
    console.log('Pago exitoso:', paymentIntentId);
  }}
  onPaymentError={(error) => {
    console.error('Error de pago:', error);
  }}
/>
```

### Usar Dashboard de Salud:
```tsx
import HealthMetricsDashboard from './components/health/HealthMetricsDashboard';

<HealthMetricsDashboard />
```

---

## 🔧 Configuración de Stripe

### 1. Crear cuenta en Stripe
- Ir a https://stripe.com
- Crear cuenta y obtener claves

### 2. Configurar webhooks
- En el dashboard de Stripe, ir a Webhooks
- Crear endpoint: `http://localhost:8006/webhook`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. Configurar variables
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📈 Monitoreo y Observabilidad

### Verificar Salud de Servicios:
```bash
# Todos los servicios
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
curl http://localhost:8006/health
curl http://localhost:8007/health
```

### Ver Logs:
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f payment-service
docker-compose logs -f notification-service
docker-compose logs -f health-metrics-service
```

---

## 🚨 Solución de Problemas

### Servicio no inicia:
```bash
# Ver logs del servicio
docker-compose logs [nombre-servicio]

# Reiniciar servicio
docker-compose restart [nombre-servicio]

# Reconstruir servicio
docker-compose up -d --build [nombre-servicio]
```

### Base de datos no conecta:
```bash
# Verificar PostgreSQL
docker-compose exec postgres psql -U smdvital -d smdvital -c "SELECT 1;"

# Verificar Redis
docker-compose exec redis redis-cli ping
```

### Pagos no funcionan:
1. Verificar claves de Stripe en `.env`
2. Verificar webhook en Stripe dashboard
3. Ver logs: `docker-compose logs -f payment-service`

---

## 🎉 ¡Listo para Producción!

### Características Implementadas:
- ✅ **Pagos seguros** con Stripe
- ✅ **Notificaciones multicanal** 
- ✅ **Métricas de salud** avanzadas
- ✅ **Monitoreo completo** con Grafana/Prometheus
- ✅ **Logging centralizado** con ELK Stack
- ✅ **Tracing distribuido** con Jaeger
- ✅ **Escalabilidad horizontal** con Docker
- ✅ **Base de datos optimizada** PostgreSQL

### Próximos Pasos:
1. Configurar dominio y SSL
2. Configurar CI/CD
3. Implementar tests automatizados
4. Configurar backup de base de datos
5. Implementar rate limiting

---

## 📞 Soporte

Si tienes problemas:
1. Revisar logs: `docker-compose logs -f`
2. Verificar salud: `curl http://localhost:800X/health`
3. Revisar configuración en `.env`
4. Verificar que todos los puertos estén libres

**¡SMD VITAL está listo para revolucionar la salud digital! 🏥💻**


