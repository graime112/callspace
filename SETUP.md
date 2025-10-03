# 🛠️ Установка и настройка

## 📋 Требования

Для работы приложения нужно установить:
- Node.js 18+ (для сервера)
- ngrok (для публичного доступа)

## 🚀 Установка на macOS

### 1. Установка Node.js

**Вариант 1: Через Homebrew (рекомендуется)**
```bash
# Установка Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Node.js
brew install node

# Проверка
node --version
npm --version
```

**Вариант 2: Официальный установщик**
1. Скачайте с https://nodejs.org/
2. Установите .pkg файл
3. Перезапустите терминал

**Вариант 3: Через nvm (для разработчиков)**
```bash
# Установка nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезапуск терминала или:
source ~/.zshrc

# Установка последней LTS версии Node.js
nvm install --lts
nvm use --lts
```

### 2. Установка ngrok

```bash
# Через Homebrew
brew install ngrok

# Или скачайте с https://ngrok.com/download
```

### 3. Проверка установки

```bash
node --version    # должно показать v18.x.x или выше
npm --version     # должно показать 9.x.x или выше  
ngrok version     # должно показать 3.x.x
```

## 🐧 Установка на Linux (Ubuntu/Debian)

### 1. Node.js
```bash
# Обновление пакетов
sudo apt update

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка
node --version
npm --version
```

### 2. ngrok
```bash
# Скачивание и установка
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin
rm ngrok-stable-linux-amd64.zip

# Проверка
ngrok version
```

## 🪟 Установка на Windows

### 1. Node.js
1. Скачайте установщик с https://nodejs.org/
2. Запустите .msi файл
3. Следуйте инструкциям установщика
4. Перезапустите командную строку

### 2. ngrok
1. Скачайте с https://ngrok.com/download
2. Распакуйте в папку (например, C:\ngrok)
3. Добавьте путь в PATH или используйте полный путь

## 🚀 Первый запуск

### 1. Установка зависимостей
```bash
cd server
npm install
```

### 2. Тестовый запуск
```bash
# Локальный запуск
npm start

# Публичный доступ через ngrok
./test-ngrok.sh
```

### 3. Проверка работы
1. Откройте http://localhost:3000
2. Разрешите доступ к камере/микрофону
3. Введите любой ID комнаты
4. Если видите себя в видео - все работает!

## 🔧 Решение проблем

### "command not found: node"
```bash
# macOS - установите через Homebrew
brew install node

# Linux - используйте NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows - скачайте с nodejs.org
```

### "command not found: npm"
npm устанавливается вместе с Node.js. Если его нет:
```bash
# Переустановите Node.js
brew reinstall node  # macOS
```

### "Permission denied" при установке пакетов
```bash
# Не используйте sudo с npm!
# Настройте npm для глобальных пакетов:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Проблемы с камерой/микрофоном
- Используйте HTTPS (ngrok автоматически предоставляет)
- Проверьте разрешения браузера
- Попробуйте другой браузер (Chrome/Firefox)

### ngrok не запускается
```bash
# Проверьте, что порт свободен
lsof -i :3000
lsof -i :4040

# Убейте процессы, если нужно
pkill -f "node.*server"
pkill -f ngrok
```

## 📱 Тестирование

### Локальное тестирование
1. Откройте 2 вкладки браузера
2. В обеих введите один ID комнаты
3. Должно установиться соединение

### Тестирование через ngrok
1. Запустите `./test-ngrok.sh`
2. Скопируйте HTTPS ссылку
3. Откройте на другом устройстве/компьютере
4. Используйте один ID комнаты

### Мобильное тестирование
1. Получите ngrok ссылку
2. Отправьте себе в мессенджер
3. Откройте на телефоне
4. Разрешите доступ к камере

## 🎯 Готовые команды

```bash
# Полная установка на macOS
brew install node ngrok
cd server && npm install

# Быстрый тест
./test-ngrok.sh

# Проверка всех компонентов
node --version && npm --version && ngrok version

# Очистка (если что-то сломалось)
pkill -f "node.*server" && pkill -f ngrok
rm -rf server/node_modules
cd server && npm install
```

После установки всех компонентов можете запускать приложение! 🎉
