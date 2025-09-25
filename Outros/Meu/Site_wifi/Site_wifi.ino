// Site_wifi.ino
// ESP8266 + LittleFS + HTTP :80 + WebSocket :81 (ACKs)
// DHT11 (temp/umid) + tacômetro óptico (RPM) + PWM do cooler 12V (MOSFET)
// UI: campos para duty, pulsesPerRev e limiar de RPM (aba "Ventilação").

#include <Arduino.h>
#include <FS.h>
#include <LittleFS.h>
#define FILESYS LittleFS

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
ESP8266WebServer server(80);

#include <ArduinoJson.h>
#include <WebSocketsServer.h>
WebSocketsServer ws(81);

#include "site.h"   // Fallback HTML mínimo

// --- Sensores ---
#include <DHT.h>
#define PIN_DHT         D2       // GPIO4
#define DHT_TYPE        DHT11
DHT dht(PIN_DHT, DHT_TYPE);

// Tacômetro (receptor óptico)
#define PIN_TACH        D5       // GPIO14 (interrupt)
#define DEBOUNCE_US     2000     // rejeita bounce < 2 ms
#define TACH_WINDOW_MS  1000     // janela de cálculo: 1 s

// PWM (cooler 12V com MOSFET)
#define PIN_PWM         D6       // GPIO12 (PWM)
#define PWM_FREQ_HZ     20000    // 20 kHz para reduzir ruído
#define PWM_RANGE       1023     // resolução do analogWrite

// LED onboard
const int  LED_PIN      = LED_BUILTIN;
const bool LED_INVERTED = true; // NodeMCU: LED ativo em LOW

// Config persistente
static const char* CONFIG_PATH = "/config.json";

// Estrutura de config
struct Cfg {
  // AP
  String ap_ssid   = "EXAUSTOR_AP";
  String ap_pass   = "12345678";

  // STA
  String sta_ssid  = "";
  String sta_pass  = "";
  String sta_site  = "";

  // Notificações
  bool  tempNotif   = false;
  float tempLimite  = 60.0;
  bool  tempBip     = false;
  bool  tempLed     = false;

  bool  fanNotif    = false;
  bool  fanBip      = false;
  bool  fanLed      = false;

  // Fan cfg
  uint8_t  fanPulsesPerRev = 2;     // PULSES_PER_REV (ajuste conforme seu disco/etiquetas)
  uint16_t rpmAlertMin     = 100;   // limiar de RPM para alerta
  uint8_t  fanDuty         = 80;    // 0..100 %

  // LED status
  bool ledOn = false;
} cfg;

// Estado de rede
String currentIP  = "";
String currentSTA = "";

// Tacômetro (ISR)
volatile uint32_t tachPulses = 0;
volatile uint32_t lastPulseUs = 0;
ICACHE_RAM_ATTR void onTach() {
  const uint32_t now = micros();
  if (now - lastPulseUs >= DEBOUNCE_US) {
    tachPulses++;
    lastPulseUs = now;
  }
}

// Estado temporal
unsigned long lastStateMs  = 0;
const unsigned long STATE_PERIOD_MS = 3000;
unsigned long lastTachCalc = 0;
uint16_t lastRPM = 0;

// ---------------------- Helpers ----------------------
void setLed(bool on) {
  cfg.ledOn = on;
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LED_INVERTED ? !on : on);
}

void setFanDuty(uint8_t dutyPct) {
  dutyPct = (dutyPct > 100) ? 100 : dutyPct;
  cfg.fanDuty = dutyPct;
  // (opcional) mínimo de 10% para evitar “cantar” em alguns coolers:
  // if (dutyPct > 0 && dutyPct < 10) dutyPct = 10;
  uint16_t val = map(dutyPct, 0, 100, 0, PWM_RANGE);
  analogWrite(PIN_PWM, val);
}

String ipToStr(IPAddress ip) {
  return String(ip[0]) + "." + String(ip[1]) + "." + String(ip[2]) + "." + String(ip[3]);
}

bool saveConfig() {
  StaticJsonDocument<640> doc;
  doc["ap_ssid"]  = cfg.ap_ssid;
  doc["ap_pass"]  = cfg.ap_pass;
  doc["sta_ssid"] = cfg.sta_ssid;
  doc["sta_pass"] = cfg.sta_pass;
  doc["sta_site"] = cfg.sta_site;

  JsonObject n = doc.createNestedObject("notif");
  n["tempNotif"]  = cfg.tempNotif;
  n["tempLimite"] = cfg.tempLimite;
  n["tempBip"]    = cfg.tempBip;
  n["tempLed"]    = cfg.tempLed;
  n["fanNotif"]   = cfg.fanNotif;
  n["fanBip"]     = cfg.fanBip;
  n["fanLed"]     = cfg.fanLed;

  JsonObject fan = doc.createNestedObject("fan");
  fan["pulsesPerRev"] = cfg.fanPulsesPerRev;
  fan["rpmAlertMin"]  = cfg.rpmAlertMin;
  fan["duty"]         = cfg.fanDuty;

  File f = FILESYS.open(CONFIG_PATH, "w");
  if (!f) return false;
  bool ok = (serializeJson(doc, f) > 0);
  f.close();
  return ok;
}

