✅ Projeto: Firmware NodeMCU — Versão Atual
1) Objetivos

Monitorar temperatura/umidade (DHT11) e RPM do exaustor.
Controlar velocidade via PWM (MOSFET) com min/max + soft‑start.
Web UI completa (dashboard, configurações, testes, Wi‑Fi).
Telegram (status, config, testes, envio de mensagens — STA only).
Captive Portal no AP e persistência em LittleFS.


2) Hardware (NodeMCU 1.0) — Pinagem Sugerida





















































FunçãoPinoGPIOObservaçõesPWM (MOSFET/Gate)D15analogWriteFreq(20000); duty 0–1023RPM (interrupção)D514Pull‑up e debounceDHT11D24Leituras não‑bloqueantesBuzzerD612Teste/alertaLED Wi‑Fi (ativo LOW)D016Padrões (STA/AP/falha)Botão Alertas/RecuperaçãoD713Curto=ON/OFF; ≥2s=mute; ≥7s=RecoveryLED de alerta (opcional)D42Onboard, ativo LOW (cuidado no boot)

⚠️ D3 (GPIO0), D4 (GPIO2), D8 (GPIO15) afetam o boot — use com cautela.


3) Conectividade & Fluxo de Boot

STA (Station): Internet (Telegram, NTP, OTA, mDNS).
AP (Access Point): Acesso local e Captive Portal (DNS redireciona para a UI).
UI acessível em AP e STA.

Boot:

Carrega /config.json (LittleFS).
Tenta STA (~20 s).

OK ⇒ inicia Telegram/NTP/OTA/mDNS e fecha Captive (se estava aberto).
Falha ⇒ incrementa contador; se exceder limites ⇒ força AP + Captive; mantém tentativa STA em plano de fundo com backoff.


Alterações na UI/Telegram salvam e persistem (escrita atômica).


4) Segurança

UI: HTTP Basic Auth e CSRF para POST.
AP: senha WPA2 forte (validação mínima de comprimento).
Telegram: token em LittleFS (/secrets.json), allowlist de chat IDs.
TLS: setInsecure() (mais leve) ou CA Root (consome mais RAM).
Botão físico de recuperação: ≥7s ⇒ reseta apenas Wi‑Fi (STA) e alertas (não apaga tudo).

5) Web UI

Dashboard: Temp, Umidade, RPM, PWM, Wi‑Fi (STA/AP + IP + RSSI), Captive (ON/OFF), Alertas (ON/OFF/MUTED com timer), Modo Teste.
Configurações:

Wi‑Fi (STA/AP), limites min/max, notificações (Telegram/Buzzer/LED), PWM (freq/min/max/soft‑start).
Alertas: toggle (persistente) e Mutar X min (temporário, com contagem regressiva).

Área de Testes:

Valores manuais por variável (temp/hum/rpm/pwm), alternar real/manual, simular erro (DHT/RPM), dry‑run PWM.
Telegram: pré‑visualização (Markdown/HTML), sandbox (simulação), enviar real (STA ativo), throttle e limite de tamanho.

6) Telegram (STA only)
Comandos:

/status
/setpwm 0-100 (respeita pwm_min/max)
/config get|set key=value (inclui limites)
/alerts on|off|status • /alerts mute 5m
/test on|off [timeout=120] • /test set temp=... hum=... rpm=... pwm=...
/test use temp=manual|real ... • /test simulate dht_error=on rpm_error=off
/test sandbox on|off • /test msg "texto..." [format=Markdown|HTML] • /test status

Proteções: Allowlist, token no LittleFS, fila com throttle (p.ex. 1500 ms) e max_msg_len (p.ex. 1000 chars).

7) Sensores & Controle

DHT11: leituras não‑bloqueantes (considerar DHT22/SHT31 no futuro).
RPM: interrupção (GPIO14) + debouncing + janela móvel.
PWM: analogWriteFreq(20000) (~20 kHz), duty 0–1023; respeita pwm_min/max + soft‑start.

(Opc.) PI para manter RPM alvo.

⚠️ Exaustor AC exige TRIAC/SSR com cruzamento por zero (não usar MOSFET).

8) Alertas (robustos)

Global alerts_enabled (persistente) controla Telegram/Buzzer/LED (criticos podem ser permitidos com alerts_allow_critical).
Mute temporário com timer visível na UI.
Rate limiting global (ex.: 1 alerta a cada 30 s).
Agregação (ex.: “Temp + RPM fora de faixa” em uma mensagem).
Disparo por fora de faixa (min/max) e erros de sensor (reais/simulados).

