# =============================================================================
# Script - Generar Token Cloudflare API
# =============================================================================
# Purpose: Guide para obtener token CF con permisos necesarios para purge cache
# Author: MrMonkey
# Date: 2026-05-12
# Usage: .\scripts\generate-cf-token.ps1 [-skip-auth]
# =============================================================================

param(
    [Mandatory]$cfAPIAccessToken,
    [string]$email,
    [switch]$useTemplate
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cloudflare Token Generator Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script te guiará para obtener un token CF válido con permisos de:" -ForegroundColor Yellow
Write-Host "- Zone Purge Cache (purgear caché por URL o zona completa)" -ForegroundColor White
Write-Host "- Zone Settings (listar zonas/domínios)" -ForegroundColor White
Write-Host ""

# =====================================
# VERIFICAR AUTENTICACIÓN INICIAL
# =====================================
$skipAuth = $useTemplate

Write-Host "[INFO] Autenticando con Cloudflare..." -ForegroundColor Yellow

try {
    if (-not $skipAuth) {
        & cf-cli login --email $email --token $cfAPIAccessToken
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Autentificación inicial falló." -ForegroundColor Red
            Write-Host ""
            Write-Host "INSTRUCCIONES MANUALES:" -ForegroundColor Yellow
            Write-Host "1. Ir a: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
            Write-Host "2. Click en 'Create Token'" -ForegroundColor White
            Write-Host "3. Seleccionar: 'Cloudflare API Access'" -ForegroundColor White
            Write-Host "4. Permisos necesarios:" -ForegroundColor White
            
            $requiredPerms = @{
                "Zone.Purge Cache" = "Purgeo caché por URL o zona completa"
                "Zone Settings"    = "Listar zonas/domínios disponibles"
                "Account Members"  = "Administrar miembros del account (opcional)"
            }
            
            foreach ($perm in $requiredPerms.GetEnumerator()) {
                Write-Host "  - ☑ $($perm.Key) : $($perm.Value)" -ForegroundColor Gray
            }
            
            Write-Host ""
            Write-Host "5. Guardar token y ejecutar: .\scripts\generate-cf-token.ps1" -ForegroundColor White
            Write-Host ""
            exit 1
        }
        
        Write-Host "[OK] ✓ Autenticated con Cloudflare (email: $email)" -ForegroundColor Green
    } 
    else {
        Write-Host "[SKIP] Modo --skip-auth activado. Continuando..." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[ERROR] Excepción: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =====================================
# LISTAR ZONAS DISPONIBLES
# =====================================
$zones = & cf-cli list --account-root $email

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No se pudo listar zonas. Verifica permisos 'Zone Settings'" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ZONAS DISPONIBLES EN CF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$zones | ForEach-Object {
    $name = $_.Name
    $id = $_.Id
    $status = $_.Status
    
    Write-Host "`n Zone: $name" -ForegroundColor White
    Write-Host "   Zone ID: $id" -ForegroundColor Gray
    Write-Host "   Status: $status" -ForegroundColor Gray
    
    if ([string]::EqualsAny($status, 'Active', 'ready')) {
        Write-Host "   [OK] Zona activa y preparada para purge" -ForegroundColor Green
    } 
    else {
        Write-Host "   [WARN] Zona en estado $status" -ForegroundColor Yellow
    }
    
    # Preguntar si quiere probar purge en esta zona
    $query = Read-Host ""
}

Write-Host ""
$testQuery = Read-Host "Probar purge cache en la primera zona? (Y/N)"

if ([string]::EqualsAny($testQuery, 'Y', 'y')) {
    try {
        $firstZone = $zones[0].Name
        
        Write-Host "[INFO] Probando purge cache en: $firstZone" -ForegroundColor Cyan
        
        & cf-cli purge-cache "$firstZone" --email $email
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "      TOKEN VALIDADO CON ÉXITO!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Token CF está listo para uso en:" -ForegroundColor Cyan
            Write-Host "  .\scripts\deploy-all.ps1 -cloudflareToken $cfAPIAccessToken -email $email" -ForegroundColor White
            Write-Host ""
        } 
        else {
            Write-Host "[ERROR] Purge cache falló. Token inválido o perm insuficientes." -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "[ERROR] Excepción: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""