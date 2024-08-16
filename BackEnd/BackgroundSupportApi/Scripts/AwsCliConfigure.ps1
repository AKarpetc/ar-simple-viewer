param(
    [string]$accessKey,    # AWS Access Key ID
    [string]$secretKey,    # AWS Secret Access Key
    [string]$region = "ru-central1",
    [string]$endpointUrl)

# Настройка AWS CLI
Write-Host "Конфигурирование AWS CLI..."

# Основные настройки
aws configure set aws_access_key_id $accessKey
    aws configure set aws_secret_access_key $secretKey
    aws configure set default.region $region

# Добавление пользовательской конечной точки, если указана
if ($endpointUrl) {
    $configPath = "$env:USERPROFILE\.aws\config"

# Проверка наличия "endpoint_url" в конфигурации
    if (-not (Select-String -Path $configPath -Pattern "endpoint_url =")) {
        Add-Content $configPath "`nendpoint_url = $endpointUrl"
        Write-Host "Конечная точка добавлена: $endpointUrl"
    } else {
        Write-Host "Конечная точка уже существует и не будет изменена."
    }
} else {
    Write-Host "Конечная точка не указана. Используется стандартная конфигурация."
}

Write-Host "AWS CLI успешно сконфигурирована."