bool loadConfig() {
  if (!FILESYS.exists(CONFIG_PATH)) return false;
  File f = FILESYS.open(CONFIG_PATH, "r");
  if (!f) return false;
  StaticJsonDocument<640> doc;
  DeserializationError err = deserializeJson(doc, f);
  f.close();
  if (err) return false;

  cfg.ap_ssid   = doc["ap_ssid"]  | cfg.ap_ssid;
  cfg.ap_pass   = doc["ap_pass"]  | cfg.ap_pass;
  cfg.sta_ssid  = doc["sta_ssid"] | cfg.sta_ssid;
  cfg.sta_pass  = doc["sta_pass"] | cfg.sta_pass;
  cfg.sta_site  = doc["sta_site"] | cfg.sta_site;

  JsonObject n = doc["notif"];
  if (!n.isNull()) {
    cfg.tempNotif  = n["tempNotif"]  | cfg.tempNotif;
    cfg.tempLimite = n["tempLimite"] | cfg.tempLimite;
    cfg.tempBip    = n["tempBip"]    | cfg.tempBip;
    cfg.tempLed    = n["tempLed"]    | cfg.tempLed;
    cfg.fanNotif   = n["fanNotif"]   | cfg.fanNotif;
    cfg.fanBip     = n["fanBip"]     | cfg.fanBip;
    cfg.fanLed     = n["fanLed"]     | cfg.fanLed;
  }

  JsonObject fan = doc["fan"];
  if (!fan.isNull()) {
    cfg.fanPulsesPerRev = constrain((int)(fan["pulsesPerRev"] | cfg.fanPulsesPerRev), 1, 12);
    cfg.rpmAlertMin     = constrain((int)(fan["rpmAlertMin"]  | cfg.rpmAlertMin), 0, 20000);
    cfg.fanDuty         = constrain((int)(fan["duty"]         | cfg.fanDuty), 0, 100);
  }
  return true;
}

// ---------------------- Wi‑Fi/mDNS ----------------------
void startAP() {
  WiFi.softAP(cfg.ap_ssid.c_str(), cfg.ap_pass.length()>=8 ? cfg.ap_pass.c_str() : nullptr);
}

bool connectSTA(unsigned long timeoutMs = 15000) {
  if (cfg.sta_ssid.isEmpty() || cfg.sta_pass.isEmpty()) return false;
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(cfg.sta_ssid.c_str(), cfg.sta_pass.c_str());
  const unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && (millis()-t0) < timeoutMs) delay(200);
  if (WiFi.status() == WL_CONNECTED) {
    currentIP  = ipToStr(WiFi.localIP());
    currentSTA = cfg.sta_ssid;
    return true;
  }
  return false;
}

void setupMDNS() {
  if (cfg.sta_site.length()) {
    if (MDNS.begin(cfg.sta_site.c_str())) {
      MDNS.addService("http", "tcp", 80);
      MDNS.addService("ws",   "tcp", 81);
    }
  }
}

