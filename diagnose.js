#!/usr/bin/env node

// Диагностический скрипт для CallSpace
import { getAllUsers, addUser } from './server/user-management.js';

console.log('🔍 CallSpace System Diagnostics\n');

async function runDiagnostics() {
    try {
        // 1. Проверка системы пользователей
        console.log('1️⃣ Checking user management system...');
        const users = getAllUsers();
        console.log(`   📊 Total users: ${users.length}`);
        
        if (users.length > 0) {
            console.log('   👥 Users:');
            users.forEach(user => {
                console.log(`      - ${user.name} (${user.id}) - ${user.email}`);
            });
        }
        
        // 2. Проверка API
        console.log('\n2️⃣ Checking API endpoints...');
        try {
            const response = await fetch('http://localhost:3000/api/users');
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ API working: ${data.users.length} users via API`);
            } else {
                console.log(`   ❌ API error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`   ❌ API not available: ${error.message}`);
            console.log('   💡 Make sure server is running: cd server && node server.js');
        }
        
        // 3. Тест приглашения пользователя
        console.log('\n3️⃣ Testing user invitation...');
        try {
            const testEmail = 'test@example.com';
            const response = await fetch('http://localhost:3000/api/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    name: 'Test User',
                    inviterId: 'admin'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Invitation test successful: ${data.user.name}`);
                
                // Удаляем тестового пользователя
                try {
                    await fetch(`http://localhost:3000/api/users/${data.user.id}`, {
                        method: 'DELETE'
                    });
                    console.log('   🗑️ Test user cleaned up');
                } catch (cleanupError) {
                    console.log('   ⚠️ Could not clean up test user');
                }
            } else {
                const errorData = await response.json();
                console.log(`   ❌ Invitation test failed: ${errorData.error}`);
            }
        } catch (error) {
            console.log(`   ❌ Invitation test error: ${error.message}`);
        }
        
        // 4. Проверка файлов
        console.log('\n4️⃣ Checking system files...');
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const filesToCheck = [
            'server/user-management.js',
            'server/users.json',
            'client/admin.html',
            'add-user.js'
        ];
        
        for (const file of filesToCheck) {
            try {
                await fs.access(file);
                console.log(`   ✅ ${file} exists`);
            } catch {
                console.log(`   ❌ ${file} missing`);
            }
        }
        
        // 5. Рекомендации
        console.log('\n5️⃣ Recommendations:');
        
        if (users.length === 0) {
            console.log('   💡 No users found. Add some users using:');
            console.log('      - Web interface: http://localhost:3000/admin.html');
            console.log('      - CLI: node add-user.js add john "John Doe" john@example.com');
        }
        
        console.log('   💡 Admin panel: http://localhost:3000/admin.html');
        console.log('   💡 Messenger: http://localhost:3000/messenger.html');
        console.log('   💡 Restart server: ./restart-server.sh');
        
        console.log('\n✅ Diagnostics completed!');
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

// Запускаем диагностику
runDiagnostics();
