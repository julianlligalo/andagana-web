# Servidor local sencillo para ver la página en http://localhost:8080
# Uso:  powershell -ExecutionPolicy Bypass -File servidor.ps1
# (También puedes abrir index.html directamente con doble clic.)
param([int]$Puerto = 8080)
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$tipos = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"
}
$http = New-Object System.Net.HttpListener
$http.Prefixes.Add("http://localhost:$Puerto/")
$http.Start()
Write-Host "Andagana web en http://localhost:$Puerto/  (Ctrl+C para detener)"
try {
  while ($http.IsListening) {
    $ctx = $http.GetContext()
    try {
      $ruta = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
      if ($ruta -eq "") { $ruta = "index.html" }
      $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $ruta))
      $res = $ctx.Response
      $esHead = $ctx.Request.HttpMethod -eq "HEAD"
      if ($archivo.StartsWith($raiz) -and (Test-Path $archivo -PathType Leaf)) {
        $ext = [IO.Path]::GetExtension($archivo).ToLower()
        $res.ContentType = $(if ($tipos[$ext]) { $tipos[$ext] } else { "application/octet-stream" })
        $bytes = [IO.File]::ReadAllBytes($archivo)
        $res.ContentLength64 = $bytes.Length
        if (-not $esHead) { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
      } else {
        $res.StatusCode = 404
        $b = [Text.Encoding]::UTF8.GetBytes("No encontrado")
        if (-not $esHead) { $res.OutputStream.Write($b, 0, $b.Length) }
      }
      $res.Close()
    } catch {
      # el navegador cerró la conexión antes de tiempo: se ignora y se sigue atendiendo
      try { $ctx.Response.Abort() } catch {}
    }
  }
} finally { $http.Stop() }
