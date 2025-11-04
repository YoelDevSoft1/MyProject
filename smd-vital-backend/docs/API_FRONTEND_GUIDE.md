# Guía de Consumo de APIs para Frontend

Esta guía describe los endpoints expuestos a través del API Gateway (`http://localhost:8000`) para facilitar la integración del frontend. Todas las rutas protegidas requieren encabezado `Authorization: Bearer <JWT>` y `Content-Type: application/json`.

## 1. Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/auth/register` | Registro de pacientes, familiares o doctores. | 201, 400, 409 |
| `POST` | `/api/auth/login` | Obtiene `access_token` y `refresh_token`. | 200, 401, 422 |
| `POST` | `/api/auth/refresh` | Emite nuevo `access_token` usando `refresh_token`. | 200, 401 |
| `POST` | `/api/auth/logout` | Invalida tokens activos. | 200, 401 |
| `POST` | `/api/auth/forgot-password` | Solicita reset de contraseña (email). | 200, 404 |
| `POST` | `/api/auth/reset-password` | Define contraseña con token temporal. | 200, 400 |
| `GET` | `/api/auth/verify-email/{token}` | Verifica correo electrónico. | 200, 400 |
| `GET` | `/api/auth/health` | Health-check público. | 200 |

**Respuesta de login (ejemplo)**

```json
{
  "access_token": "jwt_token",
  "refresh_token": "jwt_refresh",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_123",
    "email": "usuario@correo.com",
    "role": "patient"
  }
}
```

## 2. Usuarios y Perfiles (`/api/users`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `GET` | `/api/users/profile` | Obtiene perfil autenticado. | 200, 404 |
| `PUT` | `/api/users/profile` | Actualiza perfil personal y datos médicos. | 200, 400 |
| `GET` | `/api/users/notifications` | Lista notificaciones del usuario. | 200 |
| `PUT` | `/api/users/notifications/settings` | Guarda preferencias de notificación. | 200, 400 |
| `GET` | `/api/users/notifications/settings` | Recupera preferencias de notificación. | 200 |
| `PUT` | `/api/users/notifications/{id}/read` | Marca notificación como leída. | 200, 404 |
| `GET` | `/api/users/doctors/search?specialty=&rating=` | Busca doctores con filtros. | 200 |
| `GET` | `/api/users/doctors/{doctor_id}` | Detalle de doctor. | 200, 404 |
| `GET` | `/api/users/health` | Health-check. | 200 |

## 3. Citas Médicas (`/api/appointments`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/appointments` | Programa nueva cita. | 201, 400, 409 |
| `GET` | `/api/appointments` | Lista citas del usuario (soporta filtros por estado y rango). | 200 |
| `GET` | `/api/appointments/{appointment_id}` | Detalle de cita. | 200, 404 |
| `PUT` | `/api/appointments/{appointment_id}` | Reprograma o actualiza datos. | 200, 404 |
| `DELETE` | `/api/appointments/{appointment_id}` | Cancela cita. | 200, 404 |
| `GET` | `/api/appointments/patient/{patient_id}` | Histórico por paciente. | 200, 404 |
| `GET` | `/api/appointments/doctor/{doctor_id}` | Agenda por doctor. | 200, 404 |
| `GET` | `/api/appointments/available?doctor_id=&date=` | Disponibilidad de agendas. | 200 |
| `GET` | `/api/appointments/health` | Health-check. | 200 |

**Payload de creación**

```json
{
  "patient_id": "patient_123",
  "doctor_id": "doctor_456",
  "appointment_date": "2024-05-20",
  "appointment_time": "14:30:00",
  "duration_minutes": 45,
  "appointment_type": "consulta_general",
  "reason": "Dolor de espalda",
  "notes": "Paciente con antecedentes de hipertensión"
}
```

## 4. Historias Clínicas (`/api/medical-records`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/medical-records` | Crea historial clínico vinculado a cita. | 201, 400 |
| `GET` | `/api/medical-records` | Lista registros (admin/doctores). | 200 |
| `GET` | `/api/medical-records/{record_id}` | Detalle de registro. | 200, 404 |
| `GET` | `/api/medical-records/patient/{patient_id}` | Historial completo del paciente. | 200, 404 |
| `POST` | `/api/medical-records/prescriptions` | Registra fórmula médica. | 201, 400 |
| `GET` | `/api/medical-records/prescriptions/patient/{patient_id}` | Prescripciones por paciente. | 200, 404 |
| `POST` | `/api/medical-records/vital-signs` | Guarda signos vitales. | 201, 400 |
| `GET` | `/api/medical-records/vital-signs/patient/{patient_id}` | Histórico de signos vitales. | 200, 404 |
| `POST` | `/api/medical-records/ratings` | Califica doctor. | 201, 400 |
| `GET` | `/api/medical-records/ratings/doctor/{doctor_id}` | Calificaciones de doctor. | 200, 404 |
| `GET` | `/api/medical-records/stats/ratings` | Métricas agregadas de calificaciones. | 200 |
| `GET` | `/api/medical-records/health` | Health-check. | 200 |

