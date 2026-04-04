# 🚀 OmniKavach Project Startup Guide

## 📋 Prerequisites

### **System Requirements**
- **Python**: 3.8 or higher (recommended 3.9+)
- **Node.js**: 16.0 or higher (recommended 18.0+)
- **npm**: 8.0 or higher (comes with Node.js)
- **Git**: For version control

### **API Keys Required**
- **Groq API Key**: For AI model access (llama-3.3-70b-versatile)
  - Get yours at: https://console.groq.com/keys
  - Free tier available for development

---

## 🛠️ Backend Setup

### **1. Navigate to Backend Directory**
```bash
cd Backend
```

### **2. Create Virtual Environment**
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

### **3. Install Dependencies**
```bash
# Install required packages
pip install -r requirements.txt

# If requirements.txt doesn't exist, install core dependencies:
pip install fastapi uvicorn pydantic groq numpy pandas chromadb langchain
```

### **4. Set Environment Variables**
```bash
# Create .env file from example
copy .env.example .env

# Edit .env file and add your Groq API key:
GROQ_API_KEY=your_groq_api_key_here
MIMIC_DATA_DIR=./mimic-iii
```

### **5. Start Backend Server**
```bash
# Start FastAPI server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** http://localhost:8000
**API Documentation:** http://localhost:8000/docs

---

## 🎨 Frontend Setup

### **1. Navigate to Frontend Directory**
```bash
cd frontend
```

### **2. Install Dependencies**
```bash
# Install npm packages
npm install
```

### **3. Start Development Server**
```bash
# Start Vite development server
npm run dev
```

**Frontend will be available at:** http://localhost:5173

---

## 🧪 Verify Installation

### **1. Check Backend Health**
```bash
# Test backend health endpoint
curl http://localhost:8000/health
```
Expected response: `{"status":"online"}`

### **2. Test API Endpoints**
```bash
# Test patients endpoint
curl http://localhost:8000/api/v1/patients
```

### **3. Check Frontend**
Open http://localhost:5173 in your browser - you should see the OmniKavach ICU dashboard.

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **Backend Issues**

**Issue:** `ModuleNotFoundError: No module named 'groq'`
```bash
# Solution: Install missing dependencies
pip install groq
```

**Issue:** `GROQ_API_KEY not found`
```bash
# Solution: Set environment variable
set GROQ_API_KEY=your_key_here  # Windows
export GROQ_API_KEY=your_key_here  # macOS/Linux
```

**Issue:** Port 8000 already in use
```bash
# Solution: Use different port
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

#### **Frontend Issues**

**Issue:** `npm install fails`
```bash
# Solution: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Port 5173 already in use
```bash
# Solution: Use different port (Vite will auto-assign)
npm run dev -- --port 5174
```

**Issue:** CORS errors in browser
```bash
# Solution: Ensure backend is running and CORS is configured
# Check that backend shows "CORS enabled for: http://localhost:5173"
```

#### **Data Issues**

**Issue:** MIMIC-III data not found
```bash
# Solution: Ensure mimic-iii directory exists in Backend/
# The system will create mock data if real data is missing
```

**Issue:** RAG system not initializing
```bash
# Solution: Check sepsis_guidelines.txt exists in Backend/
# The system will create basic guidelines if missing
```

---

## 🚀 Quick Start Commands

### **One-Command Startup (Windows)**
```powershell
# Terminal 1 - Backend
cd Backend; python -m venv venv; venv\Scripts\activate; pip install -r requirements.txt; $env:GROQ_API_KEY="your_key_here"; uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend  
cd frontend; npm install; npm run dev
```

### **One-Command Startup (macOS/Linux)**
```bash
# Terminal 1 - Backend
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY="your_key_here"
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## 🎯 Testing the Features

### **1. Basic Functionality**
1. Navigate to http://localhost:5173
2. View patient list on dashboard
3. Click on any patient to see details
4. Run AI analysis (requires Groq API key)

### **2. Twist 1 - Family Communication**
1. Run AI analysis on a patient
2. Switch to "Family Communication" tab
3. View bilingual (English/Hindi) family summary
4. Toggle between languages using the language switcher

### **3. Twist 2 - Outlier Detection**
1. The system automatically detects lab value anomalies
2. Look for red/amber alert banners for critical outliers
3. System will flag "PROBABLE MISLABELED RESULT" for contradictions
4. Click "Request Lab Redraw" when outlier is detected

### **4. API Testing**
```bash
# Test health check
curl http://localhost:8000/health

# Test patient analysis
curl -X POST "http://localhost:8000/api/v1/patients/10006/analyze" \
  -H "Content-Type: application/json" \
  -d '{"patientId": 10006, "includeTimeline": true, "includeRAG": true}'
```

---

## 📁 Project Structure

```
OmniKavach/
├── Backend/                    # FastAPI Python backend
│   ├── app/                   # Core application modules
│   │   ├── agents.py         # Multi-agent AI system
│   │   ├── family_agent.py   # Family Communication Agent (Twist 1)
│   │   ├── tools.py          # Enhanced outlier detection (Twist 2)
│   │   ├── rag.py            # RAG system with ChromaDB
│   │   ├── engine.py         # Main orchestration engine
│   │   └── schemas.py        # Pydantic data models
│   ├── main.py               # FastAPI application entry
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/                  # React Vite frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── FamilyCommunication.jsx  # Twist 1 component
│   │   │   ├── OutlierAlert.jsx         # Twist 2 component
│   │   │   ├── RiskReport.jsx
│   │   │   └── PatientTimeline.jsx
│   │   ├── pages/            # React pages
│   │   │   └── PatientDetail.jsx
│   │   └── services/         # API services
│   ├── package.json          # Node.js dependencies
│   └── vite.config.js        # Vite configuration
└── README.md                 # This file
```

---

## 🎨 Features Implemented

### **Core Features**
- ✅ Multi-agent AI pipeline (Parser → Tracker → Chief)
- ✅ RAG system with medical guidelines
- ✅ Real-time patient monitoring
- ✅ MIMIC-III dataset integration
- ✅ Professional medical UI

### **Hackathon Twist 1 - Family Communication**
- ✅ Compassionate bilingual summaries (English/Hindi)
- ✅ 8th-grade reading level explanations
- ✅ Dedicated Family Communication tab
- ✅ Language toggle functionality
- ✅ Medical disclaimers and safety warnings

### **Hackathon Twist 2 - Enhanced Outlier Detection**
- ✅ Temporal variance analysis (3-day baseline)
- ✅ Critical outlier flagging for lab errors
- ✅ "PROBABLE MISLABELED RESULT" detection
- ✅ Visual alert banners for outliers
- ✅ Lab redraw request functionality
- ✅ Status "WAITING FOR REDRAW" when needed

---

## 🏃‍♂️ Ready to Go!

Once both servers are running:
1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:8000
3. **API Docs**: http://localhost:8000/docs

The system is now ready for the Ignisia 24-Hour AI Hackathon! 🎉

---

## 🆘 Need Help?

If you encounter any issues:
1. Check both servers are running
2. Verify GROQ_API_KEY is set in Backend/.env
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Refer to the troubleshooting section above

**Good luck with the hackathon!** 🚀
