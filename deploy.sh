#!/bin/bash

# Скрипт для быстрого развертывания CallSpace

echo "🚀 CallSpace Deployment Script"
echo ""

# Проверяем git
if ! command -v git &> /dev/null; then
    echo "❌ Git is required"
    exit 1
fi

# Показываем опции развертывания
echo "Choose deployment option:"
echo "1. Heroku"
echo "2. Railway"
echo "3. Vercel"
echo "4. Render"
echo "5. Docker (local)"
echo "6. VPS (manual)"
echo ""

read -p "Enter option (1-6): " option

case $option in
    1)
        deploy_heroku
        ;;
    2)
        deploy_railway
        ;;
    3)
        deploy_vercel
        ;;
    4)
        deploy_render
        ;;
    5)
        deploy_docker
        ;;
    6)
        deploy_vps
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

deploy_heroku() {
    echo "🚀 Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not installed"
        echo "💡 Install: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Создаем приложение
    read -p "Enter Heroku app name (or press Enter for auto): " app_name
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create $app_name
    fi
    
    # Настраиваем переменные окружения
    echo "📧 Setting up email configuration..."
    read -p "Enter email address: " email
    read -p "Enter email password/app password: " password
    
    heroku config:set EMAIL_USER=$email
    heroku config:set EMAIL_PASS=$password
    heroku config:set NODE_ENV=production
    
    # Развертываем
    git push heroku main
    
    echo "✅ Deployed to Heroku!"
    echo "🌐 URL: https://$(heroku apps:info --json | jq -r '.app.name').herokuapp.com"
}

deploy_railway() {
    echo "🚀 Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not installed"
        echo "💡 Install: npm install -g @railway/cli"
        exit 1
    fi
    
    railway login
    railway init
    railway up
    
    echo "✅ Deployed to Railway!"
    echo "🌐 Check your Railway dashboard for URL"
}

deploy_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not installed"
        echo "💡 Install: npm install -g vercel"
        exit 1
    fi
    
    vercel --prod
    
    echo "✅ Deployed to Vercel!"
    echo "🌐 Check your Vercel dashboard for URL"
}

deploy_render() {
    echo "🚀 Deploying to Render..."
    
    echo "📝 Manual steps for Render:"
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create a new Web Service"
    echo "4. Set build command: npm install"
    echo "5. Set start command: cd server && node server.js"
    echo "6. Add environment variables:"
    echo "   - EMAIL_USER=your-email@gmail.com"
    echo "   - EMAIL_PASS=your-app-password"
    echo "   - NODE_ENV=production"
    echo "7. Deploy!"
    
    echo "✅ Follow the steps above to deploy to Render!"
}

deploy_docker() {
    echo "🐳 Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not installed"
        exit 1
    fi
    
    # Создаем .env файл если не существует
    if [ ! -f .env ]; then
        cp email-config.example .env
        echo "📝 Please edit .env file with your email settings"
    fi
    
    # Собираем образ
    docker build -t callspace .
    
    # Запускаем контейнер
    docker run -d -p 3000:3000 --name callspace-app callspace
    
    echo "✅ Docker container started!"
    echo "🌐 URL: http://localhost:3000"
    echo "🛑 Stop: docker stop callspace-app"
}

deploy_vps() {
    echo "🖥️ VPS Deployment Instructions..."
    
    echo "📝 Manual steps for VPS:"
    echo "1. Connect to your VPS via SSH"
    echo "2. Install Node.js 18+:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    echo "3. Install PM2:"
    echo "   sudo npm install -g pm2"
    echo "4. Clone repository:"
    echo "   git clone <your-repo-url>"
    echo "   cd callspace"
    echo "5. Install dependencies:"
    echo "   npm install"
    echo "6. Configure email:"
    echo "   cp email-config.example .env"
    echo "   nano .env  # Edit with your settings"
    echo "7. Start with PM2:"
    echo "   pm2 start server/server.js --name callspace"
    echo "   pm2 save"
    echo "   pm2 startup"
    echo "8. Configure nginx (optional):"
    echo "   See DEPLOYMENT.md for nginx config"
    
    echo "✅ Follow the steps above to deploy to VPS!"
}