// ---------------------- HTTP estático ----------------------
String contentTypeFor(const String& path) {
  if (path.endsWith(".html"))          return "text/html; charset=utf-8";
  if (path.endsWith(".css"))           return "text/css; charset=utf-8";
  if (path.endsWith(".js"))            return "application/javascript";
  if (path.endsWith(".json"))          return "application/json";
  if (path.endsWith(".png"))           return "image/png";
  if (path.endsWith(".svg"))           return "image/svg+xml";
  if (path.endsWith(".webmanifest"))   return "application/manifest+json";
  if (path.endsWith(".txt"))           return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

bool tryServeFile(const String& path) {
  String gz = path + ".gz";
  const bool useGz = FILESYS.exists(gz);
  const String real = useGz ? gz : path;
  if (!FILESYS.exists(real)) return false;

  File f = FILESYS.open(real, "r");
  if (!f) return false;
  String mime = contentTypeFor(path);
  if (useGz) server.sendHeader("Content-Encoding", "gzip");
  server.streamFile(f, mime);
  f.close();
  return true;
}

void setupHttp() {
  server.on("/", HTTP_GET, {
    if (!tryServeFile("/index.html")) {
      server.setContentLength(CONTENT_LENGTH_UNKNOWN);
      server.send(200, "text/html; charset=utf-8", "");
      server.sendContent_P(INDEX_FALLBACK);
      server.sendContent("");
    }
  });

  server.on("/manifest.webmanifest", HTTP_GET, { if (!tryServeFile("/manifest.webmanifest")) server.send(404, "text/plain", "Not found"); });
  server.on("/service-worker.js",   HTTP_GET, { if (!tryServeFile("/service-worker.js"))   server.send(404, "text/plain", "Not found"); });
  server.on("/offline.html",        HTTP_GET, { if (!tryServeFile("/offline.html"))        server.send(404, "text/plain", "Not found"); });
  server.on("/robots.txt",          HTTP_GET, { if (!tryServeFile("/robots.txt"))          server.send(404, "text/plain", "Not found"); });

  server.onNotFound({
    String path = server.uri();
    if (tryServeFile(path)) return;
    if (path.startsWith("/icons/") && tryServeFile(path)) return;
    server.send(404, "text/plain", "Not found");
  });

  server.begin();
}

// ---------------------- WS / ACKs / Estado ----------------------
void sendAck(uint8_t num, const String& of, bool ok, const String& msgId="", const String& message="") {
  StaticJsonDocument<192> doc;
  doc["type"] = "ack";
  doc["of"]   = of;
  doc["ok"]   = ok;
  if (msgId.length()) doc["msgId"] = msgId;
  if (message.length()) doc["message"] = message;
  String out; serializeJson(doc, out);
  ws.sendTXT(num, out);
}

void sampleSensors(float& temp, float& hum) {
  temp = dht.readTemperature();
  hum  = dht.readHumidity();
  if (isnan(temp) || isnan(hum)) {
    delay(50);
    temp = dht.readTemperature();
    hum  = dht.readHumidity();
  }
}

uint16_t calcRPM() {
  const unsigned long now = millis();
  if (now - lastTachCalc < TACH_WINDOW_MS) return lastRPM;

  noInterrupts();
  uint32_t pulses = tachPulses;
  tachPulses = 0;
  interrupts();

  lastTachCalc = now;
  const uint32_t factor = (60000UL / TACH_WINDOW_MS);
  const uint32_t ppr = max<uint32_t>(1, cfg.fanPulsesPerRev);
  const uint32_t rpm = (pulses * factor) / ppr;
  lastRPM = (uint16_t)rpm;
  return lastRPM;
}

void broadcastState() {
  float temp = NAN, hum = NAN;
  sampleSensors(temp, hum);
  const uint16_t rpm = calcRPM();

  String tempAlert = "";
  String fanAlert  = "";
  if (!isnan(temp) && cfg.tempNotif && temp >= cfg.tempLimite) tempAlert = "high";
  if (cfg.fanNotif && rpm < cfg.rpmAlertMin) fanAlert = "stopped";

  StaticJsonDocument<400> doc;
  doc["led"]    = cfg.ledOn;
  if (!isnan(temp)) doc["temp"] = temp;
  if (!isnan(hum))  doc["hum"]  = hum;
  doc["fanRpm"] = rpm;

  // novos campos p/ UI
  doc["fanDuty"]       = cfg.fanDuty;
  doc["pulsesPerRev"]  = cfg.fanPulsesPerRev;
  doc["rpmAlertMin"]   = cfg.rpmAlertMin;

  if (tempAlert.length()) doc["tempAlert"] = tempAlert;
  if (fanAlert.length())  doc["fanAlert"]  = fanAlert;
  if (currentSTA.length()) doc["staSsid"] = currentSTA;
  if (currentIP.length())  doc["ip"]      = currentIP;

  String out; serializeJson(doc, out);
  ws.broadcastTXT(out);
}

void wsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t len) {
  switch (type) {
    case WStype_CONNECTED: {
      IPAddress ip = ws.remoteIP(num);
      Serial.printf("[WS] %u conectado de %s\n", num, ip.toString().c_str());
      broadcastState();
    } break;

    case WStype_DISCONNECTED:
      Serial.printf("[WS] %u desconectado\n", num);
      break;

    case WStype_TEXT: {
      StaticJsonDocument<512> doc;
      DeserializationError err = deserializeJson(doc, payload, len);
      if (err) { Serial.println("[WS] JSON inválido"); break; }

      const String t    = doc["type"]  | "";
      const String msgId= doc["msgId"] | "";

      if (t == "ping") {
        StaticJsonDocument<64> pong; pong["type"] = "pong";
        String out; serializeJson(pong, out); ws.sendTXT(num, out);
      }
      else if (t == "state") {
        float temp = NAN, hum = NAN; sampleSensors(temp, hum);
        const uint16_t rpm = calcRPM();
        StaticJsonDocument<400> s;
        s["led"] = cfg.ledOn;
        if (!isnan(temp)) s["temp"]=temp;
        if (!isnan(hum))  s["hum"]=hum;
        s["fanRpm"]=rpm;
        s["fanDuty"]=cfg.fanDuty;
        s["pulsesPerRev"]=cfg.fanPulsesPerRev;
        s["rpmAlertMin"]=cfg.rpmAlertMin;
        if (currentSTA.length()) s["staSsid"]=currentSTA;
        if (currentIP.length())  s["ip"]=currentIP;
        String out; serializeJson(s, out); ws.sendTXT(num, out);
      }
      else if (t == "led") {
        setLed(!cfg.ledOn);
        sendAck(num, "led", true, msgId, cfg.ledOn ? "LED ligado" : "LED desligado");
        broadcastState();
      }
      else if (t == "ap") {
        const String ssid = doc["ssid"] | "";
        const String pass = doc["pass"] | "";
        if (ssid.length()==0 || (pass.length() && pass.length()<8)) { sendAck(num, "ap", false, msgId, "SSID vazio ou senha <8"); return; }
        cfg.ap_ssid = ssid; cfg.ap_pass = pass; saveConfig();
        WiFi.softAPdisconnect(true); delay(200); startAP();
        sendAck(num, "ap", true, msgId, "AP atualizado");
      }
      else if (t == "sta") {
        const String ssid = doc["ssid"] | "";
        const String pass = doc["pass"] | "";
        const String site = doc["site"] | "";
        if (ssid.length()==0 || (pass.length() && pass.length()<8)) { sendAck(num, "sta", false, msgId, "SSID vazio ou senha <8"); return; }
        cfg.sta_ssid = ssid; cfg.sta_pass = pass; cfg.sta_site = site; saveConfig();
        bool ok = connectSTA(15000);
        if (ok) { setupMDNS(); sendAck(num, "sta", true, msgId, "Conectado em " + cfg.sta_ssid + " (" + currentIP + ")"); broadcastState(); }
        else    { sendAck(num, "sta", false, msgId, "Falha na conexão STA"); }
      }
      else if (t == "notif") {
        cfg.tempNotif  = doc["tempNotif"]  | cfg.tempNotif;
        cfg.tempLimite = doc["tempLimite"] | cfg.tempLimite;
        cfg.tempBip    = doc["tempBip"]    | cfg.tempBip;
        cfg.tempLed    = doc["tempLed"]    | cfg.tempLed;
        cfg.fanNotif   = doc["fanNotif"]   | cfg.fanNotif;
        cfg.fanBip     = doc["fanBip"]     | cfg.fanBip;
        cfg.fanLed     = doc["fanLed"]     | cfg.fanLed;
        saveConfig();
        sendAck(num, "notif", true, msgId, "Notificações salvas");
      }
      else if (t == "fanPwm") {
        int duty = doc["duty"] | cfg.fanDuty;
        duty = constrain(duty, 0, 100);
        setFanDuty(duty);
        saveConfig(); // opcional: persistir duty
        sendAck(num, "fanPwm", true, msgId, String("Duty: ") + duty + "%");
        broadcastState();
      }
      else if (t == "fanCfg") {
        int ppr = doc["pulsesPerRev"] | cfg.fanPulsesPerRev;
        int rmin= doc["rpmAlertMin"]  | cfg.rpmAlertMin;
        ppr  = constrain(ppr, 1, 12);
        rmin = constrain(rmin, 0, 20000);
        cfg.fanPulsesPerRev = ppr;
        cfg.rpmAlertMin     = rmin;
        saveConfig();
        sendAck(num, "fanCfg", true, msgId, "Parâmetros do fan salvos");
        broadcastState();
      }
    } break;

    default: break;
  }
}

