class MeetingManager {
    constructor() {
        // Friends
        this.friendsListEl = document.getElementById('friendsList');
        this.friends = [];

        // Optional legacy elements (may be absent)
        this.newMeetingBtn = document.getElementById('newMeetingBtn');
        this.joinMeetingBtn = document.getElementById('joinMeetingBtn');
        this.joinMeetingSubmit = document.getElementById('joinMeetingSubmit');
        this.meetingIdInput = document.getElementById('meetingIdInput');
        
        // Join modal
        this.joinModal = document.getElementById('joinModal');
        this.closeJoinModal = document.getElementById('closeJoinModal');
        this.joinModalOverlay = document.getElementById('joinModalOverlay');
        
        // Meeting created modal
        this.meetingModal = document.getElementById('meetingModal');
        this.closeModal = document.getElementById('closeModal');
        this.meetingModalOverlay = document.getElementById('meetingModalOverlay');
        this.meetingLink = document.getElementById('meetingLink');
        this.meetingId = document.getElementById('meetingId');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
        this.startMeetingBtn = document.getElementById('startMeetingBtn');
        
        // Recent calls
        this.recentCallsList = document.getElementById('recentCallsList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        // Sidebar tabs + search
        this.tabRecent = document.getElementById('tabRecent');
        this.tabContacts = document.getElementById('tabContacts');
        this.contactSearch = document.getElementById('contactSearch');
        this.inviteBtn = document.getElementById('inviteBtn');
        // Invite modal elements
        this.inviteModal = document.getElementById('inviteModal');
        this.inviteOverlay = document.getElementById('inviteOverlay');
        this.closeInviteModal = document.getElementById('closeInviteModal');
        this.inviteUserId = document.getElementById('inviteUserId');
        this.inviteLink = document.getElementById('inviteLink');
        this.copyInviteBtn = document.getElementById('copyInviteBtn');
        this.shareInviteBtn = document.getElementById('shareInviteBtn');
        this.showQrBtn = document.getElementById('showQrBtn');
        this.inviteQrWrap = document.getElementById('inviteQrWrap');
        this.inviteQrImg = document.getElementById('inviteQrImg');
        
        this.toastContainer = document.getElementById('toastContainer');
        // Inline call modal elements
        this.homeCallModal = document.getElementById('homeCallModal');
        this.homeCallOverlay = document.getElementById('homeCallOverlay');
        this.homeEndCallBtn = document.getElementById('homeEndCallBtn') || document.getElementById('homeHangupBtn');
        this.homeLocalVideo = document.getElementById('homeLocalVideo');
        this.homeRemoteVideo = document.getElementById('homeRemoteVideo');
        // New call controls UI
        this.homeMuteBtn = document.getElementById('homeMuteBtn');
        this.homeVideoBtn = document.getElementById('homeVideoBtn');
        this.homeHangupBtn = document.getElementById('homeHangupBtn');
        this.homeScreenBtn = document.getElementById('homeScreenBtn');
        this.homeSettingsBtn = document.getElementById('homeSettingsBtn');
        this.homeCalleeName = document.getElementById('homeCalleeName');
        this.homeCalleeAvatar = document.getElementById('homeCalleeAvatar');
        this.homeCalleeStatus = document.getElementById('homeCalleeStatus');
        this.homeCallTimer = document.getElementById('homeCallTimer');
        
        this.currentMeetingData = null;
        this.selectedFriend = null;
        // Inline call state
        this.ws = null;
        this.currentUserId = null;
        this.inlinePeer = null;
        this.inlineLocalStream = null;
        this.inlineRemoteStream = null;
        this.inlineAudioOn = true;
        this.inlineVideoOn = true;
        this.inlineTimer = null;
        this.inlineStartTs = null;
        
        this.setupEventListeners();
        this.initIdentity();
        this.loadFriends();
        this.loadRecentCalls();
    }
    
    setupEventListeners() {
        if (this.newMeetingBtn) this.newMeetingBtn.addEventListener('click', () => this.createNewMeeting());
        if (this.joinMeetingBtn) this.joinMeetingBtn.addEventListener('click', () => this.showJoinModal());
        if (this.joinMeetingSubmit) this.joinMeetingSubmit.addEventListener('click', () => this.joinMeeting());
        
        // Join modal
        if (this.closeJoinModal) this.closeJoinModal.addEventListener('click', () => this.closeJoinModalWindow());
        if (this.joinModalOverlay) this.joinModalOverlay.addEventListener('click', () => this.closeJoinModalWindow());
        
        // Meeting modal
        if (this.closeModal) this.closeModal.addEventListener('click', () => this.closeMeetingModalWindow());
        if (this.meetingModalOverlay) this.meetingModalOverlay.addEventListener('click', () => this.closeMeetingModalWindow());
        if (this.copyLinkBtn) this.copyLinkBtn.addEventListener('click', () => this.copyMeetingLink());
        if (this.startMeetingBtn) this.startMeetingBtn.addEventListener('click', () => this.startMeeting());
        
        // Enter key support
        if (this.meetingIdInput) {
            this.meetingIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.joinMeeting();
            });
        }
        
