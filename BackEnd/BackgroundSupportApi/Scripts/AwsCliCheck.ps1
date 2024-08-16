# Проверка наличия AWS CLI
try {
    $version = aws --version
    Write-Host "AWS CLI уже установлена: $version"
} catch {
    Write-Host "AWS CLI не найдена. Установка..."

# Установка через MSI Installer
        $installerUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
        $installerPath = "$env:TEMP\AWSCLIV2.msi"

    try {
# Загрузка установочного файла
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -ErrorAction Stop

# Установка AWS CLI
        Start-Process msiexec.exe -Wait -ArgumentList "/i", $installerPath, "/quiet" -ErrorAction Stop

# Удаление установочного файла
        Remove-Item $installerPath

        Write-Host "AWS CLI успешно установлена: $version"
    } catch {
        Write-Host "Не удалось установить AWS CLI. Ошибка: $_"
    }
}