// ---------------------- Setup / Loop ----------------------
void setup() {
  Serial.begin(115200);
  delay(100);

  if (!FILESYS.begin()) {
    Serial.println("LittleFS falhou. Usando fallback HTML (site.h).");
  }

  // Pinos e sensores
  setLed(false);
  dht.begin();

  pinMode(PIN_TACH, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_TACH), onTach, FALLING);

  pinMode(PIN_PWM, OUTPUT);
  analogWriteFreq(PWM_FREQ_HZ);
  analogWriteRange(PWM_RANGE);

  // Wi‑Fi
  WiFi.mode(WIFI_AP_STA);
  loadConfig();
  startAP();
  const bool staOk = connectSTA(8000);
  if (staOk) { setupMDNS(); Serial.printf("STA IP: %s\n", currentIP.c_str()); }
  else       { Serial.println("STA não conectou. Mantendo AP."); }

  // Aplica duty inicial do cooler
  setFanDuty(cfg.fanDuty);

  // HTTP / WS
  setupHttp();
  ws.begin();
  ws.onEvent(wsEvent);

  Serial.println("Servidor iniciado: HTTP :80, WS :81");
}

void loop() {
  ws.loop();
  const unsigned long now = millis();
  if (now - lastStateMs >= STATE_PERIOD_MS) {
    lastStateMs = now;
    broadcastState();
  }
}
