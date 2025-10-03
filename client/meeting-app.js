class MeetingClient {
    constructor() {
        // Pre-join screen elements
        this.preJoinScreen = document.getElementById('preJoinScreen');
        this.previewVideo = document.getElementById('previewVideo');
        this.displayRoomId = document.getElementById('displayRoomId');
        this.joinNowBtn = document.getElementById('joinNowBtn');
        this.backHomeBtn = document.getElementById('backHomeBtn');
        this.previewToggleAudio = document.getElementById('previewToggleAudio');
        this.previewToggleVideo = document.getElementById('previewToggleVideo');
        
        // Meeting screen elements
        this.meetingScreen = document.getElementById('meetingScreen');
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.currentRoomId = document.getElementById('currentRoomId');
        this.participantCount = document.getElementById('participantCount');
        this.toggleAudioBtn = document.getElementById('toggleAudio');
        this.toggleVideoBtn = document.getElementById('toggleVideo');
        this.shareScreenBtn = document.getElementById('shareScreen');
        this.leaveMeetingBtn = document.getElementById('leaveMeetingBtn');
        this.copyMeetingLink = document.getElementById('copyMeetingLink');
        this.waitingMessage = document.getElementById('waitingMessage');
        this.toastContainer = document.getElementById('toastContainer');
        
        // State
        this.localStream = null;
        this.previewStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.websocket = null;
        this.currentRoom = null;
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.isScreenSharing = false;
        this.participantCounter = 1;
        
        this.init();
    }
    
    async init() {
        console.log('=== MeetingClient Init ===');
        console.log('Full URL:', window.location.href);
        console.log('Pathname:', window.location.pathname);
        
        // Get room ID from URL (supports /join/<ID> or ?room=<ID>)
        const params = new URLSearchParams(window.location.search);
        const queryRoom = params.get('room');
        const pathParts = window.location.pathname.split('/').filter(p => p);
        console.log('Path parts:', pathParts);
        
        // Extract room ID (should be after 'join') or from query
        const joinIndex = pathParts.indexOf('join');
        if (queryRoom) {
            this.currentRoom = queryRoom;
        } else if (joinIndex >= 0 && pathParts.length > joinIndex + 1) {
            this.currentRoom = pathParts[joinIndex + 1];
        } else {
            this.currentRoom = pathParts[pathParts.length - 1];
        }
        
        console.log('Extracted room ID:', this.currentRoom);
        
        if (!this.currentRoom || this.currentRoom === 'join' || this.currentRoom === 'meeting.html') {
            // Auto-generate a room ID and update URL without reloading
            const newRoom = this.generateRoomId();
            console.warn('Missing/invalid room ID. Creating one:', newRoom);
            this.currentRoom = newRoom;
            try {
                // Prefer /join/<ID> path if available
                const newUrl = `/join/${newRoom}`;
                window.history.replaceState(null, '', newUrl);
            } catch (e) {
                // Fallback to query param
                const url = new URL(window.location.href);
                url.searchParams.set('room', newRoom);
                window.history.replaceState(null, '', url.toString());
            }
        }
        
        console.log('Setting room ID to elements...');
        this.displayRoomId.textContent = this.currentRoom;
        this.currentRoomId.textContent = this.currentRoom;
        
        // Setup event listeners
        console.log('Setting up event listeners...');
        this.setupEventListeners();
        
        // Start preview
        console.log('Starting preview...');
        await this.startPreview();
    }
    
    setupEventListeners() {
        this.joinNowBtn.addEventListener('click', () => this.joinMeeting());
        this.backHomeBtn.addEventListener('click', () => window.location.href = '/');
        this.previewToggleAudio.addEventListener('click', () => this.togglePreviewAudio());
        this.previewToggleVideo.addEventListener('click', () => this.togglePreviewVideo());
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.shareScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        this.leaveMeetingBtn.addEventListener('click', () => this.leaveMeeting());
        this.copyMeetingLink.addEventListener('click', () => this.copyLink());
    }
    
    async startPreview() {
        try {
            console.log('Starting preview...');
            this.showToast('Getting camera access...', 'info');
            
            this.previewStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            console.log('Preview stream obtained:', this.previewStream);
            this.previewVideo.srcObject = this.previewStream;
            this.showToast('Ready to join', 'success');
            
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            // Keep join available; user can still enter the room and others can join
            this.previewStream = null;
            this.showToast('No camera/mic preview. You can still join.', 'warning');
        }
    }
    
    togglePreviewAudio() {
        if (this.previewStream) {
            const audioTrack = this.previewStream.getAudioTracks()[0];
            if (audioTrack) {
                this.isAudioEnabled = !this.isAudioEnabled;
                audioTrack.enabled = this.isAudioEnabled;
                this.previewToggleAudio.classList.toggle('disabled', !this.isAudioEnabled);
                this.previewToggleAudio.classList.toggle('active', this.isAudioEnabled);
            }
        }
    }
    
    togglePreviewVideo() {
        if (this.previewStream) {
            const videoTrack = this.previewStream.getVideoTracks()[0];
            if (videoTrack) {
                this.isVideoEnabled = !this.isVideoEnabled;
                videoTrack.enabled = this.isVideoEnabled;
                this.previewToggleVideo.classList.toggle('disabled', !this.isVideoEnabled);
                this.previewToggleVideo.classList.toggle('active', this.isVideoEnabled);
            }
        }
    }
    
    async joinMeeting() {
        try {
            console.log('Joining meeting...');
            this.showToast('Connecting to meeting...', 'info');
            
            // Use preview stream as local stream
            this.localStream = this.previewStream;
            if (this.localStream) {
                this.localVideo.srcObject = this.localStream;
            }
            
            // Setup peer connection
            this.setupPeerConnection();
            
            // Connect to signaling server
            this.connectWebSocket();
            
            // Switch to meeting screen
            this.preJoinScreen.style.display = 'none';
            this.meetingScreen.style.display = 'block';
            // Show waiting state until a peer appears
            this.showWaitingMessage();
            
            this.showToast('Connected to meeting', 'success');
            
        } catch (error) {
            console.error('❌ Error joining meeting:', error);
            this.showToast('Failed to join meeting', 'error');
        }
    }
    
    setupPeerConnection() {
        const iceServers = CURRENT_CONFIG.STUN_SERVERS.map(url => ({ urls: url }));
        
        // Add TURN servers for production
        if (CURRENT_CONFIG.TURN_SERVERS) {
            iceServers.push(...CURRENT_CONFIG.TURN_SERVERS);
        }
        
        const configuration = { iceServers };
        this.peerConnection = new RTCPeerConnection(configuration);
        
        // Add local tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.websocket) {
                this.websocket.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('📺 Received remote stream');
            this.remoteStream = event.streams[0];
            this.remoteVideo.srcObject = this.remoteStream;
            this.hideWaitingMessage();
            this.participantCounter = 2;
            this.updateParticipantCount();
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('🔗 Connection state:', this.peerConnection.connectionState);
            
            if (this.peerConnection.connectionState === 'connected') {
                this.showToast('Connection established', 'success');
            } else if (this.peerConnection.connectionState === 'disconnected') {
                this.showToast('Connection lost', 'warning');
            } else if (this.peerConnection.connectionState === 'failed') {
                this.showToast('Connection failed', 'error');
            }
        };
    }
    
    connectWebSocket() {
        // Prefer config, but if it's localhost while we are on HTTPS/public host, derive from current origin
        let wsUrl = (typeof CURRENT_CONFIG !== 'undefined' && CURRENT_CONFIG.WS_URL) ? CURRENT_CONFIG.WS_URL : '';
        const onHttpsHost = window.location.protocol === 'https:';
        const isLocalConfig = wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1');
        if (!wsUrl || (onHttpsHost && isLocalConfig)) {
            const proto = onHttpsHost ? 'wss' : 'ws';
            wsUrl = `${proto}://${window.location.host}`;
        }
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('🔌 WebSocket connected');
            this.websocket.send(JSON.stringify({
                type: 'join',
                room: this.currentRoom
            }));
            this.showToast('Connected to server', 'success');
        };
        
        this.websocket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
        };
        
        this.websocket.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            this.showToast('Server connection lost', 'error');
        };
        
        this.websocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.showToast('Connection error', 'error');
        };
    }
    
    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'user-joined':
                console.log('👤 User joined the room');
                this.showToast('Пользователь присоединился', 'info');
                await this.createOffer();
                break;
                
            case 'user-left':
                console.log('👤 User left the room');
                this.showToast('Пользователь покинул комнату', 'info');
                this.showWaitingMessage();
                this.remoteVideo.srcObject = null;
                this.participantCounter = 1;
                this.updateParticipantCount();
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
    
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                this.isAudioEnabled = !this.isAudioEnabled;
                audioTrack.enabled = this.isAudioEnabled;
                
                this.toggleAudioBtn.classList.toggle('disabled', !this.isAudioEnabled);
                this.toggleAudioBtn.classList.toggle('active', this.isAudioEnabled);
                
                this.showToast(
                    this.isAudioEnabled ? 'Microphone on' : 'Microphone off',
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
                
                this.toggleVideoBtn.classList.toggle('disabled', !this.isVideoEnabled);
                this.toggleVideoBtn.classList.toggle('active', this.isVideoEnabled);
                
                this.showToast(
                    this.isVideoEnabled ? 'Camera on' : 'Camera off',
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
                this.shareScreenBtn.classList.add('active');
                
                videoTrack.onended = () => {
                    this.stopScreenShare();
                };
                
                this.showToast('Screen sharing started', 'success');
                
            } else {
                this.stopScreenShare();
            }
        } catch (error) {
            console.error('❌ Error with screen sharing:', error);
            this.showToast('Ошибка демонстрации экрана', 'error');
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
            this.shareScreenBtn.classList.remove('active');
            
            this.showToast('Демонстрация экрана выключена', 'info');
            
        } catch (error) {
            console.error('❌ Error stopping screen share:', error);
        }
    }
    
    getShareLink() {
        // Always construct absolute URL so anyone can join from any device
        return `${window.location.origin}/join/${this.currentRoom}`;
    }

    async copyLink() {
        try {
            const meetingUrl = this.getShareLink();
            // Try native share first
            if (navigator.share) {
                try {
                    await navigator.share({ title: 'Join my meeting', text: 'Join the meeting', url: meetingUrl });
                    this.showToast('Ссылка отправлена через системное меню', 'success');
                    return;
                } catch (_) { /* fall through to copy */ }
            }
            await navigator.clipboard.writeText(meetingUrl);
            
            this.showToast('Ссылка скопирована в буфер обмена', 'success');
            
            // Visual feedback
            const originalText = this.copyMeetingLink.textContent;
            this.copyMeetingLink.textContent = '✅';
            
            setTimeout(() => {
                this.copyMeetingLink.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error copying link:', error);
            this.showToast('Ошибка копирования ссылки', 'error');
        }
    }
    
    leaveMeeting() {
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
        
        if (this.previewStream) {
            this.previewStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        // Redirect to home
        window.location.href = '/';
    }
    
    showWaitingMessage() {
        if (this.waitingMessage) {
            this.waitingMessage.style.display = 'flex';
        }
    }
    
    hideWaitingMessage() {
        if (this.waitingMessage) {
            this.waitingMessage.style.display = 'none';
        }
    }

    generateRoomId() {
        // 6-char alphanumeric uppercase room id
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    updateParticipantCount() {
        const text = this.participantCounter === 1 ? '1 участник' : `${this.participantCounter} участника`;
        this.participantCount.textContent = text;
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const meetingClient = new MeetingClient();
    console.log('🎥 Meeting client initialized');
});
