# AuroraMind AI - Installation & Setup Guide

## 🚀 Quick Start

Your AuroraMind AI platform is now complete with a beautiful frontend and fully functional backend!

### Prerequisites
- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation Steps

#### 1. Install Dependencies
Open terminal/PowerShell in your project directory and run:
```bash
npm install
```

#### 2. Start the Backend Server
```bash
npm start
```

You should see:
```
🌌 AuroraMind Server running at http://localhost:3000
```

#### 3. Open in Browser
Visit: `http://localhost:3000`

---

## 🎯 Demo Account

**Email:** demo@auroramind.ai  
**Password:** Demo@123

---

## 📋 Features Included

### Frontend Features
✨ **Beautiful UI** - Modern glassmorphism design with aurora animations  
🔐 **Authentication** - Login/Register modal with demo account  
📊 **Dashboard** - Real-time stats and insights display  
💫 **Predictions** - AI prediction engine with confidence scores  
📈 **Analytics** - Insights tracking and performance metrics  
🎨 **Responsive** - Works on desktop, tablet, and mobile  

### Backend Features
🔑 **User Authentication** - JWT-based login/registration  
💾 **Database** - SQLite in-memory for demos  
🌐 **REST API** - Full API endpoints for all operations  
🔒 **Security** - Password hashing with bcryptjs  
📡 **Real-time** - Live dashboard updates  
⚙️ **Scalable** - Ready for production upgrades  

---

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - User login

### Insights
- `GET /api/insights` - Get user insights
- `POST /api/insights` - Create new insight

### Predictions
- `GET /api/predictions` - Get user predictions
- `POST /api/predict` - Generate prediction

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

---

## 🛠️ Development

### Available Commands
```bash
npm start        # Start server (production)
npm run dev      # Start server with watch mode
```

### Project Structure
```
AURORAMIND AI/
├── server.js          # Express backend
├── app.js             # Frontend app logic
├── index.html         # Main page
├── style.css          # Complete styling
├── package.json       # Dependencies
└── javascript (file)  # Placeholder
```

---

## 🚀 Deployment

### To Production:
1. Replace SQLite with PostgreSQL/MongoDB
2. Set environment variables for JWT_SECRET
3. Deploy to Heroku, Railway, or Vercel
4. Add proper error handling and logging

---

## 📱 Usage Guide

### For New Users
1. Click "Request Early Access" or "Sign Up"
2. Register with email and password
3. Log in with credentials
4. Welcome to your dashboard!

### Dashboard
- **Stats Cards** - View key metrics
- **Insights Section** - Browse AI insights
- **Prediction Engine** - Submit data for predictions
- **Refresh Button** - Update all data in real-time

---

## 🎨 Customization

### Change Colors
Edit CSS variables in `style.css`:
```css
:root {
  --primary: #6dfcff;    /* Cyan */
  --secondary: #7a5cff;  /* Purple */
  --accent: #ff6ecf;     /* Pink */
}
```

### Add More Features
1. Add new API endpoints in `server.js`
2. Add UI components in `index.html`
3. Add styles in `style.css`
4. Connect frontend in `app.js`

---

## 🔐 Security Notes

⚠️ This is a demo. For production:
- Use proper environment variables
- Implement rate limiting
- Add input validation
- Use HTTPS
- Implement proper CORS
- Add database backups
- Add error logging

---

## 🎉 You're All Set!

Your AuroraMind AI platform is ready to use. Enjoy exploring the beautiful interface and powerful backend! 

Questions? Check the console for any errors or reach out for support.

**Made with ✨ by AuroraMind AI Team**
