import React, { useState, useEffect } from 'react';
import './UserList.css';
import { ChevronDown, Search, X, User, UserPlus, MessageSquare, Users, Mail, Copy, Check, ExternalLink } from 'lucide-react';

function UserList({ currentUser, currentRoom, switchRoom, selectedDmUser }) {
    const [users, setUsers] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [isRecentExpanded, setIsRecentExpanded] = useState(true);
    const [isContactsExpanded, setIsContactsExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState('recent');
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteSent, setInviteSent] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
        ? "http://localhost:3001"
        : "";

    const inviteLink = `${window.location.origin}/register?ref=${currentUser}`;

    useEffect(() => {
        fetchUsers();
    }, [currentUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/users`);
            if (response.ok) {
                const data = await response.json();
                // Filter out current user
                const otherUsers = data.filter(u => u.username !== currentUser);
                setUsers(otherUsers);

                // Load recent chats from localStorage
                const savedRecent = localStorage.getItem(`recentChats_${currentUser}`);
                if (savedRecent) {
                    const recentUsernames = JSON.parse(savedRecent);
                    const recentUsers = otherUsers.filter(u => recentUsernames.includes(u.username));
                    setRecentChats(recentUsers);
                }
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.username.toLowerCase().includes(term) ||
            (user.email && user.email.toLowerCase().includes(term)) ||
            (user.mobile && user.mobile.includes(term))
        );
    });

    const filteredRecentChats = recentChats.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.username.toLowerCase().includes(term) ||
            (user.email && user.email.toLowerCase().includes(term)) ||
            (user.mobile && user.mobile.includes(term))
        );
    });

    const getDmRoomName = (otherUsername) => {
        const sorted = [currentUser, otherUsername].sort();
        return `dm_${sorted[0]}_${sorted[1]}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#4CAF50';
            case 'busy': return '#F44336';
            case 'away': return '#FF9800';
            default: return '#9E9E9E';
        }
    };

    const handleStartChat = (user) => {
        // Add to recent chats if not already there
        if (!recentChats.some(c => c.username === user.username)) {
            const newRecent = [user, ...recentChats];
            setRecentChats(newRecent);
            // Save to localStorage
            const recentUsernames = newRecent.map(u => u.username);
            localStorage.setItem(`recentChats_${currentUser}`, JSON.stringify(recentUsernames));
        }
        switchRoom(user.username);
        setActiveTab('recent');
    };

    const handleSendInvite = () => {
        if (!inviteEmail || !inviteEmail.includes('@')) return;

        // Simulate sending invite
        setInviteSent(true);
        setTimeout(() => {
            setInviteSent(false);
            setInviteEmail('');
            setShowInviteModal(false);
        }, 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <div className="user-list">
            <div className="user-list-header">
                <h2><MessageSquare size={20} /> Chat</h2>
            </div>

            {/* Tabs */}
            <div className="chat-tabs">
                <button
                    className={`chat-tab ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recent')}
                >
                    <MessageSquare size={16} />
                    Recent
                </button>
                <button
                    className={`chat-tab ${activeTab === 'add' ? 'active' : ''}`}
                    onClick={() => setActiveTab('add')}
                >
                    <UserPlus size={16} />
                    Add People
                </button>
            </div>

            {/* Search */}
            <div className="user-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder={activeTab === 'recent' ? "Search conversations..." : "Search registered users..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-users">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="user-list-content">
                    {/* Recent Chats Tab */}
                    {activeTab === 'recent' && (
                        <>
                            {recentChats.length === 0 ? (
                                <div className="empty-contacts">
                                    <div className="empty-icon">💬</div>
                                    <h4>No conversations yet</h4>
                                    <p>Click "Add People" to start chatting with someone</p>
                                    <button className="add-people-btn" onClick={() => setActiveTab('add')}>
                                        <UserPlus size={16} />
                                        Add People
                                    </button>
                                </div>
                            ) : (
                                <div className="contacts-section">
                                    <div className="section-header" onClick={() => setIsRecentExpanded(!isRecentExpanded)}>
                                        <ChevronDown size={14} className={`chevron ${isRecentExpanded ? 'expanded' : ''}`} />
                                        <span>Recent Conversations</span>
                                        <span className="count">{filteredRecentChats.length}</span>
                                    </div>

                                    {isRecentExpanded && (
                                        <div className="user-items">
                                            {filteredRecentChats.length === 0 ? (
                                                <div className="no-results">No matching conversations</div>
                                            ) : (
                                                filteredRecentChats.map((user) => {
                                                    const dmRoom = getDmRoomName(user.username);
                                                    const isActive = currentRoom === dmRoom;
                                                    return (
                                                        <div
                                                            key={user.id}
                                                            className={`user-item ${isActive ? 'active' : ''}`}
                                                            onClick={() => switchRoom(user.username)}
                                                        >
                                                            <div className="user-avatar">
                                                                {user.username.charAt(0).toUpperCase()}
                                                                <span
                                                                    className="status-dot"
                                                                    style={{ backgroundColor: getStatusColor(user.status) }}
                                                                ></span>
                                                            </div>
                                                            <div className="user-info">
                                                                <span className="user-name">{user.username}</span>
                                                                <span className="user-status">{user.status || 'offline'}</span>
                                                            </div>
                                                            <MessageSquare size={16} className="chat-icon" />
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Add People Tab */}
                    {activeTab === 'add' && (
                        <div className="add-people-section">
                            {/* Invite Others Card */}
                            <div className="invite-card" onClick={() => setShowInviteModal(true)}>
                                <div className="invite-icon">
                                    <Mail size={24} />
                                </div>
                                <div className="invite-info">
                                    <h4>Invite Others</h4>
                                    <p>Invite friends who aren't on ConnectSphere yet</p>
                                </div>
                                <ExternalLink size={18} className="invite-arrow" />
                            </div>

                            {/* Registered Users */}
                            <div className="registered-users-section">
                                <div className="section-header" onClick={() => setIsContactsExpanded(!isContactsExpanded)}>
                                    <ChevronDown size={14} className={`chevron ${isContactsExpanded ? 'expanded' : ''}`} />
                                    <span>Registered Users</span>
                                    <span className="count">{filteredUsers.length}</span>
                                </div>

                                {isContactsExpanded && (
                                    <>
                                        {filteredUsers.length === 0 ? (
                                            <div className="empty-users">
                                                <div className="empty-icon">👥</div>
                                                <h4>{searchTerm ? 'No users found' : 'No other users yet'}</h4>
                                                <p>{searchTerm ? 'Try a different search term' : 'Be the first to invite someone!'}</p>
                                                <button className="invite-btn" onClick={() => setShowInviteModal(true)}>
                                                    <Mail size={16} />
                                                    Invite Friends
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="available-users">
                                                {filteredUsers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="available-user-item"
                                                        onClick={() => handleStartChat(user)}
                                                    >
                                                        <div className="user-avatar">
                                                            {user.username.charAt(0).toUpperCase()}
                                                            <span
                                                                className="status-dot"
                                                                style={{ backgroundColor: getStatusColor(user.status) }}
                                                            ></span>
                                                        </div>
                                                        <div className="user-info">
                                                            <span className="user-name">{user.username}</span>
                                                            <span className="user-email">
                                                                {user.status === 'online' ? '🟢 Online now' :
                                                                    user.status === 'busy' ? '🔴 Busy' :
                                                                        user.status === 'away' ? '🟡 Away' : '⚫ Offline'}
                                                            </span>
                                                        </div>
                                                        <button className="start-chat-btn" onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStartChat(user);
                                                        }}>
                                                            <MessageSquare size={14} />
                                                            Chat
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="invite-modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="invite-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowInviteModal(false)}>×</button>

                        <div className="modal-header">
                            <div className="modal-icon">
                                <UserPlus size={28} />
                            </div>
                            <h3>Invite to ConnectSphere</h3>
                            <p>Bring your team together</p>
                        </div>

                        <div className="invite-methods">
                            {/* Email Invite */}
                            <div className="invite-method">
                                <label>Send email invitation</label>
                                <div className="email-input-group">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                    <button
                                        className={`send-invite-btn ${inviteSent ? 'sent' : ''}`}
                                        onClick={handleSendInvite}
                                        disabled={inviteSent}
                                    >
                                        {inviteSent ? (
                                            <>
                                                <Check size={16} />
                                                Sent!
                                            </>
                                        ) : (
                                            'Send'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="divider-line">
                                <span>or</span>
                            </div>

                            {/* Copy Link */}
                            <div className="invite-method">
                                <label>Share invite link</label>
                                <div className="link-copy-group">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                    />
                                    <button
                                        className={`copy-link-btn ${copiedLink ? 'copied' : ''}`}
                                        onClick={handleCopyLink}
                                    >
                                        {copiedLink ? (
                                            <>
                                                <Check size={16} />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <p>Invited users will receive instructions to join ConnectSphere</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserList;
