# пример команды
# .\ManageService.ps1 -exePath "BackgroundSupportApi.exe" -serviceName "BackgroundSupportApi" -displayName "BackgroundSupportApi" -description "BackgroundSupportApi"

param(
    [string]$exePath = "C:\path\to\your\app\YourApp.exe",
    [string]$serviceName = "YourAppService",
    [string]$displayName = "Your App Service"
)

function Register-Service {
    try {
        New-Service -Name $serviceName -BinaryPathName $exePath -DisplayName $displayName -Description "Your Service Description"
        Start-Service -Name $serviceName
        Write-Host "Служба $serviceName зарегистрирована и запущена."
    } catch {
        Write-Host "Ошибка при регистрации службы: $_"
    }
}

function Unregister-Service {
    try {
        # Проверяем, существует ли служба и остановлена ли она
        if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            # Ожидание остановки, если потребуется
            Start-Sleep -Seconds 2
            sc.exe delete $serviceName
            Write-Host "Служба $serviceName удалена."
        } else {
            Write-Host "Служба $serviceName не существует."
        }
    } catch {
        Write-Host "Ошибка при удалении службы: $_"
    }
}

function Main-Menu {
    Write-Host "Выберите действие:"
    Write-Host "1: Зарегистрировать службу"
    Write-Host "2: Удалить службу"
    Write-Host "0: Выход"
    $choice = Read-Host "Введите номер"
    
    switch ($choice) {
        1 { Register-Service }
        2 { Unregister-Service }
        0 { exit }
        default { Write-Host "Неверный выбор. Попробуйте снова." }
    }
}

while ($true) {
    Main-Menu
}
