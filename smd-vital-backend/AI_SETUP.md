## Configuración de IA con OpenAI (sin modelos locales)

Este backend ahora usa exclusivamente la API de OpenAI para IA. Se removieron los modelos locales (Ollama) para reducir peso y complejidad.

### Variables de entorno
- Defina su clave:

```
OPENAI_API_KEY=sk-xxxx
```

Opcional:
```
ANTHROPIC_API_KEY=
```

Actualice su archivo `.env` tomando como referencia `env.example`.

### Docker Compose
- No se levanta el servicio `ollama`.
- El servicio `ai-langgraph` queda configurado para usar OpenAI:
  - `FREE_AI_ENABLED=false`
  - `DEFAULT_MODEL=gpt-4o-mini` (ajústelo según su plan)

### Puesta en marcha
1. Exportar claves (PowerShell):
```
$env:OPENAI_API_KEY="sk-xxxx"
```
2. Levantar servicios esenciales:
```
docker-compose up -d postgres redis rabbitmq ai-langgraph auth-service user-service appointment-service notification-service medical-records-service payment-service nginx
```

### Verificación rápida
- Salud de `ai-langgraph`: `http://localhost:8008/health`
- Nginx gateway: `http://localhost:8000`

### Notas
- Si prefiere otro modelo (p. ej. `gpt-4o`, `gpt-4.1-mini`), puede cambiar `DEFAULT_MODEL` en `docker-compose.yml`.
- No es necesario instalar ni descargar modelos en la máquina local.



