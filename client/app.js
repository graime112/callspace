class WebRTCClient {
    constructor() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.roomInput = document.getElementById('roomInput');
        this.joinBtn = document.getElementById('joinBtn');
        this.leaveBtn = document.getElementById('leaveBtn');
        this.toggleAudioBtn = document.getElementById('toggleAudio');
        this.toggleVideoBtn = document.getElementById('toggleVideo');
        this.shareScreenBtn = document.getElementById('shareScreen');
        this.status = document.getElementById('status');
        this.joinSection = document.getElementById('joinSection');
        this.callSection = document.getElementById('callSection');
        this.currentRoomSpan = document.getElementById('currentRoom');
        this.waitingMessage = document.getElementById('waitingMessage');
        
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.websocket = null;
        this.currentRoom = null;
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.isScreenSharing = false;
        
        this.setupEventListeners();
        this.setupPeerConnection();
    }
    
    setupEventListeners() {
        this.joinBtn.addEventListener('click', () => this.joinRoom());
        this.leaveBtn.addEventListener('click', () => this.leaveRoom());
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.shareScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        
        this.roomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
    }
    
    setupPeerConnection() {
        const iceServers = CURRENT_CONFIG.STUN_SERVERS.map(url => ({ urls: url }));
        
        // Добавляем TURN серверы для продакшена
        if (CURRENT_CONFIG.TURN_SERVERS) {
            iceServers.push(...CURRENT_CONFIG.TURN_SERVERS);
        }
        
        const configuration = { iceServers };
        
        this.peerConnection = new RTCPeerConnection(configuration);
        
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.websocket) {
                this.websocket.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };
        
        this.peerConnection.ontrack = (event) => {
            console.log('📺 Received remote stream');
            this.remoteStream = event.streams[0];
            this.remoteVideo.srcObject = this.remoteStream;
            this.hideWaitingMessage();
        };
        
        this.peerConnection.onconnectionstatechange = () => {
            console.log('🔗 Connection state:', this.peerConnection.connectionState);
            this.updateStatus(`Состояние подключения: ${this.peerConnection.connectionState}`, 'info');
        };
    }
    
    async joinRoom() {
        const roomId = this.roomInput.value.trim();
        if (!roomId) {
            this.updateStatus('Введите ID комнаты', 'error');
            return;
        }
        
        try {
            this.updateStatus('Подключение к комнате...', 'info');
            
            // Get user media
            await this.startLocalStream();
            
            // Connect to signaling server
            this.connectWebSocket(roomId);
            
            this.currentRoom = roomId;
            this.currentRoomSpan.textContent = roomId;
            this.showCallSection();
            
        } catch (error) {
            console.error('❌ Error joining room:', error);
            this.updateStatus('Ошибка подключения к комнате', 'error');
        }
    }
    
    async startLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            
            // Add tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            console.log('📹 Local stream started');
            
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            throw new Error('Не удалось получить доступ к камере/микрофону');
        }
    }
    
    connectWebSocket(roomId) {
        const wsUrl = CURRENT_CONFIG.WS_URL;
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('🔌 WebSocket connected');
            this.websocket.send(JSON.stringify({
                type: 'join',
                room: roomId
            }));
            this.updateStatus('Подключено к серверу', 'success');
        };
        
        this.websocket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
        };
        
        this.websocket.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            this.updateStatus('Соединение разорвано', 'error');
        };
        
        this.websocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.updateStatus('Ошибка соединения с сервером', 'error');
        };
    }
    
    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'user-joined':
                console.log('👤 User joined the room');
                this.updateStatus('Пользователь присоединился', 'success');
                await this.createOffer();
                break;
                
            case 'user-left':
                console.log('👤 User left the room');
                this.updateStatus('Пользователь покинул комнату', 'info');
                this.showWaitingMessage();
                this.remoteVideo.srcObject = null;
                break;
                
            case 'offer':
                console.log('📞 Received offer');
                await this.handleOffer(message.offer);
                break;
                
            case 'answer':
                console.log('📞 Received answer');
                await this.handleAnswer(message.answer);
                break;
                
            case 'ice-candidate':
                console.log('🧊 Received ICE candidate');
                await this.handleIceCandidate(message.candidate);
                break;
        }
    }
    
    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            this.websocket.send(JSON.stringify({
                type: 'offer',
                offer: offer
            }));
            
            console.log('📞 Offer created and sent');
        } catch (error) {
            console.error('❌ Error creating offer:', error);
        }
    }
    
    async handleOffer(offer) {
        try {
            await this.peerConnection.setRemoteDescription(offer);
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            this.websocket.send(JSON.stringify({
                type: 'answer',
                answer: answer
            }));
            
            console.log('📞 Answer created and sent');
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }
    
    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(answer);
            console.log('📞 Answer processed');
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }
    
    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(candidate);
            console.log('🧊 ICE candidate added');
        } catch (error) {
            console.error('❌ Error adding ICE candidate:', error);
        }
    }
    
    leaveRoom() {
        if (this.websocket) {
            this.websocket.send(JSON.stringify({
                type: 'leave',
                room: this.currentRoom
            }));
            this.websocket.close();
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.setupPeerConnection();
        }
        
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        this.currentRoom = null;
        this.isScreenSharing = false;
        
        this.showJoinSection();
        this.updateStatus('Вы покинули комнату', 'info');
    }
    
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                this.isAudioEnabled = !this.isAudioEnabled;
                audioTrack.enabled = this.isAudioEnabled;
                
                this.toggleAudioBtn.textContent = this.isAudioEnabled ? '🎤' : '🔇';
                this.toggleAudioBtn.classList.toggle('disabled', !this.isAudioEnabled);
                
                this.updateStatus(
                    this.isAudioEnabled ? 'Микрофон включен' : 'Микрофон выключен',
                    'info'
                );
            }
        }
    }
    
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                this.isVideoEnabled = !this.isVideoEnabled;
                videoTrack.enabled = this.isVideoEnabled;
                
                this.toggleVideoBtn.textContent = this.isVideoEnabled ? '📹' : '📷';
                this.toggleVideoBtn.classList.toggle('disabled', !this.isVideoEnabled);
                
                this.updateStatus(
                    this.isVideoEnabled ? 'Камера включена' : 'Камера выключена',
                    'info'
                );
            }
        }
    }
    
    async toggleScreenShare() {
        try {
            if (!this.isScreenSharing) {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
                
                this.localVideo.srcObject = screenStream;
                this.isScreenSharing = true;
                this.shareScreenBtn.textContent = '🖥️';
                this.shareScreenBtn.classList.add('disabled');
                
                videoTrack.onended = () => {
                    this.stopScreenShare();
                };
                
                this.updateStatus('Демонстрация экрана включена', 'success');
                
            } else {
                this.stopScreenShare();
            }
        } catch (error) {
            console.error('❌ Error with screen sharing:', error);
            this.updateStatus('Ошибка демонстрации экрана', 'error');
        }
    }
    
    async stopScreenShare() {
        try {
            // Get camera stream back
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            const videoTrack = cameraStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
            );
            
            if (sender) {
                await sender.replaceTrack(videoTrack);
            }
            
            this.localVideo.srcObject = cameraStream;
            this.localStream = cameraStream;
            this.isScreenSharing = false;
            this.shareScreenBtn.textContent = '🖥️';
            this.shareScreenBtn.classList.remove('disabled');
            
            this.updateStatus('Демонстрация экрана выключена', 'info');
            
        } catch (error) {
            console.error('❌ Error stopping screen share:', error);
        }
    }
    
    showJoinSection() {
        this.joinSection.style.display = 'block';
        this.callSection.style.display = 'none';
    }
    
    showCallSection() {
        this.joinSection.style.display = 'none';
        this.callSection.style.display = 'block';
        this.showWaitingMessage();
    }
    
    showWaitingMessage() {
        this.waitingMessage.style.display = 'block';
    }
    
    hideWaitingMessage() {
        this.waitingMessage.style.display = 'none';
    }
    
    updateStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        
        // Auto-hide success/info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                this.status.textContent = '';
                this.status.className = 'status';
            }, 3000);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const client = new WebRTCClient();
    console.log('🚀 WebRTC Video Calls initialized');
});
