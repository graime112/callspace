// Система управления пользователями для CallSpace
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'users.json');

// Загружаем пользователей из файла
let users = new Map();

async function loadUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        const usersArray = JSON.parse(data);
        users = new Map(usersArray.map(user => [user.id, user]));
        console.log(`📋 Loaded ${users.size} users from file`);
    } catch (error) {
        console.log('📋 No users file found, starting with empty users');
        // Создаем файл с демо пользователями
        const demoUsers = [
            { id: 'demo1', name: 'John Doe', avatar: 'JD', online: false, email: 'john@example.com', role: 'user' },
            { id: 'demo2', name: 'Alice Smith', avatar: 'AS', online: false, email: 'alice@example.com', role: 'user' },
            { id: 'demo3', name: 'Bob Johnson', avatar: 'BJ', online: false, email: 'bob@example.com', role: 'user' },
            { id: 'admin', name: 'Admin User', avatar: 'AD', online: false, email: 'admin@callspace.com', role: 'admin' }
        ];
        users = new Map(demoUsers.map(user => [user.id, user]));
        await saveUsers();
    }
}

async function saveUsers() {
    try {
        const usersArray = Array.from(users.values());
        await fs.writeFile(USERS_FILE, JSON.stringify(usersArray, null, 2));
        console.log(`💾 Saved ${users.size} users to file`);
    } catch (error) {
        console.error('❌ Error saving users:', error);
    }
}

// API функции
export function getAllUsers() {
    return Array.from(users.values());
}

export function getUserById(id) {
    return users.get(id);
}

export function getUserByEmail(email) {
    for (const user of users.values()) {
        if (user.email === email) {
            return user;
        }
    }
    return null;
}

export async function addUser(userData) {
    const { id, name, email, avatar, role = 'user' } = userData;
    
    // Проверяем, что пользователь с таким ID или email не существует
    if (users.has(id)) {
        throw new Error(`User with ID '${id}' already exists`);
    }
    
    if (getUserByEmail(email)) {
        throw new Error(`User with email '${email}' already exists`);
    }
    
    // Создаем аватар из имени, если не указан
    const userAvatar = avatar || name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const newUser = {
        id,
        name,
        email,
        avatar: userAvatar,
        online: false,
        role,
        createdAt: new Date().toISOString(),
        lastSeen: null
    };
    
    users.set(id, newUser);
    await saveUsers();
    
    console.log(`✅ Added new user: ${name} (${id})`);
    return newUser;
}

export async function updateUser(id, updates) {
    const user = users.get(id);
    if (!user) {
        throw new Error(`User with ID '${id}' not found`);
    }
    
    // Обновляем только разрешенные поля
    const allowedFields = ['name', 'email', 'avatar', 'role'];
    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            user[key] = value;
        }
    }
    
    user.updatedAt = new Date().toISOString();
    users.set(id, user);
    await saveUsers();
    
    console.log(`✅ Updated user: ${user.name} (${id})`);
    return user;
}

export async function deleteUser(id) {
    const user = users.get(id);
    if (!user) {
        throw new Error(`User with ID '${id}' not found`);
    }
    
    users.delete(id);
    await saveUsers();
    
    console.log(`🗑️ Deleted user: ${user.name} (${id})`);
    return true;
}

export function setUserOnline(id, isOnline) {
    const user = users.get(id);
    if (user) {
        user.online = isOnline;
        user.lastSeen = isOnline ? null : new Date().toISOString();
        return user;
    }
    return null;
}

export function getOnlineUsers() {
    return Array.from(users.values()).filter(user => user.online);
}

export function searchUsers(query) {
    const q = query.toLowerCase();
    return Array.from(users.values()).filter(user => 
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q)
    );
}

// Инициализируем при загрузке модуля
loadUsers();

export { users };
