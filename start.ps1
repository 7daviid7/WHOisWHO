# Script per iniciar el projecte Who is Who
# PowerShell

Write-Host "🚀 Iniciant Who is Who..." -ForegroundColor Cyan

# 1. Iniciar Redis
Write-Host "`n📦 Iniciant Redis amb Docker Compose..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 2

# 2. Comprovar si cal instal·lar dependències del Backend
if (-Not (Test-Path "Backend/node_modules")) {
    Write-Host "`n📥 Instal·lant dependències del Backend..." -ForegroundColor Yellow
    Set-Location Backend
    npm install
    Set-Location ..
}

# 3. Comprovar si cal instal·lar dependències del Frontend
if (-Not (Test-Path "Frontend/node_modules")) {
    Write-Host "`n📥 Instal·lant dependències del Frontend..." -ForegroundColor Yellow
    Set-Location Frontend
    npm install
    Set-Location ..
}

# 4. Iniciar Backend en una finestra nova
Write-Host "`n🔧 Iniciant Backend..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd Backend; npm run dev"

Start-Sleep -Seconds 3

# 5. Iniciar Frontend en una finestra nova
Write-Host "`n🎨 Iniciant Frontend..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd Frontend; npm run dev"

Write-Host "`n✅ Tot iniciat correctament!" -ForegroundColor Green
Write-Host "`nAccedeix a: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPer aturar els serveis, tanca les finestres i executa: docker-compose down" -ForegroundColor Yellow
