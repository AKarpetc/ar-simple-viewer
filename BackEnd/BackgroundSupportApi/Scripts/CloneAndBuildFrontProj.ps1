param([string]$repoUrl)

# Клонирование репозитория
git clone $repoUrl
$repoName = ($repoUrl -split '/|\\')[-1] -replace '\.git$', ''
Set-Location $repoName

$branches = git branch -r | ForEach-Object { $_.ToString().Trim() -replace 'origin/', '' }
$mainBranch = $branches | Where-Object { $_ -eq 'main' }

if ($mainBranch) {
    Write-Host "Найдена ветка main"
    git checkout $mainBranch
} else {
    Write-Host "Ветка main не найдена"
    exit
}

# Выполнение команды сборки
Write-Host "Выполняем сборку..."
npm install
npm run build-prod

Write-Host "Сборка завершена!"