# 🎯 Kibana - Configuración y Uso para SMD Vital
===============================================

## 🚀 Acceso Rápido
- **URL:** http://localhost:5601
- **Usuario:** (sin autenticación por defecto)
- **Índice:** `smd-vital-logs-*`

## 📊 Dashboards Útiles que Puedes Crear

### 1. **Dashboard de Errores**
```
Filtros:
- level: ERROR
- @timestamp: last 24h

Visualizaciones:
- Gráfico de barras: Errores por servicio
- Timeline: Errores en el tiempo
- Tabla: Top 10 errores más frecuentes
```

### 2. **Dashboard de Performance**
```
Filtros:
- type: http_request
- duration_ms: [* TO *]

Visualizaciones:
- Línea: Tiempo de respuesta promedio por servicio
- Histograma: Distribución de tiempos de respuesta
- Métricas: P95, P99 de latencia
```

### 3. **Dashboard de Negocio**
```
Filtros:
- type: business_event

Visualizaciones:
- Contador: Total de citas creadas hoy
- Contador: Total de pagos procesados
- Gráfico: Usuarios activos por hora
- Timeline: Eventos de negocio en tiempo real
```

### 4. **Dashboard de Seguridad**
```
Filtros:
- type: security_event
- level: WARNING

Visualizaciones:
- Gráfico: Intentos de login fallidos
- Mapa: IPs sospechosas
- Timeline: Eventos de seguridad
```

## 🔍 Queries Útiles (KQL)

### Errores por Servicio:
```kql
level: ERROR AND @timestamp:[now-1h TO now]
```

### Requests Lentos:
```kql
type: http_request AND duration_ms:>1000
```

### Actividad de Usuario:
```kql
user_id: "user_1234" AND @timestamp:[now-1d TO now]
```

### Eventos de Negocio:
```kql
type: business_event AND event_type: "appointment_created"
```

### Errores de Base de Datos:
```kql
type: database_operation AND level: ERROR
```

## 📈 Visualizaciones Recomendadas

### 1. **Métricas en Tiempo Real**
- **Tipo:** Métricas
- **Agregación:** Count
- **Filtro:** @timestamp: [now-5m TO now]
- **Actualización:** 30 segundos

### 2. **Top Servicios por Requests**
- **Tipo:** Pie Chart
- **Agregación:** Count por service.keyword
- **Filtro:** type: http_request

### 3. **Timeline de Errores**
- **Tipo:** Line Chart
- **Eje X:** @timestamp (histograma de 5 minutos)
- **Eje Y:** Count
- **Filtro:** level: ERROR

### 4. **Distribución de Códigos de Estado**
- **Tipo:** Bar Chart
- **Eje X:** status_code
- **Eje Y:** Count
- **Filtro:** type: http_request

## 🚨 Alertas Útiles

### 1. **Alerta de Errores Críticos**
```
Condición: Count > 10
Filtro: level: ERROR AND service: "payment-service"
Ventana: 5 minutos
```

### 2. **Alerta de Latencia Alta**
```
Condición: Average > 2000
Filtro: type: http_request AND duration_ms: [* TO *]
Ventana: 10 minutos
```

### 3. **Alerta de Intentos de Login Sospechosos**
```
Condición: Count > 5
Filtro: type: security_event AND event_type: "failed_login_attempt"
Ventana: 1 minuto
```

## 🎯 Casos de Uso Prácticos

### 1. **Debugging de Problemas**
1. Ve a **Discover**
2. Filtra por `user_id: "usuario_problema"`
3. Ordena por `@timestamp` descendente
4. Ve el flujo completo de la sesión

### 2. **Análisis de Performance**
1. Ve a **Visualize**
2. Crea un **Line Chart**
3. Agrega `duration_ms` como métrica
4. Agrupa por `service.keyword`
5. Ve qué servicio es más lento

### 3. **Monitoreo de Negocio**
1. Ve a **Dashboard**
2. Crea widgets para métricas clave:
   - Citas creadas hoy
   - Pagos procesados
   - Usuarios activos
   - Errores por servicio

### 4. **Análisis de Seguridad**
1. Filtra por `type: security_event`
2. Agrupa por `ip_address`
3. Identifica patrones sospechosos
4. Configura alertas automáticas

## 🔧 Configuración Avanzada

### 1. **Índices Personalizados**
```json
{
  "index_patterns": ["smd-vital-*"],
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

### 2. **Mapeo de Campos**
```json
{
  "mappings": {
    "properties": {
      "user_id": {"type": "keyword"},
      "duration_ms": {"type": "float"},
      "ip_address": {"type": "ip"}
    }
  }
}
```

### 3. **Filtros Guardados**
- **Errores Críticos:** `level: ERROR AND service: "payment-service"`
- **Requests Lentos:** `duration_ms:>2000`
- **Actividad Reciente:** `@timestamp:[now-1h TO now]`

## 📱 Acceso Móvil
- **URL:** http://localhost:5601
- **Responsive:** Sí, funciona en móviles
- **Dashboards:** Se adaptan automáticamente

## 🎉 ¡Listo para Usar!
1. **Accede a Kibana:** http://localhost:5601
2. **Crea tu primer dashboard**
3. **Configura alertas importantes**
4. **Monitorea tu sistema en tiempo real**

¡Kibana te dará visibilidad completa de tu sistema SMD Vital! 🚀


















