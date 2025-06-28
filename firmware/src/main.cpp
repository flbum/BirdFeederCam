#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "ArduinoJson.h"
#include "secrets.h"
#include <time.h>

// Camera model: AI Thinker
#define CAMERA_MODEL_AI_THINKER

#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define PIR_PIN           14
#define TIMEZONE_OFFSET   -4 * 3600  // Eastern Daylight Time (EDT)

const int NUM_NETWORKS = sizeof(ssidList) / sizeof(ssidList[0]);

void startCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_SVGA;
  config.jpeg_quality = 10;
  config.fb_count     = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();

  // 🛠️ Base camera tuning
  s->set_framesize(s, FRAMESIZE_SVGA);
  s->set_quality(s, 10);
  s->set_brightness(s, 1);
  s->set_contrast(s, 1);
  s->set_saturation(s, 0);
  s->set_whitebal(s, 1);
  s->set_awb_gain(s, 1);
  s->set_gainceiling(s, (gainceiling_t)4);
  s->set_exposure_ctrl(s, 1);
  s->set_aec2(s, 1);
  s->set_ae_level(s, 0);
  s->set_gain_ctrl(s, 1);
  s->set_wb_mode(s, 0);
  s->set_lenc(s, 1);
  s->set_hmirror(s, 0);   // Rotate 90°
  s->set_vflip(s, 0);     // Rotate 90°
}

bool connectToWiFi(int timeoutPerNetwork = 10) {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(1000);

  Serial.println("📡 Scanning for nearby networks...");
  int n = WiFi.scanNetworks();
  for (int i = 0; i < n; ++i) {
    Serial.printf("  • %s (RSSI %d)\n", WiFi.SSID(i).c_str(), WiFi.RSSI(i));
  }

  for (int i = 0; i < NUM_NETWORKS; i++) {
    Serial.printf("🔌 Trying SSID: %s\n", ssidList[i]);
    WiFi.begin(ssidList[i], passwordList[i]);

    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < timeoutPerNetwork * 1000) {
      Serial.print(".");
      delay(500);
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("✅ Connected to WiFi");
      return true;
    } else {
      Serial.println("❌ Failed to connect");
    }
  }

  return false;
}

void uploadToSupabase(camera_fb_t* fb, struct tm* timeinfo) {
  if (!fb) {
    Serial.println("❌ No image data!");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  char folder[32];
  char fname[40];

  if (timeinfo) {
    strftime(folder, sizeof(folder), "images/%Y/%m/%d", timeinfo);
    strftime(fname, sizeof(fname), "%Y-%m-%d_%H-%M-%S.jpg", timeinfo);
  } else {
    strcpy(folder, "images/unknown");
    sprintf(fname, "unknown_%lu.jpg", millis());
  }

  String fullPath = String(folder) + "/" + String(fname);
  String url = String(SUPABASE_URL) + "/storage/v1/object/" + SUPABASE_BUCKET + "/" + fullPath;

  Serial.printf("📤 Uploading to: %s\n", url.c_str());

  http.begin(client, url);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("apikey", SUPABASE_API_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_API_KEY));

  int httpResponseCode = http.PUT(fb->buf, fb->len);
  if (httpResponseCode > 0) {
    Serial.printf("✅ Upload OK: %d\n", httpResponseCode);
  } else {
    Serial.printf("❌ Upload failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void prepareSleep() {
  Serial.println("🔕 Waiting for PIR to go LOW...");
  while (digitalRead(PIR_PIN) == HIGH) {
    delay(100);
  }

  Serial.println("😴 Going to deep sleep. Waiting for next motion...");
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_14, 1);  // PIR rising edge
  delay(100);
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("🔄 Booting...");

  pinMode(PIR_PIN, INPUT);
  startCamera();

  // 🔁 Let camera auto-adjust by grabbing a few dummy frames
  Serial.println("🎞️ Warming up camera...");
  for (int i = 0; i < 5; i++) {
    camera_fb_t* warm = esp_camera_fb_get();
    if (warm) esp_camera_fb_return(warm);
    delay(200);
  }

  camera_fb_t* fb = nullptr;

  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    Serial.println("👀 Motion detected");

    fb = esp_camera_fb_get();
    if (fb) {
      Serial.printf("📸 Captured image (%d bytes)\n", fb->len);
    } else {
      Serial.println("⚠️ Camera capture failed");
    }

    if (connectToWiFi()) {
      configTime(TIMEZONE_OFFSET, 0, "pool.ntp.org", "time.nist.gov");
      struct tm timeinfo;
      if (getLocalTime(&timeinfo)) {
        Serial.println("🕒 Time synced");

        // 🌓 Day/Night adjustments
        sensor_t * s = esp_camera_sensor_get();
        if (timeinfo.tm_hour >= 21 || timeinfo.tm_hour < 6) {
          Serial.println("🌙 Night mode: Adjusting camera settings");
          s->set_brightness(s, 2);
          s->set_gainceiling(s, (gainceiling_t)6);
          s->set_exposure_ctrl(s, 1);
          s->set_aec2(s, 1);
        } else {
          Serial.println("☀️ Day mode: Normal settings");
          s->set_brightness(s, 1);
          s->set_gainceiling(s, (gainceiling_t)4);
          s->set_exposure_ctrl(s, 1);
          s->set_aec2(s, 1);
        }

        uploadToSupabase(fb, &timeinfo);
      } else {
        Serial.println("⚠️ Failed to sync time");
        uploadToSupabase(fb, nullptr);
      }
    } else {
      Serial.println("🚫 Skipping upload (no WiFi)");
    }

    if (fb) {
      esp_camera_fb_return(fb);
    }

  } else {
    Serial.println("🌀 First boot or unknown wake cause");
  }

  prepareSleep();
}

void loop() {
  // Nothing here
}
