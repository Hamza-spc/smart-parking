<div align="center">

<img width="1632" height="463" alt="parkingo_logo" src="https://github.com/user-attachments/assets/9677fb00-88df-4f03-b7e9-86023682fea5" />


  # SmartParkinGo

  **Smart parking made simple — find, book and manage parking spots in real time.**
</div>

---

## 🚗 About

SmartParkinGo is a multi-platform parking management solution that connects drivers, parking owners, and security guards. The system streamlines spot discovery, reservations, access control, and analytics in one ecosystem.

## Screenshots
<img width="335" height="697" alt="map-mobile" src="https://github.com/user-attachments/assets/9926e123-2f1b-456d-af46-d72e9cf1d848" />

<img width="335" height="697" alt="parkbot" src="https://github.com/user-attachments/assets/718a380c-652c-4352-92a9-4c884da53645" />

<img width="335" height="697" alt="navigation" src="https://github.com/user-attachments/assets/e2a04529-93b8-4b4d-a25e-fd85f48f3693" />


<img width="904" height="440" alt="map-front" src="https://github.com/user-attachments/assets/6f1de8a3-9356-43df-8d96-52365070e260" />


## 📦 Project Structure

| Module | Description | Tech |
|--------|-------------|------|
| `mobile/` | Driver mobile app — find & book parking spots | Flutter |
| `frontend/` | Web dashboard for users and admins | React |
| `Backend/` | Core API and business logic | Spring Boot (Java) |
| `owner-analytics/` | Analytics & video processing for parking owners | Python |
| `guard-alpr/` | Automatic License Plate Recognition for guards | Python / ALPR |

## ✨ Features

- 🅿️ Real-time parking spot availability
- 📍 Map-based search with Mapbox integration
- 📱 Cross-platform mobile app (iOS & Android)
- 📊 Analytics dashboard for parking owners
- 🎥 ALPR-based access control for guards
- 🤖 AI assistance powered by Gemini

## 🚀 Getting Started

Each module has its own setup instructions. To run a component:

```bash
# Mobile app
cd mobile && flutter pub get && flutter run

# Web frontend
cd frontend && npm install && npm run dev

# Backend API (Spring Boot)
cd Backend && ./mvnw spring-boot:run

# Analytics worker
cd owner-analytics && pip install -r requirements.txt && python worker.py
```

## 🔐 Configuration

The mobile app reads secrets from environment variables via `--dart-define`:

```bash
flutter run --dart-define=MAPBOX_TOKEN=pk.xxx --dart-define=GEMINI_API_KEY=xxx
```

## 📄 License

This project is for academic purposes (EMSI - S8).
