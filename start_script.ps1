# Function to check if Docker Desktop is installed
function Check-Docker {
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Host "Docker Desktop is not installed. Please install Docker Desktop to proceed." -ForegroundColor Red
        exit 1
    }
}

# Function to check if Docker Desktop is running
function Start-Docker {
    Write-Host "Checking Docker Desktop..."
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

    if (-not $dockerProcess) {
        Write-Host "Starting Docker Desktop..."
        Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe" -NoNewWindow
        Write-Host "Waiting for Docker Desktop to be ready..."

        while (-not (docker info | Out-Null)) {
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Host "Docker Desktop is already running."
    }
}

# Check if Docker Desktop is installed
Check-Docker

# Start Docker Desktop
Start-Docker

# Navigate to the frontend directory and install dependencies
Write-Host "Navigating to the frontend directory..."
Set-Location -Path ".\src\frontend" -ErrorAction Stop

Write-Host "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Starting frontend with npm run dev..."
Start-Process -NoNewWindow -FilePath ".\npm" -ArgumentList "run dev"

# Navigate back to the root directory
Write-Host "Navigating back to the root directory..."
Set-Location -Path "..\..\"

# Clean and build the backend using Maven Wrapper
Write-Host "Running Maven clean..."
Start-Process -NoNewWindow -Wait -FilePath ".\mvnw" -ArgumentList "clean"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven clean failed. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Starting the backend server..."
Start-Process -NoNewWindow -Wait -FilePath ".\mvnw" -ArgumentList "spring-boot:run"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start backend server. Exiting." -ForegroundColor Red
    exit 1
}

# Success message
Write-Host "Webservice started successfully!" -ForegroundColor Green
