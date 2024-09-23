# MainScript.ps1

param([string]$branchName)

# 1. Проверка установки AWS CLI
Write-Host "Шаг 1: Проверка установки AWS CLI..."
.\AwsCliCheck.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка: AWS CLI не установлен или недоступен."
    exit $LASTEXITCODE
}

# 2. Настройка AWS CLI
Write-Host "Шаг 2: Настройка AWS CLI..."
.\AwsCliConfigure.ps1 -accessKey "accessKey" -secretKey "secretKey" -endpointUrl "endpointUrl"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при настройке AWS CLI."
    exit $LASTEXITCODE
}

# 3. Клонирование и сборка фронтенд проекта
Write-Host "Шаг 3: Клонирование и сборка фронтенд проекта..."
.\CloneAndBuildFrontProj.ps1 -repoUrl "repoUrl.git" -branchName $branchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при клонировании или сборке фронтенд проекта."
    exit $LASTEXITCODE
}

# 4. Загрузка собранного фронтенда на AWS
cd ..
Write-Host "Шаг 4: Загрузка собранного фронтенда на AWS..."
.\AwsCliUpload.ps1 -bucketName "art-vision-tech" -sourceDirectory $PWD"\ar-simple-viewer"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при загрузке на AWS."
    exit $LASTEXITCODE
}

Write-Host "Все шаги выполнены успешно!"
