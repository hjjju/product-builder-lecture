const chatElements = Array.from(document.querySelectorAll('[data-chat]'));
const chatPlaceholderElements = Array.from(document.querySelectorAll('[data-chat-placeholder]'));

const chatMessages = document.getElementById('chat-messages');
const chatEmpty = document.getElementById('chat-empty');
const chatForm = document.getElementById('chat-form');
const chatMessageInput = document.getElementById('chat-message');
const chatRoomInput = document.getElementById('chat-room');
const chatNameInput = document.getElementById('chat-name');
const chatJoinButton = document.getElementById('chat-join');
const chatServerUrlInput = document.getElementById('chat-server-url');
const chatServerApplyButton = document.getElementById('chat-server-apply');
const chatStatusText = document.getElementById('chat-status-text');
const chatRoomBadge = document.getElementById('chat-room-badge');

const CHAT_TEXT = {
    en: {
        titlebar: 'Retro OS · Live Chat',
        title: 'Live Chat',
        subtitle: 'Share quick ideas with real-time messages.',
        roomLabel: 'Room',
        roomPlaceholder: 'lobby',
        nameLabel: 'Display name',
        namePlaceholder: 'Guest',
        joinButton: 'Join',
        serverLabel: 'WebSocket URL',
        serverPlaceholder: 'wss://chat.example.com',
        serverApply: 'Apply',
        statusLabel: 'Status',
        statusLocal: 'Local realtime (same browser)',
        statusConnecting: 'Connecting…',
        statusConnected: 'Connected',
        statusOffline: 'Offline — using local mode',
        empty: 'No messages yet.',
        messageLabel: 'Message',
        messagePlaceholder: 'Write a message',
        sendButton: 'Send',
        tipsTitle: 'Tips',
        tip1: 'Keep it friendly and concise.',
        tip2: 'Press Enter to send, Shift+Enter for a new line.',
        tip3: 'Change room names to split topics.',
        note: 'Set a WebSocket server URL to sync across devices.'
    },
    ko: {
        titlebar: 'Retro OS · Live Chat',
        title: '실시간 채팅',
        subtitle: '아이디어를 빠르게 나누는 실시간 대화 공간입니다.',
        roomLabel: '방 이름',
        roomPlaceholder: 'lobby',
        nameLabel: '닉네임',
        namePlaceholder: 'Guest',
        joinButton: '참여',
        serverLabel: 'WebSocket URL',
        serverPlaceholder: 'wss://chat.example.com',
        serverApply: '적용',
        statusLabel: '상태',
        statusLocal: '브라우저 탭 실시간',
        statusConnecting: '연결 중…',
        statusConnected: '연결됨',
        statusOffline: '오프라인 — 로컬 모드',
        empty: '아직 메시지가 없어요.',
        messageLabel: '메시지',
        messagePlaceholder: '메시지를 입력하세요',
        sendButton: '보내기',
        tipsTitle: '이용 팁',
        tip1: '간단하고 친근한 메시지를 남겨주세요.',
        tip2: 'Enter 키로 전송, Shift+Enter로 줄바꿈이 됩니다.',
        tip3: '방 이름을 바꾸면 주제가 분리됩니다.',
        note: '멀티 기기 동기화를 위해서는 WebSocket 서버 주소를 설정해 주세요.'
    },
    ja: {
        titlebar: 'Retro OS · Live Chat',
        title: 'リアルタイムチャット',
        subtitle: 'アイデアをすぐに共有できるチャットです。',
        roomLabel: 'ルーム',
        roomPlaceholder: 'lobby',
        nameLabel: '表示名',
        namePlaceholder: 'Guest',
        joinButton: '参加',
        serverLabel: 'WebSocket URL',
        serverPlaceholder: 'wss://chat.example.com',
        serverApply: '適用',
        statusLabel: 'ステータス',
        statusLocal: '同一ブラウザ内のリアルタイム',
        statusConnecting: '接続中…',
        statusConnected: '接続済み',
        statusOffline: 'オフライン — ローカルモード',
        empty: 'まだメッセージがありません。',
        messageLabel: 'メッセージ',
        messagePlaceholder: 'メッセージを入力',
        sendButton: '送信',
        tipsTitle: '使い方のヒント',
        tip1: '短く丁寧なメッセージがおすすめです。',
        tip2: 'Enterで送信、Shift+Enterで改行。',
        tip3: 'ルーム名を変えると話題を分けられます。',
        note: '複数端末で同期するには WebSocket サーバーURL を設定してください。'
    }
};

