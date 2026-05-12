# Scripts de Backup Automatizado para SQLite

## Descripción

Este directorio contiene scripts Bash para automatizar la gestión de backups de la base de datos SQLite `quotes.sqlite`. Ideal para deployment en servidores Linux donde se ejecuta cPanel o similar.

## Scripts Disponibles

### 1. `backup-sqlite.sh` - Backup Automatizado

Crea backups automáticos con timestamp y mantiene solo los últimos N backups.

**Uso:**
```bash
# Ejecutar manualmente
./backup-sqlite.sh

# Para ejecutar en servidor remoto (siga)
scp myPortfolio/scripts/backup/backup-sqlite.sh user@server:/path/to/myPortfolio/scripts/backup/
chmod +x /path/to/myPortfolio/scripts/backup/backup-sqlite.sh
```

**Características:**
- Crea timestamp en fecha y hora del backup (`YYYYMMDD_HHMMSS`)
- Guarda copia con nombre `quotes_latest.sqlite` siempre actualizada
- Limpia automáticamente backups antiguos (mantiene últimos 7 por defecto)

**Variables configurables:**
```bash
DATE=$(date +%Y%m%d_%H%M%S)    # Formato timestamp
BACKUP_DIR="$HOME/backups"      # Directorio donde se guardan los backups
DB_PATH="$HOME/myPortfolio/..." # Ruta a la base de datos SQLite
MAX_BACKUPS=7                    # Número máximo de backups a retener
```

### 2. `restore-sqlite.sh` - Restaurar desde Backup

Restaura la base de datos desde un backup existente.

**Uso:**
```bash
# Restaurar desde el backup más reciente (quotes_latest.sqlite)
./restore-sqlite.sh

# Restaurar desde un archivo específico
./restore-sqlite.sh quotes_20260512_143022.sqlite
```

**Características:**
- Crea automáticamente un backup del estado actual antes de restaurar
- El archivo pre-backup se guarda con timestamp para referencia
- Verifica que el backup existe antes de proceder

### 3. `verify-sqlite.sh` - Verificar Integridad

Verifica la integridad de la base de datos SQLite.

**Uso:**
```bash
./verify-sqlite.sh
```

**Output:**
- PRAGMA integrity_check: Verificación completa de integridad SQL
- Estadísticas básicas: Cantidad total de citas y agrupación por sync_status
- Código de salida 0 = éxito, 1 = error

### 4. `cron-setup.sh` - Configurar Cron Job

Configura automáticamente un cron job para backups diarios.

**Uso:**
```bash
# Configurar en servidor local/más cercano
./cron-setup.sh
```

**Output del script:**
- Muestra los jobs de backup configurados en crontab
- Elimina jobs anteriores antes de agregar nuevos (evita duplicados)

**Cron Job configurado por defecto:**
```bash
0 0 * * *    # Diariamente a las 00:00 UTC
$HOME/myPortfolio/scripts/backup/backup-sqlite.sh >> 
$HOME/backups/backup.log 2>&1   # Redirects stdout/stderr to log
```

## Instalación en Servidor Linux/cPanel

```bash
# 1. Copiar scripts al servidor
scp -r myPortfolio/scripts/user@your-server:/path/to/myPortfolio/scripts/

# 2. Iniciar los archivos como ejecutables
chmod +x /path/to/myPortfolio/scripts/backup/*.sh

# 3. Ejecutar verificación inicial (opcional)
/path/to/myPortfolio/scripts/backup/verify-sqlite.sh

# 4. Configurar cron job para backups diarios
/path/to/myPortfolio/scripts/backup/cron-setup.sh

# 5. Verificar que el cron job se configuró
crontab -l | grep backup
```

## Directivas para Excluir Backups

Actualice `.gitignore` para excluir archivos de backup:

```gitignore
# Backups
backups/
backend/data/*.sqlite.backup
*.pre_restore_*
```

**IMPORTANTE:** No incluir los backups en el repositorio Git! Los backups son archivos de producción locales.

## Errores Comunes y Soluciones

### Error: "Database not found"

**Causa:** La base de datos no existe en la ruta especificada o no tiene permisos para escribir.

**Solución:**
```bash
# Verificar si el archivo existe
ls -la $HOME/myPortfolio/backend/data/quotes.sqlite

# Verificar permisos
chmod 644 $HOME/myPortfolio/backend/data/quotes.sqlite
chown $USER:$USER $HOME/myPortfolio/backend/data/quotes.sqlite
```

### Error: "Backup not found"

**Causa:** El archivo de backup especificado no existe o la ruta es incorrecta.

**Solución:**
```bash
# Listar backups disponibles en el directorio destino
ls -la $HOME/backups/quotes_*.sqlite

# Si no existen, ejecutar primero backup-sqlite.sh o crear directorio manual
mkdir -p $HOME/backups
```

### Problema con Permisos en Servidor Remoto

**Causa:** El usuario del servidor no tiene permisos para escribir en `$HOME/backups` o modificar crontab.

**Solución alternativa usando user-specific paths:**
```bash
# Configurar backups en ruta del usuario (normalmente HOME ya está bien)
BACKUP_DIR="/home/username/myPortfolio_backups"  # Ruta específica de usuario

# Asegurar que la ruta sea accesible para el usuario
chown -R username:username /home/username/myPortfolio_backups
```

## Seguridad y Best Practices

1. **No hardcodear variables:** Use `$HOME` para rutas base
2. **Verificar permisos:** Los scripts verifican que archivos existan antes de procesarlos
3. **Log de errores:** `cron-setup.sh` include output en `/path/to/backups/backup.log 2>&1`
4. **Backup pre-restore:** El script siempre crea un backup del estado actual antes de restaurar
5. **Cleanup automático:** Mantiene solo los últimos N backups (configurable con MAX_BACKUPS)

## Automatización Avanzada (Opcional)

### Backup en la Nube

Combine con servicios como AWS S3, Google Cloud Storage o Backblaze B2:

```bash
# Ejemplo usando AWS CLI
aws s3 cp "$BACKUP_DIR/quotes_latest.sqlite" "s3://my-portfolio-backups/"
```

### Backup Incremental (Futuro)

Actualmente hace copias completas. Para backups incrementales (más eficientes), se necesitaría implementar `sqlite3` con WAL mode y puntos temporales.

## Soporte y Troubleshooting

Para reportar problemas:

1. Ejecutar `verify-sqlite.sh` para verificar integridad
2. Revisar logs en `/path/to/backups/backup.log` si tiene cron job activo
3. Verificar sistema de archivos disponible: `df -h $HOME/backups`
