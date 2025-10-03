import { WebSocketServer } from 'ws';
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { networkInterfaces } from 'os';
import { 
    getAllUsers, 
    getUserById, 
    addUser, 
    updateUser, 
    deleteUser, 
    setUserOnline, 
    getOnlineUsers, 
    searchUsers 
} from './user-management.js';
import { sendInvitationEmail, checkEmailConfig } from './email-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Get local IP address
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// CORS middleware for public access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../client')));

// Тестовая страница для отладки
app.get('/test-button', (req, res) => {
  res.sendFile(join(__dirname, '../client/test-button.html'));
});

// Server info endpoint
app.get('/api/server/info', (req, res) => {
  res.json({
    success: true,
    server: 'CallSpace',
    version: '1.0.0',
    status: 'running',
    localUrl: `http://localhost:${PORT}`,
    networkUrl: `http://${getLocalIP()}:${PORT}`,
    publicUrl: process.env.PUBLIC_URL || null,
    timestamp: new Date().toISOString()
  });
});

// Redirect root to messenger
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../client/messenger.html'));
});

// Generate unique room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// API для создания новой встречи
app.post('/api/create-meeting', (req, res) => {
  const roomId = generateRoomId();
  const meetingUrl = `https://${req.get('host')}/join/${roomId}`;
  
  res.json({
    roomId,
    meetingUrl,
    directJoinUrl: meetingUrl
  });
});

// Обработка прямых ссылок на встречи
app.get('/join/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.sendFile(join(__dirname, '../client/meeting.html'));
});

// API для получения информации о комнате
app.get('/api/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const roomExists = rooms.has(roomId);
  const participantCount = roomExists ? rooms.get(roomId).size : 0;
  
  res.json({
    roomId,
    exists: roomExists,
    participantCount
  });
});

// ===== USER MANAGEMENT API =====

