Write-Host "Starting WHOisWHO Project..." -ForegroundColor Green

# 1. Start Redis
Write-Host "Step 1: Starting Redis..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\redis"
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start Redis. Make sure Docker Desktop is running."
    exit
}

# 2. Install Dependencies (Root)
Write-Host "Step 2: Installing Dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies."
    exit
}

# 3. Start App (Backend + Frontend)
Write-Host "Step 3: Starting App (Backend + Frontend)..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the servers." -ForegroundColor Yellow
npm run dev
