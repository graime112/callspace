#!/bin/bash

# Скрипт для настройки Railway развертывания CallSpace

echo "🚀 Setting up CallSpace for Railway deployment..."

# Проверяем, что мы в git репозитории
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Проверяем Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Logging into Railway..."
railway login

echo "🚀 Creating Railway project..."
railway init

echo "📝 Setting up environment variables..."
echo "Please enter your email configuration:"
read -p "Email address: " email
read -p "Email password/app password: " password

echo "🔧 Setting environment variables..."
railway variables set EMAIL_USER="$email"
railway variables set EMAIL_PASS="$password"
railway variables set NODE_ENV="production"

echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ CallSpace deployed to Railway!"
echo ""
echo "🌐 Your app will be available at:"
railway domain
echo ""
echo "📱 Access your app:"
echo "   💬 Messenger: $(railway domain)/messenger.html"
echo "   👥 Admin Panel: $(railway domain)/admin.html"
echo "   🏠 Home: $(railway domain)/"
echo ""
echo "🔧 To manage your deployment:"
echo "   railway status    - Check status"
echo "   railway logs      - View logs"
echo "   railway variables - Manage environment variables"
echo ""
echo "🎉 CallSpace is now live and ready to use!"
