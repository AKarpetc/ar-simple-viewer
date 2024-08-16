param(
    [string]$bucketName,      # Имя бакета S3
    [string]$sourceDirectory  # Локальная директория с файлами для загрузки
    )

# Очищаем бакет
Write-Host "Очистка бакета $bucketName..."
aws s3 rm "s3://$bucketName" --recursive

# Проверяем, существует ли указанный каталог
if (-not (Test-Path $sourceDirectory)) {
    Write-Host "Указанный каталог не существует: $sourceDirectory"
    exit 1
}

# Загружаем файлы в бакет
Write-Host "Загрузка файлов из $sourceDirectory в $bucketName..."
# Массив с путями для удаления
    $pathsToRemove = @(
    "BackEnd",
    "https",
    "mailing_templates",
    "src/arconfigurator",
    "src/demo",
    "src/precheck",
    "src/s3",
    "src/WebXRScene",
    "src/viewer",
    "src/index",
    "node_modules",
    ".gitignore",
    "babel.config.json",
    "buildspec.yml",
    "package-lock.json",
    "package.json",
    "webpack.config.js"
)

# Удаляем ненужные файлы и каталоги
foreach ($path in $pathsToRemove) {
    $fullPath = Join-Path -Path $sourceDirectory -ChildPath $path
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Recurse -Force
        Write-Host "Удален: $fullPath"
    } else {
        Write-Host "Не найдено: $fullPath"
    }
}

# Загружаем оставшиеся файлы в бакет
Write-Host "Загрузка файлов из $sourceDirectory в $bucketName..."
aws s3 cp $sourceDirectory "s3://$bucketName" --recursive

Write-Host "Загрузка завершена!"