9) LED Wi‑Fi (GPIO16, ativo LOW)

STA conectado: aceso fixo
STA conectando: pisca rápido (~200 ms)
AP ativo sem STA: pisca lento (~800 ms)
Falha STA: duas piscadas a cada ~2 s
(Ticker não‑bloqueante.)

10) Persistência & Resiliência

LittleFS com escrita atômica (config.tmp → rename), fallback em defaults ao detectar corrupção.
OTA “segura”: exige MD5 e faz backup de config.json antes de aplicar.
Watchdog + Safe Mode: bootloops ⇒ desativa Telegram, sobe AP + Captive para recuperação.
mDNS: http://exaustor.local no STA.
NTP: carimbo de tempo em logs/alertas (opcional).

11) Configuração (JSON) — Estrutura consolidada

{
  "config_version": 2,
  "wifi": {
    "sta_ssid": "",
    "sta_pass": "",
    "ap_ssid": "Exaustor-Setup",
    "ap_pass": "SenhaForte123!",
    "ap_channel": 6,
    "close_captive_on_sta": true,
    "sta_fail_window_s": 120,
    "sta_fail_limit": 3
  },
  "network": { "mdns_hostname": "exaustor" },
  "security": {
    "ui_basic_auth": { "enabled": true, "user": "admin", "pass": "admin123" },
    "csrf_enabled": true,
    "min_ap_pass_len": 10
  },
  "telegram": {
    "token_path": "/secrets.json",
    "allowed_chat_ids": [123456789],
    "poll_interval_s": 2,
    "rate_limit_msg_per_min": 10,
    "format_default": "Markdown",
    "enable_tls_validation": false
  },
  "limits": {
    "temp_min": 18, "temp_max": 35,
    "hum_min": 30,  "hum_max": 70,
    "rpm_min": 500, "rpm_max": 2500,
    "pwm_min": 50,  "pwm_max": 255,
    "pwm_freq": 20000
  },
  "alerts": {
    "global_rate_limit_s": 30,
    "aggregate_window_ms": 1500,
    "temp": { "telegram": true, "buzzer": false, "led": true },
    "hum":  { "telegram": false, "buzzer": false, "led": true },
    "rpm":  { "telegram": true,  "buzzer": true,  "led": true },
    "sensor_error": { "telegram": true, "buzzer": true, "led": true }
  },
  "control": {
    "soft_start_ms": 800,
    "pi_control": { "enabled": false, "kp": 0.3, "ki": 0.05 }
  },
  "system": {
    "alerts_enabled": true,
    "alerts_allow_critical": true,
    "alerts_mute_s": 0,
    "safe_mode": { "enabled": true, "boot_fail_limit": 3, "stable_ms": 60000 }
  },
  "pins": { "led_wifi": 16, "btn_alerts": 13, "led_alert": 2 },
  "test": {
    "enabled": false,
    "dry_run": true,
    "timeout_s": 120,
    "notify_prefix": "[TEST]",
    "use_manual": { "temp": false, "hum": false, "rpm": false, "pwm": false },
    "manual_values": { "temp": 25.0, "hum": 55.0, "rpm": 1200, "pwm": 140 },
    "simulate_error": { "dht": false, "rpm": false },
    "restrict_to_ap": true,
    "persist_across_reboot": false,
    "telegram": {
      "sandbox": true,
      "default_chat_id": 123456789,
      "format": "Markdown",
      "max_msg_len": 1000,
      "throttle_ms": 1500
    }
  },
  "ota": { "enabled": true, "require_md5": true, "backup_config_before": true },
  "watchdog": { "enabled": true }
}

12) Endpoints REST / WebSocket
REST

GET  /api/status
GET  /api/net/status → { sta:{connected,ip,rssi}, ap:{active,ip,clients}, captive:{active}, mdns, safeMode }
GET  /api/config • POST /api/config (Basic + CSRF para POST)
POST /api/wifi (valida ap_pass ≥ min_ap_pass_len)
GET  /api/captive
GET  /api/alerts • POST /api/alerts • POST /api/alerts/mute • POST /api/alerts/unmute
Testes: GET/POST /api/test, /api/test/reset, /api/test/buzzer, /api/test/led, /api/test/telegram/preview, /api/test/telegram/send
OTA: POST /api/ota (com md5), upload autenticado

