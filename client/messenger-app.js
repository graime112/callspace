class TelegramMessenger {
    constructor() {
        // UI Elements
        this.chatsList = document.getElementById('chatsList');
        this.friendsList = document.getElementById('friendsList');
        this.emptyState = document.getElementById('emptyState');
        this.chatContainer = document.getElementById('chatContainer');
        this.messagesArea = document.getElementById('messagesArea');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatName = document.getElementById('chatName');
        this.chatStatus = document.getElementById('chatStatus');
        this.chatAvatar = document.getElementById('chatAvatar');
        
        // Call buttons
        this.voiceCallBtn = document.getElementById('voiceCallBtn');
        this.videoCallBtn = document.getElementById('videoCallBtn');
        
        // Video modal
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.toggleAudioBtn = document.getElementById('toggleAudioBtn');
        this.toggleVideoBtn = document.getElementById('toggleVideoBtn');
        this.endCallBtn = document.getElementById('endCallBtn');

        // Call selection modal
        this.callModal = document.getElementById('callModal');
        this.callOverlay = document.getElementById('callOverlay');
        this.closeCallModal = document.getElementById('closeCallModal');
        this.startAudioCallBtn = document.getElementById('startAudioCall');
        this.startVideoCallBtn = document.getElementById('startVideoCall');
        this.callModalTitle = document.getElementById('callModalTitle');

        // Video modal
        this.videoModal = document.getElementById('videoModal');

        this.toastContainer = document.getElementById('toastContainer');
        
        // State
        this.currentChat = null;
        this.chats = new Map();
        this.friends = [];
        this.messages = new Map();
        this.websocket = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.currentUserId = this.generateUserId();
        this.selectedFriend = null;
        
        this.init();
    }

    async loadDemoFriends() {
        try {
            // Try to load users from API first
            const response = await fetch('/api/users');
            const data = await response.json();
            
            if (data.success && data.users) {
                this.friends = data.users.map(user => ({
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    online: user.online
                }));
                console.log('✅ Loaded users from API:', this.friends.length);
            } else {
                throw new Error('Failed to load users from API');
            }
        } catch (error) {
            console.warn('⚠️ Using demo friends, API not available:', error.message);
            // Fallback to demo friends
            this.friends = [
                { id: 'demo1', name: 'John Doe', avatar: 'JD', online: true },
                { id: 'demo2', name: 'Alice Smith', avatar: 'AS', online: false },
                { id: 'demo3', name: 'Bob Johnson', avatar: 'BJ', online: true },
            ];
        }
        
        this.renderFriends();
    }

    renderFriends() {
        if (!this.friendsList) return;
        this.friendsList.innerHTML = '';
        this.friends.forEach(friend => {
            const el = document.createElement('div');
            el.className = 'friend-item';
            el.dataset.friendId = friend.id;
            el.innerHTML = `
                <div class="avatar">${friend.avatar}</div>
                <div class="friend-name">${friend.name}</div>
            `;
            el.addEventListener('click', () => this.openCallModal(friend));
            this.friendsList.appendChild(el);
        });
    }

    openCallModal(friend) {
        this.selectedFriend = friend;
        if (this.callModalTitle) this.callModalTitle.textContent = `Call ${friend.name}`;
        if (this.callModal) this.callModal.style.display = 'flex';
    }

    hideCallModal() {
        if (this.callModal) this.callModal.style.display = 'none';
        this.selectedFriend = null;
    }

    ensureChatAndOpen(friend) {
        if (!this.chats.has(friend.id)) {
            const chat = { id: friend.id, name: friend.name, avatar: friend.avatar, lastMessage: '', time: '', unread: 0, online: friend.online };
            this.chats.set(friend.id, chat);
            this.renderChatItem(chat);
        }
        this.openChat(friend.id);
    }
    
    generateUserId() {
        return 'user_' + Math.random().toString(36).substring(2, 11);
    }
    
    async init() {
        console.log('Telegram Messenger initialized');
        // Resolve identity
        await this.initIdentity();
        console.log('User ID:', this.currentUserId);
        
        // Load demo chats
        this.loadDemoChats();
        // Load friends list
        this.loadDemoFriends();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Connect to WebSocket
        this.connectWebSocket();
    }

    async initIdentity() {
        // Priority: URL ?user=... > localStorage > random prompt > random generated
        const urlParams = new URLSearchParams(window.location.search);
        const fromQuery = (urlParams.get('user') || '').trim();
        const fromStorage = (localStorage.getItem('messenger_user_id') || '').trim();
        let chosen = fromQuery || fromStorage || '';
        if (!chosen) {
            chosen = prompt('Enter your user ID (e.g., demo1, demo2):', '') || '';
        }
        if (chosen) {
            this.currentUserId = chosen;
            localStorage.setItem('messenger_user_id', chosen);
        }
    }

    setUserId(newId) {
        if (!newId) return;
        this.currentUserId = newId.trim();
        localStorage.setItem('messenger_user_id', this.currentUserId);
        // Re-register if socket is open
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'register', userId: this.currentUserId }));
        }
    }
    
    setupEventListeners() {
        // Message input
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        // Call buttons
        this.videoCallBtn.addEventListener('click', () => this.startVideoCall());
        this.voiceCallBtn.addEventListener('click', () => this.startVoiceCall());
        
        // Video controls
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.endCallBtn.addEventListener('click', () => this.endCall());

        // Call modal
        if (this.callOverlay) this.callOverlay.addEventListener('click', () => this.hideCallModal());
        if (this.closeCallModal) this.closeCallModal.addEventListener('click', () => this.hideCallModal());
        if (this.startAudioCallBtn) this.startAudioCallBtn.addEventListener('click', () => {
            this.hideCallModal();
            if (this.selectedFriend) this.ensureChatAndOpen(this.selectedFriend);
            this.startVoiceCall();
        });
        if (this.startVideoCallBtn) this.startVideoCallBtn.addEventListener('click', () => {
            this.hideCallModal();
            if (this.selectedFriend) this.ensureChatAndOpen(this.selectedFriend);
            this.startVideoCall();
        });
    }
    
    renderChatItem(chat) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        
        chatItem.innerHTML = `
            <div class="avatar">${chat.avatar}</div>
            <div class="chat-item-info">
                <div class="chat-item-header">
                    <span class="chat-item-name">${chat.name}</span>
                    <span class="chat-time">${chat.time}</span>
                </div>
                <div class="chat-preview">${chat.lastMessage}</div>
            </div>
            ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ''}
        `;
        
        chatItem.addEventListener('click', () => this.openChat(chat.id));
        this.chatsList.appendChild(chatItem);
    }
    
    openChat(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;
        
        this.currentChat = chat;
        
        // Update UI
        this.emptyState.style.display = 'none';
        this.chatContainer.style.display = 'flex';
        
        // Update chat header
        this.chatName.textContent = chat.name;
        this.chatAvatar.textContent = chat.avatar;
        this.chatStatus.textContent = chat.online ? 'online' : 'last seen recently';
        this.chatStatus.className = chat.online ? 'status online' : 'status';
        
        // Update active state
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId === chatId) {
                item.classList.add('active');
            }
        });
        
        // Load messages
        this.loadMessages(chatId);
    }
    
    loadMessages(chatId) {
        this.messagesArea.innerHTML = '';
        const messages = this.messages.get(chatId) || [];
        
        messages.forEach(msg => this.renderMessage(msg));
        this.scrollToBottom();
    }
    
    renderMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.type}`;
        
        messageEl.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${this.escapeHtml(message.text)}</div>
                <div class="message-time">${message.time}</div>
            </div>
        `;
        
        this.messagesArea.appendChild(messageEl);
    }
    
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.currentChat) return;
        
        const message = {
            id: Date.now(),
            text: text,
            type: 'outgoing',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        
        // Add to messages
        const chatMessages = this.messages.get(this.currentChat.id) || [];
        chatMessages.push(message);
        this.messages.set(this.currentChat.id, chatMessages);
        
        // Render message
        this.renderMessage(message);
        this.scrollToBottom();
        
        // Clear input
        this.messageInput.value = '';
        
        // Send via WebSocket
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'message',
                to: this.currentChat.id,
                from: this.currentUserId,
                text: text,
                timestamp: Date.now()
            }));
        }
    }
    
    async startVideoCall() {
        console.log('🎥 Starting video call...');
        console.log('Current chat:', this.currentChat);
        console.log('WebSocket state:', this.websocket ? this.websocket.readyState : 'not connected');
        
        if (!this.currentChat) {
            // Try to create a chat with the first available friend
            if (this.friends && this.friends.length > 0) {
                const firstFriend = this.friends[0];
                this.ensureChatAndOpen(firstFriend);
                this.showToast(`Starting call with ${firstFriend.name}`, 'info');
            } else {
                this.showToast('Please select a chat first', 'error');
                return;
            }
        }
        
        try {
            this.showToast('Starting video call...', 'info');
            
            // Check if WebSocket is connected
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                console.log('WebSocket not connected, connecting...');
                this.connectWebSocket();
                // Wait a bit for connection
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Get media
            console.log('Requesting media access...');
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            console.log('Media access granted');
            
            this.localVideo.srcObject = this.localStream;
            
            // Setup peer connection
            console.log('Setting up peer connection...');
            this.setupPeerConnection();
            
            // Create SDP offer
            console.log('Creating offer...');
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            // Show video modal
            console.log('Showing video modal...');
            this.videoModal.style.display = 'block';
            
            // Send call signal with offer
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                console.log('Sending call request...');
                this.websocket.send(JSON.stringify({
                    type: 'call-request',
                    to: this.currentChat.id,
                    from: this.currentUserId,
                    callType: 'video',
                    offer
                }));
            } else {
                console.error('WebSocket not ready for sending');
                this.showToast('Connection not ready', 'error');
                return;
            }
            
            this.showToast('Calling...', 'info');
            
        } catch (error) {
            console.error('Error starting video call:', error);
            this.showToast('Failed to access camera/microphone', 'error');
        }
    }
    
    async startVoiceCall() {
        if (!this.currentChat) {
            // Try to create a chat with the first available friend
            if (this.friends && this.friends.length > 0) {
                const firstFriend = this.friends[0];
                this.ensureChatAndOpen(firstFriend);
                this.showToast(`Starting call with ${firstFriend.name}`, 'info');
            } else {
                this.showToast('Please select a chat first', 'error');
                return;
            }
        }
        
        try {
            this.showToast('Starting voice call...', 'info');
            // Get audio only
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
            this.localVideo.srcObject = this.localStream;

            // Setup peer connection
            this.setupPeerConnection();

            // Create SDP offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Show video modal (audio-only is fine)
            this.videoModal.style.display = 'block';

            // Send call signal with offer
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'call-request',
                    to: this.currentChat.id,
                    from: this.currentUserId,
                    callType: 'voice',
                    offer
                }));
            }

            this.showToast('Calling...', 'info');

        } catch (error) {
            console.error('Error starting voice call:', error);
            this.showToast('Failed to access microphone', 'error');
        }
    }

    setupPeerConnection() {
        console.log('Setting up peer connection...');
        console.log('CURRENT_CONFIG:', CURRENT_CONFIG);
        
        const iceServers = CURRENT_CONFIG.STUN_SERVERS.map(url => ({ urls: url }));
        console.log('ICE servers:', iceServers);
        
        this.peerConnection = new RTCPeerConnection({ iceServers });
        console.log('Peer connection created');

        // Add local tracks
        if (this.localStream) {
            console.log('Adding local tracks to peer connection');
            this.localStream.getTracks().forEach(track => {
                console.log('Adding track:', track.kind);
                this.peerConnection.addTrack(track, this.localStream);
            });
        } else {
            console.warn('No local stream available');
        }

        // Remote track
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote track');
            this.remoteStream = event.streams[0];
            this.remoteVideo.srcObject = this.remoteStream;
            this.showToast('Connected', 'success');
        };

        // ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                console.log('Sending ICE candidate');
                this.websocket.send(JSON.stringify({
                    type: 'ice-candidate-user',
                    to: this.currentChat?.id,
                    candidate: event.candidate
                }));
            }
        };

        // Connection state
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'failed' || this.peerConnection.connectionState === 'disconnected') {
                this.endCall();
            }
        };
    }
    
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                this.isAudioEnabled = !this.isAudioEnabled;
                audioTrack.enabled = this.isAudioEnabled;
                this.toggleAudioBtn.style.opacity = this.isAudioEnabled ? '1' : '0.5';
            }
        }
    }
    
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                this.isVideoEnabled = !this.isVideoEnabled;
                videoTrack.enabled = this.isVideoEnabled;
                this.toggleVideoBtn.style.opacity = this.isVideoEnabled ? '1' : '0.5';
                this.localVideo.style.display = this.isVideoEnabled ? 'block' : 'none';
            }
        }
    }
    
    endCall() {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Hide video modal
        this.videoModal.style.display = 'none';
        this.localVideo.style.display = 'block';
        
        // Send end call signal
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN && this.currentChat) {
            this.websocket.send(JSON.stringify({
                type: 'call-end',
                to: this.currentChat.id,
                from: this.currentUserId
            }));
        }
        
        this.showToast('Call ended', 'info');
    }
    
    connectWebSocket() {
        const wsUrl = CURRENT_CONFIG.WS_URL;
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('🔌 WebSocket connected');
            this.websocket.send(JSON.stringify({
                type: 'register',
                userId: this.currentUserId
            }));
            // Process startup call instruction if any
            this.processStartupCall();
        };
        
        this.websocket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
        };
        
        this.websocket.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            setTimeout(() => this.connectWebSocket(), 3000);
        };
        
        this.websocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };
    }
    
    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'message':
                this.handleIncomingMessage(message);
                break;
            case 'call-request':
                this.handleIncomingCall(message);
                break;
            case 'call-answer':
                await this.handleCallAnswer(message);
                break;
            case 'ice-candidate-user':
                await this.handleIceCandidate(message);
                break;
            case 'ice-candidate':
                await this.handleIceCandidate(message);
                break;
            case 'call-end':
                this.endCall();
                break;
        }
    }
    
    handleIncomingMessage(message) {
        // Add message to chat
        const msg = {
            id: Date.now(),
            text: message.text,
            type: 'incoming',
            time: new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        
        const chatMessages = this.messages.get(message.from) || [];
        chatMessages.push(msg);
        this.messages.set(message.from, chatMessages);
        
        // If chat is open, render message
        if (this.currentChat && this.currentChat.id === message.from) {
            this.renderMessage(msg);
            this.scrollToBottom();
        }
    }
    
    async handleIncomingCall(message) {
        const accept = confirm(`Incoming ${message.callType} call from ${message.from}. Accept?`);
        
        if (accept) {
            // Start local stream
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: message.callType === 'video',
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            this.setupPeerConnection();
            this.videoModal.style.display = 'block';
            
            // Create answer
            const offer = message.offer;
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            // Send answer
            this.websocket.send(JSON.stringify({
                type: 'call-answer',
                to: message.from,
                answer: answer
            }));
        } else {
            // Reject call
            this.websocket.send(JSON.stringify({
                type: 'call-reject',
                to: message.from
            }));
        }
    }
    
    async handleCallAnswer(message) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
        }
    }
    
    async handleIceCandidate(message) {
        if (this.peerConnection && message.candidate) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    }

    processStartupCall() {
        try {
            const raw = localStorage.getItem('startup_call');
            if (!raw) return;
            localStorage.removeItem('startup_call');
            const data = JSON.parse(raw);
            if (!data || !data.to || !data.type) return;

            // Resolve friend by id; if not found, create placeholder
            let friend = (this.friends || []).find(f => f.id === data.to);
            if (!friend) {
                const avatar = (data.to || 'US').substring(0,2).toUpperCase();
                friend = { id: data.to, name: data.to, avatar, online: true };
            }
            this.ensureChatAndOpen(friend);

            if (data.type === 'voice') {
                this.startVoiceCall();
            } else {
                this.startVideoCall();
            }
        } catch (e) {
            console.error('Failed to process startup_call:', e);
        }
    }
    
    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize messenger
document.addEventListener('DOMContentLoaded', () => {
    const messenger = new TelegramMessenger();
    console.log('💬 Telegram Messenger ready');
});
