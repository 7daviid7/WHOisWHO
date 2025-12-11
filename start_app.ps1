Write-Host "Starting WHOisWHO Project..." -ForegroundColor Green

# 1. Start Infrastructure (Redis + Postgres)
Write-Host "Step 1: Starting Infrastructure (Redis + Postgres)..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\redis"
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start infrastructure. Make sure Docker Desktop is running."
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

# 3. Generate Prisma Client (Backend)
Write-Host "Step 3: Generating Prisma Client..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to generate Prisma Client."
    exit
}

# 4. Start App (Backend + Frontend)
Write-Host "Step 4: Starting App (Backend + Frontend)..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the servers." -ForegroundColor Yellow
Set-Location "$PSScriptRoot"
npm run dev
