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
$SITIO = "https://julianlligalo.github.io/andagana-web/"   # dirección pública (para el feed RSS)
$NOMBRES_TIPO = @{ casa = "Casa"; terreno = "Terreno"; departamento = "Departamento"; local = "Local"; "casa-rentera" = "Casa rentera"; otro = "Propiedad" }
# Hoy en hora de Ecuador (UTC-5), también cuando corre en GitHub (UTC)
$HOY = [DateTime]::UtcNow.AddHours(-5).Date

# WhatsApp de cada oficina, leído de data/empresa.js
$WA_OFICINA = @{}
$empresaJs = Join-Path $Raiz "data/empresa.js"
if (Test-Path $empresaJs) {
  $txt = [IO.File]::ReadAllText($empresaJs, $utf8)
  foreach ($m in [regex]::Matches($txt, '(?s)id:\s*"(\w+)".*?whatsapp:\s*"(\d+)".*?telefonoVisible:\s*"([^"]+)"')) {
    $WA_OFICINA[$m.Groups[1].Value] = @{ numero = $m.Groups[2].Value; visible = $m.Groups[3].Value }
  }
}
if (-not $WA_OFICINA["ambato"]) { $WA_OFICINA["ambato"] = @{ numero = "593992674556"; visible = "099 267 4556" } }

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
  if ($v -is [DateTime]) { return $v.ToString("yyyy-MM-dd") }   # PowerShell 7 convierte fechas solo
  return ([string]$v).Trim()
}
function Get-Fecha($o, $nombre) {
  $v = Get-Valor $o $nombre
  if ($v -is [DateTime]) { return $v.Date }
  $t = "$v".Trim()
  if (-not $t) { return $null }
  $d = [DateTime]::MinValue
  $formatos = [string[]]@("yyyy-MM-dd", "yyyy-MM-ddTHH:mm", "yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm:ssK", "yyyy-MM-ddTHH:mm:ss.fffK", "dd/MM/yyyy")
  if ([DateTime]::TryParseExact($t, $formatos, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::None, [ref]$d)) { return $d.Date }
  if ([DateTime]::TryParse($t, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::None, [ref]$d)) { return $d.Date }
  return $null
}
function Get-Slug([string]$t) {
  $n = $t.ToLower().Normalize([Text.NormalizationForm]::FormD)
  $n = -join ($n.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark })
  return ($n -replace '[^a-z0-9]+', '-').Trim('-')
}

