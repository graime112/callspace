# 🚀 Развертывание CallSpace

## Обзор

CallSpace можно развернуть несколькими способами для публичного доступа:

1. **🌐 ngrok** - Быстрый туннель (для тестирования)
2. **☁️ Облачные платформы** - Heroku, Railway, Vercel, Render
3. **🐳 Docker** - Контейнеризация
4. **🖥️ VPS** - Виртуальный сервер

## 🌐 Быстрый старт с ngrok

### 1. Запуск публичного доступа
```bash
./start-public.sh
```

### 2. Получение публичного URL
```bash
./get-public-url.sh
```

### 3. Остановка
```bash
./stop-public.sh
```

## ☁️ Облачные платформы

### Heroku

1. **Установите Heroku CLI**
2. **Создайте приложение:**
   ```bash
   heroku create your-callspace-app
   ```

3. **Настройте переменные окружения:**
   ```bash
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   heroku config:set NODE_ENV=production
   ```

4. **Разверните:**
   ```bash
   git push heroku main
   ```

### Railway

1. **Подключите GitHub репозиторий**
2. **Настройте переменные окружения в панели Railway**
3. **Автоматическое развертывание**

### Vercel

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Разверните:**
   ```bash
   vercel --prod
   ```

### Render

1. **Подключите GitHub репозиторий**
2. **Выберите "Web Service"**
3. **Настройте переменные окружения**

## 🐳 Docker развертывание

### Локальное тестирование
```bash
# Сборка образа
docker build -t callspace .

# Запуск контейнера
docker run -p 3000:3000 callspace

# Или с docker-compose
docker-compose up -d
```

### На VPS с Docker
```bash
# Клонируйте репозиторий
git clone <your-repo>
cd callspace

# Запустите с docker-compose
docker-compose up -d

# Настройте nginx для проксирования
```

## 🖥️ VPS развертывание

### 1. Подготовка сервера
```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PM2 для управления процессами
sudo npm install -g pm2
```

### 2. Развертывание приложения
```bash
# Клонируйте репозиторий
git clone <your-repo>
cd callspace

# Установите зависимости
npm install

# Настройте переменные окружения
cp email-config.example .env
nano .env  # Отредактируйте настройки

# Запустите с PM2
pm2 start server/server.js --name callspace
pm2 save
pm2 startup
```

### 3. Настройка nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL сертификат
```bash
# Установите certbot
sudo apt install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com
```

## 🔧 Настройка переменных окружения

### Обязательные переменные
```env
# Email настройки
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Сервер
PORT=3000
NODE_ENV=production
```

### Опциональные переменные
```env
# Публичный URL (автоматически определяется)
PUBLIC_URL=https://your-domain.com

# CORS настройки
CORS_ORIGIN=*

# Логирование
LOG_LEVEL=info

# TURN серверы для WebRTC
TURN_SERVERS=[{"urls":"turn:your-turn-server.com","username":"user","credential":"pass"}]
```

## 📊 Мониторинг

### PM2 мониторинг
```bash
# Статус процессов
pm2 status

# Логи
pm2 logs callspace

# Мониторинг в реальном времени
pm2 monit

# Перезапуск
pm2 restart callspace
```

### Docker мониторинг
```bash
# Статус контейнеров
docker ps

# Логи
docker logs callspace

# Статистика
docker stats callspace
```

## 🔒 Безопасность

### Рекомендации для продакшена:
1. **Используйте HTTPS** везде
2. **Настройте файрвол** (ufw, iptables)
3. **Регулярно обновляйте** систему
4. **Используйте сильные пароли** для email
5. **Ограничьте CORS** только нужными доменами
6. **Настройте rate limiting**

### Настройка файрвола
```bash
# Разрешить SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Включить файрвол
sudo ufw enable
```

## 🚨 Устранение проблем

### Проблемы с WebRTC
- Убедитесь, что используются правильные STUN/TURN серверы
- Проверьте, что порты не заблокированы
- Настройте TURN сервер для лучшей совместимости

### Проблемы с email
- Проверьте настройки SMTP
- Убедитесь, что App Password правильный
- Проверьте логи сервера

### Проблемы с производительностью
- Используйте PM2 кластер режим
- Настройте nginx кэширование
- Мониторьте использование ресурсов

## 📈 Масштабирование

### Горизонтальное масштабирование
```bash
# PM2 кластер режим
pm2 start server/server.js -i max --name callspace

# Docker Swarm
docker service create --name callspace --replicas 3 -p 3000:3000 callspace
```

### Вертикальное масштабирование
- Увеличьте RAM и CPU на сервере
- Используйте SSD диски
- Настройте swap файл

## 🎯 Рекомендации

### Для тестирования:
- Используйте ngrok или локальный туннель
- Heroku для быстрого развертывания

### Для продакшена:
- VPS с Docker + nginx + SSL
- Railway или Render для простоты
- AWS/GCP для масштабирования

### Для корпоративного использования:
- Kubernetes кластер
- Load balancer
- Мониторинг (Prometheus + Grafana)
- Логирование (ELK Stack)