// Получить всех пользователей
app.get('/api/users', (req, res) => {
  try {
    const allUsers = getAllUsers();
    res.json({ success: true, users: allUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить онлайн пользователей
app.get('/api/users/online', (req, res) => {
  try {
    const onlineUsers = getOnlineUsers();
    res.json({ success: true, users: onlineUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Поиск пользователей
app.get('/api/users/search', (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }
    
    const results = searchUsers(query);
    res.json({ success: true, users: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить пользователя по ID
app.get('/api/users/:id', (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить нового пользователя
app.post('/api/users', async (req, res) => {
  try {
    const { id, name, email, avatar, role } = req.body;
    
    // Валидация
    if (!id || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Fields "id", "name", and "email" are required' 
      });
    }
    
    const newUser = await addUser({ id, name, email, avatar, role });
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Обновить пользователя
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    const updatedUser = await updateUser(userId, updates);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Удалить пользователя
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Проверить конфигурацию email
app.get('/api/email/config', (req, res) => {
  try {
    const config = checkEmailConfig();
    res.json({ success: true, ...config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Пригласить пользователя по email
app.post('/api/users/invite', async (req, res) => {
  try {
    const { email, name, inviterId } = req.body;
    
    console.log(`📧 Invite request: email=${email}, name=${name}, inviter=${inviterId}`);
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    
    // Генерируем ID для нового пользователя
    const id = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const displayName = name || email.split('@')[0];
    
    console.log(`🆔 Generated ID: ${id} for email: ${email}`);
    
    if (!id || id.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not generate valid user ID from email' 
      });
    }
    
    const newUser = await addUser({
      id,
      name: displayName,
      email,
      role: 'user'
    });
    
    console.log(`✅ User created successfully: ${newUser.name} (${newUser.id})`);
    
    // Отправляем email приглашение
    const inviteUrl = `https://${req.get('host')}/?user=${id}`;
    const inviterName = inviterId || 'CallSpace Team';
    
    const emailResult = await sendInvitationEmail({
      name: displayName,
      email: email,
      inviterName: inviterName
    }, inviteUrl);
    
    if (emailResult.success) {
      console.log(`📧 Invitation email sent to ${email}`);
    } else {
      console.log(`⚠️ Failed to send email to ${email}: ${emailResult.error}`);
    }
    
    res.status(201).json({ 
      success: true, 
      user: newUser,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      inviteUrl: inviteUrl,
      message: emailResult.success 
        ? 'User invited successfully and email sent' 
        : 'User invited successfully, but email could not be sent'
    });
  } catch (error) {
    console.error('❌ Error inviting user:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create HTTP server
const server = createServer(app);

// WebSocket server on same port as HTTP
const wss = new WebSocketServer({ server });
// roomId -> Set of websockets (for meeting rooms)
const rooms = new Map();
// userId -> ws (for messenger direct messaging/calls)
const users = new Map();

function broadcastToRoom(roomId, sender, message) {
  const peers = rooms.get(roomId);
  if (!peers) return;
  
  for (const ws of peers) {
    if (ws !== sender && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

wss.on('connection', (ws) => {
  let currentRoom = null;
  let currentUserId = null;

  console.log('📱 New client connected');

  const sendToUser = (userId, payload) => {
    const target = users.get(userId);
    if (target && target.readyState === target.OPEN) {
      target.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        // Meeting room signaling (group calls)
        case 'join': {
          currentRoom = message.room;
          if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Set());
          rooms.get(currentRoom).add(ws);
          console.log(`👤 Client joined room: ${currentRoom}`);
          broadcastToRoom(currentRoom, ws, { type: 'user-joined', room: currentRoom });
          break;
        }
        case 'offer':
        case 'answer':
        case 'ice-candidate': {
          if (currentRoom) broadcastToRoom(currentRoom, ws, message);
          break;
        }
        case 'leave': {
          if (currentRoom && rooms.has(currentRoom)) {
            rooms.get(currentRoom).delete(ws);
            broadcastToRoom(currentRoom, ws, { type: 'user-left', room: currentRoom });
            if (rooms.get(currentRoom).size === 0) rooms.delete(currentRoom);
          }
          break;
        }

        // Messenger features
        case 'register': {
          currentUserId = message.userId;
          users.set(currentUserId, ws);
          
          // Обновляем онлайн статус в базе пользователей
          setUserOnline(currentUserId, true);
          
          console.log(`✅ Registered user: ${currentUserId}`);
          break;
        }
        case 'message': {
          // direct text message
          const delivered = sendToUser(message.to, { ...message, type: 'message' });
          if (!delivered) {
            // optionally queue or log undelivered
            console.log(`⚠️ User ${message.to} not connected`);
          }
          break;
        }
        case 'call-request': {
          // forward SDP offer to callee
          sendToUser(message.to, {
            type: 'call-request',
            from: currentUserId,
            callType: message.callType,
            offer: message.offer
          });
          break;
        }
        case 'call-answer': {
          // forward SDP answer back to caller
          sendToUser(message.to, { type: 'call-answer', answer: message.answer });
          break;
        }
        case 'ice-candidate-user': {
          // forward ICE candidate for p2p call
          sendToUser(message.to, { type: 'ice-candidate', candidate: message.candidate });
          break;
        }
        case 'call-end':
        case 'call-reject': {
          sendToUser(message.to, { type: message.type });
          break;
        }
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('📱 Client disconnected');
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      broadcastToRoom(currentRoom, ws, { type: 'user-left', room: currentRoom });
      if (rooms.get(currentRoom).size === 0) rooms.delete(currentRoom);
    }
    if (currentUserId && users.get(currentUserId) === ws) {
      users.delete(currentUserId);
      
      // Обновляем офлайн статус в базе пользователей
      setUserOnline(currentUserId, false);
    }
  });
});
// Start server
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`\n🌐 Web server running at:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://${localIP}:${PORT}`);
  console.log(`\n🔌 WebSocket server running on same port (${PORT})`);
  console.log(`\n📱 To access from other devices:`);
  console.log(`   1. Connect to same WiFi network`);
  console.log(`   2. Open: http://${localIP}:${PORT}`);
  console.log(`\n🌍 To access from internet:`);
  console.log(`   Run: ngrok http ${PORT}`);
  console.log(`   Or use: ./start-ngrok.sh\n`);
});
