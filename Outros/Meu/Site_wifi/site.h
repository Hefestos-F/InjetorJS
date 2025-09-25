// site.h
#pragma once
#include <Arduino.h>

static const char INDEX_FALLBACK[] PROGMEM = R"rawliteral(
<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Exaustor Monitor • Fallback</title>
<style>
  body{margin:0;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;background:#121212;color:#fff;display:grid;place-items:center;height:100vh}
  .card{max-width:680px;background:#1e1e1e;padding:24px;border-radius:12px;box-shadow:0 0 10px rgba(0,0,0,.6)}
  h1{margin:0 0 8px} p{opacity:.9} code{background:#2a2a2a;padding:2px 6px;border-radius:6px}
  a{color:#76d47a}
</style>
<body>
  <div class="card">
    <h1>UI não encontrada no LittleFS</h1>
    <p>Envie os arquivos da interface (ex.: <code>index.html</code>, <code>manifest.webmanifest</code>, <code>service-worker.js</code> e pasta <code>icons/</code>) para o <strong>LittleFS</strong>.</p>
    <p>Portas: <strong>HTTP :80</strong>, <strong>WebSocket :81</strong></p>
    <p>/Tentar novamente</a></p>
  </div>
</body>
</html>
)rawliteral";
