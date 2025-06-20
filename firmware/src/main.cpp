#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "ArduinoJson.h"
#include "secrets.h"   // Your WiFi and Supabase secrets here
#include <time.h>

// Pin definitions for AI Thinker camera module
#define PIR_PIN 14
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
  config.frame_size = FRAMESIZE_QQVGA;  // low res for speed & size
  config.jpeg_quality = 12;              // quality (lower is better compression)
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

  // Get ISO 8601 timestamp for filename
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }
  char timestamp[30];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H-%M-%S", &timeinfo);

  String filename = "images/photo_" + String(timestamp) + ".jpg";
  String url = String(SUPABASE_URL) + "/storage/v1/object/" + SUPABASE_BUCKET + "/" + filename;

  Serial.printf("Uploading to URL: %s\n", url.c_str());

  http.begin(client, url);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("apikey", SUPABASE_API_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_API_KEY));

  int httpResponseCode = http.PUT(fb->buf, fb->len);
  if (httpResponseCode > 0) {
    Serial.printf("Upload response code: %d\n", httpResponseCode);
  } else {
    Serial.printf("Upload failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("Booting...");

  pinMode(PIR_PIN, INPUT);

  // Check if wakeup caused by PIR motion sensor
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    Serial.println("Motion detected, waking up...");

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");

    // Sync time for timestamped filename
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      Serial.println("Time synchronized");
    } else {
      Serial.println("Failed to sync time");
    }

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

  // Setup wakeup on PIR pin
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_14, 1);

  delay(100);  // Allow serial to flush
  Serial.println("Going to deep sleep...");
  esp_deep_sleep_start();
}

void loop() {
  // Nothing here, device sleeps between triggers
}