WebSocket (/ws)

Status em tempo real: sensores, origem (sensor/manual), STA/AP, mute countdown, LED Wi‑Fi mode, safe mode, filas, etc.

13) Trechos Essenciais (código)
Fechar Captive ao reconectar STA

onGotIP = WiFi.onStationModeGotIP(&{
  if (config.wifi.close_captive_on_sta) stopCaptive();  // para DNSServer
  MDNS.begin(config.network.mdns_hostname.c_str());
  MDNS.addService("http", "tcp", 80);
  setWifiLedByStatus();
});

Fallback seguro (falhas STA ⇒ força AP)

bool connectSTA(const String& ssid, const String& pass, uint32_t timeoutMs=20000);
struct StaFailWindow { uint32_t startMs=0; uint8_t fails=0; } staFail;

bool shouldForceAP() {
  uint32_t now = millis();
  if (staFail.startMs==0 || now - staFail.startMs > config.wifi.sta_fail_window_s*1000UL){
    staFail.startMs = now; staFail.fails = 0;
  }
  return staFail.fails >= config.wifi.sta_fail_limit;
}

void bootNetwork() {
  bool staOk = (config.wifi.sta_ssid.length()>0) && connectSTA(config.wifi.sta_ssid, config.wifi.sta_pass);
  if (!staOk) staFail.fails++;
  if (!staOk || shouldForceAP()) { WiFi.mode(WIFI_AP_STA); startCaptive(); }
}

Rate limiting + agregação de alertas

uint32_t lastAlertMs=0, aggStartMs=0; String aggMsgs;

bool canAlertNow(){ return millis()-lastAlertMs >= config.alerts.global_rate_limit_s*1000UL; }
void queueAlert(const String& m){ if(!aggMsgs.length()) aggStartMs=millis(); aggMsgs += (aggMsgs.length()?"\n":"") + m; }
void serviceAlerts(){
  if(!aggMsgs.length()) return;
  if(millis()-aggStartMs >= config.alerts.aggregate_window_ms && canAlertNow()){
    notifier_sendAggregated(aggMsgs); lastAlertMs=millis(); aggMsgs=""; aggStartMs=0;
  }
}

UI: Basic + CSRF (para POST)

bool checkBasic(AsyncWebServerRequest* r){ return !cfg.security.ui_basic_auth.enabled || r->authenticate(cfg.security.ui_basic_auth.user.c_str(), cfg.security.ui_basic_auth.pass.c_str()); }
bool checkCsrf(AsyncWebServerRequest* r){ if(!cfg.security.csrf_enabled) return true; auto h=r->getHeader("X-CSRF-Token"); return h && h->value()==csrfToken; }
server.on("/api/config", HTTP_POST, &{
  if(!checkBasic(r)) { r->requestAuthentication(); return; }
  if(!checkCsrf(r))  { r->send(403, "text/plain", "Forbidden"); return; }
  // ... aplicar e salvar
});

Telegram: token no arquivo + allowlist + TLS

String loadToken(){ File f=LittleFS.open("/secrets.json","r"); StaticJsonDocument<256> d; deserializeJson(d,f); f.close(); return (const char*)d["telegram_token"]; }
bool isAllowed(long id){ for(long x: cfg.telegram.allowed_chat_ids) if(x==id) return true; return false; }
BearSSL::WiFiClientSecure client; /* setInsecure() ou carregar CA Root */

Botão: curto=toggle, ≥2s=mute, ≥7s=recovery

void serviceBtn(){
  static bool last=HIGH, pressed=false; static uint32_t t0=0; bool now=digitalRead(PIN_BTN_ALERTS); uint32_t ms=millis();
  if(now!=last && ms-t0>50){ t0=ms; last=now;
    if(now==LOW){ pressed=true; t0=ms; }
    else if(pressed){ pressed=false; uint32_t held=ms-t0;
      if(held>=7000) resetWifiAndAlerts();
      else if(held>=2000) muteAlertsSeconds(300);
      else toggleAlertsPersist(!cfg.system.alerts_enabled);
}}}

LED Wi‑Fi (Ticker)

