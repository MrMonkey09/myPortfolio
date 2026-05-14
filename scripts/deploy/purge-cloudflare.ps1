# =============================================================================
# Cloudflare Cache Purge Script
# =============================================================================
# Purpose: Purge URLs específicas desde Cloudflare cache vía CLI
# Author: MrMonkey
# Date: 2026-05-12
# Usage: .\scripts\purge-cloudflare.ps1 -token TU_TOKEN -email tu@email.com [-skip-auth]
# =============================================================================

param(
    [Mandatory]$cloudflareToken,
    [string]$cloudflareEmail,
    [switch]$skipAuth
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cloudflare Cache Purge Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# =====================================
# CONFIGURACIÓN
# =====================================
$urlsToPurge = @(
    "https://mrmonkey.avdev.cl/frontend/servicios.html",
    "https://mrmonkey.avdev.cl/frontend/contacto.html",   
    "https://mrmonkey.avdev.cl/frontend/educacion.html",
    "https://mrmonkey.avdev.cl/frontend/habilidades.html"
)

# =====================================
# AUTHENTICAR CON CF CLI
# =====================================
Write-Host "[INFO] Autenticando con Cloudflare..." -ForegroundColor Yellow

try {
    if (-not $skipAuth) {
        & cf-cli login --token $cloudflareToken --email $cloudflareEmail
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Autentificación falló. Verifica token y email." -ForegroundColor Red
            Write-Host ""
            Write-Host "SUGERENCIA:" -ForegroundColor Yellow
            Write-Host "1. Generar nuevo token en: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
            Write-Host "2. Permisos necesarios: Zone Purge, Zone Settings" -ForegroundColor White
            exit 1
        }
        
        Write-Host "[OK] Autenticated con Cloudflare API (email: $cloudflareEmail)" -ForegroundColor Green
    } 
    else {
        Write-Host "[SKIP] Modo --skip-auth activado. Usando API directa..." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =====================================
# PURGE CACHING POR URLS
# =====================================
Write-Host "[INFO] Purgeando cache para $urlsToPurge URLs..." -ForegroundColor Yellow
Write-Host ""

$countSuccess = 0
$countFailed = 0

foreach ($url in $urlsToPurge) {
    Write-Host "Purging: $url" -ForegroundColor Cyan
    
    try {
        & cf-cli purge-cache "$url" --api-token $cloudflareToken --email $cloudflareEmail
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] ✓" -ForegroundColor Green
            $countSuccess++
        } 
        else {
            Write-Host "  [ERROR] Falló con código: $LASTEXITCODE" -ForegroundColor Red
            $countFailed++
        }
    } 
    catch {
        Write-Host "  [ERROR] Excepción: $_" -ForegroundColor Red
        $countFailed++
    }
    
    # Pausar entre requests para no saturar API
    Start-Sleep -Seconds 1
}

# =====================================
# PURGE POR ZONA (OPCIONAL)
# =====================================
Write-Host ""
$response = Read-Host "¿Purguar toda la zona? (Y/N)"

if ([string]::EqualsAny($response, 'Y', 'y')) {
    Write-Host "[INFO] Purgeando toda la zona de mrmonkey.avdev.cl..." -ForegroundColor Yellow
    
    try {
        & cf-cli purge-cache "mrmonkey.avdev.cl" --api-token $cloudflareToken
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Zona purgada exitosamente" -ForegroundColor Green
            $countSuccess++
        } 
        else {
            Write-Host "  [ERROR] Falló con código: $LASTEXITCODE" -ForegroundColor Red
            $countFailed++
        }
    }
    catch {
        Write-Host "[ERROR] Excepción: $_" -ForegroundColor Red
        $countFailed++
    }
}

# =====================================
# RESUMEN FINAL
# =====================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "      RESUMEN DE PURGEO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Éxito: $countSuccess URLs" -ForegroundColor Green

if ($countFailed -gt 0) {
    Write-Host "Fallo: $countFailed URLs" -ForegroundColor Red
} 
else {
    Write-Host "Fallo: 0 URLs" -ForegroundColor Gray
}

Write-Host ""

if ($countSuccess -eq (CountOf($urlsToPurge))) {
    Write-Host "¡Purgue COMPLETO!" -ForegroundColor Green
} 
else {
    Write-Host "ALGUN PURGE FALLÓ - Verificar logs de API" -ForegroundColor Yellow
}


Write-Host ""
