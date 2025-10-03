# 🚀 Быстрый старт: Добавление пользователей в CallSpace

## 1. Запуск сервера

```bash
cd server
npm start
```

Сервер запустится на `http://localhost:3000`

## 2. Добавление пользователей

### Способ 1: Веб-интерфейс (Самый простой)

1. Откройте `http://localhost:3000/admin.html`
2. В поле "Invite by Email" введите email пользователя
3. Нажмите "Invite User"
4. Пользователь автоматически добавится в систему

### Способ 2: Командная строка

```bash
# Добавить обычного пользователя
node add-user.js add john "John Doe" john@example.com JD user

# Добавить администратора
node add-user.js add admin "Admin User" admin@callspace.com AD admin

# Посмотреть всех пользователей
node add-user.js list
```

### Способ 3: API (для интеграции)

```bash
# Добавить пользователя через API
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "alice",
    "name": "Alice Smith", 
    "email": "alice@example.com",
    "avatar": "AS",
    "role": "user"
  }'
```

## 3. Проверка работы

1. **Откройте мессенджер**: `http://localhost:3000/messenger.html`
2. **Проверьте список друзей** - должны появиться добавленные пользователи
3. **Попробуйте видео звонок** - кнопка должна работать с новыми пользователями

## 4. Тестирование системы

```bash
# Запустить тесты пользователей
node test-users.js
```

## 5. Управление пользователями

### Веб-интерфейс (`/admin.html`)
- ✅ Просмотр всех пользователей
- ✅ Поиск по имени/email
- ✅ Редактирование профилей
- ✅ Удаление пользователей
- ✅ Статистика онлайн пользователей

### API Endpoints
- `GET /api/users` - все пользователи
- `GET /api/users/online` - онлайн пользователи
- `GET /api/users/search?q=query` - поиск
- `POST /api/users` - добавить пользователя
- `PUT /api/users/:id` - обновить
- `DELETE /api/users/:id` - удалить
- `POST /api/users/invite` - пригласить по email

## 6. Структура пользователя

```javascript
{
    id: "john",                    // Уникальный ID
    name: "John Doe",              // Полное имя
    email: "john@example.com",     // Email
    avatar: "JD",                  // Аватар (инициалы)
    online: false,                 // Онлайн статус
    role: "user",                  // Роль: "user" или "admin"
    createdAt: "2024-01-01...",    // Дата создания
    lastSeen: "2024-01-01..."      // Последний раз онлайн
}
```

## 7. Роли пользователей

- **`user`** - Обычный пользователь
  - Может участвовать в звонках
  - Может отправлять сообщения
  - Может создавать встречи

- **`admin`** - Администратор
  - Все права пользователя
  - Доступ к админ-панели
  - Может управлять другими пользователями

## 8. Автоматические функции

- **Отслеживание онлайн статуса** - автоматически при подключении/отключении
- **Загрузка в клиент** - пользователи автоматически появляются в мессенджере
- **Fallback на демо-пользователей** - если API недоступен

## 9. Файлы системы

- `server/user-management.js` - логика управления пользователями
- `server/users.json` - база данных пользователей (создается автоматически)
- `client/admin.html` - веб-интерфейс управления
- `add-user.js` - CLI скрипт
- `test-users.js` - тесты системы

## 10. Примеры использования

### Добавить пользователя из JavaScript

```javascript
const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        id: 'newuser',
        name: 'New User',
        email: 'newuser@example.com',
        avatar: 'NU',
        role: 'user'
    })
});

const result = await response.json();
console.log('User added:', result.user);
```

### Поиск пользователей

```javascript
const response = await fetch('/api/users/search?q=john');
const data = await response.json();
console.log('Found users:', data.users);
```

### Получить онлайн пользователей

```javascript
const response = await fetch('/api/users/online');
const data = await response.json();
console.log('Online users:', data.users);
```

## 🎯 Готово!

Теперь у вас есть полноценная система управления пользователями в CallSpace. Пользователи автоматически появляются в мессенджере и могут участвовать в видео звонках.

### Следующие шаги:
- Настройте HTTPS для продакшена
- Добавьте аутентификацию
- Интегрируйте с внешними системами
- Настройте отправку email приглашений
