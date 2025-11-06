# Script per aturar el projecte Who is Who
# PowerShell

Write-Host "🛑 Aturant Who is Who..." -ForegroundColor Cyan

# Aturar Docker Compose
Write-Host "`n📦 Aturant Redis..." -ForegroundColor Yellow
docker-compose down

Write-Host "`n✅ Redis aturat correctament!" -ForegroundColor Green
Write-Host "`nRecorda tancar les finestres del Backend i Frontend si encara estan obertes." -ForegroundColor Yellow