        // Auto-detect and format meeting links
        if (this.meetingIdInput) {
            this.meetingIdInput.addEventListener('input', (e) => {
                this.formatMeetingInput(e.target.value);
            });
        }
        
        // Clear history
        if (this.clearHistoryBtn) this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Inline call modal listeners
        if (this.homeCallOverlay) this.homeCallOverlay.addEventListener('click', () => this.endInlineCall());
        if (this.homeEndCallBtn) this.homeEndCallBtn.addEventListener('click', () => this.endInlineCall());
        if (this.homeMuteBtn) this.homeMuteBtn.addEventListener('click', () => this.toggleInlineAudio());
        if (this.homeVideoBtn) this.homeVideoBtn.addEventListener('click', () => this.toggleInlineVideo());
        if (this.homeHangupBtn) this.homeHangupBtn.addEventListener('click', () => this.endInlineCall());
        if (this.homeScreenBtn) this.homeScreenBtn.addEventListener('click', () => this.toggleScreenShare());

        // Tabs switching
        if (this.tabRecent && this.tabContacts) {
            this.tabRecent.addEventListener('click', () => this.switchTab('recent'));
            this.tabContacts.addEventListener('click', () => this.switchTab('contacts'));
        }

        // Search
        if (this.contactSearch) {
            this.contactSearch.addEventListener('input', (e) => this.applySearchFilter(e.target.value));
        }
        // Invite link
        if (this.inviteBtn) {
            this.inviteBtn.addEventListener('click', () => this.openInviteModal());
        }
        if (this.inviteOverlay) this.inviteOverlay.addEventListener('click', () => this.hideInviteModal());
        if (this.closeInviteModal) this.closeInviteModal.addEventListener('click', () => this.hideInviteModal());
        if (this.inviteUserId) this.inviteUserId.addEventListener('input', () => this.updateInviteLink());
        if (this.copyInviteBtn) this.copyInviteBtn.addEventListener('click', () => this.copyInvite());
        if (this.shareInviteBtn) this.shareInviteBtn.addEventListener('click', () => this.shareInvite());
        if (this.showQrBtn) this.showQrBtn.addEventListener('click', () => this.toggleInviteQr());
    }

    openInviteModal() {
        if (!this.inviteModal) return;
        // Pre-fill with last used friend id if focused card exists later
        this.updateInviteLink();
        this.inviteModal.style.display = 'flex';
        setTimeout(() => this.inviteUserId?.focus(), 50);
    }
    hideInviteModal() { if (this.inviteModal) this.inviteModal.style.display = 'none'; }
    currentBaseUrl() { return location.origin || (location.protocol + '//' + location.host); }
    buildInviteUrl() {
        const id = (this.inviteUserId?.value || '').trim();
        return id ? `${this.currentBaseUrl()}/?user=${encodeURIComponent(id)}` : `${this.currentBaseUrl()}/`;
    }
    updateInviteLink() {
        const url = this.buildInviteUrl();
        if (this.inviteLink) this.inviteLink.value = url;
        if (this.inviteQrImg && this.inviteQrWrap?.style.display !== 'none') {
            this.inviteQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        }
    }
    async copyInvite() {
        const url = this.buildInviteUrl();
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('Invite link copied to clipboard', 'success');
        } catch {
            const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
            this.showToast('Invite link copied', 'success');
        }
    }
    async shareInvite() {
        const url = this.buildInviteUrl();
        if (navigator.share) {
            try {
                await navigator.share({ title: 'CallSpace', text: 'Join me on CallSpace', url });
            } catch {}
        } else {
            this.copyInvite();
        }
    }
    toggleInviteQr() {
        if (!this.inviteQrWrap) return;
        const isShown = this.inviteQrWrap.style.display !== 'none';
        if (isShown) {
            this.inviteQrWrap.style.display = 'none';
        } else {
            const url = this.buildInviteUrl();
            if (this.inviteQrImg) this.inviteQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
            this.inviteQrWrap.style.display = '';
        }
    }

    switchTab(which) {
        if (which === 'recent') {
            this.tabRecent?.classList.add('active');
            this.tabContacts?.classList.remove('active');
            if (this.recentCallsList) this.recentCallsList.style.display = '';
            if (this.friendsListEl) this.friendsListEl.style.display = 'none';
        } else {
            this.tabContacts?.classList.add('active');
            this.tabRecent?.classList.remove('active');
            if (this.friendsListEl) this.friendsListEl.style.display = '';
            if (this.recentCallsList) this.recentCallsList.style.display = 'none';
        }
    }

    applySearchFilter(query) {
        const q = (query || '').trim().toLowerCase();
        // Filter contacts
        if (this.friendsListEl) {
            Array.from(this.friendsListEl.children).forEach(el => {
                const text = el.textContent?.toLowerCase() || '';
                el.style.display = text.includes(q) ? '' : 'none';
            });
        }
        // Filter recent calls
        if (this.recentCallsList) {
            Array.from(this.recentCallsList.children).forEach(el => {
                const text = el.textContent?.toLowerCase() || '';
                el.style.display = text.includes(q) ? '' : 'none';
            });
        }
    }

    // Identity (reuse same approach as messenger)
    initIdentity() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const q = (urlParams.get('user') || '').trim();
            const fromStorage = (localStorage.getItem('messenger_user_id') || '').trim();
            let chosen = q || fromStorage || '';
            if (!chosen) {
                chosen = prompt('Enter your user ID (e.g., demo1, demo2):', '') || '';
            }
            if (!chosen) {
                this.showToast('User ID is required to start a call', 'error');
                return;
            }
            this.currentUserId = chosen;
            localStorage.setItem('messenger_user_id', chosen);
        } catch {}
    }

    ensureWs() {
        return new Promise((resolve) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) return resolve();
            const wsUrl = (window.CURRENT_CONFIG && CURRENT_CONFIG.WS_URL) ? CURRENT_CONFIG.WS_URL : (location.protocol === 'https:' ? `wss://${location.host}` : `ws://${location.host}`);
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = () => {
                if (this.currentUserId) {
                    this.ws.send(JSON.stringify({ type: 'register', userId: this.currentUserId }));
                }
                resolve();
            };
            this.ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'call-answer') {
                    if (this.inlinePeer) await this.inlinePeer.setRemoteDescription(new RTCSessionDescription(msg.answer));
                } else if (msg.type === 'ice-candidate') {
                    if (this.inlinePeer && msg.candidate) await this.inlinePeer.addIceCandidate(new RTCIceCandidate(msg.candidate));
                } else if (msg.type === 'call-end') {
                    this.endInlineCall();
                }
            };
            this.ws.onclose = () => { /* no-op */ };
            this.ws.onerror = () => { /* no-op */ };
        });
        // Apply current search filter if any
        if (this.contactSearch && this.contactSearch.value) {
            this.applySearchFilter(this.contactSearch.value);
        }
    }

    async startInlineCall(friendId, callType) {
        try {
            if (!this.currentUserId) this.initIdentity();
            if (!this.currentUserId) {
                // user canceled entering id
                return;
            }
            await this.ensureWs();

            // Acquire media
            // Preflight: check API presence
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Media devices are not available in this context (use HTTPS or localhost).');
            }
            this.inlineLocalStream = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true
            });
            this.homeLocalVideo.srcObject = this.inlineLocalStream;

            // Peer connection
            const iceServers = (window.CURRENT_CONFIG && CURRENT_CONFIG.STUN_SERVERS) ? CURRENT_CONFIG.STUN_SERVERS.map(u => ({ urls: u })) : [{ urls: 'stun:stun.l.google.com:19302' }];
            if (window.CURRENT_CONFIG && CURRENT_CONFIG.TURN_SERVERS) iceServers.push(...CURRENT_CONFIG.TURN_SERVERS);
            this.inlinePeer = new RTCPeerConnection({ iceServers });
            this.inlineLocalStream.getTracks().forEach(t => this.inlinePeer.addTrack(t, this.inlineLocalStream));

            this.inlinePeer.ontrack = (ev) => {
                this.inlineRemoteStream = ev.streams[0];
                this.homeRemoteVideo.srcObject = this.inlineRemoteStream;
                this.setCalleeStatus('Connected');
                this.startTimer();
            };
            this.inlinePeer.onicecandidate = (ev) => {
                if (ev.candidate && this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'ice-candidate-user', to: friendId, candidate: ev.candidate }));
                }
            };

            // Offer
            const offer = await this.inlinePeer.createOffer();
            await this.inlinePeer.setLocalDescription(offer);

            // Show modal
            if (this.homeCallModal) this.homeCallModal.style.display = 'flex';
            const card = document.querySelector('.call-card');
            if (card) {
                if (callType === 'voice') card.classList.add('voice'); else card.classList.remove('voice');
            }
            // UI callee meta
            const friend = (this.friends || []).find(f => f.id === friendId) || { id: friendId, name: friendId, avatar: (friendId || 'US').substring(0,2).toUpperCase() };
            if (this.homeCalleeName) this.homeCalleeName.textContent = friend.name || friend.id;
            if (this.homeCalleeAvatar) this.homeCalleeAvatar.textContent = (friend.avatar || friend.name || friend.id || 'U').substring(0,2).toUpperCase();
            this.setCalleeStatus('Calling…');
            this.resetTimer();

            // Send call-request
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'call-request', to: friendId, from: this.currentUserId, callType, offer }));
            }
            this.showToast('Calling...', 'info');
        } catch (e) {
            console.error('Inline call error:', e);
            const msg = (e && e.message) ? e.message : 'Failed to start call';
            this.showToast(msg, 'error');
            this.endInlineCall();
        }
    }

    endInlineCall() {
        try {
            if (this.inlineLocalStream) { this.inlineLocalStream.getTracks().forEach(t => t.stop()); this.inlineLocalStream = null; }
            if (this.inlinePeer) { this.inlinePeer.close(); this.inlinePeer = null; }
            if (this.homeCallModal) this.homeCallModal.style.display = 'none';
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'call-end', to: this.selectedFriend ? this.selectedFriend.id : undefined, from: this.currentUserId }));
            }
            this.resetTimer();
        } catch {}
    }

    toggleInlineAudio() {
        if (!this.inlineLocalStream) return;
        const track = this.inlineLocalStream.getAudioTracks()[0];
        if (!track) return;
        this.inlineAudioOn = !this.inlineAudioOn;
        track.enabled = this.inlineAudioOn;
        this.showToast(this.inlineAudioOn ? 'Microphone on' : 'Microphone off', 'info');
    }

    toggleInlineVideo() {
        if (!this.inlineLocalStream) return;
        const track = this.inlineLocalStream.getVideoTracks()[0];
        if (!track) return;
        this.inlineVideoOn = !this.inlineVideoOn;
        track.enabled = this.inlineVideoOn;
        this.showToast(this.inlineVideoOn ? 'Camera on' : 'Camera off', 'info');
    }

    async toggleScreenShare() {
        try {
            if (!this.inlinePeer) return;
            const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = display.getVideoTracks()[0];
            const sender = this.inlinePeer.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) await sender.replaceTrack(screenTrack);
            screenTrack.onended = async () => {
                // revert to camera
                if (this.inlineLocalStream) {
                    const camTrack = this.inlineLocalStream.getVideoTracks()[0];
                    if (camTrack && sender) await sender.replaceTrack(camTrack);
                }
            };
        } catch (e) {
            console.warn('Screen share failed:', e);
        }
    }

    setCalleeStatus(text) { if (this.homeCalleeStatus) this.homeCalleeStatus.textContent = text; }
    resetTimer() { if (this.inlineTimer) { clearInterval(this.inlineTimer); this.inlineTimer = null; } this.inlineStartTs = null; if (this.homeCallTimer) this.homeCallTimer.textContent = '00:00'; }
    startTimer() {
        if (this.inlineTimer) return;
        this.inlineStartTs = Date.now();
        this.inlineTimer = setInterval(() => {
            const sec = Math.floor((Date.now() - this.inlineStartTs) / 1000);
            const mm = String(Math.floor(sec / 60)).padStart(2,'0');
            const ss = String(sec % 60).padStart(2,'0');
            if (this.homeCallTimer) this.homeCallTimer.textContent = `${mm}:${ss}`;
        }, 1000);
    }

    // Friends UI
    async loadFriends() {
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
        if (!this.friendsListEl) return;
        if (!this.friends || this.friends.length === 0) return;
        this.friendsListEl.innerHTML = '';
        this.friends.forEach(friend => {
            const item = document.createElement('div');
            item.className = 'call-item';
            item.innerHTML = `
                <div class="call-avatar">${friend.avatar}</div>
                <div class="call-info">
                    <div class="call-id">${friend.name}</div>
                    <div class="call-time">${friend.online ? 'online' : 'offline'}</div>
                </div>
                <div class="call-actions">
                    <button class="call-action-btn voice" title="Audio call">🔊</button>
                    <button class="call-action-btn video" title="Video call">🎥</button>
                </div>
            `;

            // Click on row -> open chat in messenger
            item.addEventListener('click', (e) => {
                if ((e.target.closest && e.target.closest('.call-action-btn'))) return; // ignore when pressing buttons
                window.location.href = '/messenger.html';
            });

            // Audio call button
            item.querySelector('.call-action-btn.voice').addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedFriend = friend;
                this.startInlineCall(friend.id, 'voice');
            });
            // Video call button
            item.querySelector('.call-action-btn.video').addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedFriend = friend;
                this.startInlineCall(friend.id, 'video');
            });
            this.friendsListEl.appendChild(item);
        });
    }
    
    async createNewMeeting() {
        try {
            this.showToast('Creating meeting...', 'info');
            
            const response = await fetch('/api/create-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to create meeting');
            }
            
            const meetingData = await response.json();
            this.currentMeetingData = meetingData;
            
            this.showMeetingModal(meetingData);
            this.showToast('Meeting created successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating meeting:', error);
            this.showToast('Failed to create meeting', 'error');
        }
    }
    
    showJoinModal() {
        this.joinModal.style.display = 'flex';
        setTimeout(() => this.meetingIdInput.focus(), 100);
    }
    
    closeJoinModalWindow() {
        this.joinModal.style.display = 'none';
        this.meetingIdInput.value = '';
    }
    
    showMeetingModal(meetingData) {
        // Force HTTPS for Railway deployment
        const httpsUrl = meetingData.meetingUrl.replace('http://', 'https://');
        this.meetingLink.value = httpsUrl;
        this.meetingId.textContent = meetingData.roomId;
        this.meetingModal.style.display = 'flex';
    }
    
    closeMeetingModalWindow() {
        this.meetingModal.style.display = 'none';
    }
    
    async copyMeetingLink() {
        try {
            await navigator.clipboard.writeText(this.meetingLink.value);
            this.showToast('Link copied to clipboard', 'success');
            
        } catch (error) {
            // Fallback for older browsers
            this.meetingLink.select();
            document.execCommand('copy');
            this.showToast('Link copied', 'success');
        }
    }
    
    startMeeting() {
        if (this.currentMeetingData) {
            this.addCallToHistory(this.currentMeetingData.roomId);
            // Force HTTPS for Railway deployment
            const httpsUrl = this.currentMeetingData.meetingUrl.replace('http://', 'https://');
            window.location.href = httpsUrl;
        }
    }
    
    
    formatMeetingInput(value) {
        // Extract room ID from various formats
        const cleanValue = value.trim();
        
        // If it's a full URL, extract the room ID
        const urlMatch = cleanValue.match(/\/join\/([A-Z0-9]+)/i);
        if (urlMatch) {
            this.meetingIdInput.value = urlMatch[1].toUpperCase();
            return;
        }
        
        // If it's just an ID, format it
        if (cleanValue.match(/^[a-z0-9]+$/i)) {
            this.meetingIdInput.value = cleanValue.toUpperCase();
        }
    }
    
    async joinMeeting() {
        const input = this.meetingIdInput.value.trim();
        if (!input) {
            this.showToast('Please enter a meeting ID or link', 'error');
            return;
        }
        
        try {
            let roomId = input;
            
            // Extract room ID from URL if needed
            const urlMatch = input.match(/\/join\/([A-Z0-9]+)/i);
            if (urlMatch) {
                roomId = urlMatch[1];
            }
            
            // Validate room ID format
            if (!roomId.match(/^[A-Z0-9]{6}$/i)) {
                this.showToast('Invalid meeting ID format', 'error');
                return;
            }
            
            this.showToast('Joining meeting...', 'info');
            
            // Check if room exists (optional)
            const response = await fetch(`/api/room/${roomId}`);
            const roomInfo = await response.json();
            
            // Add to history
            this.addCallToHistory(roomId.toUpperCase());
            
            // Redirect to meeting room
            window.location.href = `/join/${roomId.toUpperCase()}`;
            
        } catch (error) {
            console.error('Error joining meeting:', error);
            this.showToast('Failed to join meeting', 'error');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Recent calls management
    loadRecentCalls() {
        const calls = this.getCallHistory();
        this.renderCalls(calls);
    }
    
    getCallHistory() {
        const history = localStorage.getItem('callHistory');
        return history ? JSON.parse(history) : [];
    }
    
    saveCallHistory(calls) {
        localStorage.setItem('callHistory', JSON.stringify(calls));
    }
    
    addCallToHistory(roomId) {
        const calls = this.getCallHistory();
        const newCall = {
            id: roomId,
            timestamp: Date.now()
        };
        
        // Remove duplicate if exists
        const filtered = calls.filter(call => call.id !== roomId);
        
        // Add to beginning
        filtered.unshift(newCall);
        
        // Keep only last 10 calls
        const limited = filtered.slice(0, 10);
        
        this.saveCallHistory(limited);
        this.renderCalls(limited);
    }
    
    renderCalls(calls) {
        if (calls.length === 0) {
            this.recentCallsList.innerHTML = `
                <div class="empty-calls">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="24" fill="#F3F4F6"/>
                        <path d="M24 16V24M24 28H24.01M38 24C38 31.732 31.732 38 24 38C16.268 38 10 31.732 10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24Z" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>No recent calls</p>
                    <small>Your call history will appear here</small>
                </div>
            `;
            return;
        }
        
        this.recentCallsList.innerHTML = calls.map(call => {
            const timeAgo = this.getTimeAgo(call.timestamp);
            return `
                <div class="call-item" data-room-id="${call.id}">
                    <div class="call-avatar">${call.id.substring(0, 2)}</div>
                    <div class="call-info">
                        <div class="call-id">Meeting ${call.id}</div>
                        <div class="call-time">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1V6L8.5 8.5M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${timeAgo}
                        </div>
                    </div>
                    <div class="call-actions">
                        <button class="call-action-btn rejoin" title="Rejoin">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13.3333 5.33333L16 8M16 8L13.3333 10.6667M16 8H6.66667M10 13.3333H3.33333C2.59695 13.3333 2 12.7364 2 12V4C2 3.26362 2.59695 2.66667 3.33333 2.66667H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="call-action-btn delete" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners
        document.querySelectorAll('.call-item').forEach(item => {
            const roomId = item.dataset.roomId;
            
            item.querySelector('.rejoin').addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `/join/${roomId}`;
            });
            
            item.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCall(roomId);
            });
            
            item.addEventListener('click', () => {
                window.location.href = `/join/${roomId}`;
            });
        });
    }
    
    deleteCall(roomId) {
        const calls = this.getCallHistory();
        const filtered = calls.filter(call => call.id !== roomId);
        this.saveCallHistory(filtered);
        this.renderCalls(filtered);
        this.showToast('Call removed from history', 'success');
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all call history?')) {
            this.saveCallHistory([]);
            this.renderCalls([]);
            this.showToast('Call history cleared', 'success');
        }
    }
    
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }
}

// Auto-join if URL contains room ID
function checkAutoJoin() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId) {
        // Redirect to meeting room
        window.location.href = `/join/${roomId}`;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const meetingManager = new MeetingManager();
    checkAutoJoin();
    console.log('🏠 Home page initialized');
});
