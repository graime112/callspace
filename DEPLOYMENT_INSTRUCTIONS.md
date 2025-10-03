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
