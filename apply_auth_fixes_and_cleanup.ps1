# ...existing code...
$root = Get-Location
$ts = Get-Date -Format "yyyyMMddHHmmss"
$backupDir = Join-Path $root ("project_backups_$ts")
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# 1) Crear helper TS si no existe
$helper = Join-Path $root "lib\absoluteUrl.ts"
if (-not (Test-Path $helper)) {
  New-Item -ItemType Directory -Path (Split-Path $helper) -Force | Out-Null
  @"
export function absoluteUrl(path: string, req?: { headers?: Record<string,string> }) {
  const envBase = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || process.env.BASE_URL;
  if (envBase) {
    try { return new URL(path, envBase).toString(); } catch {}
  }
  if (req && req.headers && req.headers['host']) {
    const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
    try { return new URL(path, `${proto}://${req.headers['host']}`).toString(); } catch {}
  }
  return `http://localhost:3000${path.startsWith('/') ? path : '/' + path}`;
}
"@ | Out-File -FilePath $helper -Encoding UTF8
  Write-Host "Helper creado:" $helper
} else {
  Write-Host "Helper ya existe:" $helper
}

# 2) Función para backup y reemplazo simple
function Backup-And-Replace($filePath, $pattern, $replacement) {
  $rel = Resolve-Path -LiteralPath $filePath -ErrorAction SilentlyContinue
  if (-not $rel) { Write-Host "No existe:" $filePath; return }
  $rel = $rel.Path
  $bak = Join-Path $backupDir ((Split-Path $rel -Leaf) + ".bak_$ts")
  Copy-Item -LiteralPath $rel -Destination $bak -Force
  Write-Host "Backup created:" $bak
  $content = Get-Content -LiteralPath $rel -Raw -ErrorAction Stop
  $new = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacement, [System.Text.RegularExpressions.RegexOptions]::Multiline)
  if ($new -ne $content) {
    Set-Content -LiteralPath $rel -Value $new -Encoding UTF8
    Write-Host "Patrón aplicado en:" $rel
  } else {
    Write-Host "No se detectó patrón en:" $rel
  }
}

# 3) Archivos objetivo: sólo escaneo y cambios en archivos server-side (api) y pages que reciban req
$targets = Get-ChildItem -Recurse -File | Where-Object { $_.FullName -match '\\pages\\api\\' -or $_.FullName -match '\\pages\\' } | Select-Object -ExpandProperty FullName

# Reemplazos:
# - fetch('/api/xxx' , ...) -> fetch(absoluteUrl('/api/xxx', req) , ...)
# Only replace when function has (req, res) signature: this is a simple heuristic, we do global replace of fetch('/api/ to fetch(absoluteUrl('/api/ , req) when file contains "function" with req param
foreach ($f in $targets) {
  $txt = Get-Content -LiteralPath $f -Raw -ErrorAction SilentlyContinue
  if (-not $txt) { continue }
  if ($txt -match "function\s+\w*\s*\(\s*req\s*,\s*res" -or $txt -match "\(req:\s*") {
    # pattern: fetch('...') or fetch("...")
    $pattern = "fetch\(\s*(['""])(\/api\/[^'""]*)\1"
    $replacement = "fetch(absoluteUrl('$2', req)"
    Backup-And-Replace $f $pattern $replacement
    # ensure import exists
    if ($txt -notmatch "absoluteUrl") {
      # prepend import after possible top imports
      $lines = Get-Content -LiteralPath $f
      $insertAt = 0
      for ($i=0;$i -lt $lines.Length; $i++) {
        if ($lines[$i] -match "^import") { $insertAt = $i+1 }
      }
      $imp = "import { absoluteUrl } from '@/lib/absoluteUrl';"
      $lines = $lines[0..($insertAt-1)] + $imp + $lines[$insertAt..($lines.Length-1)]
      $lines -join "`n" | Set-Content -LiteralPath $f -Encoding UTF8
      Write-Host "Import insertado en:" $f
    }
  } else {
    # replace fetch('/api/...') without req using env base
    $pattern2 = "fetch\(\s*(['""])(\/api\/[^'""]*)\1"
    $replacement2 = "fetch(absoluteUrl('$2'))"
    Backup-And-Replace $f $pattern2 $replacement2
    if ((Get-Content -LiteralPath $f -Raw) -match "absoluteUrl" -and (Get-Content -LiteralPath $f -Raw) -notmatch "from '@/lib/absoluteUrl'") {
      $content = Get-Content -LiteralPath $f
      $content[0] = "import { absoluteUrl } from '@/lib/absoluteUrl';`n" + $content[0]
      $content -join "`n" | Set-Content -LiteralPath $f -Encoding UTF8
      Write-Host "Import insertado (fallback) en:" $f
    }
  }
}

# 4) Mover backups .bak_* existentes a carpeta backup (organiza)
Get-ChildItem -Recurse -File -Filter "*.bak_*" | ForEach-Object {
  $dest = Join-Path $backupDir ($_.Name)
  Move-Item -LiteralPath $_.FullName -Destination $dest -Force
}
Write-Host "Backups movidos a:" $backupDir

Write-Host "`nHecho. Revisa los archivos modificados y luego ejecuta: npm run dev"
# ...existing code...