#!/bin/bash

# Script para optimizar Health Checks en SMD VITAL
# ================================================

echo "🔧 OPTIMIZANDO HEALTH CHECKS..."

# Crear configuración optimizada de Prometheus
cat > infrastructure/monitoring/prometheus-optimized.yml << 'EOF'
global:
  scrape_interval: 30s  # Reducido de 15s a 30s
  evaluation_interval: 30s
  scrape_timeout: 10s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 30s

  - job_name: 'smd-vital-auth'
    static_configs:
      - targets: ['auth-service:8001']
    metrics_path: '/metrics'
    scrape_interval: 60s  # Reducido frecuencia
    scrape_timeout: 5s

  - job_name: 'smd-vital-users'
    static_configs:
      - targets: ['user-service:8002']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-appointments'
    static_configs:
      - targets: ['appointment-service:8003']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-notifications'
    static_configs:
      - targets: ['notification-service:8004']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-medical-records'
    static_configs:
      - targets: ['medical-records-service:8005']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-payments'
    static_configs:
      - targets: ['payment-service:8006']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-health-metrics'
    static_configs:
      - targets: ['health-metrics-service:8007']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-ai-langgraph'
    static_configs:
      - targets: ['ai-langgraph:8008']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-elasticsearch'
    static_configs:
      - targets: ['elasticsearch:9200']
    metrics_path: '/_prometheus/metrics'
    scrape_interval: 120s  # Reducido para ES
    scrape_timeout: 10s

  - job_name: 'smd-vital-flower'
    static_configs:
      - targets: ['flower:5555']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s

  - job_name: 'smd-vital-jaeger'
    static_configs:
      - targets: ['jaeger:14269']
    metrics_path: '/metrics'
    scrape_interval: 60s
    scrape_timeout: 5s
EOF

echo "✅ CONFIGURACIÓN DE HEALTH CHECKS OPTIMIZADA"
echo "📊 Cambios aplicados:"
echo "   - Intervalo de scraping: 30s → 60s"
echo "   - Timeout de scraping: 5s"
echo "   - Elasticsearch: 120s"
echo "   - Timeout de conexión: 10s"

