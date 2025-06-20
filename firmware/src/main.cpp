#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "ArduinoJson.h"
#include "secrets.h"   // Your WiFi and Supabase secrets here
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

#define PIR_PIN           14  // Motion sensor pin

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
  config.frame_size = FRAMESIZE_QQVGA;   // small image for faster upload
  config.jpeg_quality = 12;              // lower number = higher quality
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }
}

void uploadToSupabase(camera_fb_t* fb) {
  if (!fb) {
    Serial.println("No image data!");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }

  // Format: /images/YYYY/MM/DD/filename.jpg
  char folder[32];
  char fname[32];
  strftime(folder, sizeof(folder), "images/%Y/%m/%d", &timeinfo);
  strftime(fname, sizeof(fname), "%Y-%m-%d_%H-%M-%S.jpg", &timeinfo);

  String fullPath = String(folder) + "/" + String(fname);
  String url = String(SUPABASE_URL) + "/storage/v1/object/" + SUPABASE_BUCKET + "/" + fullPath;

  Serial.printf("Uploading to: %s\n", url.c_str());

  http.begin(client, url);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("apikey", SUPABASE_API_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_API_KEY));

  int httpResponseCode = http.PUT(fb->buf, fb->len);
  if (httpResponseCode > 0) {
    Serial.printf("Upload succeeded. Response: %d\n", httpResponseCode);
  } else {
    Serial.printf("Upload failed. Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("Booting...");

  pinMode(PIR_PIN, INPUT);

  // Only act if woken by motion
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    Serial.println("Motion detected, waking up...");

    // Connect to WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");

    // Set time from NTP
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      Serial.println("Time synchronized");
    } else {
      Serial.println("Failed to sync time");
    }

    // Start camera and capture
    startCamera();
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) {
      uploadToSupabase(fb);
      esp_camera_fb_return(fb);
    } else {
      Serial.println("Camera capture failed");
    }
  } else {
    Serial.println("Not a PIR wakeup");
  }

  // Prepare for next PIR wakeup
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_14, 1);

  delay(100);  // Allow serial to flush
  Serial.println("Going to deep sleep...");
  esp_deep_sleep_start();
}

void loop() {
  // Not used — the ESP goes to sleep after setup
}
