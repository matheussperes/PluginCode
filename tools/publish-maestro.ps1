<#
.SYNOPSIS
  Valida, commita e publica uma nova versao do plugin Maestro.

.DESCRIPTION
  Roda na raiz do repositorio PluginCode. Faz, nesta ordem:

    1. Confere que plugin.json e marketplace.json declaram a MESMA versao.
       Divergencia aqui e o erro classico: o plugin sobe, o marketplace
       continua servindo a versao velha, e nada parece errado.
    2. Valida sintaxe de todo script .mjs e de todo .json do plugin.
    3. Confere que todo agente tem frontmatter com name e description.
    4. Commita e faz push.

  Nao instala nem recarrega o plugin: isso e feito dentro do Claude Code,
  por comando de barra. O script imprime os comandos exatos no final.

  NOTA DE ENCODING: este arquivo e ASCII puro e gravado com BOM UTF-8, de
  proposito. O Windows PowerShell 5.1 le arquivo UTF-8 sem BOM como
  Windows-1252, e um travessao vira tres caracteres, o ultimo deles uma
  aspa curva que o parser trata como delimitador de string. O resultado e
  um erro de sintaxe dezenas de linhas abaixo do caractere culpado.
  Mantenha este arquivo sem acento e sem travessao.

.PARAMETER Message
  Mensagem de commit. Se omitida, monta uma a partir da versao.

.PARAMETER NoPush
  Commita mas nao envia para o remoto.

.PARAMETER DryRun
  So valida. Nao commita nem envia.

.EXAMPLE
  .\tools\publish-maestro.ps1 -DryRun
  .\tools\publish-maestro.ps1 -Message "3.8.0 - hooks deterministicos"
#>