## 5. Pagos y Facturación (`/api/payments`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/payments/create-payment-intent` | Crea intención de pago (Stripe). | 201, 400, 500 |
| `GET` | `/api/payments` | Lista pagos filtrables por estado. | 200 |
| `GET` | `/api/payments/{payment_id}` | Detalle del pago. | 200, 404 |
| `POST` | `/api/payments/refunds` | Solicita reembolso parcial/total. | 201, 400 |
| `GET` | `/api/payments/refunds` | Consulta historial de reembolsos. | 200 |
| `POST` | `/api/payments/invoices` | Genera factura en PDF/JSON. | 201, 400 |
| `GET` | `/api/payments/invoices` | Lista facturas emitidas. | 200 |
| `POST` | `/api/payments/webhooks/stripe` | Recepción de eventos Stripe (usar `Stripe-Signature`). | 200, 400 |
| `GET` | `/api/payments/health` | Health-check. | 200 |

## 6. Notificaciones (`/api/notifications`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/notifications/send-notification` | Envía notificación individual (email/SMS/WhatsApp/push). | 201, 400 |
| `GET` | `/api/notifications` | Lista notificaciones enviadas. | 200 |
| `GET` | `/api/notifications/{notification_id}` | Detalle de mensaje. | 200, 404 |
| `PUT` | `/api/notifications/{notification_id}/read` | Marca una notificación como leída. | 200, 404 |
| `POST` | `/api/notifications/bulk` | Envio masivo por segmentos. | 201, 400 |
| `GET` | `/api/notifications/templates` | Catálogo de plantillas. | 200 |
| `POST` | `/api/notifications/templates` | Crea nueva plantilla. | 201, 400 |
| `GET` | `/api/notifications/settings/{user_id}` | Configuración de canales por usuario. | 200, 404 |
| `PUT` | `/api/notifications/settings/{user_id}` | Actualiza preferencias. | 200, 404 |
| `GET` | `/api/notifications/stats` | Métricas de entrega. | 200 |
| `GET` | `/api/notifications/health` | Health-check. | 200 |

## 7. Métricas de Salud (`/api/health-metrics`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/health-metrics/metrics` | Registra lectura desde IoT/wearables. | 201, 400 |
| `GET` | `/api/health-metrics/metrics/patient/{patient_id}` | Histórico de métricas. | 200, 404 |
| `GET` | `/api/health-metrics/metrics/patient/{patient_id}/trends` | Tendencias agregadas. | 200, 404 |
| `GET` | `/api/health-metrics/metrics/alerts` | Alertas activas por riesgo. | 200 |
| `POST` | `/api/health-metrics/metrics/alerts/{alert_id}/acknowledge` | Confirma recepción de alerta. | 200, 404 |
| `GET` | `/api/health-metrics/health` | Health-check. | 200 |

## 8. IA Médica (`/api/ai`)

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| `POST` | `/api/ai/chat` | Conversación asistida con IA. | 200, 400, 500 |
| `POST` | `/api/ai/analyze-symptoms` | Analiza síntomas para triage. | 200, 400, 500 |
| `POST` | `/api/ai/generate-report` | Genera informe clínico resumido. | 200, 400, 500 |
| `GET` | `/api/ai/medical-knowledge` | Obtiene artículos y guías médicas. | 200 |
| `GET` | `/api/ai/health` | Health-check. | 200 |

## 9. Convenciones Generales

- **Versionado**: Actualmente `v1` implícito; incorpore `X-API-Version: v1` en headers para compatibilidad futura.
- **Errores**: Las respuestas de error siguen formato `{ "detail": "mensaje descriptivo", "code": "error_key" }`.
- **Paginación**: Rutas de listado aceptan `?page=` y `?page_size=` donde aplica (`appointments`, `notifications`, `payments`).
- **Ordenamiento y filtros**: Use parámetros como `?status=`, `?from=`/`?to=`, `?channel=` según cada recurso.
- **Entorno productivo**: Reemplace host `localhost` por el dominio configurado en el Gateway y use HTTPS.

Para ejemplos adicionales consulte `docs/API_REFERENCE.md` y la colección Postman en `docs/api/postman/SMD_Vital_API.json`.
