import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneCall, PhoneOff, PhoneMissed, Clock, User, Search, Star, Plus, X, UserPlus, Trash2 } from 'lucide-react';
import './CallsView.css';

function CallsView({ username }) {
    const [activeSection, setActiveSection] = useState('history');
    const [isInCall, setIsInCall] = useState(false);
    const [callingUser, setCallingUser] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [directCallUser, setDirectCallUser] = useState('');

    const [speedDial, setSpeedDial] = useState([]);
    const [callHistory, setCallHistory] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showAddContact, setShowAddContact] = useState(false);
    const [loading, setLoading] = useState(true);

    const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
        ? "http://localhost:3001"
        : "";

    useEffect(() => {
        fetchData();
    }, [username]);

    useEffect(() => {
        let interval;
        if (isInCall) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isInCall]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch speed dial contacts
            const speedDialRes = await fetch(`${baseUrl}/api/speed-dial?username=${username}`);
            if (speedDialRes.ok) {
                const sdData = await speedDialRes.json();
                setSpeedDial(sdData);
            }

            // Fetch call history
            const historyRes = await fetch(`${baseUrl}/api/call-history?username=${username}`);
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                // Format call history
                const formatted = historyData.map(call => ({
                    ...call,
                    date: formatCallDate(new Date(call.time)),
                    time: new Date(call.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setCallHistory(formatted);
            }

            // Fetch all users for adding to speed dial
            const usersRes = await fetch(`${baseUrl}/api/users`);
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setAllUsers(usersData.filter(u => u.username !== username));
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            // Use sample data as fallback
            setSpeedDial(sampleSpeedDial);
            setCallHistory(sampleCallHistory);
        } finally {
            setLoading(false);
        }
    };

    // Sample data for fallback
    const sampleSpeedDial = [
        { id: 1, username: 'Sarah Johnson', status: 'online' },
        { id: 2, username: 'Mike Chen', status: 'busy' },
        { id: 3, username: 'Emily Davis', status: 'online' },
        { id: 4, username: 'Alex Turner', status: 'offline' },
    ];

    const sampleCallHistory = [
        { id: 1, name: 'Sarah Johnson', type: 'outgoing', callType: 'video', duration: '12:34', time: '10:30 AM', date: 'Today' },
        { id: 2, name: 'Mike Chen', type: 'incoming', callType: 'voice', duration: '5:21', time: '9:15 AM', date: 'Today' },
        { id: 3, name: 'Emily Davis', type: 'missed', callType: 'video', duration: '', time: '8:00 PM', date: 'Yesterday' },
        { id: 4, name: 'Jordan Lee', type: 'outgoing', callType: 'voice', duration: '23:45', time: '3:30 PM', date: 'Yesterday' },
    ];

    const displaySpeedDial = speedDial.length > 0 ? speedDial : sampleSpeedDial;
    const displayCallHistory = callHistory.length > 0 ? callHistory : sampleCallHistory;

    const formatCallDate = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCallIcon = (type) => {
        switch (type) {
            case 'outgoing': return <PhoneCall size={16} className="outgoing" />;
            case 'incoming': return <PhoneOff size={16} className="incoming" />;
            case 'missed': return <PhoneMissed size={16} className="missed" />;
            default: return <Phone size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#4CAF50';
            case 'busy': return '#F44336';
            case 'offline': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };

    const startCall = async (contact, type) => {
        const contactName = contact.username || contact.name;
        setCallingUser({ name: contactName, type });
        setCallDuration(0);
        setIsInCall(true);

        // Log call to history
        try {
            await fetch(`${baseUrl}/api/call-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callerUsername: username,
                    receiverUsername: contactName,
                    callType: type,
                    status: 'outgoing',
                    duration: null
                })
            });
        } catch (err) {
            console.error('Failed to log call:', err);
        }
    };

    const endCall = async () => {
        // In a real app, we'd update the call duration in the database
        setIsInCall(false);
        setCallingUser(null);
        setCallDuration(0);
        fetchData(); // Refresh call history
    };

    const addToSpeedDial = async (user) => {
        try {
            const res = await fetch(`${baseUrl}/api/speed-dial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    contactUsername: user.username
                })
            });
            if (res.ok) {
                fetchData();
                setShowAddContact(false);
            }
        } catch (err) {
            console.error('Failed to add to speed dial:', err);
        }
    };

    const removeFromSpeedDial = async (contactId) => {
        try {
            await fetch(`${baseUrl}/api/speed-dial/${contactId}`, {
                method: 'DELETE'
            });
            fetchData();
        } catch (err) {
            console.error('Failed to remove from speed dial:', err);
        }
    };

    const filteredHistory = displayCallHistory.filter(call =>
        call.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSpeedDial = displaySpeedDial.filter(contact =>
        (contact.username || contact.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableUsers = allUsers.filter(user =>
        !speedDial.some(sd => sd.username === user.username)
    );

    return (
        <div className="calls-view">
            {/* Call Overlay */}
            {isInCall && (
                <div className="call-overlay">
                    <div className="call-modal">
                        <div className="call-avatar-large">
                            {callingUser?.name?.charAt(0)}
                        </div>
                        <h3>{callingUser?.name}</h3>
                        <p className="call-type-label">
                            {callingUser?.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                        </p>
                        <div className="call-timer">
                            {formatDuration(callDuration)}
                        </div>
                        <div className="call-animation">
                            <span></span><span></span><span></span>
                        </div>
                        <div className="call-controls">
                            <button className="call-control-btn mute" title="Mute">
                                🔇
                            </button>
                            <button className="end-call-btn" onClick={endCall}>
                                <PhoneOff size={24} />
                            </button>
                            <button className="call-control-btn" title="Speaker">
                                🔊
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="calls-sidebar">
                <h2><Phone size={24} /> Calls</h2>

                <div className="calls-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="calls-tabs">
                    <button
                        className={activeSection === 'history' ? 'active' : ''}
                        onClick={() => setActiveSection('history')}
                    >
                        <Clock size={16} /> History
                    </button>
                    <button
                        className={activeSection === 'speed' ? 'active' : ''}
                        onClick={() => setActiveSection('speed')}
                    >
                        <Star size={16} /> Speed Dial
                    </button>
                </div>

                {loading ? (
                    <div className="calls-loading">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {activeSection === 'speed' && (
                            <>
                                <div className="speed-dial-list">
                                    {filteredSpeedDial.length === 0 ? (
                                        <div className="no-contacts">
                                            <Star size={32} />
                                            <p>No speed dial contacts</p>
                                            <span>Add contacts for quick calling</span>
                                        </div>
                                    ) : (
                                        filteredSpeedDial.map(contact => (
                                            <div key={contact.id} className="speed-dial-item">
                                                <div className="contact-avatar">
                                                    {(contact.username || contact.name || '?').charAt(0).toUpperCase()}
                                                    <span
                                                        className="status-dot"
                                                        style={{ backgroundColor: getStatusColor(contact.status) }}
                                                    ></span>
                                                </div>
                                                <div className="contact-info">
                                                    <div className="contact-name">{contact.username || contact.name}</div>
                                                    <div className="contact-status">{contact.status}</div>
                                                </div>
                                                <div className="contact-actions">
                                                    <button
                                                        className="call-btn voice"
                                                        onClick={() => startCall(contact, 'voice')}
                                                        disabled={contact.status === 'offline'}
                                                        title="Voice Call"
                                                    >
                                                        <Phone size={16} />
                                                    </button>
                                                    <button
                                                        className="call-btn video"
                                                        onClick={() => startCall(contact, 'video')}
                                                        disabled={contact.status === 'offline'}
                                                        title="Video Call"
                                                    >
                                                        <Video size={16} />
                                                    </button>
                                                    <button
                                                        className="call-btn remove"
                                                        onClick={() => removeFromSpeedDial(contact.id)}
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button className="add-speed-dial-btn" onClick={() => setShowAddContact(true)}>
                                    <Plus size={18} />
                                    <span>Add to Speed Dial</span>
                                </button>
                            </>
                        )}

                        {activeSection === 'history' && (
                            <div className="call-history-list">
                                {filteredHistory.length === 0 ? (
                                    <div className="no-contacts">
                                        <Phone size={32} />
                                        <p>No call history</p>
                                        <span>Your calls will appear here</span>
                                    </div>
                                ) : (
                                    filteredHistory.map(call => (
                                        <div key={call.id} className="call-history-item" onClick={() => startCall({ name: call.name }, call.callType)}>
                                            <div className="call-type-icon">
                                                {getCallIcon(call.type)}
                                            </div>
                                            <div className="call-info">
                                                <div className="call-name">{call.name}</div>
                                                <div className="call-meta">
                                                    {call.callType === 'video' ? <Video size={12} /> : <Phone size={12} />}
                                                    {call.duration || 'Missed'} • {call.time}
                                                </div>
                                            </div>
                                            <div className="call-date">{call.date}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="calls-main">
                <div className="calls-dashboard">
                    <div className="dashboard-header">
                        <h3>👋 Start a Call</h3>
                        <p>Enter a username or select a favorite contact</p>
                        <div className="direct-call-input">
                            <input
                                type="text"
                                placeholder="Enter username..."
                                value={directCallUser}
                                onChange={(e) => setDirectCallUser(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && directCallUser && startCall({ username: directCallUser }, 'voice')}
                            />
                            <div className="direct-call-actions">
                                <button
                                    className="call-btn-large voice"
                                    onClick={() => directCallUser && startCall({ username: directCallUser }, 'voice')}
                                    disabled={!directCallUser}
                                    title="Voice Call"
                                >
                                    <Phone size={24} />
                                </button>
                                <button
                                    className="call-btn-large video"
                                    onClick={() => directCallUser && startCall({ username: directCallUser }, 'video')}
                                    disabled={!directCallUser}
                                    title="Video Call"
                                >
                                    <Video size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="speed-dial-grid-section">
                        <h4>⭐ Favorites</h4>
                        {displaySpeedDial.length === 0 ? (
                            <div className="empty-speed-dial">
                                <p>No favorites yet. Add contacts from the sidebar!</p>
                            </div>
                        ) : (
                            <div className="speed-dial-grid-container">
                                {displaySpeedDial.map((contact) => (
                                    <div key={contact.id} className="speed-dial-card">
                                        <div className="card-avatar">
                                            {(contact.username || contact.name || '?').charAt(0).toUpperCase()}
                                            <span className="status-dot" style={{ backgroundColor: getStatusColor(contact.status) }}></span>
                                        </div>
                                        <div className="card-info">
                                            <span className="card-name">{contact.username || contact.name}</span>
                                            <span className="card-status">{contact.status}</span>
                                        </div>
                                        <div className="card-actions">
                                            <button className="card-btn voice" onClick={() => startCall(contact, 'voice')}>
                                                <Phone size={18} />
                                            </button>
                                            <button className="card-btn video" onClick={() => startCall(contact, 'video')}>
                                                <Video size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Contact Modal */}
            {showAddContact && (
                <div className="add-contact-overlay" onClick={() => setShowAddContact(false)}>
                    <div className="add-contact-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><UserPlus size={20} /> Add to Speed Dial</h3>
                            <button className="close-btn" onClick={() => setShowAddContact(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="user-list">
                            {availableUsers.length === 0 ? (
                                <p className="no-users">All users are already in your speed dial</p>
                            ) : (
                                availableUsers.map(user => (
                                    <div key={user.id} className="user-item" onClick={() => addToSpeedDial(user)}>
                                        <div className="user-avatar">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="user-name">{user.username}</span>
                                        <Plus size={16} className="add-icon" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CallsView;
