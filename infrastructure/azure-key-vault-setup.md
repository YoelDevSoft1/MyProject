# Azure Key Vault Setup para SMD Vital
========================================

## 🔐 Configuración de Azure Key Vault

### 1. Crear Key Vault

```bash
# Crear resource group
az group create --name smd-vital-rg --location eastus

# Crear Key Vault
az keyvault create \
  --name smd-vital-vault \
  --resource-group smd-vital-rg \
  --location eastus \
  --sku standard \
  --enable-soft-delete true \
  --enable-purge-protection true
```

### 2. Configurar Access Policy

```bash
# Obtener subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Crear service principal para GitHub Actions
az ad sp create-for-rbac \
  --name "smd-vital-github-actions" \
  --role "Key Vault Secrets Officer" \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/smd-vital-rg/providers/Microsoft.KeyVault/vaults/smd-vital-vault"
```

### 3. Agregar Secretos

```bash
# Database URL
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "DATABASE_URL" \
  --value "postgresql://smdvital:$(openssl rand -base64 32)@postgres:5432/smdvital"

# JWT Secret Key
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "JWT_SECRET_KEY" \
  --value "$(openssl rand -base64 64)"

# Stripe Secret Key
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "STRIPE_SECRET_KEY" \
  --value "sk_live_your_stripe_secret_key_here"

# Stripe Webhook Secret
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "STRIPE_WEBHOOK_SECRET" \
  --value "whsec_your_webhook_secret_here"

# SMTP Password
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "SMTP_PASSWORD" \
  --value "your_smtp_app_password"

# Twilio Auth Token
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "TWILIO_AUTH_TOKEN" \
  --value "your_twilio_auth_token"

# Redis Password
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "REDIS_PASSWORD" \
  --value "$(openssl rand -base64 32)"

# RabbitMQ Password
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "RABBITMQ_PASSWORD" \
  --value "$(openssl rand -base64 32)"

# Grafana Admin Password
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "GRAFANA_ADMIN_PASSWORD" \
  --value "$(openssl rand -base64 32)"

# Encryption Key
az keyvault secret set \
  --vault-name smd-vital-vault \
  --name "ENCRYPTION_KEY" \
  --value "$(openssl rand -base64 32)"
```

### 4. Configurar GitHub Secrets

Agregar los siguientes secrets en GitHub:

```
AZURE_CLIENT_ID=<client_id_from_service_principal>
AZURE_TENANT_ID=<tenant_id_from_service_principal>
AZURE_SUBSCRIPTION_ID=<subscription_id>
CONTAINER_REGISTRY=<your_container_registry>
CONTAINER_REGISTRY_USERNAME=<registry_username>
CONTAINER_REGISTRY_PASSWORD=<registry_password>
SLACK_WEBHOOK_URL=<slack_webhook_url>
PAGERDUTY_INTEGRATION_KEY=<pagerduty_integration_key>
API_BASE_URL=<api_base_url>
API_TOKEN=<api_token>
```

### 5. Configurar Rotación Automática de Secretos

```bash
# Crear función para rotación de secretos
az functionapp create \
  --resource-group smd-vital-rg \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.9 \
  --functions-version 4 \
  --name smd-vital-secret-rotation \
  --storage-account smdvitalstorage
```

### 6. Configurar Monitoreo de Key Vault

```bash
# Habilitar logging
az monitor diagnostic-settings create \
  --name "keyvault-monitoring" \
  --resource smd-vital-vault \
  --logs '[{"category":"AuditEvent","enabled":true}]' \
  --workspace smd-vital-workspace
```

## 🔒 Mejores Prácticas de Seguridad

### 1. Access Policies
- Usar Azure RBAC en lugar de access policies
- Implementar principio de menor privilegio
- Rotar credenciales regularmente

### 2. Network Security
- Configurar firewall para Key Vault
- Restringir acceso por IP
- Usar private endpoints

### 3. Monitoring
- Habilitar logging de auditoría
- Configurar alertas de acceso
- Monitorear intentos de acceso fallidos

### 4. Backup y Recovery
- Habilitar soft delete
- Configurar purge protection
- Implementar backup automático

## 📊 Monitoreo y Alertas

### 1. Métricas a Monitorear
- Número de accesos a secretos
- Intentos de acceso fallidos
- Rotación de secretos
- Uso de secretos por aplicación

### 2. Alertas Configuradas
- Acceso a secretos fuera de horario laboral
- Múltiples intentos de acceso fallidos
- Acceso a secretos críticos
- Rotación de secretos fallida

### 3. Dashboard de Seguridad
- Acceso a secretos en tiempo real
- Estadísticas de uso
- Alertas de seguridad
- Estado de rotación de secretos

## 🚀 Integración con CI/CD

### 1. GitHub Actions
```yaml
- name: Retrieve Secrets
  uses: azure/get-keyvault-secrets@v1
  with:
    keyvault: "smd-vital-vault"
    secrets: |
      DATABASE_URL
      JWT_SECRET_KEY
      STRIPE_SECRET_KEY
```

### 2. Kubernetes
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: smd-vital-secrets
type: Opaque
data:
  database-url: <base64-encoded-value>
  jwt-secret: <base64-encoded-value>
```

### 3. Docker Compose
```yaml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    secrets:
      - database_url
      - jwt_secret
```

## 🔄 Rotación Automática de Secretos

### 1. Script de Rotación
```python
import azure.keyvault.secrets as secrets
import azure.identity as identity
import os

def rotate_secret(secret_name: str):
    """Rotar un secreto en Key Vault"""
    credential = identity.DefaultAzureCredential()
    client = secrets.SecretClient(
        vault_url="https://smd-vital-vault.vault.azure.net/",
        credential=credential
    )
    
    # Generar nuevo valor
    new_value = os.urandom(32).hex()
    
    # Actualizar secreto
    client.set_secret(secret_name, new_value)
    
    # Notificar a aplicaciones
    notify_applications(secret_name, new_value)
```

### 2. Programación de Rotación
- Secretos de aplicación: cada 90 días
- Secretos de base de datos: cada 180 días
- Secretos de infraestructura: cada 365 días

### 3. Notificaciones
- Slack para rotaciones exitosas
- PagerDuty para fallos de rotación
- Email para cambios críticos

## 📋 Checklist de Seguridad

- [ ] Key Vault creado con soft delete habilitado
- [ ] Access policies configuradas correctamente
- [ ] Network security configurada
- [ ] Logging de auditoría habilitado
- [ ] Alertas de seguridad configuradas
- [ ] Rotación automática implementada
- [ ] Backup y recovery configurados
- [ ] Monitoreo de acceso implementado
- [ ] Integración con CI/CD configurada
- [ ] Documentación de seguridad actualizada



