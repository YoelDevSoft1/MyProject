# SMD VITAL - Configuración de IA Gratuita 100%

## 🤖 Introducción

Este documento explica cómo configurar y usar modelos de IA 100% gratuitos en SMD VITAL usando **Ollama**. Los modelos se ejecutan localmente en tu servidor, sin necesidad de APIs externas ni costos.

## 📋 Características

- ✅ **100% Gratuito** - Sin costos de API
- ✅ **Privacidad Total** - Datos procesados localmente
- ✅ **Múltiples Modelos** - Llama2, Mistral, CodeLlama, MedLlama, etc.
- ✅ **Streaming en Tiempo Real** - Respuestas en vivo
- ✅ **Especialización Médica** - Modelos entrenados para medicina
- ✅ **Fácil Instalación** - Script automatizado incluido

## 🚀 Instalación Rápida

### 1. Iniciar los Servicios

```bash
# Iniciar Ollama y el servicio de IA
docker-compose up -d ollama ai-langgraph

# Verificar que estén corriendo
docker-compose ps
```

### 2. Instalar Modelos de IA

```bash
# Ejecutar el script de instalación
cd smd-vital-backend
./scripts/install-ai-models.sh
```

### 3. Verificar Instalación

```bash
# Verificar estado de Ollama
curl http://localhost:11434/api/tags

# Verificar estado del servicio de IA
curl http://localhost:8008/ai/free/status
```

## 🎯 Modelos Disponibles

### Modelos Ligeros (2-4GB RAM)
- **phi:3b** - Microsoft Phi, muy eficiente
- **gemma:2b** - Google Gemma, ultra ligero
- **orca-mini** - Microsoft Orca, conversacional

### Modelos Balanceados (4-8GB RAM)
- **llama2** - Meta Llama 2, excelente calidad
- **mistral** - Mistral AI, muy rápido
- **phi** - Microsoft Phi, balanceado
- **gemma** - Google Gemma, eficiente

### Modelos Avanzados (8-16GB RAM)
- **llama2:13b** - Llama 2 13B, máxima calidad
- **codellama:13b** - Code Llama 13B, especializado
- **mistral:7b** - Mistral 7B, avanzado

### Modelos Médicos Especializados
- **medllama** - Entrenado específicamente para medicina
- **neural-chat** - Optimizado para conversación médica

## 🔧 Configuración

### Variables de Entorno

```bash
# En docker-compose.yml
FREE_AI_ENABLED=true
DEFAULT_MODEL=llama2
OLLAMA_BASE_URL=http://ollama:11434
```

### Recursos Recomendados

```yaml
# Para Ollama en docker-compose.yml
deploy:
  resources:
    limits:
      memory: 8G      # Para modelos grandes
      cpus: '4.0'
    reservations:
      memory: 4G      # Mínimo para modelos básicos
      cpus: '2.0'
```

## 📡 API Endpoints

### Consulta Básica

```bash
curl -X POST "http://localhost:8008/ai/free/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cuáles son los síntomas de la gripe?",
    "user_id": "user123",
    "model": "llama2"
  }'
```

### Consulta con Streaming

```bash
curl -X POST "http://localhost:8008/ai/free/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explica el tratamiento para la diabetes",
    "user_id": "user123",
    "model": "llama2"
  }'
```

### Listar Modelos

```bash
curl http://localhost:8008/ai/free/models
```

### Instalar Modelo

```bash
curl -X POST "http://localhost:8008/ai/free/install/llama2"
```

### Estado del Servicio

```bash
curl http://localhost:8008/ai/free/status
```

## 💻 Uso en Frontend

### Componente React

```tsx
import { FreeAIChat } from './components/ai/FreeAIChat';

function App() {
  return (
    <div>
      <FreeAIChat />
    </div>
  );
}
```

### Servicio TypeScript

