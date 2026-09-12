# 🏥 NexCure — AI Health Companion & Medical Triage Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Powered%20by-Groq%20Cloud-f55036)](https://groq.com/)
[![Database](https://img.shields.io/badge/Database-H2%20%2F%20MySQL-yellow)](https://www.h2database.com/)

**NexCure** is an intelligent, full-stack medical triage and healthcare assistance platform powered by **Emma**, an empathetic conversational AI companion. NexCure combines LLM-driven symptom assessment with an integrated database of verified medical specialists, offering personalized health guidance, over-the-counter (OTC) recommendations, home remedies, and doctor matching.

---

## ✨ Features

### 🩺 Intelligent Symptom Triage & Analysis
- **Emma AI Companion**: Warm, conversational assistant fluent in **English**, **Hindi**, and **Hinglish**.
- **Context-Aware Follow-Ups**: Asks focused, relevant clinical follow-up questions to assess symptom severity.
- **Emergency Red-Flag Detection**: Identifies critical symptoms (e.g., severe chest pain, shortness of breath, sudden neurological deficits) and advises immediate emergency care.

### 👨‍⚕️ Verified Doctor Recommendation Engine
- **Pre-Seeded Multi-Specialty Database**: Built-in directory of verified doctors covering Cardiology, Dermatology, Neurology, Orthopedics, Gastroenterology, Pulmonology, ENT, Psychiatry, and General Medicine.
- **Dynamic Symptom-Based Matching**: Algorithmic scoring matches reported symptoms to doctor specialties, sub-specialties, and treated conditions.
- **Detailed Clinical Profiles**: Injects doctor contact details, hospital locations, consultation fees, and visiting hours directly into AI triage responses.

### 💊 Over-The-Counter (OTC) & Home Remedy Guidance
- Suggests safe, non-prescription remedies and general symptom relief tips for minor conditions.
- Structured medical card formatting for easy readability.

### 💬 Modern, ChatGPT-Inspired User Interface
- **Persistent Sessions**: Chat history stored locally with multi-session management (create, switch, delete).
- **Model Switcher**: Support for multiple model tiers (`emma v3.4`, `emma v3.5`, `emma Pro`).
- **Rich Message Formatting**: Interactive visual cards for doctors, medications, home remedies, and warnings.
- **Quick Actions**: Copy to clipboard, regenerate response, and thumbs up/down feedback.
- **Starter Prompts**: Pre-configured prompt cards for instant symptom triage.

### 🛡️ Safety & Usage Management
- **Token & Prompt Quotas**: Built-in rate limiting and quota tracking per user (`AiUsage` entity).
- **Non-Diagnostic Guardrails**: Adheres to strict medical safety boundaries without hallucinating diagnoses or medications.

---

## 🏛️ Architecture Overview

```
chatbor-demo/
├── backend/                       # Spring Boot 3.2.5 (Java 21)
│   ├── pom.xml                    # Maven dependencies & build setup
│   └── src/main/java/com/chatbot/backend/
│       ├── config/                # WebMvc & CORS configuration
│       ├── controller/            # REST API endpoints (Chat, Doctors)
│       ├── dto/                   # Request/Response data transfer objects
│       ├── entity/                # JPA Entities (Doctor, AiUsage)
│       ├── exception/             # Global error handling & custom exceptions
│       ├── repository/            # Spring Data JPA repositories
│       ├── service/               # Core business logic & Groq LLM integration
│       └── util/                  # Helper utilities and constants
│
└── frontend/                      # React 19 + TypeScript + Vite 8
    ├── package.json               # Frontend dependencies & scripts
    ├── vite.config.ts             # Vite build configuration
    └── src/
        ├── api/                   # API client for backend communication
        ├── components/            # UI components (Header, Sidebar, ChatWindow, etc.)
        ├── layouts/               # Main layout wrappers
        ├── pages/                 # Chat page view
        ├── services/              # Chat service abstraction
        ├── store/                 # Zustand state management (chat sessions, active chat)
        ├── styles/                # Tailwind v4 globals
        └── types/                 # TypeScript interfaces and types
```

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Linter**: [Oxlint](https://oxc.rs/)

### Backend
- **Framework**: [Spring Boot 3.2.5](https://spring.io/projects/spring-boot)
- **Language**: [Java 21](https://www.oracle.com/java/)
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: H2 In-Memory Database (development/testing) with MySQL connector support
- **HTTP Client**: Spring 6 `RestClient`
- **Boilerplate Reduction**: Project Lombok

### AI Engine
- **Provider**: [Groq Cloud API](https://groq.com/)
- **Default Models**: `openai/gpt-oss-120b` (Paid / Pro), `openai/gpt-oss-20b` (Free tier)

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Java Development Kit (JDK) 21** or higher
- **Node.js** (v18.0.0 or higher) and **npm**
- **Git**

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Configure your Groq API Key in `src/main/resources/application.properties`:
   ```properties
   # Server Port
   server.port=8080

   # Groq API Configuration
   groq.api.key=YOUR_GROQ_API_KEY
   groq.api.url=https://api.groq.com/openai/v1/chat/completions
   groq.model=openai/gpt-oss-120b
   groq.model.free=openai/gpt-oss-20b
   groq.model.paid=openai/gpt-oss-120b

   # H2 Database
   spring.datasource.url=jdbc:h2:mem:nexcuredb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
   spring.h2.console.enabled=true
   spring.h2.console.path=/h2-console
   ```

3. Build and start the backend service:
   ```bash
   # On macOS / Linux:
   ./mvnw spring-boot:run

   # On Windows:
   mvnw.cmd spring-boot:run
   ```

4. The backend server will be running at **`http://localhost:8080`**.
   - **H2 Web Console**: Access `http://localhost:8080/h2-console`
     - JDBC URL: `jdbc:h2:mem:nexcuredb`
     - Username: `sa`
     - Password: *(leave blank)*

---

### 2. Frontend Setup

1. Open a new terminal tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the displayed local address (typically **`http://localhost:5173`**).

---

## 📡 API Reference

### 1. Chat & Triage API

#### Send Message
- **Endpoint**: `POST /api/chat/message`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "message": "I've had a severe throbbing headache on one side of my head and nausea since yesterday.",
  "conversationId": "optional-uuid-string"
}
```

**Response (`200 OK`):**
```json
{
  "response": "It sounds like you may be experiencing symptoms consistent with a migraine...",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "tokensUsed": 0
}
```

---

### 2. Doctor Directory API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/doctors` | Retrieve all verified doctors in the database |
| `GET` | `/api/doctors/{id}` | Fetch detailed profile of a doctor by ID |
| `GET` | `/api/doctors/specialty/{specialty}` | Filter doctors by medical specialty (e.g., `Cardiologist`, `Dermatologist`) |
| `GET` | `/api/doctors/search?query={query}` | Search doctors by name, specialty, or condition |
| `GET` | `/api/doctors/recommend?symptoms={symptoms}` | Get top doctor recommendations based on symptom keywords |

#### Example: Recommend Doctors for Symptoms
```bash
curl -X GET "http://localhost:8080/api/doctors/recommend?symptoms=fever%20and%20body%20ache"
```

**Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "Dr. Sarah Jenkins",
    "specialty": "General Physician",
    "subSpecialty": "Internal Medicine",
    "experienceYears": 14,
    "hospitalLocation": "Nexcure Care Clinic, Central Wing",
    "contactNumber": "+1-800-555-0101",
    "email": "dr.jenkins@nexcure.org",
    "rating": 4.9,
    "consultationFee": "$60",
    "availableDays": "Mon-Fri (8:00 AM - 4:00 PM)",
    "symptomsHandled": ["fever", "cough", "fatigue", "flu", "headache", "cold", "general body pain", "infection"]
  }
]
```

---

## ⚙️ Configuration & Environment Variables

| Property | Default Value | Description |
|---|---|---|
| `server.port` | `8080` | Port where the Spring Boot backend runs |
| `groq.api.key` | `—` | API Key for authenticating with Groq Cloud |
| `groq.api.url` | `https://api.groq.com/openai/v1/chat/completions` | Groq chat completion API endpoint |
| `groq.model.free` | `openai/gpt-oss-20b` | AI model used for standard/free tier requests |
| `groq.model.paid` | `openai/gpt-oss-120b` | High-accuracy AI model used for Pro/paid requests |
| `spring.datasource.url` | `jdbc:h2:mem:nexcuredb` | Database connection URL (H2 in-memory by default) |
| `spring.jpa.hibernate.ddl-auto` | `update` | Hibernate DDL schema automation |

---

## 🔒 Safety & Medical Disclaimer

> [!CAUTION]
> **NexCure and Emma AI are designed strictly for informational and triage assistance purposes and do NOT provide medical diagnosis or replace professional medical advice, diagnosis, or treatment.**
> 
> - If you are experiencing a life-threatening medical emergency (such as severe chest pain, sudden numbness, difficulty breathing, or severe trauma), **please immediately call your local emergency services (e.g., 911 / 112) or visit the nearest hospital emergency room.**
> - Always consult a qualified healthcare provider for any medical condition or before starting any medication.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
