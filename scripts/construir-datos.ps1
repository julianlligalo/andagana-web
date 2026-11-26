# ==========================================================
#  Construye data/propiedades.js a partir de data/propiedades/*.json
#  (los archivos que se editan desde el panel Pages CMS).
#
#  - Revisa errores: código repetido o vacío, sin precio ni "Consultar precio",
#    JSON dañado, fotos que no existen. Las propiedades con error se publican
#    igual de forma segura (p. ej. "Consultar precio") para no romper la página.
#  - Escribe la lista de errores en REVISION-PROPIEDADES.md (visible en el panel)
#    y, en GitHub Actions, en el resumen de la ejecución.
#
#  Uso local:  powershell -ExecutionPolicy Bypass -File scripts/construir-datos.ps1
#  Funciona en Windows PowerShell 5.1 y en PowerShell 7 (GitHub Actions).
# ==========================================================
param([string]$Raiz = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding $false
$carpeta = Join-Path $Raiz "data/propiedades"
$TIPOS = @("casa", "terreno", "departamento", "local", "casa-rentera", "otro")
$OFICINAS = @("ambato", "quito")            # deben coincidir con data/empresa.js
$ESTADOS = @("disponible", "reservada", "vendida")
$OPERACIONES = @("venta", "arriendo")

# ---------- JSON sin dependencias (mismo resultado en PS 5.1 y 7) ----------
function ConvertTo-JsonTexto($v) {
  if ($null -eq $v) { return "null" }
  if ($v -is [bool]) { if ($v) { return "true" } else { return "false" } }
  if ($v -is [int] -or $v -is [long] -or $v -is [double] -or $v -is [decimal] -or $v -is [single]) {
    return ([double]$v).ToString("R", [Globalization.CultureInfo]::InvariantCulture)
  }
  if ($v -is [string]) {
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('"')
    foreach ($ch in $v.ToCharArray()) {
      switch ($ch) {
        '"' { [void]$sb.Append('\"') } '\' { [void]$sb.Append('\\') }
        "`n" { [void]$sb.Append('\n') } "`r" { [void]$sb.Append('\r') } "`t" { [void]$sb.Append('\t') }
        '<' { [void]$sb.Append('<') }  # evita "</script>" dentro del .js
        default { if ([int]$ch -lt 32) { [void]$sb.Append(('\u{0:x4}' -f [int]$ch)) } else { [void]$sb.Append($ch) } }
      }
    }
    [void]$sb.Append('"')
    return $sb.ToString()
  }
  if ($v -is [System.Collections.IDictionary]) {
    $partes = foreach ($k in $v.Keys) { (ConvertTo-JsonTexto ([string]$k)) + ":" + (ConvertTo-JsonTexto $v[$k]) }
    return "{" + ($partes -join ",") + "}"
  }
  if ($v -is [System.Collections.IEnumerable]) {
    $partes = foreach ($x in $v) { ConvertTo-JsonTexto $x }
    return "[" + ($partes -join ",") + "]"
  }
  return ConvertTo-JsonTexto ([string]$v)
}

# ---------- Ayudas de lectura ----------
function Get-Valor($o, $nombre) {
  if ($null -eq $o) { return $null }
  $p = $o.PSObject.Properties[$nombre]
  if ($p) { return $p.Value } else { return $null }
}
function Get-Texto($o, $nombre) {
  $v = Get-Valor $o $nombre
  if ($null -eq $v) { return "" }
  return ([string]$v).Trim()
}
function Get-Numero($o, $nombre) {
  $v = Get-Valor $o $nombre
  if ($null -eq $v -or "$v".Trim() -eq "") { return $null }
  if ($v -is [string]) { $v = $v.Trim() -replace '[^\d,.\-]', '' -replace '\.(?=\d{3}(\D|$))', '' -replace ',', '.' }
  $n = 0.0
  if ([double]::TryParse("$v", [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$n)) { return $n }
  return $null
}
function Get-Bool($o, $nombre, [bool]$porDefecto = $false) {
  $v = Get-Valor $o $nombre
  if ($null -eq $v) { return $porDefecto }
  if ($v -is [bool]) { return $v }
  return @("true", "si", "sí", "1", "yes") -contains ("$v".Trim().ToLower())
}
function Get-Lista($o, $nombre) {
  $v = Get-Valor $o $nombre
  if ($null -eq $v) { return @() }
  if ($v -is [string]) { if ($v.Trim()) { return @($v.Trim()) } else { return @() } }
  return @($v | ForEach-Object { if ($_ -is [string]) { $_.Trim() } else { Get-Texto $_ "value" } } | Where-Object { $_ })
}
function Convert-RutaFoto([string]$ruta) {
  $r = ($ruta -replace '\\', '/').Trim()
  if ($r -match '^(https?:)?//') { return $r }
  $r = $r.TrimStart('/')
  if ($r.StartsWith("andagana-web/")) { $r = $r.Substring(13) }
  return $r
}

# ---------- Lectura ----------
$errores = New-Object System.Collections.ArrayList
function Add-Error($archivo, $mensaje) {
  [void]$errores.Add([ordered]@{ archivo = $archivo; mensaje = $mensaje })
}

$propiedades = New-Object System.Collections.ArrayList
$archivos = @(Get-ChildItem -Path $carpeta -Filter *.json -File | Sort-Object Name)
foreach ($f in $archivos) {
  $rel = "data/propiedades/" + $f.Name
  try {
    $o = [IO.File]::ReadAllText($f.FullName, $utf8) | ConvertFrom-Json
  } catch {
    Add-Error $rel "El archivo está dañado y no se pudo leer (JSON inválido). Esta propiedad no se publicó."
    continue
  }
  $id = [IO.Path]::GetFileNameWithoutExtension($f.Name)
  $codigo = Get-Texto $o "codigo"
  $titulo = Get-Texto $o "titulo"
  if (-not $titulo) { $titulo = if ($codigo) { "Propiedad $codigo" } else { "Propiedad" } }

  $tipo = (Get-Texto $o "tipo").ToLower()
  if ($TIPOS -notcontains $tipo) { if ($tipo) { Add-Error $rel "Tipo desconocido «$tipo»; se mostró como «Otro»." }; $tipo = "otro" }
  $oficina = (Get-Texto $o "oficina").ToLower()
  if ($OFICINAS -notcontains $oficina) { $oficina = "ambato"; Add-Error $rel "Sin oficina responsable válida; se asignó Ambato." }
  $estado = (Get-Texto $o "estado").ToLower(); if ($ESTADOS -notcontains $estado) { $estado = "disponible" }
  $operacion = (Get-Texto $o "operacion").ToLower(); if ($OPERACIONES -notcontains $operacion) { $operacion = "venta" }

  $precio = Get-Numero $o "precio"
  if ($null -ne $precio -and $precio -le 0) { $precio = $null }
  $consultar = Get-Bool $o "consultarPrecio"
  if ($null -eq $precio -and -not $consultar) {
    Add-Error $rel "«$titulo» no tiene precio ni «Consultar precio». Se publicó como «Consultar precio»."
    $consultar = $true
  }
  if (-not $codigo) { Add-Error $rel "«$titulo» no tiene código." }

  # Características: las de la lista + las escritas a mano
  $caract = @(@(Get-Lista $o "caracteristicas") + @(Get-Lista $o "otrasCaracteristicas") | Select-Object -Unique)
  $normal = ($caract -join "|").ToLower()
  $vias = Get-Texto $o "viasAcceso"

  # Fotos: principal + galería, sin repetir; se descartan las que no existen
  $fotos = New-Object System.Collections.ArrayList
  foreach ($ruta in @(Get-Lista $o "fotoPrincipal") + @(Get-Lista $o "galeria")) {
    $r = Convert-RutaFoto $ruta
    if (-not $r -or $fotos -contains $r) { continue }
    if ($r -notmatch '^(https?:)?//' -and -not (Test-Path -LiteralPath (Join-Path $Raiz $r) -PathType Leaf)) {
      Add-Error $rel "La foto «$r» no existe en el sitio; se omitió."
      continue
    }
    [void]$fotos.Add($r)
  }

  $p = [ordered]@{
    id = $id; codigo = $codigo; titulo = $titulo; tipo = $tipo; subtipo = Get-Texto $o "subtipo"
    operacion = $operacion; canton = Get-Texto $o "canton"; sector = Get-Texto $o "sector"; provincia = Get-Texto $o "provincia"
    oficina = $oficina; estado = $estado; destacada = (Get-Bool $o "destacada")
    precio = $precio; consultarPrecio = $consultar; precioDesde = (Get-Bool $o "precioDesde")
    precioEspecial = (Get-Bool $o "precioEspecial" $true); financiamiento = (Get-Bool $o "financiamiento" $true)
    areaTerreno = (Get-Numero $o "areaTerreno"); areaTerrenoTexto = Get-Texto $o "areaTerrenoTexto"
    areaConstruccion = (Get-Numero $o "areaConstruccion")
    habitaciones = (Get-Numero $o "habitaciones"); banos = (Get-Numero $o "banos")
    garaje = (Get-Bool $o "garaje"); garajeDetalle = Get-Texto $o "garajeDetalle"
    serviciosBasicos = ($normal -match 'servicios b[aá]sicos')
    viasAcceso = $(if ($vias) { $vias } elseif ($normal -match 'v[ií]as? de acceso|acceso vehicular|asfaltad') { "Disponibles" } else { "" })
    caracteristicas = @($caract)
    descripcion = Get-Texto $o "descripcion"
    fotos = @($fotos)
    mapaEnlace = Get-Texto $o "mapaEnlace"; mapaTexto = Get-Texto $o "mapaTexto"
    orden = (Get-Numero $o "ordenCatalogo")
  }
  if (-not $p.canton) { Add-Error $rel "«$titulo» no tiene cantón." }
  if ($p.fotos.Count -eq 0) { Add-Error $rel "«$titulo» no tiene fotos." }
  [void]$propiedades.Add($p)
}

# Códigos repetidos
$propiedades | Where-Object { $_.codigo } | Group-Object { $_.codigo.ToUpper() } | Where-Object { $_.Count -gt 1 } | ForEach-Object {
  $lista = ($_.Group | ForEach-Object { "«$($_.titulo)» (data/propiedades/$($_.id).json)" }) -join ", "
  Add-Error "data/propiedades/$($_.Group[0].id).json" "El código $($_.Name) está repetido en $($_.Count) propiedades: $lista."
}

# ---------- Salida para la página ----------
$fecha = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm 'UTC'")
$js = "/* ARCHIVO GENERADO AUTOMÁTICAMENTE ($fecha). No lo edites a mano:`n" +
      "   las propiedades se editan en el panel (Pages CMS) o en data/propiedades/*.json,`n" +
      "   y este archivo se vuelve a crear con scripts/construir-datos.ps1. */`n" +
      "window.PROPIEDADES = " + (ConvertTo-JsonTexto @($propiedades)) + ";`n"
[IO.File]::WriteAllText((Join-Path $Raiz "data/propiedades.js"), $js, $utf8)

# ---------- Informe de revisión ----------
$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine("# Revisión de propiedades")
[void]$md.AppendLine("")
[void]$md.AppendLine("Este archivo se actualiza solo cada vez que se guardan cambios. No hace falta editarlo.")
[void]$md.AppendLine("")
if ($errores.Count -eq 0) {
  [void]$md.AppendLine("✅ **Todo en orden.** $($propiedades.Count) propiedades publicadas, sin errores.")
} else {
  [void]$md.AppendLine("⚠️ **Hay $($errores.Count) aviso(s) por corregir.** La página sigue funcionando: las propiedades con problemas se muestran de forma segura hasta que se corrijan.")
  [void]$md.AppendLine("")
  foreach ($e in $errores) { [void]$md.AppendLine("- **$($e.archivo)** — $($e.mensaje)") }
}
$informe = $md.ToString()
[IO.File]::WriteAllText((Join-Path $Raiz "REVISION-PROPIEDADES.md"), $informe, $utf8)

Write-Host "Propiedades publicadas: $($propiedades.Count) · Avisos: $($errores.Count)"
foreach ($e in $errores) {
  Write-Host " - $($e.archivo): $($e.mensaje)"
  if ($env:GITHUB_ACTIONS) { Write-Host "::warning file=$($e.archivo)::$($e.mensaje)" }
}
if ($env:GITHUB_STEP_SUMMARY) { [IO.File]::AppendAllText($env:GITHUB_STEP_SUMMARY, $informe, $utf8) }
if ($env:GITHUB_OUTPUT) { [IO.File]::AppendAllText($env:GITHUB_OUTPUT, "avisos=$($errores.Count)`n", $utf8) }
