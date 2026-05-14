# Fix Cpanel Routing Manual Upload Instructions
## STEP 1: UPLOAD .HTACCESS TO HOSTING (cPanel)1. Log in to cPanel2. Go to File Manager for ~/public_html/frontend/3. Upload file: scripts/.htaccess-corrected-version.txt4. Rename uploaded file FROM htaccess-corrected-version.txt TO .htaccess5. Permissions should already be 644 or 755
## STEP 2: VERIFY WITH CURLcurl -I https://mrmonkey.avdev.cl/frontend/servicios.html | head -10
## STEP 3: CLEAR CLOUDFLARE CACHEcdash.cloudflare.com/purge-everything
## STEP 4: TEST IN BROWSERhttps://your-domain.com/frontend/servicios.html
