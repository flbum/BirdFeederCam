# BirdFeederCam

A motion-activated wildlife camera built around an **ESP32-CAM**, **PIR motion sensor**, **Supabase**, and a custom **Next.js web application**.

The goal of BirdFeederCam is to create a low-power camera that can sit at a bird feeder, sleep when nothing is happening, automatically wake when motion is detected, capture an image, upload it to the cloud, and make those images available through a web interface.

**Live web app:** https://bird-feeder-cam.vercel.app

---

## Overview

BirdFeederCam combines embedded firmware and a modern web application into one project.

The ESP32-CAM spends most of its time in deep sleep to reduce power consumption. A PIR motion sensor wakes the microcontroller when movement is detected. The ESP32 initializes the camera, captures an image, connects to Wi-Fi, synchronizes its clock using NTP, uploads the image to Supabase Storage, and then returns to deep sleep.

The web application provides authentication and a frontend for accessing the images stored by the camera.

### System Flow

```text
        Motion Detected
              │
              ▼
        PIR Motion Sensor
              │
              ▼
         ESP32-CAM Wakes
              │
              ▼
        Camera Initializes
              │
              ▼
         Capture JPEG
              │
              ▼
         Connect to Wi-Fi
              │
              ▼
        Synchronize Time
              │
              ▼
       Upload to Supabase
              │
              ▼
      Next.js Web Application
              │
              ▼
        Authenticated User
              │
              ▼
        View Captured Images
              │
              ▼
      ESP32 Returns to Sleep
```

---

## Features

### ESP32 Firmware

* AI Thinker ESP32-CAM support
* OV2640 camera capture
* PIR motion detection
* Deep-sleep operation
* GPIO wake-up from motion
* Automatic Wi-Fi connection
* Support for multiple configured Wi-Fi networks
* NTP time synchronization
* Automatic day/night camera adjustments
* JPEG image capture
* Direct upload to Supabase Storage
* Date-based image organization
* Serial debugging output
* PlatformIO-based development environment

### Web Application

* Next.js
* React
* TypeScript
* Supabase integration
* User authentication
* Account signup
* Login
* Password reset
* Protected application routes
* Responsive styling
* Vercel deployment

---

## Hardware

The current firmware targets the **AI Thinker ESP32-CAM**.

The motion sensor is connected to:

```text
GPIO 14
```

GPIO 14 is also configured as the ESP32 deep-sleep wake source.

### Main Components

* AI Thinker ESP32-CAM
* OV2640 camera module
* PIR motion sensor
* Suitable power supply
* USB-to-serial adapter for initial programming

---

## Repository Structure

```text
BirdFeederCam/
├── firmware/
│   ├── include/
│   ├── lib/
│   ├── src/
│   │   └── main.cpp
│   └── platformio.ini
│
├── web/
│   ├── app/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── package.json
└── package-lock.json
```

### `firmware/`

Contains the ESP32-CAM firmware written in C++ using the Arduino framework and PlatformIO.

### `web/`

Contains the Next.js application used to authenticate users and interact with the cloud-hosted image collection.

---

# ESP32 Firmware

## Development Environment

The firmware uses **PlatformIO** with the Arduino framework.

The current PlatformIO configuration targets:

```ini
[env:esp32cam]
platform = espressif32
board = esp32cam
framework = arduino
monitor_speed = 115200
upload_speed = 115200

lib_deps =
    bblanchon/ArduinoJson@^6.21.2

build_flags =
    -DBOARD_HAS_PSRAM
    -mfix-esp32-psram-cache-issue
```

PlatformIO can be used through VS Code or directly from the command line.

---

## Firmware Configuration

Private credentials are intentionally kept outside of source control.

The firmware expects a file named:

```text
firmware/src/secrets.h
```

This file should contain the Wi-Fi networks and Supabase configuration required by the ESP32.

Example:

```cpp
#pragma once

const char* ssidList[] = {
    "WiFiNetwork1",
    "WiFiNetwork2"
};

const char* passwordList[] = {
    "password1",
    "password2"
};

const char* SUPABASE_URL = "https://your-project.supabase.co";
const char* SUPABASE_BUCKET = "your-storage-bucket";
const char* SUPABASE_API_KEY = "your-api-key";
```

`secrets.h` is excluded from Git and should never be committed.

---

## Build the Firmware

From the `firmware` directory:

```bash
cd firmware
pio run
```

---

## Upload the Firmware

Connect the ESP32-CAM using a compatible USB-to-serial adapter and place the board into flashing mode.

Then run:

```bash
pio run --target upload
```

After flashing, open the serial monitor:

```bash
pio device monitor
```

The firmware uses:

```text
115200 baud
```

---

# How the Camera Works

## 1. Deep Sleep

After completing its work, the ESP32 enables a wake-up source on GPIO 14 and enters deep sleep.

```text
ESP32-CAM
    │
    └── Deep Sleep
            │
            └── PIR motion event
                    │
                    ▼
                  Wake
```

This allows the camera to avoid running continuously when nothing is happening.

