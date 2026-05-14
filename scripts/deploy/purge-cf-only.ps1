# CLOUDFLARE PURGE STAN ALONE SCRIPT
# Execute this file independently for Cloudflare cache purge  
# Target zone: mrmonkey.avdev.cl | Uses cf-cli if installed globally (PATH)

param(
    # Zone name or tag to purge
    [string]$ZoneTag,
    
    # Optional API token (will use cf-cli login auth if available)
    [string]$Token,
    
    # Skip confirmation prompt (auto-execute)
    [switch]$SkipConfirm
)

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                    CLOUDFLARE CACHE PURGE - STANDALONE" -ForegroundColor Cyan  
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Target zone configuration
$TARGET_ZONE = $ZoneTag -or "mrmonkey.avdev.cl"

Write-Host "[INFO] Cloudflare Purge Target:" -ForegroundColor Yellow  
Write-Host "  Zone: $TARGET_ZONE" -ForegroundColor Gray
Write-Host ""

# Check if cf-cli is available in PATH
function Test-CfCliAvailable {
    try {
        Write-Host "[DEBUG] Verifying cf-cli in PATH..." -ForegroundColor Cyan
        & cf --version >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ cf-cli found in PATH - ready to execute" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ cf-cli NOT found in PATH globally" -ForegroundColor Red
            Write-Host "   Install: https://developers.cloudflare.com/cli/" -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        Write-Host "[ERROR] Failed to verify cf-cli: $_" -ForegroundColor Red
        exit 1
    }
}

Test-CfCliAvailable

Write-Host ""
if ($SkipConfirm) {
    Write-Host "Executing purge for zone: $TARGET_ZONE..." -ForegroundColor Cyan
    if ($Token) {
        & cf-cli purge-cache "$TARGET_ZONE" --api-token $Token 
    } else {
        & cf-cli purge-cache "$TARGET_ZONE"
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Green  
        Write-Host "                  CLOUDFLARE PURGE COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
        Write-Host "============================================================================" -ForegroundColor Green  
        Write-Host ""
        Write-Host "Purge completed for zone: $TARGET_ZONE" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Purge falló con código $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    # Interactive confirmation needed
    Write-Host ""
    Write-Host "CONFIRMATION NEEDED:" -ForegroundColor Yellow
    Write-Host "  Zone: $TARGET_ZONE" -ForegroundColor Gray  
    Write-Host "  Action: Purge ALL cache for this zone" -ForegroundColor Gray
    Write-Host "  ⚠️  WARNING: This will invalidate ALL cached resources immediately!" -ForegroundColor Yellow
    
    $confirm = Read-Host "Type 'PURGE' to confirm or press Enter to skip"
    
    if ([string]::EqualsAny($confirm, 'PURGE', 'purge')) {
        Write-Host ""
        Write-Host "[INFO] Confirming purge for zone: $TARGET_ZONE..." -ForegroundColor Green
        
        if ($LASTEXITCODE -eq 0) {
            & cf-cli purge-cache "$TARGET_ZONE" --api-token $(Read-Host "Enter Cloudflare API Token (or skip for existing login)")
            
            Write-Host ""
            Write-Host "============================================================================" -ForegroundColor Green
            Write-Host "                  CLOUDFLARE PURGE COMPLETADO!" -ForegroundColor Green  
            Write-Host "============================================================================" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] cf-cli purge falló con código $LASTEXITCODE" -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "[SKIP] Cloudflare purge skipped by user" -ForegroundColor Yellow
        exit 0
    }
}
