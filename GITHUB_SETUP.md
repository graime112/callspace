# 📚 Настройка GitHub для CallSpace

## 🚀 Пошаговая инструкция

### 1. Создайте репозиторий на GitHub

1. **Перейдите на https://github.com**
2. **Нажмите "New repository"**
3. **Заполните поля:**
   - Repository name: `callspace`
   - Description: `Modern video calling platform with WebRTC`
   - Visibility: **Public** (Railway лучше работает с публичными репозиториями)
   - **НЕ** добавляйте README, .gitignore или лицензию (у нас уже есть)
4. **Нажмите "Create repository"**

### 2. Подключите локальный репозиторий к GitHub

После создания репозитория, GitHub покажет команды. Выполните их:

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/callspace.git
git branch -M main
git push -u origin main
```

### 3. Разверните на Railway

#### Способ 1: Автоматический скрипт
```bash
./setup-railway.sh
```

#### Способ 2: Вручную
```bash
# Установите Railway CLI (если не установлен)
npm install -g @railway/cli

# Войдите в Railway
railway login

# Создайте проект
railway init

# Настройте переменные окружения
railway variables set EMAIL_USER="your-email@gmail.com"
railway variables set EMAIL_PASS="your-app-password"
railway variables set NODE_ENV="production"

# Разверните
railway up
```

### 4. Настройте переменные окружения

В Railway dashboard добавьте:
- `EMAIL_USER` - ваш Gmail адрес
- `EMAIL_PASS` - пароль приложения Gmail
- `NODE_ENV` - production

## 🔧 Настройка Gmail

### Получение App Password:

1. **Включите двухфакторную аутентификацию** в Google аккаунте
2. **Перейдите на https://myaccount.google.com/apppasswords**
3. **Создайте пароль приложения:**
   - Выберите "Mail"
   - Введите название: "CallSpace"
   - Скопируйте 16-символьный пароль
4. **Используйте этот пароль** в `EMAIL_PASS`

## 🎯 После развертывания

CallSpace будет доступен по URL вида:
- `https://your-app-name.railway.app`
- `https://your-app-name.railway.app/messenger.html`
- `https://your-app-name.railway.app/admin.html`

## 📱 Тестирование

1. **Откройте мессенджер** и зарегистрируйтесь
2. **Откройте админ-панель** и пригласите пользователя
3. **Проверьте, что email отправляется**
4. **Протестируйте видео звонки**

## 🔄 Обновление

После изменений в коде:
```bash
git add .
git commit -m "Update CallSpace"
git push origin main
# Railway автоматически переразвернет приложение
```

## 🛠️ Управление

### Railway CLI команды:
```bash
railway status      # Статус приложения
railway logs        # Просмотр логов
railway variables   # Управление переменными
railway domain      # Получить URL
```

### GitHub команды:
```bash
git status          # Статус изменений
git add .           # Добавить изменения
git commit -m "..."  # Создать коммит
git push origin main # Отправить на GitHub
```

## 🚨 Устранение проблем

### Проблемы с GitHub:
- Убедитесь, что репозиторий публичный
- Проверьте, что вы авторизованы в GitHub
- Убедитесь, что все файлы загружены

### Проблемы с Railway:
- Проверьте логи: `railway logs`
- Убедитесь, что переменные окружения настроены
- Проверьте, что приложение запускается локально

### Проблемы с email:
- Убедитесь, что используете App Password, не обычный пароль
- Проверьте, что 2FA включен в Google аккаунте
- Проверьте переменные окружения в Railway

## 🎉 Готово!

После выполнения всех шагов CallSpace будет:
- ✅ Развернут на Railway
- ✅ Доступен публично
- ✅ Настроен для отправки email
- ✅ Готов к использованию

**Следующий шаг:** Поделитесь ссылкой с пользователями! 🚀
