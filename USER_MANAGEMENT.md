# 👥 Управление пользователями CallSpace

## Обзор

CallSpace теперь поддерживает полноценную систему управления пользователями с возможностью добавления внешних пользователей, управления ролями и отслеживания онлайн статуса.

## 🚀 Быстрый старт

### 1. Веб-интерфейс (Рекомендуется)

Откройте админ-панель: `http://localhost:3000/admin.html`

**Возможности:**
- ✅ Просмотр всех пользователей
- ✅ Поиск пользователей
- ✅ Приглашение по email
- ✅ Редактирование пользователей
- ✅ Удаление пользователей
- ✅ Статистика онлайн пользователей

### 2. Командная строка

```bash
# Добавить пользователя
node add-user.js add john "John Doe" john@example.com JD user

# Добавить администратора
node add-user.js add admin "Admin User" admin@callspace.com AD admin

# Просмотреть всех пользователей
node add-user.js list

# Получить информацию о пользователе
node add-user.js get john
```

### 3. API (для интеграции)

```bash
# Получить всех пользователей
curl http://localhost:3000/api/users

# Добавить пользователя
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":"john","name":"John Doe","email":"john@example.com","avatar":"JD","role":"user"}'

# Пригласить по email
curl -X POST http://localhost:3000/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","name":"New User","inviterId":"admin"}'
```

## 📋 API Endpoints

### Пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/users` | Получить всех пользователей |
| GET | `/api/users/online` | Получить онлайн пользователей |
| GET | `/api/users/search?q=query` | Поиск пользователей |
| GET | `/api/users/:id` | Получить пользователя по ID |
| POST | `/api/users` | Добавить нового пользователя |
| PUT | `/api/users/:id` | Обновить пользователя |
| DELETE | `/api/users/:id` | Удалить пользователя |
| POST | `/api/users/invite` | Пригласить пользователя по email |

### Примеры запросов

#### Добавить пользователя
```javascript
const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        id: 'john',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'JD',
        role: 'user'
    })
});
```

#### Поиск пользователей
```javascript
const response = await fetch('/api/users/search?q=john');
const data = await response.json();
console.log(data.users); // Массив найденных пользователей
```

## 🔧 Настройка

### Структура данных пользователя

```javascript
{
    id: "john",                    // Уникальный ID пользователя
    name: "John Doe",              // Полное имя
    email: "john@example.com",     // Email адрес
    avatar: "JD",                  // Аватар (инициалы)
    online: false,                 // Онлайн статус
    role: "user",                  // Роль: "user" или "admin"
    createdAt: "2024-01-01T00:00:00.000Z",  // Дата создания
    updatedAt: "2024-01-01T00:00:00.000Z",  // Дата обновления
    lastSeen: "2024-01-01T00:00:00.000Z"    // Последний раз онлайн
}
```

### Роли пользователей

- **`user`** - Обычный пользователь (по умолчанию)
  - Может участвовать в звонках
  - Может отправлять сообщения
  - Может создавать встречи

- **`admin`** - Администратор
  - Все права обычного пользователя
  - Доступ к админ-панели
  - Может управлять другими пользователями

## 📁 Файлы системы

```
server/
├── user-management.js    # Основная логика управления пользователями
├── users.json           # База данных пользователей (создается автоматически)
└── server.js            # Обновленный сервер с API

client/
├── admin.html           # Веб-интерфейс управления пользователями
├── messenger-app.js     # Обновлен для загрузки пользователей с сервера
└── home-app.js          # Обновлен для загрузки пользователей с сервера

add-user.js              # CLI скрипт для управления пользователями
```

## 🔄 Автоматические функции

### Отслеживание онлайн статуса

- При подключении пользователя к WebSocket автоматически устанавливается статус "онлайн"
- При отключении статус меняется на "офлайн" и записывается время последнего посещения

### Загрузка пользователей в клиент

- Клиентские приложения автоматически загружают пользователей с сервера
- При недоступности API используется fallback на демо-пользователей

## 🚨 Безопасность

### Валидация данных

- Проверка уникальности ID и email
- Валидация формата email
- Ограничение на редактируемые поля

### Рекомендации

1. **Используйте HTTPS** в продакшене
2. **Ограничьте доступ** к админ-панели
3. **Регулярно создавайте резервные копии** файла `users.json`
4. **Используйте сильные пароли** для администраторов

## 🔧 Расширение функциональности

### Добавление новых полей

1. Обновите структуру в `user-management.js`
2. Добавьте поля в форму `admin.html`
3. Обновите API endpoints при необходимости

### Интеграция с внешними системами

```javascript
// Пример интеграции с LDAP/Active Directory
import { addUser } from './server/user-management.js';

async function syncFromLDAP() {
    const ldapUsers = await getLDAPUsers();
    for (const ldapUser of ldapUsers) {
        try {
            await addUser({
                id: ldapUser.sAMAccountName,
                name: ldapUser.displayName,
                email: ldapUser.mail,
                role: ldapUser.isAdmin ? 'admin' : 'user'
            });
        } catch (error) {
            console.error('Failed to sync user:', error);
        }
    }
}
```

### Отправка email приглашений

```javascript
// В server.js, endpoint /api/users/invite
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    // настройки SMTP
});

// Отправка приглашения
await transporter.sendMail({
    from: 'noreply@callspace.com',
    to: email,
    subject: 'Приглашение в CallSpace',
    html: `
        <h2>Добро пожаловать в CallSpace!</h2>
        <p>Вы были приглашены присоединиться к нашей платформе видеозвонков.</p>
        <a href="${inviteUrl}">Присоединиться</a>
    `
});
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи сервера
2. Убедитесь, что файл `users.json` существует и доступен для записи
3. Проверьте права доступа к файлам
4. Используйте CLI скрипт для диагностики

## 🎯 Следующие шаги

- [ ] Добавить аутентификацию и авторизацию
- [ ] Интеграция с внешними системами (LDAP, OAuth)
- [ ] Отправка email приглашений
- [ ] Группы пользователей и права доступа
- [ ] Аудит действий пользователей
- [ ] Экспорт/импорт пользователей
