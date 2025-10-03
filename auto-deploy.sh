#!/bin/bash

# Автоматический скрипт развертывания CallSpace

echo "🚀 CallSpace Auto-Deployment Script"
echo "=================================="
echo ""

# Проверяем, что мы в git репозитории
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Проверяем, что код загружен на GitHub
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No GitHub remote found. Please set up GitHub repository first."
    exit 1
fi

echo "✅ GitHub repository: $(git remote get-url origin)"
echo ""

# Создаем Railway проект через веб-интерфейс
echo "🌐 Setting up Railway deployment..."
echo ""
echo "📋 Follow these steps to complete deployment:"
echo ""
echo "1️⃣  Open Railway dashboard:"
echo "   https://railway.app"
echo ""
echo "2️⃣  Click 'New Project'"
echo ""
echo "3️⃣  Select 'Deploy from GitHub repo'"
echo ""
echo "4️⃣  Find and select: graime112/callspace"
echo ""
echo "5️⃣  Click 'Deploy Now'"
echo ""
echo "6️⃣  After deployment, go to 'Variables' tab"
echo ""
echo "7️⃣  Add these environment variables:"
echo "   EMAIL_USER=your-email@gmail.com"
echo "   EMAIL_PASS=your-app-password"
echo "   NODE_ENV=production"
echo ""
echo "8️⃣  Your app will be available at:"
echo "   https://your-app-name.railway.app"
echo ""

# Создаем QR код для быстрого доступа
echo "📱 Quick access QR code:"
echo "   Messenger: https://your-app-name.railway.app/messenger.html"
echo "   Admin: https://your-app-name.railway.app/admin.html"
echo ""

# Создаем файл с инструкциями
cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🚀 CallSpace Deployment Instructions

## ✅ GitHub Repository Created
- **URL:** https://github.com/graime112/callspace
- **Status:** Public repository ready for deployment

## 🌐 Railway Deployment Steps

### 1. Open Railway Dashboard
Go to: https://railway.app

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Find and select: **graime112/callspace**
- Click "Deploy Now"

### 3. Configure Environment Variables
After deployment, go to "Variables" tab and add:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 4. Get Your App URL
Your CallSpace will be available at:
- **Main:** https://your-app-name.railway.app
- **Messenger:** https://your-app-name.railway.app/messenger.html
- **Admin Panel:** https://your-app-name.railway.app/admin.html

## 📧 Email Setup (Required)

### Gmail Configuration:
1. Enable 2FA in your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Create App Password for "Mail"
4. Use this password in `EMAIL_PASS` variable

## 🎯 After Deployment

1. **Test the app** - Open your Railway URL
2. **Check admin panel** - Test user management
3. **Test email invites** - Send test invitation
4. **Test video calls** - Try WebRTC functionality

## 🔧 Management

### Railway CLI (if installed):
```bash
railway status      # Check status
railway logs        # View logs
railway variables   # Manage variables
railway domain      # Get URL
```

### GitHub Updates:
```bash
git add .
git commit -m "Update CallSpace"
git push origin main
# Railway will auto-deploy
```

## 🎉 Ready to Use!

Your CallSpace platform is now ready for public use!
EOF

echo "📄 Created DEPLOYMENT_INSTRUCTIONS.md with detailed steps"
echo ""
echo "🎯 Next steps:"
echo "   1. Open https://railway.app"
echo "   2. Deploy from GitHub: graime112/callspace"
echo "   3. Configure environment variables"
echo "   4. Test your deployment!"
echo ""
echo "✅ CallSpace is ready for deployment! 🚀"
