$ErrorActionPreference = "Continue"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Energya Cables 3D - GitHub Deploy Tool" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$gitPath = "C:\Users\m.galal\AppData\Local\Programs\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    $found = Get-Command git -ErrorAction SilentlyContinue
    if ($found) { $gitPath = $found.Source }
}

if (-not (Test-Path $gitPath)) {
    Write-Host "[!] Git executable not found." -ForegroundColor Red
    pause
    exit
}

Write-Host "`n[1/3] Adding and committing files..." -ForegroundColor Green
& $gitPath add -A
& $gitPath commit -m "Energya Cables 3D: Unified INS Stage, KM Analytics & 3D Fleet" 2>$null

$repoUrl = "https://github.com/lava101010/MachineFollowUp-Wip.git"
Write-Host "`n[2/3] Configuring Remote Repository: $repoUrl" -ForegroundColor Green
& $gitPath remote remove origin 2>$null
& $gitPath remote add origin $repoUrl

Write-Host "`n[3/3] Pushing to GitHub (main branch)..." -ForegroundColor Green
Write-Host "Note: If a GitHub login window pops up, click 'Sign in with your browser' / 'Authorize'.`n" -ForegroundColor Yellow

& $gitPath push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "  SUCCESSFULLY UPLOADED TO GITHUB!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "Now enable GitHub Pages in 3 quick steps:" -ForegroundColor White
    Write-Host "1. Open: https://github.com/lava101010/MachineFollowUp-Wip/settings/pages" -ForegroundColor Cyan
    Write-Host "2. Under 'Build and deployment':" -ForegroundColor White
    Write-Host "   Set Source: Deploy from a branch" -ForegroundColor White
    Write-Host "   Set Branch: main, and Folder: / (root)" -ForegroundColor White
    Write-Host "3. Click Save!" -ForegroundColor White
    Write-Host "`nYour Live Web Dashboard URL will be:" -ForegroundColor Yellow
    Write-Host "https://lava101010.github.io/MachineFollowUp-Wip/" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[!] Push completed or requires browser authorization." -ForegroundColor Yellow
}

Write-Host "`nPress any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
