# Veo Animator SaaS

A comprehensive SaaS platform for generating cinematic AI videos from static images using Google's **Veo** model (Gemini 2.5/3.0 ecosystem). 

This project demonstrates a full-stack capable frontend including an Admin Dashboard, User Management, Billing limits, and RBAC (Role-Based Access Control).

![Veo Animator Screenshot](https://via.placeholder.com/800x450.png?text=Veo+Animator+SaaS)

## ✨ Features

### 🎥 AI Video Generation (Veo Studio)
- **Image-to-Video**: Upload static images and bring them to life.
- **High Definition**: Support for **720p** and **1080p** resolutions.
- **Aspect Ratios**: Generate in Landscape (16:9) or Portrait (9:16).
- **Prompting**: Add text prompts to guide the animation style.

### 🛠️ SaaS Admin Panel
- **Dashboard**: Real-time overview of users, revenue, and generation usage.
- **Analytics**: Visual charts showing user growth and platform activity.
- **User Management**: 
  - View all registered users.
  - Manually set credit limits.
  - Suspend/Activate user accounts.
- **Billing System**: 
  - Manage mock payment gateways (Stripe/PayPal).
  - Configure subscription plans (Free, Pro, Enterprise).
- **Settings**: 
  - Upload Custom Logo & Favicon.
  - Configure Global API Keys for sponsored usage.

### 🔐 Security & Access
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admin, Editor, Viewer, and Standard Users.
- **API Key Management**: Securely input and toggle Google GenAI keys in the admin panel.

## 🚀 Getting Started

### Prerequisites
- A Google Cloud Project with access to the **Veo** model (VideoFX).
- A Google Gemini API Key.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/veo-animator.git
   cd veo-animator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## 🌍 Deployment (Vercel)

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and "Import Project".
3. **Important**: Add your Environment Variable:
   - `API_KEY`: Your Google Gemini API Key.
4. Click **Deploy**.

## ⚙️ Configuration

You can configure the application directly from the **Admin Panel > Settings** page after logging in as an admin.

- **App Name**: Change the platform name.
- **Branding**: Upload your own logo and favicon.
- **API Keys**: Set the backend API keys if you don't want to use the Environment Variable.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Model**: Google GenAI SDK (@google/genai), Veo Model
- **State Management**: LocalStorage (Mock Backend Service)
- **Build Tool**: Vite

## 📄 License

MIT License.
