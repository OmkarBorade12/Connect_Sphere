import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Mail, Smartphone, Check, X } from 'lucide-react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChannelList from './components/ChannelList';
import UserList from './components/UserList';
import ChatArea from './components/ChatArea';
import Login from './components/Login';
import ActivityFeed from './components/ActivityFeed';
import CalendarView from './components/CalendarView';
import CallsView from './components/CallsView';

// Settings View Component with full functionality
const SettingsView = ({ username, onLogout, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('online');
  // Profile & Verification State
  const [profile, setProfile] = useState({ email: '', mobile: '', isEmailVerified: false, isMobileVerified: false });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyType, setVerifyType] = useState(''); // 'email' or 'mobile'
  const [verifyCode, setVerifyCode] = useState('');

  const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
    ? "http://localhost:3001"
    : "";

  useEffect(() => {
    fetch(`${baseUrl}/api/users/${username}`)
      .then(res => {
        if (res.ok) return res.json();
        return {};
      })
      .then(data => setProfile({ ...profile, ...data }))
      .catch(err => console.error(err));
  }, [username]);

  const updateSettings = async (newSettings) => {
    setLocalSettings(newSettings);
    setSaving(true);
    try {
      await fetch(`${baseUrl}/api/settings/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      onSettingsChange(newSettings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    try {
      await fetch(`${baseUrl}/api/users/${username}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdateProfile = async (field, value) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    try {
      await fetch(`${baseUrl}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: updated.mobile, email: updated.email })
      });
    } catch (err) { console.error(err); }
  };

  const startVerification = async (type) => {
    const value = type === 'email' ? profile.email : profile.mobile;
    if (!value) return alert(`Please enter a ${type} first.`);

    setVerifyType(type);
    setShowVerifyModal(true);
    setVerifyCode('');

    try {
      await fetch(`${baseUrl}/api/verify/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, contact: value })
      });
    } catch (err) { console.error(err); }
  };

  const confirmVerification = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/verify/confirm-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type: verifyType, code: verifyCode })
      });
      if (res.ok) {
        const field = verifyType === 'email' ? 'isEmailVerified' : 'isMobileVerified';
        setProfile(prev => ({ ...prev, [field]: true }));
        setShowVerifyModal(false);
        alert("Verified Successfully!");
      } else {
        alert("Invalid Code");
      }
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'online': return '#4CAF50';
      case 'busy': return '#F44336';
      case 'away': return '#FF9800';
      case 'offline': return '#9E9E9E';
      default: return '#4CAF50';
    }
  };

  return (
    <div className="settings-view">
      <h2>⚙️ Settings</h2>

      <div className="settings-section">
        <h3>Account</h3>
        <div className="profile-card">
          <div className="profile-avatar" style={{
            background: 'linear-gradient(135deg, #6264A7, #8B8DC8)'
          }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <div className="profile-name">{username}</div>
            <div className="profile-status">
              <select
                value={status}
                onChange={(e) => updateStatus(e.target.value)}
                style={{ borderColor: getStatusColor(status) }}
              >
                <option value="online">🟢 Online</option>
                <option value="busy">🔴 Do Not Disturb</option>
                <option value="away">🟡 Away</option>
                <option value="offline">⚫ Appear Offline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Contact Verification</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          Verify your contact info to find friends and secure your account.
        </p>

        {/* Email */}
        <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> <span>Email Address</span>
            </div>
            {profile.isEmailVerified && <span style={{ color: '#4CAF50', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Verified</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input
              type="email"
              placeholder="Enter email"
              value={profile.email || ''}
              onChange={(e) => handleUpdateProfile('email', e.target.value)}
              disabled={profile.isEmailVerified}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            {!profile.isEmailVerified && (
              <button
                onClick={() => startVerification('email')}
                style={{ background: '#5B5FC7', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontSize: '13px' }}
              >
                Verify
              </button>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginTop: '16px' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} /> <span>Mobile Number</span>
            </div>
            {profile.isMobileVerified && <span style={{ color: '#4CAF50', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Verified</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={profile.mobile || ''}
              onChange={(e) => handleUpdateProfile('mobile', e.target.value)}
              disabled={profile.isMobileVerified}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            {!profile.isMobileVerified && (
              <button
                onClick={() => startVerification('mobile')}
                style={{ background: '#5B5FC7', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontSize: '13px' }}
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Dark Mode</span>
            <small>Switch between light and dark theme</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.theme === 'dark'}
              onChange={(e) => updateSettings({ ...localSettings, theme: e.target.checked ? 'dark' : 'light' })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Enable Notifications</span>
            <small>Receive notifications for mentions and messages</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifications}
              onChange={(e) => updateSettings({ ...localSettings, notifications: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Language</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Display Language</span>
            <small>Choose your preferred language</small>
          </div>
          <select
            value={localSettings.language}
            onChange={(e) => updateSettings({ ...localSettings, language: e.target.value })}
            className="language-select"
          >
            <option value="English">English</option>
            <option value="Spanish">Español</option>
            <option value="French">Français</option>
            <option value="German">Deutsch</option>
            <option value="Hindi">हिंदी</option>
          </select>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h3>Session</h3>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Log Out
        </button>
      </div>

      {saving && <div className="saving-indicator">Saving...</div>}

      {/* Verification Modal */}
      {showVerifyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowVerifyModal(false)}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '16px', width: '320px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Verify {verifyType === 'email' ? 'Email' : 'Number'}
              <button onClick={() => setShowVerifyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Enter the 4-digit code sent to your {verifyType}. (Demo: Any 4 digits)
            </p>
            <input
              type="text"
              style={{ width: '93%', padding: '12px', textAlign: 'center', fontSize: '24px', letterSpacing: '4px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}
              placeholder="0000"
              maxLength={6}
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
            />
            <button
              onClick={confirmVerification}
              style={{ width: '100%', padding: '12px', background: '#5B5FC7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const socket = io.connect(
  window.location.hostname === "localhost" && window.location.port === "5173"
    ? "http://localhost:3001"
    : window.location.origin
);

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("Teams");

  // Teams & Chat Data
  const [currentRoom, setCurrentRoom] = useState("");
  const [dmUser, setDmUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Sidebar width for resizable panel
  const [sidebarWidth, setSidebarWidth] = useState(280);

  // User Settings
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'English'
  });

  // Activity notifications
  const [unreadActivities, setUnreadActivities] = useState(0);

  const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
    ? "http://localhost:3001"
    : "";

  // Fetch user settings
  const fetchSettings = async (user) => {
    try {
      const res = await fetch(`${baseUrl}/api/settings/${user}`);
      if (res.ok) {
        const data = await res.json();
        setUserSettings({
          theme: data.theme || 'light',
          notifications: data.notifications !== false,
          language: data.language || 'English'
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  // Fetch Channels
  const fetchChannels = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/channels`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.map(c => c.name));
      }
    } catch (err) {
      console.error('Failed to fetch channels', err);
    }
  };

  // Add new channel
  const addChannel = async (channelName) => {
    if (!rooms.includes(channelName)) {
      try {
        const res = await fetch(`${baseUrl}/api/channels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: channelName, createdBy: username })
        });
        if (res.ok) {
          await fetchChannels();
          switchRoom(channelName);
        } else {
          alert("Failed to create channel");
        }
      } catch (err) { console.error(err); }
    }
  };

  // Delete channel
  const deleteChannel = async (channelName) => {
    try {
      await fetch(`${baseUrl}/api/channels/${encodeURIComponent(channelName)}`, { method: 'DELETE' });
      setRooms(rooms.filter(room => room !== channelName));
      if (currentRoom === channelName) {
        setCurrentRoom(rooms.length > 0 ? rooms[0] : ""); // Fallback to another room
      }
    } catch (err) { console.error(err); }
  };

  // Rename channel
  const renameChannel = async (oldName, newName) => {
    if (oldName === newName) return;
    try {
      await fetch(`${baseUrl}/api/channels/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      });
      await fetchChannels();
      if (currentRoom === oldName) {
        setCurrentRoom(newName);
      }
    } catch (err) { console.error(err); }
  };

  // Leave channel
  const leaveChannel = async (channelName) => {
    try {
      await fetch(`${baseUrl}/api/channels/${encodeURIComponent(channelName)}/members/${username}`, {
        method: 'DELETE'
      });
      // Check if we still have access or if it should be removed from view
      // For now, we just notify and switch room if active
      if (currentRoom === channelName) {
        setCurrentRoom("");
      }
    } catch (err) { console.error(err); }
  };

  // Check for existing session on load
  useEffect(() => {
    fetchChannels(); // Load channels
    const savedToken = sessionStorage.getItem('connectsphere_token');
    const savedUsername = sessionStorage.getItem('connectsphere_username');

    if (savedToken && savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
      fetchSettings(savedUsername);
      fetchChannels();
      socket.emit("join_room", { room: currentRoom, username: savedUsername });
    }
  }, []);

  // Listen for real-time activity notifications
  useEffect(() => {
    socket.on("new_activity", (data) => {
      if (data.targetUser === username) {
        setUnreadActivities(prev => prev + 1);
      }
    });

    socket.on("user_status_update", (data) => {
      // Update user status in UI if needed
      console.log(`User ${data.username} is now ${data.status}`);
    });

    return () => {
      socket.off("new_activity");
      socket.off("user_status_update");
    };
  }, [username]);

  const handleLogin = (user, token) => {
    if (user !== "") {
      // Save to sessionStorage for session persistence
      sessionStorage.setItem('connectsphere_token', token);
      sessionStorage.setItem('connectsphere_username', user);

      setUsername(user);
      setIsLoggedIn(true);
      fetchSettings(user);
      fetchChannels();
      socket.emit("join_room", { room: currentRoom, username: user });
    }
  };

  const handleLogout = () => {
    // Clear sessionStorage
    sessionStorage.removeItem('connectsphere_token');
    sessionStorage.removeItem('connectsphere_username');

    // Reset state
    setUsername("");
    setIsLoggedIn(false);
    setActiveTab("Teams");
    setCurrentRoom("");
    setMessages([]);
    setDmUser(null);
    setUserSettings({ theme: 'light', notifications: true, language: 'English' });
  };

  const switchRoom = (room) => {
    setCurrentRoom(room);
    setDmUser(null);
    setMessages([]);
    socket.emit("join_room", { room, username });
    if (activeTab === 'Chat') setActiveTab('Teams');
  };

  // Navigate to channel from activity feed
  const navigateToChannel = (channelName) => {
    // Check if it's a DM (starts with dm_) or a regular channel
    if (channelName.startsWith('dm_')) {
      // Extract the other user from DM room name
      const parts = channelName.replace('dm_', '').split('_');
      const otherUser = parts.find(p => p !== username) || parts[0];
      setDmUser(otherUser);
      setActiveTab('Chat');
      setCurrentRoom(channelName);
      setMessages([]);
      socket.emit("join_room", { room: channelName, username });
    } else {
      // Regular channel - switch to Teams tab
      setActiveTab('Teams');
      setCurrentRoom(channelName);
      setDmUser(null);
      setMessages([]);
      socket.emit("join_room", { room: channelName, username });

      // Add channel to rooms if not exists
      if (!rooms.includes(channelName)) {
        setRooms([...rooms, channelName]);
      }
    }
  };

  const switchDm = (otherUser) => {
    const sorted = [username, otherUser].sort();
    const roomName = `dm_${sorted[0]}_${sorted[1]}`;
    setCurrentRoom(roomName);
    setDmUser(otherUser);
    setMessages([]);
    socket.emit("join_room", { room: roomName, username });
  };

  useEffect(() => {
    socket.on("receive_message", (data) => setMessages((list) => [...list, data]));
    socket.on("receive_message_history", (history) => setMessages(history));
    return () => {
      socket.off("receive_message");
      socket.off("receive_message_history");
    };
  }, [socket]);

  const sendMessage = (msg) => {
    if (msg.trim() === "") return;
    const messageData = {
      room: currentRoom,
      author: username,
      message: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    socket.emit("send_message", messageData);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Render main content based on Active Tab
  const renderMain = () => {
    if (activeTab === 'Teams') {
      return (
        <>
          <ChannelList
            rooms={rooms}
            currentRoom={currentRoom}
            switchRoom={switchRoom}
            width={sidebarWidth}
            onWidthChange={setSidebarWidth}
            onAddChannel={addChannel}
            onDeleteChannel={deleteChannel}
            onRenameChannel={renameChannel}
            onLeaveChannel={leaveChannel}
          />
          {currentRoom ? (
            <ChatArea
              currentRoom={currentRoom}
              messages={messages}
              author={username}
              sendMessage={sendMessage}
            />
          ) : (
            <div className="chat-empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">📢</div>
                <h2>Welcome to Teams</h2>
                <p>Select a channel from the list or create a new one to start collaborating</p>
                <div className="empty-state-features">
                  <div className="feature-item">
                    <span className="feature-icon">➕</span>
                    <span>Create Channels</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <span>Team Chat</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📁</span>
                    <span>Share Resources</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )
    }
    if (activeTab === 'Chat') {
      return (
        <>
          <UserList
            currentUser={username}
            currentRoom={currentRoom}
            switchRoom={switchDm}
            selectedDmUser={dmUser}
          />
          {dmUser ? (
            <ChatArea
              currentRoom={currentRoom}
              title={dmUser}
              messages={messages}
              author={username}
              sendMessage={sendMessage}
              isDm={true}
            />
          ) : (
            <div className="chat-empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">💬</div>
                <h2>Welcome to Chat</h2>
                <p>Select a conversation from the list or add a new person to start chatting</p>
                <div className="empty-state-features">
                  <div className="feature-item">
                    <span className="feature-icon">👥</span>
                    <span>Direct Messages</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔒</span>
                    <span>Private Conversations</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📎</span>
                    <span>Share Files & Links</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )
    }
    if (activeTab === 'Settings') {
      return (
        <SettingsView
          username={username}
          onLogout={handleLogout}
          settings={userSettings}
          onSettingsChange={setUserSettings}
        />
      );
    }
    if (activeTab === 'Activity') {
      return <ActivityFeed username={username} onNavigateToChannel={navigateToChannel} />;
    }
    if (activeTab === 'Calendar') {
      return <CalendarView username={username} />;
    }
    if (activeTab === 'Calls') {
      return <CallsView username={username} />;
    }
    // Fallback
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#616161' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✨</div>
        <h2>{activeTab}</h2>
        <p>This module is fully functional and ready for content.</p>
      </div>
    );
  }

  return (
    <div className={`app-container ${userSettings.theme === 'dark' ? 'dark-theme' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={username}
        onLogout={handleLogout}
        unreadActivities={unreadActivities}
      />
      <div className="main-content">
        {renderMain()}
      </div>
    </div>
  );
}

export default App;
