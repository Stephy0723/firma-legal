#!/bin/bash

# Script de Deploy Automático - Firma Legal
# Este script se ejecuta cuando hay cambios en la rama main
# Uso: ./deploy.sh

set -e  # Exit si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/var/www/firma-legal"
LOG_FILE="/var/log/firma-legal-deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Función para logging
log() {
  echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
  echo -e "${YELLOW}→ $1${NC}" | tee -a "$LOG_FILE"
}

# Verificar que el directorio existe
if [ ! -d "$PROJECT_DIR" ]; then
  log_error "Directorio $PROJECT_DIR no existe"
  exit 1
fi

log_info "Iniciando deploy automático..."

# 1. Ir al directorio del proyecto
cd "$PROJECT_DIR"
log_success "Entrado a $PROJECT_DIR"

# 2. Actualizar repositorio
log_info "Actualizando repositorio (git pull)..."
git pull origin main >> "$LOG_FILE" 2>&1
log_success "Repositorio actualizado"

# 3. Deploy Frontend
log_info "Instalando dependencias del Frontend..."
cd "$PROJECT_DIR/Frontend"
npm ci >> "$LOG_FILE" 2>&1  # npm ci es más seguro que npm i para CI/CD
log_success "Dependencias del Frontend instaladas"

log_info "Compilando Frontend..."
npm run build >> "$LOG_FILE" 2>&1
log_success "Frontend compilado exitosamente"

# 4. Deploy Backend
log_info "Instalando dependencias del Backend..."
cd "$PROJECT_DIR/backend"
npm ci >> "$LOG_FILE" 2>&1
log_success "Dependencias del Backend instaladas"

log_info "Reiniciando Backend con PM2..."
pm2 restart "backend" --cwd "$PROJECT_DIR/backend" >> "$LOG_FILE" 2>&1
log_success "Backend reiniciado"

# 5. Verificación final
log_info "Verificando estado del servicio..."
pm2 status >> "$LOG_FILE" 2>&1

log_success "================================"
log_success "✓ DEPLOY COMPLETADO EXITOSAMENTE"
log_success "================================"
log_success "Timestamp: $TIMESTAMP"
log_success "Logs guardados en: $LOG_FILE"
