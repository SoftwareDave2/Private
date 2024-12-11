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

        while (-not $dockerProcess) {
            Start-Sleep -Seconds 2
            $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Docker Desktop is already running."
    }
}

# Function to clean up and return to root directory
function CleanUp {
    Write-Host "`nStopping all processes and returning to root directory..." -ForegroundColor Yellow

    # Stop Maven and Frontend processes
    Get-Process -Name "java", "npm", "node" -ErrorAction SilentlyContinue | Stop-Process -Force

    # Return to the root directory
    Set-Location -Path $rootDir
    Write-Host "All processes stopped. Back to root directory." -ForegroundColor Green
    exit
}

# Store the root directory for cleanup
$rootDir = Get-Location

# Check if Docker Desktop is installed
Check-Docker

Start-Docker

Start-Sleep -Seconds 15


# Navigate back to the root directory
Write-Host "Navigating back to the root directory..."

# Clean and build the backend
Write-Host "Running Maven clean..."
.\mvnw clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven clean failed. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Starting the backend server..."
$backendProcess = Start-Process -NoNewWindow -PassThru -FilePath ".\mvnw" -ArgumentList "spring-boot:run"

# Navigate to the frontend directory and install dependencies
Write-Host "Navigating to the frontend directory..."
Set-Location -Path ".\src\frontend" -ErrorAction Stop

Write-Host "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed. Exiting." -ForegroundColor Red
    CleanUp
}

Write-Host "Starting frontend with npm run dev..."
$frontendProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList "/c npm run dev"


# Monitor for the 'q' key press
Write-Host "`nPress 'q' to stop all processes and return to the root directory..."
while ($true) {
    if ([console]::KeyAvailable) {
        $key = [console]::ReadKey($true).Key
        if ($key -eq "Q") {
            CleanUp
        }
    }
    Start-Sleep -Milliseconds 100
}

# Success message
Write-Host "Webservice started successfully!" -ForegroundColor Green
