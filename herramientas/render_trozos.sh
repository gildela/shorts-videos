#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
# Render por trozos para la nube: «fabrica render» se queda sin memoria en vídeos de más de ~3 min.
# Uso: bash herramientas/render_trozos.sh <id> "<título del mp4>"
ID=${1:?id}; S=salida/$ID; mkdir -p $S/trozos
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
N=$(npx remotion compositions src/index.ts 2>/dev/null | awk -v id=$ID '$1==id{print $4}'); PASO=1500
: > $S/trozos/lista.txt
for ((a=0; a<N; a+=PASO)); do
  b=$((a+PASO-1)); [ $b -ge $N ] && b=$((N-1))
  f=$S/trozos/t_$(printf %05d $a).mp4
  if [ ! -s $f ]; then
    echo "trozo $a-$b $(date +%T)"
    npx remotion render src/index.ts $ID $f --frames=$a-$b --muted --concurrency=3 --crf=20 --jpeg-quality=80 --timeout=120000 --browser-executable=$B --log=error
  fi
  echo "file '$(realpath $f)'" >> $S/trozos/lista.txt
done
echo "audio $(date +%T)"
npx remotion render src/index.ts $ID $S/fondo.wav --codec=wav --browser-executable=$B --log=error
ffmpeg -v error -y -f concat -safe 0 -i $S/trozos/lista.txt -c copy $S/bruto-mudo.mp4
mkdir -p "/mnt/project-files/Vídeos listos"
OUT="/mnt/project-files/Vídeos listos/${2:-$ID}.mp4"
ffmpeg -v error -y -i $S/bruto-mudo.mp4 -i $S/fondo.wav -i public/videos/$ID/voz.mp3 -filter_complex "[2:a]aresample=48000,aformat=channel_layouts=stereo[voz];[1:a]aresample=48000,aformat=channel_layouts=stereo[f];[f][voz]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -shortest "$OUT"
echo "LISTO $(date +%T)"
