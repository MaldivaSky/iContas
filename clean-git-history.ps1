# Script PowerShell para remover segredos do histórico Git usando git-filter-repo
# AVISO: isto reescreve o histórico e fará FORÇAR push no remoto. Todos os colaboradores
# deverão re-clonar o repositório após o processo.

# Uso: execute na raiz do repositório (onde está `replacements.txt`)
# PowerShell: abra em Administrador e rode: .\clean-git-history.ps1

Write-Host "START: limpeza do histórico Git (git-filter-repo)" -ForegroundColor Cyan

# 1) Verifica URL do remoto
Write-Host "Remoto origin:" -NoNewline
git remote get-url origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "\nErro: não há remoto 'origin' configurado. Abortando." -ForegroundColor Red
    exit 1
}

# 2) Instala git-filter-repo se necessário
Write-Host "Instalando git-filter-repo (pip)..." -ForegroundColor Yellow
pip install git-filter-repo
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao instalar git-filter-repo. Verifique o Python/pip e tente manualmente." -ForegroundColor Red
    exit 1
}

# 3) Criar mirror clone
Write-Host "Criando clone mirror..." -ForegroundColor Yellow
if (Test-Path "repo-mirror.git") {
    Write-Host "Pasta repo-mirror.git já existe. Removendo..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force repo-mirror.git
}

git clone --mirror --no-local . repo-mirror.git
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao criar mirror clone." -ForegroundColor Red
    exit 1
}

# 4) Aplicar replacements.txt
Write-Host "Aplicando replacements.txt com git-filter-repo..." -ForegroundColor Yellow
Set-Location repo-mirror.git
if (!(Test-Path "../replacements.txt")) {
    Write-Host "Arquivo replacements.txt não encontrado na raiz. Coloque-o e rode novamente." -ForegroundColor Red
    exit 1
}

git filter-repo --replace-text ../replacements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "git-filter-repo falhou." -ForegroundColor Red
    exit 1
}

# 5) Forçar push para remoto
Write-Host "Forçando push do histórico limpo para o remoto..." -ForegroundColor Yellow
git push --force --all
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push --all." -ForegroundColor Red
    exit 1
}

git push --force --tags
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push --tags." -ForegroundColor Red
    exit 1
}

# 6) Limpeza local do repositório original
Set-Location ..
Write-Host "Limpando referências locais e executando garbage collection..." -ForegroundColor Yellow
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "Concluído. FORÇE seus colaboradores a re-clonar o repositório." -ForegroundColor Green
Write-Host "Dica: atualize também suas variáveis de ambiente no host (MAIL_PASSWORD, JWT_SECRET_KEY)." -ForegroundColor Green
