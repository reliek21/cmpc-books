#!/bin/bash

# CMCP Books - Script de instalación y despliegue automático
# Este script configura y lanza todo el proyecto con un solo comando

set -e  # Salir si hay errores

echo "🚀 CMCP Books - Instalación y Despliegue Automático"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar prerrequisitos
check_requirements() {
    log_info "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado. Instálalo desde https://docker.com"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Verificar pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm no está instalado. Instalando..."
        npm install -g pnpm
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado. Instálalo desde https://nodejs.org"
        exit 1
    fi
    
    log_success "Todos los prerrequisitos están instalados"
}

# Configurar variables de entorno
setup_environment() {
    log_info "Configurando variables de entorno..."
    
    # Crear .env principal si no existe
    if [ ! -f .env ]; then
        cp .env.example .env
        log_success "Archivo .env creado desde .env.example"
    else
        log_warning "Archivo .env ya existe, se mantiene la configuración actual"
    fi
    
    # Crear .env del backend si no existe
    if [ ! -f apps/server/.env ]; then
        cp apps/server/.env.example apps/server/.env
        log_success "Archivo apps/server/.env creado"
    else
        log_warning "Archivo apps/server/.env ya existe"
    fi
    
    # Crear .env del frontend si no existe
    if [ ! -f apps/web/.env.local ]; then
        cp apps/web/.env.example apps/web/.env.local
        log_success "Archivo apps/web/.env.local creado"
    else
        log_warning "Archivo apps/web/.env.local ya existe"
    fi
}

# Instalar dependencias
install_dependencies() {
    log_info "Instalando dependencias..."
    
    # Limpiar cache si es necesario
    if [ "$1" = "--clean" ]; then
        log_info "Limpiando cache y node_modules..."
        rm -rf node_modules
        rm -rf apps/server/node_modules
        rm -rf apps/web/node_modules
        pnpm store prune
    fi
    
    # Instalar dependencias
    pnpm install
    log_success "Dependencias instaladas correctamente"
}

# Verificar puertos disponibles
check_ports() {
    log_info "Verificando puertos disponibles..."
    
    ports=(3000 3001 5432)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            log_warning "Puerto $port está en uso. Liberándolo..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    log_success "Puertos 3000, 3001 y 5432 están disponibles"
}

# Construir y lanzar servicios
launch_services() {
    log_info "Construyendo y lanzando servicios con Docker Compose..."
    
    # Detener servicios existentes
    docker-compose down -v 2>/dev/null || true
    
    # Construir y lanzar
    docker-compose up --build -d
    
    log_success "Servicios lanzados correctamente"
}

# Verificar que los servicios estén corriendo
verify_services() {
    log_info "Verificando que los servicios estén funcionando..."
    
    # Esperar un poco para que los servicios inicien
    sleep 10
    
    # Verificar PostgreSQL
    if docker-compose exec -T db pg_isready -U cmpc123 >/dev/null 2>&1; then
        log_success "PostgreSQL está funcionando"
    else
        log_error "PostgreSQL no está respondiendo"
        return 1
    fi
    
    # Verificar Backend
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
        log_success "Backend está funcionando"
    else
        log_warning "Backend aún no está respondiendo (puede tomar un momento)"
    fi
    
    # Verificar Frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        log_success "Frontend está funcionando"
    else
        log_warning "Frontend aún no está respondiendo (puede tomar un momento)"
    fi
}

# Mostrar información final
show_final_info() {
    echo ""
    echo "🎉 ¡CMCP Books se ha lanzado exitosamente!"
    echo "========================================"
    echo ""
    echo "📱 Aplicaciones disponibles:"
    echo "   Frontend:    http://localhost:3000"
    echo "   Backend API: http://localhost:3001"
    echo "   Swagger:     http://localhost:3001/api"
    echo "   PostgreSQL:  localhost:5432"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   Ver logs:           docker-compose logs -f"
    echo "   Detener servicios:  docker-compose down"
    echo "   Reiniciar:          docker-compose restart"
    echo "   Tests:              pnpm test"
    echo ""
    echo "📚 Para más información, revisa el README.md"
    echo ""
}

# Función principal
main() {
    echo "Iniciando configuración automática..."
    echo ""
    
    # Parsear argumentos
    CLEAN_INSTALL=false
    SKIP_DEPS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                CLEAN_INSTALL=true
                shift
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --help)
                echo "Uso: $0 [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --clean      Limpia cache y reinstala dependencias"
                echo "  --skip-deps  Omite la instalación de dependencias"
                echo "  --help       Muestra esta ayuda"
                exit 0
                ;;
            *)
                log_error "Opción desconocida: $1"
                exit 1
                ;;
        esac
    done
    
    # Ejecutar pasos
    check_requirements
    setup_environment
    
    if [ "$SKIP_DEPS" = false ]; then
        if [ "$CLEAN_INSTALL" = true ]; then
            install_dependencies --clean
        else
            install_dependencies
        fi
    fi
    
    check_ports
    launch_services
    verify_services
    show_final_info
}

# Manejo de errores
trap 'log_error "Error en línea $LINENO. Código de salida: $?"; exit 1' ERR

# Ejecutar función principal
main "$@"
