#!/usr/bin/env bash
# Reduce las fotos de img/ a máximo 1600 px de ancho y las comprime.
# - Corrige la orientación de las fotos tomadas con el celular.
# - Solo reescribe una foto si es más ancha de 1600 px o si al comprimirla
#   queda al menos un 10 % más liviana (así no se recomprime una y otra vez).
set -euo pipefail

ANCHO_MAX=1600
CALIDAD=82
cd "$(dirname "$0")/.."

if command -v magick >/dev/null 2>&1; then IM="magick"; else IM="convert"; fi
if ! command -v identify >/dev/null 2>&1 && [ "$IM" = "convert" ]; then
  sudo apt-get update -qq && sudo apt-get install -y -qq imagemagick >/dev/null
fi

cambiadas=0
revisadas=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

while IFS= read -r -d '' f; do
  revisadas=$((revisadas + 1))
  ext="${f##*.}"; ext="${ext,,}"
  ancho=$(identify -format '%w' "${f}[0]" 2>/dev/null || echo 0)
  antes=$(stat -c %s "$f")
  salida="$tmp/salida.$ext"

  case "$ext" in
    jpg|jpeg) $IM "$f" -auto-orient -resize "${ANCHO_MAX}x>" -strip -sampling-factor 4:2:0 -interlace JPEG -quality "$CALIDAD" "$salida" ;;
    png)      $IM "$f" -auto-orient -resize "${ANCHO_MAX}x>" -strip -define png:compression-level=9 "$salida" ;;
    webp)     $IM "$f" -auto-orient -resize "${ANCHO_MAX}x>" -strip -quality "$CALIDAD" "$salida" ;;
    *) continue ;;
  esac

  despues=$(stat -c %s "$salida")
  if [ "$ancho" -gt "$ANCHO_MAX" ] || [ $((despues * 10)) -lt $((antes * 9)) ]; then
    mv "$salida" "$f"
    cambiadas=$((cambiadas + 1))
    echo "Optimizada: $f (${ancho}px, $((antes / 1024)) KB -> $((despues / 1024)) KB)"
  fi
done < <(find img -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -print0)

echo "Fotos revisadas: $revisadas · optimizadas: $cambiadas"