---

## 2. Motion Detection

The PIR sensor's output is connected to GPIO 14.

When motion causes GPIO 14 to go HIGH, the ESP32 wakes from deep sleep.

The firmware checks that the wake event came from the configured external wake source before beginning the capture process.

---

## 3. Camera Initialization

The firmware initializes the AI Thinker ESP32-CAM using the board's camera pin configuration.

Images are captured as JPEG files.

The current configuration uses:

```text
Resolution: SVGA
Pixel format: JPEG
JPEG quality: 10
```

The camera also captures several temporary frames during startup to allow automatic exposure and white-balance settings to settle before the actual image is captured.

---

## 4. Image Capture

After a motion wake event, the firmware captures an image using the ESP32 camera frame buffer.

If capture succeeds, the JPEG remains in memory while the ESP32 establishes its network connection.

---

## 5. Wi-Fi Connection

The firmware supports a list of configured Wi-Fi networks.

It scans nearby networks and then attempts the configured networks until one successfully connects.

This makes it possible to use the camera in more than one known location without changing firmware every time.

---

## 6. Time Synchronization

Once connected to Wi-Fi, the ESP32 synchronizes its clock using NTP servers.

The timestamp is used both for camera behavior and image organization.

---

## 7. Day and Night Camera Settings

The firmware adjusts several camera parameters based on the current time.

During nighttime hours, increased brightness and sensor gain are used to improve low-light capture.

During daytime hours, the camera returns to its normal capture settings.

---

## 8. Supabase Upload

Captured JPEG files are uploaded directly from the ESP32 to Supabase Storage over HTTPS.

Images are organized using the capture date:

```text
images/
└── YYYY/
    └── MM/
        └── DD/
            └── YYYY-MM-DD_HH-MM-SS.jpg
```

For example:

```text
images/
└── 2026/
    └── 08/
        └── 20/
            └── 2026-08-20_14-32-18.jpg
```

If time synchronization fails, the firmware still has a fallback naming system so an image can be uploaded without a valid timestamp.

---

## 9. Return to Sleep

Once the upload attempt is complete, the ESP32 waits for the PIR output to return LOW.

It then enables GPIO 14 as the next wake source and enters deep sleep again.

The normal Arduino `loop()` function is intentionally unused.

---

# Web Application

The web frontend lives inside:

```text
web/
```

It is built with:

* Next.js 15
* React 19
* TypeScript
* Supabase JavaScript client
* Supabase authentication
* Tailwind CSS
* Vercel

---

## Web Environment Variables

Create:

```text
web/.env.local
```

with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Environment files are excluded from Git and should not be committed.

---

## Install Web Dependencies

```bash
cd web
npm install
```

---

## Run the Web Application Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Production Build

```bash
npm run build
npm start
```

---

# Authentication

The web application uses Supabase authentication.

The application includes routes for:

```text
/login
/signup
/reset-password
```

Authenticated portions of the application are separated into protected routes so users must authenticate before accessing protected content.

---

# Cloud Architecture

```text
┌──────────────────────┐
│      PIR Sensor      │
└──────────┬───────────┘
           │ motion
           ▼
┌──────────────────────┐
│      ESP32-CAM       │
│                      │
│  Camera + Firmware   │
└──────────┬───────────┘
           │
           │ HTTPS
           ▼
┌──────────────────────┐
│       Supabase       │
│                      │
│  Storage + Auth      │
└──────────┬───────────┘
           │
           │ Supabase API
           ▼
┌──────────────────────┐
│       Next.js        │
│   Web Application    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│         User         │
└──────────────────────┘
```

---

# Security

Sensitive credentials are intentionally kept outside of the repository.

The following types of files should never be committed:

```text
.env
.env.local
secrets.h
```

The firmware's Wi-Fi credentials and Supabase upload credentials belong in `secrets.h`.

The web application's Supabase configuration belongs in environment variables.

Before publishing changes, it is also a good idea to scan the repository and its Git history with a secret-detection tool such as Gitleaks.

---

# Project Goals

BirdFeederCam started as an electronics and embedded-programming project, but it has expanded into a full end-to-end system involving:

* Microcontroller firmware
* Camera hardware
* Motion sensing
* Power management
* Wi-Fi networking
* HTTP APIs
* Cloud object storage
* User authentication
* Web development
* Cloud deployment

The project is intended both as a practical wildlife camera and as an ongoing platform for experimenting with embedded systems, IoT, and full-stack development.

---

# Current Status

BirdFeederCam is an active personal project.

The core architecture is implemented:

* ESP32-CAM firmware
* PIR-triggered wake-up
* Image capture
* Wi-Fi connectivity
* Supabase uploads
* Deep-sleep operation
* Web frontend
* User authentication
* Cloud deployment

Future revisions may continue to improve camera reliability, power efficiency, image quality, enclosure design, and the web viewing experience.

---

## License

This repository is a personal hardware and software project. Unless otherwise stated, all original project code and design work is maintained by the repository owner.