```typescript
import { freeAIService } from './services/freeAIService';

// Consulta simple
const response = await freeAIService.queryAI({
  query: "¿Qué es la hipertensión?",
  user_id: "user123",
  model: "llama2"
});

// Consulta médica específica
const diagnosis = await freeAIService.getDiagnosis(
  "Dolor de cabeza y fiebre",
  { age: 30, gender: "female" },
  "medllama"
);

// Streaming
for await (const chunk of freeAIService.streamQuery({
  query: "Explica el tratamiento para la gripe",
  user_id: "user123",
  model: "llama2"
})) {
  console.log(chunk);
}
```

## 🏥 Casos de Uso Médicos

### 1. Diagnóstico Preliminar

```typescript
const diagnosis = await freeAIService.getDiagnosis(
  "Dolor en el pecho, dificultad para respirar, sudoración",
  {
    age: 45,
    gender: "male",
    medical_history: ["hipertensión"]
  },
  "medllama"
);
```

### 2. Análisis de Signos Vitales

```typescript
const analysis = await freeAIService.analyzeVitalSigns({
  blood_pressure: "140/90",
  heart_rate: 95,
  temperature: 37.2,
  oxygen_saturation: 98
}, "llama2");
```

### 3. Recomendación de Medicamentos

```typescript
const medication = await freeAIService.getMedicationRecommendation(
  "Hipertensión arterial",
  {
    age: 60,
    allergies: ["penicilina"],
    current_medications: ["metformina"]
  },
  "medllama"
);
```

## 🔍 Monitoreo y Debugging

### Logs de Ollama

```bash
# Ver logs de Ollama
docker logs smd_vital_ollama

# Ver logs del servicio de IA
docker logs smd_vital_ai_langgraph
```

### Métricas de Rendimiento

```bash
# Uso de memoria
docker stats smd_vital_ollama

# Estado de modelos
curl http://localhost:11434/api/tags | jq
```

## 🛠️ Solución de Problemas

### Problema: Ollama no responde

```bash
# Reiniciar Ollama
docker-compose restart ollama

# Verificar logs
docker logs smd_vital_ollama
```

### Problema: Modelo no se instala

```bash
# Verificar espacio en disco
df -h

# Limpiar modelos no usados
docker exec smd_vital_ollama ollama list
docker exec smd_vital_ollama ollama rm modelo_no_usado
```

### Problema: Respuestas lentas

```bash
# Usar modelo más ligero
curl -X POST "http://localhost:8008/ai/free/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Consulta médica",
    "user_id": "user123",
    "model": "phi:3b"
  }'
```

## 📊 Comparación de Modelos

| Modelo | Tamaño | RAM | Velocidad | Calidad | Uso Recomendado |
|--------|--------|-----|-----------|---------|-----------------|
| phi:3b | 3B | 2GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Desarrollo, respuestas rápidas |
| llama2 | 7B | 4GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Producción, balanceado |
| llama2:13b | 13B | 8GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Máxima calidad |
| medllama | 7B | 4GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medicina especializada |

## 🔒 Seguridad y Privacidad

- ✅ **Datos Locales**: Toda la información se procesa en tu servidor
- ✅ **Sin APIs Externas**: No se envían datos a terceros
- ✅ **Control Total**: Tienes control completo sobre los modelos
- ✅ **Cumplimiento**: Ideal para entornos que requieren privacidad estricta

## 🚀 Optimización

### Para Desarrollo

```yaml
# Usar modelo ligero
DEFAULT_MODEL=phi:3b
```

### Para Producción

```yaml
# Usar modelo balanceado
DEFAULT_MODEL=llama2
```

### Para Máxima Calidad

```yaml
# Usar modelo avanzado
DEFAULT_MODEL=llama2:13b
```

## 📚 Recursos Adicionales

- [Documentación de Ollama](https://ollama.ai/docs)
- [Modelos disponibles](https://ollama.ai/library)
- [Guía de optimización](https://ollama.ai/docs/performance)
- [API Reference](http://localhost:8008/docs) (cuando el servicio esté corriendo)

## 🆘 Soporte

Si tienes problemas:

1. Verifica los logs: `docker logs smd_vital_ollama`
2. Revisa el estado: `curl http://localhost:8008/ai/free/status`
3. Consulta la documentación de Ollama
4. Revisa los issues en el repositorio

---

**¡Disfruta de tu IA médica 100% gratuita! 🎉**

