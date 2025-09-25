Esta pasta deve conter os seguintes ícones PNG:

- favicon-16.png
- favicon-32.png
- apple-180.png
- icon-192.png
- icon-512.png

Como gerar (ImageMagick):
  convert base.png -resize 16x16   favicon-16.png
  convert base.png -resize 32x32   favicon-32.png
  convert base.png -resize 180x180 apple-180.png
  convert base.png -resize 192x192 icon-192.png
  convert base.png -resize 512x512 icon-512.png

Dicas:
- Use uma imagem base quadrada (ideal 1024x1024, fundo transparente).
- Para ícones "maskable" (Android), considere adicionar margem/extent.
