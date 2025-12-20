# PowerShell script to help find and set JAVA_HOME
# Run this script: .\setup-java.ps1

Write-Host "Searching for Java installations..." -ForegroundColor Cyan

$javaPaths = @(
    "C:\Program Files\Java\*",
    "C:\Program Files (x86)\Java\*",
    "$env:ProgramFiles\Android\Android Studio\jbr",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\jbr",
    "C:\Program Files\Android\Android Studio\jbr",
    "$env:ProgramFiles\Eclipse Adoptium\*",
    "$env:ProgramFiles\Microsoft\*"
)

$foundJava = @()

foreach ($path in $javaPaths) {
    $dirs = Get-ChildItem $path -ErrorAction SilentlyContinue -Directory
    foreach ($dir in $dirs) {
        $javaExe = Join-Path $dir.FullName "bin\java.exe"
        if (Test-Path $javaExe) {
            $version = & $javaExe -version 2>&1 | Select-Object -First 1
            $foundJava += [PSCustomObject]@{
                Path = $dir.FullName
                Version = $version
            }
            Write-Host "Found: $($dir.FullName)" -ForegroundColor Green
            Write-Host "  Version: $version" -ForegroundColor Gray
        }
    }
}

if ($foundJava.Count -eq 0) {
    Write-Host "`nNo Java installations found!" -ForegroundColor Red
    Write-Host "Please install JDK 17 or higher:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://adoptium.net/" -ForegroundColor Yellow
    Write-Host "  2. Or install Android Studio (includes JDK)" -ForegroundColor Yellow
    Write-Host "`nSee JAVA_SETUP.md for detailed instructions." -ForegroundColor Cyan
    exit 1
}

Write-Host "`nFound $($foundJava.Count) Java installation(s):" -ForegroundColor Cyan
for ($i = 0; $i -lt $foundJava.Count; $i++) {
    Write-Host "  [$($i + 1)] $($foundJava[$i].Path)" -ForegroundColor White
    Write-Host "      $($foundJava[$i].Version)" -ForegroundColor Gray
}

if ($foundJava.Count -eq 1) {
    $selectedJava = $foundJava[0].Path
    Write-Host "`nUsing the only found installation: $selectedJava" -ForegroundColor Green
} else {
    $choice = Read-Host "`nSelect Java installation (1-$($foundJava.Count))"
    $index = [int]$choice - 1
    if ($index -ge 0 -and $index -lt $foundJava.Count) {
        $selectedJava = $foundJava[$index].Path
    } else {
        Write-Host "Invalid selection!" -ForegroundColor Red
        exit 1
    }
}

# Verify it's JDK 17+
$javaExe = Join-Path $selectedJava "bin\java.exe"
$versionOutput = & $javaExe -version 2>&1
$versionMatch = $versionOutput | Select-String -Pattern "version `"(\d+)" | ForEach-Object { $_.Matches[0].Groups[1].Value }
$majorVersion = [int]$versionMatch

if ($majorVersion -lt 17) {
    Write-Host "`nWARNING: Java $majorVersion found, but JDK 17+ is required!" -ForegroundColor Red
    Write-Host "Please install a newer version." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nSetting JAVA_HOME for current session..." -ForegroundColor Cyan
$env:JAVA_HOME = $selectedJava
$env:PATH = "$selectedJava\bin;$env:PATH"

Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green

# Verify
Write-Host "`nVerifying Java installation..." -ForegroundColor Cyan
& java -version

Write-Host "`nTo make this permanent, run:" -ForegroundColor Yellow
Write-Host "  [System.Environment]::SetEnvironmentVariable('JAVA_HOME', '$selectedJava', 'User')" -ForegroundColor White
Write-Host "  `$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')" -ForegroundColor White
Write-Host "  [System.Environment]::SetEnvironmentVariable('Path', `"`$currentPath;${selectedJava}\bin`", 'User')" -ForegroundColor White

Write-Host "`nOr use the Windows GUI (see JAVA_SETUP.md)" -ForegroundColor Cyan