# JSON con sangría, para reescribir los archivos de propiedades conservando el orden de los campos
function ConvertTo-JsonBonito($v, $ind = "") {
  $n = $ind + "  "
  if ($null -eq $v) { return "null" }
  if ($v -is [DateTime]) { return ConvertTo-JsonTexto ($v.ToString("yyyy-MM-dd")) }
  if ($v -is [bool] -or $v -is [string] -or $v -is [ValueType]) { return ConvertTo-JsonTexto $v }
  if ($v -is [System.Management.Automation.PSCustomObject]) {
    $d = [ordered]@{}; foreach ($p in $v.PSObject.Properties) { $d[$p.Name] = $p.Value }; $v = $d
  }
  if ($v -is [System.Collections.IDictionary]) {
    if ($v.Count -eq 0) { return "{}" }
    $partes = foreach ($k in $v.Keys) { $n + (ConvertTo-JsonTexto ([string]$k)) + ": " + (ConvertTo-JsonBonito $v[$k] $n) }
    return "{`n" + ($partes -join ",`n") + "`n$ind}"
  }
  $items = @($v)
  if ($items.Count -eq 0) { return "[]" }
  $partes = foreach ($x in $items) { $n + (ConvertTo-JsonBonito $x $n) }
  return "[`n" + ($partes -join ",`n") + "`n$ind]"
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

$archivos = @(Get-ChildItem -Path $carpeta -Filter *.json -File | Sort-Object Name)

# ---------- 1. Leer todo y completar los datos automáticos ----------
# fechaPublicacion: si está vacía, se pone la fecha de hoy.
# guid: identificador permanente para el feed RSS. Se crea UNA sola vez a partir
#       del código y se guarda en el archivo; no cambia aunque luego se edite la propiedad.
$leidos = @{}
foreach ($f in $archivos) {
  try { $leidos[$f.Name] = [IO.File]::ReadAllText($f.FullName, $utf8) | ConvertFrom-Json } catch { $leidos[$f.Name] = $null }
}
$validos = @($archivos | Where-Object { $null -ne $leidos[$_.Name] })
$porCambiar = @{}
foreach ($f in $validos) {
  $o = $leidos[$f.Name]
  if ($null -eq (Get-Fecha $o "fechaPublicacion")) {
    $o | Add-Member -NotePropertyName fechaPublicacion -NotePropertyValue $HOY.ToString("yyyy-MM-dd") -Force
    $porCambiar[$f.Name] = $true
  }
}
# los guid existentes se respetan; si dos archivos comparten uno (p. ej. una copia), el más antiguo lo conserva
$orden = $validos | Sort-Object @{ e = { Get-Fecha $leidos[$_.Name] "fechaPublicacion" } }, @{ e = { $n = Get-Numero $leidos[$_.Name] "ordenCatalogo"; if ($null -eq $n) { [double]::MaxValue } else { $n } } }, Name
$usados = @{}
foreach ($f in $orden) {
  $g = Get-Texto $leidos[$f.Name] "guid"
  if ($g -and -not $usados.ContainsKey($g)) { $usados[$g] = $f.Name }
}
foreach ($f in $orden) {
  $o = $leidos[$f.Name]
  $g = Get-Texto $o "guid"
  if ($g -and $usados[$g] -eq $f.Name) { continue }
  $base = "andagana-" + $(if (Get-Texto $o "codigo") { Get-Slug (Get-Texto $o "codigo") } else { Get-Slug ([IO.Path]::GetFileNameWithoutExtension($f.Name)) })
  $nuevo = $base; $i = 2
  while ($usados.ContainsKey($nuevo)) { $nuevo = "$base-$i"; $i++ }
  $usados[$nuevo] = $f.Name
  $o | Add-Member -NotePropertyName guid -NotePropertyValue $nuevo -Force
  $porCambiar[$f.Name] = $true
}
foreach ($nombre in $porCambiar.Keys) {
  $ruta = Join-Path $carpeta $nombre
  [IO.File]::WriteAllText($ruta, (ConvertTo-JsonBonito $leidos[$nombre]) + "`n", $utf8)
}
if ($porCambiar.Count) { Write-Host "Archivos completados con fecha/guid: $($porCambiar.Count)" }

# ---------- 2. Revisar y preparar cada propiedad ----------
$propiedades = New-Object System.Collections.ArrayList
foreach ($f in $archivos) {
  $rel = "data/propiedades/" + $f.Name
  $o = $leidos[$f.Name]
  if ($null -eq $o) {
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
    fechaPublicacion = (Get-Fecha $o "fechaPublicacion").ToString("yyyy-MM-dd")
    guid = Get-Texto $o "guid"
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
$js = "/* ARCHIVO GENERADO AUTOMÁTICAMENTE. No lo edites a mano:`n" +
      "   las propiedades se editan en el panel (Pages CMS) o en data/propiedades/*.json,`n" +
      "   y este archivo se vuelve a crear con scripts/construir-datos.ps1. */`n" +
      "window.PROPIEDADES = " + (ConvertTo-JsonTexto @($propiedades)) + ";`n"
[IO.File]::WriteAllText((Join-Path $Raiz "data/propiedades.js"), $js, $utf8)

# ---------- Feed RSS (feed.xml): solo propiedades disponibles, de la más reciente a la más antigua ----------
function Format-Miles($n, [string]$formato = "#,0") {
  # 1234567.5 -> "1.234.567,5" (formato de Ecuador)
  return ([double]$n).ToString($formato, [Globalization.CultureInfo]::InvariantCulture).Replace(",", "§").Replace(".", ",").Replace("§", ".")
}
function Get-PrecioTexto($p) {
  if ($p.consultarPrecio -or $null -eq $p.precio) { return "Consultar precio" }
  $t = '$' + (Format-Miles $p.precio)
  if ($p.precioDesde) { $t = "desde $t" }
  if ($p.operacion -eq "arriendo") { $t = "$t al mes" }
  return $t
}
function Get-Resumen([string]$texto, [int]$max = 260) {
  $texto = ($texto -replace '\s+', ' ').Trim()
  if ($texto.Length -le $max) { return $texto }
  $frases = [regex]::Split($texto, '(?<=[.!?])\s+')
  $r = ""
  foreach ($fr in $frases) { if (($r + " " + $fr).Trim().Length -gt $max) { break }; $r = ($r + " " + $fr).Trim() }
  if (-not $r) { $r = $texto.Substring(0, $max).TrimEnd() + "…" }
  return $r
}
$fmtFecha = { param($d) $d.AddHours(8).ToString("ddd, dd MMM yyyy HH:mm:ss", [Globalization.CultureInfo]::InvariantCulture) + " -0500" }
$tiposMime = @{ ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".png" = "image/png"; ".webp" = "image/webp" }

$enFeed = @($propiedades | Where-Object { $_.estado -eq "disponible" } |
  Sort-Object @{ e = { [DateTime]::ParseExact($_.fechaPublicacion, "yyyy-MM-dd", $null) }; Descending = $true },
              @{ e = { if ($null -eq $_.orden) { -1 } else { $_.orden } }; Descending = $false })

$cfg = New-Object System.Xml.XmlWriterSettings
$cfg.Indent = $true; $cfg.Encoding = $utf8; $cfg.NewLineChars = "`n"
$feedRuta = Join-Path $Raiz "feed.xml"
$ms = New-Object System.IO.MemoryStream
$x = [System.Xml.XmlWriter]::Create($ms, $cfg)
$x.WriteStartDocument()
$x.WriteStartElement("rss"); $x.WriteAttributeString("version", "2.0")
$x.WriteAttributeString("xmlns", "atom", $null, "http://www.w3.org/2005/Atom")
$x.WriteStartElement("channel")
$x.WriteElementString("title", "Andagana Corporación – Propiedades disponibles")
$x.WriteElementString("link", $SITIO)
$x.WriteElementString("description", "Casas, terrenos, departamentos y locales en venta con financiamiento. Financiamos oportunidades, entregamos hogares.")
$x.WriteElementString("language", "es-EC")
$ultima = if ($enFeed.Count) { [DateTime]::ParseExact($enFeed[0].fechaPublicacion, "yyyy-MM-dd", $null) } else { $HOY }
$x.WriteElementString("lastBuildDate", (& $fmtFecha $ultima))
$x.WriteStartElement("atom", "link", "http://www.w3.org/2005/Atom")
$x.WriteAttributeString("href", $SITIO + "feed.xml"); $x.WriteAttributeString("rel", "self"); $x.WriteAttributeString("type", "application/rss+xml")
$x.WriteEndElement()
$x.WriteStartElement("image")
$x.WriteElementString("url", $SITIO + "img/logo.png")
$x.WriteElementString("title", "Andagana Corporación – Propiedades disponibles")
$x.WriteElementString("link", $SITIO)
$x.WriteEndElement()

foreach ($p in $enFeed) {
  $tipoNombre = $NOMBRES_TIPO[$p.tipo]
  # "sector, cantón" (p. ej. "Centro, Pelileo"); solo el cantón si no hay sector o es el mismo
  $lugar = if ($p.sector -and $p.sector -ne $p.canton -and $p.canton) { "$($p.sector), $($p.canton)" } elseif ($p.sector) { $p.sector } else { $p.canton }
  $precio = Get-PrecioTexto $p
  $titulo = "$tipoNombre" + $(if ($p.operacion -eq "arriendo") { " en arriendo" } else { "" }) + " en $lugar – $precio"
  $enlace = $SITIO + "propiedad.html?id=" + [Uri]::EscapeDataString($p.id)
  $wa = $WA_OFICINA[$p.oficina]; if (-not $wa) { $wa = $WA_OFICINA["ambato"] }

  $ubic = (@($p.sector, $p.canton, $p.provincia) | Where-Object { $_ } | Select-Object -Unique) -join ", "
  $lineas = New-Object System.Collections.ArrayList
  [void]$lineas.Add("🏡 " + $(if ($p.subtipo) { $p.subtipo } else { $tipoNombre }) + " en " + $(if ($p.operacion -eq "arriendo") { "arriendo" } else { "venta" }) + " – $ubic")
  [void]$lineas.Add("")
  $resumen = Get-Resumen $p.descripcion
  if ($resumen) { [void]$lineas.Add($resumen); [void]$lineas.Add("") }
  $areas = @()
  if ($p.areaTerrenoTexto) { $areas += "Terreno: $($p.areaTerrenoTexto)" } elseif ($p.areaTerreno) { $areas += "Terreno: " + $(if ($p.precioDesde) { "desde " } else { "" }) + (Format-Miles $p.areaTerreno "#,0.##") + " m²" }
  if ($p.areaConstruccion) { $areas += "Construcción: " + (Format-Miles $p.areaConstruccion "#,0.##") + " m²" }
  if ($areas.Count) { [void]$lineas.Add("📐 " + ($areas -join " · ")) }
  $amb = @()
  if ($p.habitaciones) { $amb += "$($p.habitaciones) habitaciones" }
  if ($p.banos) { $amb += "$($p.banos) baños" }
  if ($p.garaje) { $amb += $(if ($p.garajeDetalle) { $p.garajeDetalle } else { "Garaje" }) }
  if ($amb.Count) { [void]$lineas.Add("🛏️ " + ($amb -join " · ")) }
  if ($p.caracteristicas.Count) { [void]$lineas.Add("✅ " + (@($p.caracteristicas | Select-Object -First 8) -join " · ")) }
  [void]$lineas.Add("💰 " + $(if ($p.precioEspecial -and -not $p.consultarPrecio) { "Precio especial: " } else { "Precio: " }) + $precio)
  if ($p.financiamiento) { [void]$lineas.Add("🏦 Financiamiento desde el 8,5%*") }
  [void]$lineas.Add("📲 WhatsApp: $($wa.visible) → https://wa.me/$($wa.numero)")
  [void]$lineas.Add("🔗 Fotos y detalles: $enlace")
  if ($p.codigo) { [void]$lineas.Add("Código: $($p.codigo)") }
  if ($p.financiamiento) { [void]$lineas.Add(""); [void]$lineas.Add("*Tasa referencial desde el 8,5% anual. Sujeta a análisis, aprobación del crédito y condiciones vigentes.") }

  $x.WriteStartElement("item")
  $x.WriteElementString("title", $titulo)
  $x.WriteElementString("link", $enlace)
  $x.WriteElementString("description", ($lineas -join "`n"))
  $x.WriteStartElement("guid"); $x.WriteAttributeString("isPermaLink", "false"); $x.WriteString($p.guid); $x.WriteEndElement()
  $x.WriteElementString("pubDate", (& $fmtFecha ([DateTime]::ParseExact($p.fechaPublicacion, "yyyy-MM-dd", $null))))
  $x.WriteElementString("category", $tipoNombre)
  if ($p.canton) { $x.WriteElementString("category", $p.canton) }
  if ($p.fotos.Count) {
    $foto = $p.fotos[0]
    if ($foto -match '^(https?:)?//') { $url = $foto; $largo = 0 } else {
      $url = $SITIO + ((($foto -split '/') | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/')
      $largo = (Get-Item -LiteralPath (Join-Path $Raiz $foto)).Length
    }
    $ext = [IO.Path]::GetExtension($foto).ToLower(); $mime = $tiposMime[$ext]; if (-not $mime) { $mime = "image/jpeg" }
    $x.WriteStartElement("enclosure"); $x.WriteAttributeString("url", $url); $x.WriteAttributeString("length", "$largo"); $x.WriteAttributeString("type", $mime); $x.WriteEndElement()
  }
  $x.WriteEndElement()
}
$x.WriteEndElement(); $x.WriteEndElement(); $x.WriteEndDocument(); $x.Flush(); $x.Close()
[IO.File]::WriteAllBytes($feedRuta, $ms.ToArray())
Write-Host "Feed RSS: $($enFeed.Count) propiedades disponibles en feed.xml"

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