const normalizeServerUrl = (value) => {
    const text = (value || '').trim();
    if (!text) return '';
    if (text.startsWith('ws://') || text.startsWith('wss://')) {
        return text;
    }
    if (text.startsWith('http://')) {
        return `ws://${text.slice('http://'.length)}`;
    }
    if (text.startsWith('https://')) {
        return `wss://${text.slice('https://'.length)}`;
    }
    return '';
};

const resolveInitialServerUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const queryServer = normalizeServerUrl(params.get('ws'));
    if (queryServer) {
        localStorage.setItem('chatServerUrl', queryServer);
        return queryServer;
    }

    const storedServer = normalizeServerUrl(localStorage.getItem('chatServerUrl'));
    if (storedServer) {
        return storedServer;
    }

    const presetServer = normalizeServerUrl(window.CHAT_SERVER_URL);
    if (presetServer) {
        return presetServer;
    }

    const host = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'ws://localhost:8080';
    }
    if (host.endsWith('.pages.dev')) {
        return `${protocol}//${window.location.host}/ws`;
    }

    return '';
};

const state = {
    language: localStorage.getItem('language') || 'en',
    room: localStorage.getItem('chatRoom') || 'lobby',
    name: localStorage.getItem('chatName') || '',
    serverUrl: resolveInitialServerUrl(),
    statusKey: 'statusLocal',
    channel: null,
    socket: null,
    seenIds: new Set()
};

const MAX_MESSAGES = 150;

const getTranslations = () => CHAT_TEXT[state.language] || CHAT_TEXT.en;

const applyChatLanguage = () => {
    const text = getTranslations();
    chatElements.forEach(element => {
        const key = element.getAttribute('data-chat');
        if (text[key]) {
            element.textContent = text[key];
        }
    });
    chatPlaceholderElements.forEach(element => {
        const key = element.getAttribute('data-chat-placeholder');
        if (text[key]) {
            element.setAttribute('placeholder', text[key]);
        }
    });
    setStatus(state.statusKey);
};

const setStatus = (key) => {
    state.statusKey = key;
    const text = getTranslations();
    if (chatStatusText && text[key]) {
        chatStatusText.textContent = text[key];
    }
};

const sanitizeMessage = (value) => value.replace(/\s+/g, ' ').trim();

