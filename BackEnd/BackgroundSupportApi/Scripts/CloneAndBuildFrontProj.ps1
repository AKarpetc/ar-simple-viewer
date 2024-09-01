param([string]$repoUrl,
      [string]$branchName)

# Клонирование репозитория
git clone $repoUrl
$repoName = ($repoUrl -split '/|\\')[-1] -replace '\.git$', ''
Set-Location $repoName

$branches = git branch -r | ForEach-Object { $_.ToString().Trim() -replace 'origin/', '' }
$mainBranch = $branches | Where-Object { $_ -eq $branchName }

if ($mainBranch) {
    Write-Host "Ветка найдена"
    git checkout $mainBranch
} else {
    Write-Host "Ветка не найдена" $mainBranch
    Write-Host $mainBranch
    exit
}

# Выполнение команды сборки
Write-Host "Выполняем сборку..."
npm install
npm run build-prod

Write-Host "Сборка завершена!"