enum class WifiLedMode{ON,OFF,FAST,SLOW,PAIR}; WifiLedMode mode;
void setWifiLedByStatus(){
  if(WiFi.status()==WL_CONNECTED) mode=WifiLedMode::ON;
  else if(WiFi.getMode() & WIFI_AP) mode=WifiLedMode::SLOW;
  else mode=WifiLedMode::FAST;
}

14) Diagrama (Mermaid) — Arquitetura Atual

flowchart LR
  subgraph Sensores
    DHT[DHT11\nTemp/Umidade]
    RPM[Hall/TACH\nRPM]
  end
  subgraph MCU[ESP8266 NodeMCU 1.0]
    CFG[Config JSON\n(LittleFS, persistente)]
    WIFI[Wi‑Fi AP+STA]
    DNS[DNSServer\n(Captive Portal)]
    HTTP[AsyncWebServer\n(UI/REST/WebSocket)]
    AUTH[Basic Auth + CSRF]
    TEST[Modo Teste\n(manual/dry-run/falhas/timeout)]
    FUS[Fusão valores\n(sensor vs manual)]
    CTRL[Controle PWM\n(soft-start, min/max)]
    TG[Telegram\n(allowlist, token em FS, TLS, fila)]
    NOTIF[Notificações\n(LED/Buzzer/Telegram)\nRate-limit + agregação]
    LEDW[LED Wi‑Fi\n(padrões)]
    BTN[Botão Alertas/Recovery]
    OTA[OTA segura\n(MD5 + backup)]
    WDT[Watchdog + Safe Mode]
    MDNS[mDNS exaustor.local]
    LOG[Logs]
  end
  subgraph Atuadores
    MOSFET[MOSFET + Driver]
    FAN[Exaustor DC]
    BUZ[Buzzer]
    LEDA[LED Alerta]
  end

  DHT --> FUS
  RPM --> FUS
  TEST --> FUS --> CTRL --> MOSFET --> FAN
  NOTIF --> BUZ
  NOTIF --> LEDA
  CFG <--> HTTP
  AUTH --> HTTP
  WIFI --> HTTP
  WIFI --> TG
  WIFI --> DNS
  LEDW --> WIFI
  BTN --> NOTIF
  OTA --> HTTP
  MDNS --> WIFI


  15) PlatformIO (base)


  [env:nodemcuv2]
platform = espressif8266
board = nodemcuv2
framework = arduino
board_build.filesystem = littlefs
build_flags =
  -Os
  -DASYNCWEBSERVER_REGEX
lib_deps =
  ottowinter/ESPAsyncWebServer-esphome @ ^3.1.0
  bblanchon/ArduinoJson @ ^6.21.3
  adafruit/DHT sensor library @ ^1.4.6
  ayushsharma82/AsyncElegantOTA @ ^2.2.7
  https://github.com/witnessmenow/Universal-Arduino-Telegram-Bot.git

  16) Estrutura do Projeto
/src
  main.cpp
  core/
    settings.h        (load/save JSON atômico)
    watchdog.h        (boot counter + safe mode)
    logger.h
  net/
    wifi_manager.h    (STA/AP + captive + eventos + mDNS)
    web_server.h      (REST + WS + Basic + CSRF)
    telegram_bot.h    (fila, sandbox, throttle, allowlist, TLS)
  drivers/
    dht_reader.h
    rpm_reader.h
    pwm_control.h
  features/
    notifier.h        (rate limit + agregação + LED/Buzzer/Telegram)
    test_mode.h       (manual/erros/dry-run/timeout)
    alerts_switch.h   (toggle/mute/recovery + botão + endpoints)
    wifi_led.h        (Ticker e padrões)
/data
  index.html.gz
  app.js.gz
  styles.css.gz
  config.json         (gerado em runtime)
  secrets.json        (colocar token do Telegram)


  17) Checklist de Aceitação

 Captive fecha quando STA reconecta; status STA/AP visível na UI
 Fallback seguro a AP após falhas repetidas do STA
 Auth (Basic + CSRF) funcionando para POST; AP com senha forte
 Telegram protegido (allowlist + token no FS; TLS conforme RAM)
 Alertas: toggle/mute, rate limit global, agregação, contagem regressiva na UI
 Área de Testes completa (manuais, falhas, dry‑run, Telegram preview/sandbox)
 LED Wi‑Fi indica estados (STA/AP/falha)
 OTA com MD5 e backup de config.json
 Safe Mode em bootloops; AP ativo para recuperação
 Persistência robusta (LittleFS, escrita atômica)