const formatTime = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const addMessage = ({ id, name, text, timestamp, system }) => {
    if (!chatMessages) return;

    if (id && state.seenIds.has(id)) {
        return;
    }

    if (id) {
        state.seenIds.add(id);
        if (state.seenIds.size > 300) {
            const entries = Array.from(state.seenIds);
            state.seenIds = new Set(entries.slice(entries.length - 200));
        }
    }

    if (chatEmpty) {
        chatEmpty.style.display = 'none';
    }

    const messageItem = document.createElement('li');
    const isSelf = !system && name && state.name && name === state.name;
    messageItem.className = system ? 'chat-message chat-system' : isSelf ? 'chat-message chat-self' : 'chat-message';

    const meta = document.createElement('span');
    meta.className = 'chat-meta';
    const time = formatTime(timestamp);
    meta.textContent = system ? `${time} · system` : `${name || 'Guest'} · ${time}`;

    const body = document.createElement('p');
    body.className = 'chat-text';
    body.textContent = text;

    messageItem.appendChild(meta);
    messageItem.appendChild(body);
    chatMessages.appendChild(messageItem);

    while (chatMessages.children.length > MAX_MESSAGES) {
        chatMessages.removeChild(chatMessages.firstChild);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const connectLocalChannel = () => {
    if (state.channel) state.channel.close();

    const channel = new BroadcastChannel(`retro-chat-${state.room}`);
    state.channel = channel;
    setStatus('statusLocal');

    channel.addEventListener('message', (event) => {
        const payload = event.data || {};
        if (payload.type === 'message') {
            addMessage(payload);
        }
    });
};

const closeLocalChannel = () => {
    if (state.channel) {
        state.channel.close();
        state.channel = null;
    }
};

const closeSocket = () => {
    if (state.socket) {
        state.socket.close();
        state.socket = null;
    }
};

const connectWebSocket = () => {
    const serverUrl = state.serverUrl;
    closeSocket();
    closeLocalChannel();

    if (!serverUrl) {
        connectLocalChannel();
        return;
    }

    setStatus('statusConnecting');

    try {
        const wsUrl = (() => {
            try {
                const url = new URL(serverUrl);
                url.searchParams.set('room', state.room);
                return url.toString();
            } catch (error) {
                return serverUrl;
            }
        })();
        const socket = new WebSocket(wsUrl);
        state.socket = socket;

        socket.addEventListener('open', () => {
            setStatus('statusConnected');
            socket.send(JSON.stringify({
                type: 'join',
                room: state.room,
                name: state.name
            }));
        });

        socket.addEventListener('message', (event) => {
            let payload;
            try {
                payload = JSON.parse(event.data);
            } catch (error) {
                return;
            }
            if (payload.type === 'message') {
                addMessage(payload);
            }
        });

        socket.addEventListener('close', () => {
            setStatus('statusOffline');
            connectLocalChannel();
        });

        socket.addEventListener('error', () => {
            setStatus('statusOffline');
            connectLocalChannel();
        });
    } catch (error) {
        setStatus('statusOffline');
        connectLocalChannel();
    }
};

const resetChat = () => {
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    if (chatEmpty) {
        chatEmpty.style.display = 'block';
    }
};

const updateRoom = () => {
    const nextRoom = sanitizeMessage(chatRoomInput.value) || 'lobby';
    state.room = nextRoom;
    localStorage.setItem('chatRoom', nextRoom);
    chatRoomInput.value = nextRoom;
    if (chatRoomBadge) {
        chatRoomBadge.textContent = `#${nextRoom}`;
    }
    resetChat();
    connectWebSocket();
    addMessage({
        id: `system-${Date.now()}`,
        name: 'system',
        text: `Joined #${nextRoom}`,
        timestamp: Date.now(),
        system: true
    });
};

const updateName = () => {
    const nextName = sanitizeMessage(chatNameInput.value) || 'Guest';
    state.name = nextName;
    localStorage.setItem('chatName', nextName);
    chatNameInput.value = nextName;
};

const updateServerUrl = () => {
    if (!chatServerUrlInput) return;
    const nextUrl = normalizeServerUrl(chatServerUrlInput.value);
    state.serverUrl = nextUrl;
    localStorage.setItem('chatServerUrl', nextUrl);
    chatServerUrlInput.value = nextUrl;
    connectWebSocket();
};

const sendMessage = (text) => {
    const cleanText = sanitizeMessage(text);
    if (!cleanText) return;

    updateName();

    const payload = {
        type: 'message',
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        room: state.room,
        name: state.name || 'Guest',
        text: cleanText,
        timestamp: Date.now()
    };

    addMessage(payload);

    if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(payload));
        return;
    }

    if (state.channel) {
        state.channel.postMessage(payload);
    }
};

const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(chatMessageInput.value);
    chatMessageInput.value = '';
    chatMessageInput.focus();
};

const handleKeydown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
};

const initChat = () => {
    if (chatRoomInput) {
        chatRoomInput.value = state.room;
    }
    if (chatRoomBadge) {
        chatRoomBadge.textContent = `#${state.room}`;
    }
    if (chatNameInput) {
        chatNameInput.value = state.name || `Guest${Math.floor(Math.random() * 900 + 100)}`;
        updateName();
    }
    if (chatServerUrlInput) {
        chatServerUrlInput.value = state.serverUrl;
    }

    applyChatLanguage();
    connectWebSocket();

    chatForm.addEventListener('submit', handleSubmit);
    chatMessageInput.addEventListener('keydown', handleKeydown);

    chatJoinButton.addEventListener('click', () => {
        updateName();
        updateRoom();
    });

    chatRoomInput.addEventListener('blur', updateRoom);
    chatNameInput.addEventListener('blur', updateName);
    if (chatServerApplyButton) {
        chatServerApplyButton.addEventListener('click', updateServerUrl);
    }
    if (chatServerUrlInput) {
        chatServerUrlInput.addEventListener('blur', updateServerUrl);
    }

    document.addEventListener('language-change', (event) => {
        state.language = event.detail.language || 'en';
        applyChatLanguage();
    });
};

if (chatForm && chatMessageInput) {
    initChat();
}
