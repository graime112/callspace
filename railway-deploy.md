# 🚀 One-Click Railway Deployment

## 🎯 Deploy CallSpace to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/graime112/callspace)

## 📋 Manual Deployment Steps

1. **Click the button above** or go to [Railway](https://railway.app)
2. **Connect your GitHub account** (if not already connected)
3. **Select repository:** `graime112/callspace`
4. **Click "Deploy Now"**
5. **Wait for deployment** (2-3 minutes)
6. **Configure environment variables** (see below)

## 🔧 Environment Variables

After deployment, go to **Variables** tab and add:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

## 📧 Gmail Setup

1. Enable 2FA in your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create password for "Mail"
4. Use this password in `EMAIL_PASS`

## 🎉 After Deployment

Your CallSpace will be available at:
- **Main:** `https://your-app-name.railway.app`
- **Messenger:** `https://your-app-name.railway.app/messenger.html`
- **Admin:** `https://your-app-name.railway.app/admin.html`

## ✅ Features Ready

- 📹 Video calling with WebRTC
- 💬 Real-time messaging
- 👥 User management
- 📧 Email invitations
- 🖥️ Screen sharing
- 🔒 Secure HTTPS

## 🛠️ Management

- **Logs:** View in Railway dashboard
- **Variables:** Manage in Variables tab
- **Updates:** Auto-deploy on git push
- **Monitoring:** Built-in Railway metrics

---

**Ready to deploy?** Click the button above! 🚀
