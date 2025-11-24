# Start the Next.js development server and open browser
Write-Host "Starting BBD Papers development server..." -ForegroundColor Cyan

# Start the dev server in the background
$devServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -PassThru

# Wait for the server to be ready
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open the browser
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nBBD Papers is now running!" -ForegroundColor Green
Write-Host "Press Ctrl+C in the server window to stop." -ForegroundColor Yellow
