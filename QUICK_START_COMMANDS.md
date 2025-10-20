# Quick Start Commands Guide

## 🚀 **Essential Commands for Running Your Template**

### **Initial Setup (First Time Only)**
```bash
# Navigate to your template directory
cd C:\Users\jaypo\Downloads\Template

# Install all dependencies (backend + frontend)
npm run install-all

# Create demo data for demonstrations
npm run reset-demo-data
```

### **Daily Usage - Starting the Application**
```bash
# Navigate to your template directory
cd C:\Users\jaypo\Downloads\Template

# Start the application (both backend and frontend)
npm run dev
```

### **Alternative: Run Backend and Frontend Separately**
```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend client
npm run client
```

## 🔧 **Database Management Commands**

### **Reset Demo Data**
```bash
# Clear database and create fresh demo data
npm run reset-demo-data
```

### **Create Demo Data Only**
```bash
# Add demo data without clearing existing data
npm run create-demo-data
```

### **Admin User Management**
```bash
# Create/reset admin user
npm run create-admin

# Check existing admin users
npm run check-admin

# Delete admin user (if needed)
npm run delete-admin
```

## 📱 **Access Your Application**

### **URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### **Demo Login Credentials**
- **Tenant 1**: `demo@example.com` / `demo123` (Has approved application with generated lease)
- **Tenant 2**: `demo2@example.com` / `demo123` (Has pending application)
- **Admin**: `admin@example.com` / `admin123`

## 🛠️ **Development Commands**

### **Build for Production**
```bash
# Build the frontend for production
npm run build

# Start production server
npm start
```

### **Install Dependencies**
```bash
# Install backend dependencies only
npm install

# Install frontend dependencies only
cd client && npm install

# Install all dependencies (recommended)
npm run install-all
```

## 🚨 **Troubleshooting Commands**

### **Port Issues**
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process using port 5000 (replace PID with actual process ID)
taskkill /PID <process_id> /F
```

### **Database Issues**
```bash
# Reset everything and start fresh
npm run reset-demo-data

# Check admin users
npm run check-admin
```

### **Node Process Issues**
```bash
# Check running Node.js processes
tasklist | findstr node

# Kill all Node.js processes (use with caution)
taskkill /IM node.exe /F
```

## 📋 **Complete Startup Sequence**

### **For Daily Use (Quick Start)**
```bash
cd C:\Users\jaypo\Downloads\Template
npm run dev
```

### **For Fresh Setup**
```bash
cd C:\Users\jaypo\Downloads\Template
npm run install-all
npm run reset-demo-data
npm run dev
```

### **For Production Deployment**
```bash
cd C:\Users\jaypo\Downloads\Template
npm run build
npm start
```

## 🎯 **Demo Preparation Commands**

### **Before Customer Presentation**
```bash
# Ensure clean demo data
npm run reset-demo-data

# Verify admin access
npm run check-admin

# Start the application
npm run dev
```

### **After Presentation (Cleanup)**
```bash
# Reset demo data for next presentation
npm run reset-demo-data
```

## 📁 **File Locations**

### **Important Files**
- **Package.json**: `package.json` (main commands)
- **Environment**: `.env` (configuration)
- **Demo Data Script**: `server/scripts/resetDemoData.js`
- **Admin Script**: `server/scripts/createAdmin.js`

### **Access URLs**
- **Template**: http://localhost:3000
- **API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎪 **Demo Workflow Commands**

### **Complete Demo Setup**
```bash
# 1. Navigate to directory
cd C:\Users\jaypo\Downloads\Template

# 2. Start application
npm run dev

# 3. Wait for "Compiled successfully!" message
# 4. Open browser to http://localhost:3000
# 5. Use demo credentials to login
```

### **Quick Reset Between Demos**
```bash
npm run reset-demo-data
```

### **Lease Demo Features**
- **Auto-Generation**: When admin approves an application, a demo lease is automatically generated
- **Demo Content**: Lease includes demo-specific terms and disclaimers
- **Full Workflow**: Complete tenant journey from application to lease signing
- **No Real Legal Obligations**: All lease content is clearly marked as demo-only

### **Demo Lease Workflow**
1. **Admin Login**: `admin@example.com` / `admin123`
2. **Review Applications**: Go to admin dashboard
3. **Approve Application**: Click "Approve" on any application
4. **Auto-Lease Generation**: System automatically creates demo lease
5. **Tenant Access**: Tenant can view generated lease immediately
6. **Demo Signing**: Complete lease signing process (demo mode)

## 🔑 **Key Points to Remember**

1. **Always navigate to the template directory first**: `cd C:\Users\jaypo\Downloads\Template`
2. **Main command for daily use**: `npm run dev`
3. **Reset demo data when needed**: `npm run reset-demo-data`
4. **Demo credentials are always the same** (see above)
5. **Application runs on**: http://localhost:3000

## 🚀 **One-Line Quick Start**

For the fastest startup, just run:
```bash
cd C:\Users\jaypo\Downloads\Template && npm run dev
```

---

**Your template is ready for professional demonstrations!** 🎉
