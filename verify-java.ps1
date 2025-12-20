# Verify Java Installation and Configuration
Write-Host "`n=== Java Configuration Verification ===" -ForegroundColor Cyan

$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot"

# Check if Java exists
if (Test-Path "$javaPath\bin\java.exe") {
    Write-Host "✓ Java found at: $javaPath" -ForegroundColor Green
    
    # Get Java version
    $versionOutput = & "$javaPath\bin\java.exe" -version 2>&1
    Write-Host "`nJava Version:" -ForegroundColor Cyan
    $versionOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    # Check JAVA_HOME
    $javaHome = [System.Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
    if ($javaHome) {
        Write-Host "`n✓ JAVA_HOME (User): $javaHome" -ForegroundColor Green
    } else {
        Write-Host "`n✗ JAVA_HOME not set (User)" -ForegroundColor Yellow
        Write-Host "  Setting JAVA_HOME..." -ForegroundColor Cyan
        [System.Environment]::SetEnvironmentVariable('JAVA_HOME', $javaPath, 'User')
        Write-Host "  ✓ JAVA_HOME set!" -ForegroundColor Green
    }
    
    # Check PATH
    $userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -like "*$javaPath\bin*") {
        Write-Host "✓ Java in PATH (User)" -ForegroundColor Green
    } else {
        Write-Host "✗ Java not in PATH (User)" -ForegroundColor Yellow
        Write-Host "  Adding Java to PATH..." -ForegroundColor Cyan
        [System.Environment]::SetEnvironmentVariable('Path', "$userPath;$javaPath\bin", 'User')
        Write-Host "  ✓ Java added to PATH!" -ForegroundColor Green
    }
    
    # Set for current session
    $env:JAVA_HOME = $javaPath
    $env:PATH = "$javaPath\bin;$env:PATH"
    
    Write-Host "`n✓ Current session configured" -ForegroundColor Green
    Write-Host "`nTesting Java command..." -ForegroundColor Cyan
    java -version 2>&1 | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    Write-Host "`n=== Verification Complete ===" -ForegroundColor Green
    Write-Host "`nNote: Restart your terminal/IDE for environment variables to take effect." -ForegroundColor Yellow
    
} else {
    Write-Host "✗ Java not found at: $javaPath" -ForegroundColor Red
    Write-Host "`nPlease verify the Java installation path is correct." -ForegroundColor Yellow
    Write-Host "Common locations:" -ForegroundColor Cyan
    Write-Host "  - C:\Program Files\Java\jdk-*" -ForegroundColor Gray
    Write-Host "  - C:\Program Files\Eclipse Adoptium\jdk-*" -ForegroundColor Gray
    Write-Host "  - C:\Program Files\Android\Android Studio\jbr" -ForegroundColor Gray
}