[CmdletBinding()]
param(
  [string]$Message,
  [switch]$NoPush,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Raiz do repo = pasta acima de /tools, onde este script vive.
$Raiz = Split-Path -Parent $PSScriptRoot
Set-Location $Raiz

$Plugin = Join-Path $Raiz "plugins\maestro"
$script:erros = @()

function Passo($texto) { Write-Host "`n== $texto" -ForegroundColor Cyan }
function Ok($texto)    { Write-Host "   ok    $texto" -ForegroundColor DarkGray }
function Aviso($texto) { Write-Host "   aviso $texto" -ForegroundColor Yellow }
function Falha($texto) {
  Write-Host "   FALHA $texto" -ForegroundColor Red
  $script:erros += $texto
}

# ---------------------------------------------------------------------------

Passo "Versoes"

$vPlugin = (Get-Content (Join-Path $Plugin ".claude-plugin\plugin.json") -Raw | ConvertFrom-Json).version
$mkt     = Get-Content (Join-Path $Raiz ".claude-plugin\marketplace.json") -Raw | ConvertFrom-Json
$vMarket = ($mkt.plugins | Where-Object { $_.name -eq "maestro" }).version

Write-Host "   plugin.json      $vPlugin"
Write-Host "   marketplace.json $vMarket"

if ($vPlugin -ne $vMarket) {
  Falha "versoes divergentes: o marketplace continuaria servindo a versao antiga"
}
else {
  Ok "versoes batem"
}

# ---------------------------------------------------------------------------

Passo "Sintaxe dos scripts"

foreach ($s in Get-ChildItem (Join-Path $Plugin "scripts") -Filter "*.mjs") {
  $saida = & node --check $s.FullName 2>&1
  if ($LASTEXITCODE -eq 0) {
    Ok $s.Name
  }
  else {
    Falha "$($s.Name): erro de sintaxe"
    Write-Host "          $saida" -ForegroundColor DarkRed
  }
}

# ---------------------------------------------------------------------------

Passo "JSON"

$jsons = @(
  (Join-Path $Raiz   ".claude-plugin\marketplace.json"),
  (Join-Path $Plugin ".claude-plugin\plugin.json"),
  (Join-Path $Plugin "hooks\hooks.json"),
  (Join-Path $Plugin "templates\project\.maestro\config.json"),
  (Join-Path $Plugin "templates\project\.claude\settings.json")
)

foreach ($j in $jsons) {
  $nome = Split-Path $j -Leaf
  try {
    Get-Content $j -Raw | ConvertFrom-Json | Out-Null
    Ok $nome
  }
  catch {
    Falha "${nome}: JSON invalido - $($_.Exception.Message)"
  }
}

# ---------------------------------------------------------------------------

Passo "Frontmatter dos agentes"

$agentes = Get-ChildItem (Join-Path $Plugin "agents") -Filter "*.md"
$inertes = @()

foreach ($a in $agentes) {
  $txt = Get-Content $a.FullName -Raw

  if ($txt -notmatch "(?s)^---\r?\n(.*?)\r?\n---") {
    Falha "$($a.Name): sem frontmatter"
    continue
  }

  $fm = $Matches[1]
  if ($fm -notmatch "(?m)^name:")        { Falha "$($a.Name): sem campo name" }
  if ($fm -notmatch "(?m)^description:") { Falha "$($a.Name): sem campo description" }

  # Campo inerte. `background` so tem semantica documentada para true, e desde
  # a v2.1.198 subagentes rodam em background por padrao. Quem decide isso
  # agora e o hook shape-agent-call.mjs. Deixar `background: false` no arquivo
  # e manter uma afirmacao falsa que alguem vai acreditar.
  if ($fm -match "(?m)^background:\s*false") { $inertes += $a.Name }
}

Ok "$($agentes.Count) agentes conferidos"
if ($inertes.Count -gt 0) {
  Aviso "background: false (inerte) em: $($inertes -join ', ')"
}

# ---------------------------------------------------------------------------

Passo "Encoding dos scripts PowerShell"

# Mesma armadilha que gerou esta nota: ASCII puro nunca quebra, seja qual for
# a decodificacao que o PowerShell escolher.
foreach ($p in Get-ChildItem (Join-Path $Raiz "tools") -Filter "*.ps1") {
  $bytes = [System.IO.File]::ReadAllBytes($p.FullName)
  $naoAscii = @($bytes | Where-Object { $_ -gt 127 })
  $temBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF

  if ($naoAscii.Count -eq 0 -or $temBom) {
    Ok "$($p.Name)"
  }
  else {
    Falha "$($p.Name): tem byte nao-ASCII e nao tem BOM - o PS 5.1 vai quebrar"
  }
}

# ---------------------------------------------------------------------------

if ($script:erros.Count -gt 0) {
  Write-Host "`n$($script:erros.Count) problema(s). Nada foi commitado.`n" -ForegroundColor Red
  exit 1
}

Write-Host "`nValidacao limpa." -ForegroundColor Green

if ($DryRun) {
  Write-Host "DryRun: parando aqui.`n"
  exit 0
}

# ---------------------------------------------------------------------------

Passo "Git"

git add -A
git diff --cached --stat

$staged = git diff --cached --name-only

if (-not $staged) {
  Aviso "nada para commitar"
}
else {
  if (-not $Message) { $Message = "maestro $vPlugin" }

  git commit -m $Message
  if ($LASTEXITCODE -ne 0) {
    Write-Host "commit falhou" -ForegroundColor Red
    exit 1
  }

  if ($NoPush) {
    Aviso "NoPush: commit local feito, sem envio"
  }
  else {
    git push
    if ($LASTEXITCODE -ne 0) {
      Write-Host "push falhou" -ForegroundColor Red
      exit 1
    }
  }
}

# ---------------------------------------------------------------------------

$cacheDir = Join-Path $env:USERPROFILE ".claude\plugins\cache"

Write-Host @"

Publicado: maestro $vPlugin

O resto acontece DENTRO do Claude Code. Marketplace local tem auto-update
desligado por padrao, entao a nova versao nao chega sozinha:

    /plugin marketplace update plugincode
    /plugin install maestro@plugincode
    /reload-plugins

Se o /reload-plugins avisar que invalida o cache do prompt:

    /reload-plugins --force

Para testar antes de publicar, sem mexer no marketplace nem no cache:

    claude --plugin-dir "$Plugin"

Se as skills ou agentes nao aparecerem depois de instalar, limpe o cache
e reinicie o Claude Code:

    Remove-Item -Recurse -Force "$cacheDir"

"@ -ForegroundColor Green
