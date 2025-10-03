#!/usr/bin/env node

// Скрипт для добавления пользователей через командную строку
import { addUser, getAllUsers, getUserById } from './server/user-management.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
CallSpace User Management CLI

Usage:
  node add-user.js <command> [options]

Commands:
  add <id> <name> <email> [avatar] [role]  Add a new user
  list                                     List all users
  get <id>                                 Get user by ID
  help                                     Show this help

Examples:
  node add-user.js add john "John Doe" john@example.com JD user
  node add-user.js add admin "Admin User" admin@callspace.com AD admin
  node add-user.js list
  node add-user.js get john

Options:
  --help, -h    Show this help message
    `);
    process.exit(0);
}

const command = args[0];

async function handleCommand() {
    try {
        switch (command) {
            case 'add':
                await handleAddUser();
                break;
            case 'list':
                await handleListUsers();
                break;
            case 'get':
                await handleGetUser();
                break;
            default:
                console.error(`❌ Unknown command: ${command}`);
                console.log('Use "node add-user.js help" for usage information');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function handleAddUser() {
    const [id, name, email, avatar, role = 'user'] = args.slice(1);
    
    if (!id || !name || !email) {
        console.error('❌ Missing required arguments: id, name, email');
        console.log('Usage: node add-user.js add <id> <name> <email> [avatar] [role]');
        process.exit(1);
    }
    
    try {
        const user = await addUser({ id, name, email, avatar, role });
        console.log('✅ User added successfully:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Avatar: ${user.avatar}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
    } catch (error) {
        console.error('❌ Failed to add user:', error.message);
        process.exit(1);
    }
}

async function handleListUsers() {
    try {
        const users = getAllUsers();
        console.log(`\n📋 Found ${users.length} users:\n`);
        
        if (users.length === 0) {
            console.log('   No users found');
            return;
        }
        
        users.forEach(user => {
            const status = user.online ? '🟢 Online' : '🔴 Offline';
            const lastSeen = user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Never';
            
            console.log(`   ${user.avatar} ${user.name} (@${user.id})`);
            console.log(`      Email: ${user.email}`);
            console.log(`      Role: ${user.role}`);
            console.log(`      Status: ${status}`);
            console.log(`      Last seen: ${lastSeen}`);
            console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to list users:', error.message);
        process.exit(1);
    }
}

async function handleGetUser() {
    const id = args[1];
    
    if (!id) {
        console.error('❌ Missing user ID');
        console.log('Usage: node add-user.js get <id>');
        process.exit(1);
    }
    
    try {
        const user = getUserById(id);
        if (!user) {
            console.error(`❌ User with ID '${id}' not found`);
            process.exit(1);
        }
        
        const status = user.online ? '🟢 Online' : '🔴 Offline';
        const lastSeen = user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Never';
        
        console.log(`\n👤 User Details:\n`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Avatar: ${user.avatar}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${status}`);
        console.log(`   Last seen: ${lastSeen}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        if (user.updatedAt) {
            console.log(`   Updated: ${new Date(user.updatedAt).toLocaleString()}`);
        }
    } catch (error) {
        console.error('❌ Failed to get user:', error.message);
        process.exit(1);
    }
}

// Запускаем обработку команд
handleCommand();
