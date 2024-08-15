param([string]$accessKey,    # AWS Access Key ID
      [string]$secretKey,    # AWS Secret Access Key
      [string]$region = "ru-central1")

# Настройка AWS CLI
Write-Host "Конфигурирование AWS CLI..."
aws configure set aws_access_key_id $accessKey
    aws configure set aws_secret_access_key $secretKey
    aws configure set default.region $region

Write-Host "AWS CLI успешно сконфигурирована."