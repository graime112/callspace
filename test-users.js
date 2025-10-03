#!/usr/bin/env node

// Тестовый скрипт для проверки системы пользователей
import { 
    addUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser,
    searchUsers,
    setUserOnline 
} from './server/user-management.js';

console.log('🧪 Testing CallSpace User Management System\n');

async function runTests() {
    try {
        // Тест 1: Добавление пользователей
        console.log('1️⃣ Testing user creation...');
        
        const testUsers = [
            { id: 'test1', name: 'Test User 1', email: 'test1@example.com', avatar: 'T1', role: 'user' },
            { id: 'test2', name: 'Test User 2', email: 'test2@example.com', avatar: 'T2', role: 'admin' },
            { id: 'test3', name: 'Test User 3', email: 'test3@example.com', avatar: 'T3', role: 'user' }
        ];
        
        for (const userData of testUsers) {
            try {
                const user = await addUser(userData);
                console.log(`   ✅ Created user: ${user.name} (${user.id})`);
            } catch (error) {
                console.log(`   ⚠️ User ${userData.id} might already exist: ${error.message}`);
            }
        }
        
        // Тест 2: Получение всех пользователей
        console.log('\n2️⃣ Testing user retrieval...');
        const allUsers = getAllUsers();
        console.log(`   📊 Total users: ${allUsers.length}`);
        
        // Тест 3: Поиск пользователей
        console.log('\n3️⃣ Testing user search...');
        const searchResults = searchUsers('test');
        console.log(`   🔍 Found ${searchResults.length} users matching "test"`);
        
        // Тест 4: Получение пользователя по ID
        console.log('\n4️⃣ Testing get user by ID...');
        const user = getUserById('test1');
        if (user) {
            console.log(`   👤 Found user: ${user.name} (${user.email})`);
        } else {
            console.log('   ❌ User not found');
        }
        
        // Тест 5: Обновление пользователя
        console.log('\n5️⃣ Testing user update...');
        try {
            const updatedUser = await updateUser('test1', { name: 'Updated Test User 1' });
            console.log(`   ✅ Updated user: ${updatedUser.name}`);
        } catch (error) {
            console.log(`   ❌ Update failed: ${error.message}`);
        }
        
        // Тест 6: Онлайн статус
        console.log('\n6️⃣ Testing online status...');
        setUserOnline('test1', true);
        setUserOnline('test2', true);
        setUserOnline('test3', false);
        
        const onlineUsers = allUsers.filter(u => u.online);
        console.log(`   🟢 Online users: ${onlineUsers.length}`);
        
        // Тест 7: API endpoints (если сервер запущен)
        console.log('\n7️⃣ Testing API endpoints...');
        try {
            const response = await fetch('http://localhost:3000/api/users');
            if (response.ok) {
                const data = await response.json();
                console.log(`   🌐 API working: ${data.users.length} users via API`);
            } else {
                console.log('   ⚠️ API not available (server not running?)');
            }
        } catch (error) {
            console.log('   ⚠️ API not available (server not running?)');
        }
        
        // Тест 8: Очистка тестовых данных
        console.log('\n8️⃣ Cleaning up test data...');
        for (const userData of testUsers) {
            try {
                await deleteUser(userData.id);
                console.log(`   🗑️ Deleted test user: ${userData.id}`);
            } catch (error) {
                console.log(`   ⚠️ Could not delete ${userData.id}: ${error.message}`);
            }
        }
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Запускаем тесты
runTests();
