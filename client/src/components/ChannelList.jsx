import React, { useState, useRef, useEffect } from 'react';
import './ChannelList.css';
import { Filter, Plus, MoreHorizontal, GripVertical, X, Share2, UserPlus, Bell, Settings, Edit, Bot, AlertTriangle, LogOut, Trash2, Link, Copy, Check, Send, Search, Crown, Users } from 'lucide-react';

// Community Bot responses
const BOT_RESPONSES = {
    help: "👋 Hi! I'm the Community Bot. I can help you with:\n• /members - View channel members\n• /rules - Show community rules\n• /poll - Create a quick poll\n• /announce - Make an announcement\n• /stats - Show channel statistics\n• /remind - Set a reminder\n• /faq - Frequently asked questions",
    rules: "📋 **Community Rules:**\n1. Be respectful to all members\n2. No spam or self-promotion\n3. Keep discussions on-topic\n4. No harassment or hate speech\n5. Protect everyone's privacy\n6. Report inappropriate content",
    stats: "📊 **Channel Statistics:**\n• Total Members: 12\n• Messages Today: 47\n• Active Users: 8\n• Files Shared: 15\n• Created: Jan 2025",
    faq: "❓ **Frequently Asked Questions:**\n\nQ: How do I invite members?\nA: Click the menu → Invite members\n\nQ: How do I report an issue?\nA: Click menu → Report a concern\n\nQ: Can I customize notifications?\nA: Yes! Menu → Notifications",
    poll: "📊 **Create a Poll:**\nTo create a poll, use: /poll \"Question\" \"Option1\" \"Option2\" \"Option3\"\n\nExample: /poll \"Team lunch?\" \"Pizza\" \"Sushi\" \"Burgers\"",
    announce: "📢 **Announcements:**\nTo make an announcement visible to all members, use:\n/announce Your message here\n\nThis will pin the message and notify everyone.",
    remind: "⏰ **Reminders:**\nSet a reminder with: /remind [time] [message]\n\nExamples:\n• /remind 1h Check emails\n• /remind 30m Team meeting\n• /remind tomorrow Submit report"
};

function ChannelList({ rooms, currentRoom, switchRoom, width, onWidthChange, onAddChannel, onDeleteChannel, onRenameChannel, onLeaveChannel }) {
    const [showFilter, setShowFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isResizing, setIsResizing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({ show: false, channel: null, x: 0, y: 0 });
    const [editingChannel, setEditingChannel] = useState(null);
    const [editName, setEditName] = useState("");

    // Modal States
    const [showShareModal, setShowShareModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBotModal, setShowBotModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Current channel for modals
    const [modalChannel, setModalChannel] = useState("");

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        all: true,
        mentions: true,
        replies: true,
        muted: false
    });

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        isPrivate: true
    });

    // Report State
    const [reportForm, setReportForm] = useState({
        type: 'spam',
        description: '',
        submitted: false
    });

    // Bot Chat State
    const [botMessages, setBotMessages] = useState([
        { from: 'bot', text: "👋 Hi! I'm the Community Bot. Type /help to see what I can do!" }
    ]);
    const [botInput, setBotInput] = useState('');

    // Copy state
    const [copiedLink, setCopiedLink] = useState(false);

    // Users for invite and manage
    const [allUsers, setAllUsers] = useState([]);
    const [inviteSearchTerm, setInviteSearchTerm] = useState('');
    const [invitedUsers, setInvitedUsers] = useState([]);

    // Member management state
    const [channelMembers, setChannelMembers] = useState([]);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [channelCreator, setChannelCreator] = useState(null);
    const [inviteMembers, setInviteMembers] = useState([]);

    const contextMenuRef = useRef(null);

    const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
        ? "http://localhost:3001"
        : "";

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu({ show: false, channel: null, x: 0, y: 0 });
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch users when invite modal opens
    useEffect(() => {
        if (showInviteModal && modalChannel) {
            fetchUsersAndMembersForInvite();
        }
    }, [showInviteModal, modalChannel]);

    // Fetch members when manage modal opens
    useEffect(() => {
        if (showManageModal && modalChannel) {
            fetchUsersAndMembers();
        }
    }, [showManageModal, modalChannel]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/users`);
            if (response.ok) {
                const users = await response.json();
                setAllUsers(users);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchUsersAndMembersForInvite = async () => {
        try {
            const usersRes = await fetch(`${baseUrl}/api/users`);
            if (usersRes.ok) {
                const users = await usersRes.json();
                setAllUsers(users);
            }

            const membersRes = await fetch(`${baseUrl}/api/channels/${encodeURIComponent(modalChannel)}/members`);
            if (membersRes.ok) {
                const members = await membersRes.json();
                setInviteMembers(members);
            }
        } catch (err) {
            console.error('Failed to fetch users/members for invite:', err);
        }
    };

    const fetchUsersAndMembers = async () => {
        setLoadingMembers(true);
        try {
            const usersRes = await fetch(`${baseUrl}/api/users`);
            if (usersRes.ok) {
                const users = await usersRes.json();
                setAllUsers(users);
            }

            const membersRes = await fetch(`${baseUrl}/api/channels/${encodeURIComponent(modalChannel)}/members`);
            if (membersRes.ok) {
                const members = await membersRes.json();
                setChannelMembers(members);
                const admin = members.find(m => m.role === 'admin') || members[0];
                if (admin) {
                    setChannelCreator(admin.username);
                }
            }
        } catch (err) {
            console.error('Failed to fetch users/members:', err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const addMemberToChannel = async (username) => {
        try {
            const res = await fetch(`${baseUrl}/api/channels/${encodeURIComponent(modalChannel)}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (res.ok) {
                fetchUsersAndMembers();
            }
        } catch (err) {
            console.error('Failed to add member:', err);
        }
    };

    const removeMemberFromChannel = async (username) => {
        try {
            await fetch(`${baseUrl}/api/channels/${encodeURIComponent(modalChannel)}/members/${username}`, {
                method: 'DELETE'
            });
            fetchUsersAndMembers();
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    const filteredRooms = rooms.filter(room =>
        room.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTeamStyle = (room) => {
        const styles = {
            'General': { bg: '#FFE0E6', icon: '💼', color: '#E91E63' },
            'Random': { bg: '#E3F2FD', icon: '🎲', color: '#2196F3' },
            'Development': { bg: '#E8F5E9', icon: '💻', color: '#4CAF50' },
            'Announcements': { bg: '#FFF3E0', icon: '📢', color: '#FF9800' },
            'Off-Topic': { bg: '#F3E5F5', icon: '☕', color: '#9C27B0' },
        };
        return styles[room] || { bg: '#E8EBFA', icon: '💬', color: '#6264A7' };
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        const startX = e.clientX;
        const startWidth = width || 280;

        const handleMouseMove = (e) => {
            const newWidth = Math.min(Math.max(200, startWidth + e.clientX - startX), 450);
            onWidthChange?.(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleAddChannel = () => {
        if (newChannelName.trim() && onAddChannel) {
            onAddChannel(newChannelName.trim());
            setNewChannelName("");
            setShowAddModal(false);
        }
    };

    // Context Menu Handlers
    const openContextMenu = (e, channel) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const menuHeight = 380;
        const menuWidth = 220;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let x = rect.right + 5;
        if (x + menuWidth > viewportWidth) {
            x = rect.left - menuWidth - 5;
        }
        if (x < 10) x = 10;

        let y = rect.top;
        const spaceBelow = viewportHeight - rect.top;

        if (spaceBelow < menuHeight) {
            y = Math.max(10, viewportHeight - menuHeight - 20);
        }

        setContextMenu({
            show: true,
            channel,
            x,
            y
        });
    };

    // Modal openers
    const openModal = (modalType, channel) => {
        setModalChannel(channel);
        setContextMenu({ show: false, channel: null, x: 0, y: 0 });

        switch (modalType) {
            case 'share':
                setCopiedLink(false);
                setShowShareModal(true);
                break;
            case 'invite':
                setInviteSearchTerm('');
                setInvitedUsers([]);
                setInviteMembers([]);
                setShowInviteModal(true);
                break;
            case 'notifications':
                setShowNotificationsModal(true);
                break;
            case 'manage':
                setMemberSearchTerm('');
                setChannelMembers([]);
                setShowManageModal(true);
                break;
            case 'edit':
                setEditForm({ name: channel, description: '', isPrivate: true });
                setShowEditModal(true);
                break;
            case 'bot':
                setBotMessages([{ from: 'bot', text: "👋 Hi! I'm the Community Bot. Type /help to see what I can do!" }]);
                setBotInput('');
                setShowBotModal(true);
                break;
            case 'report':
                setReportForm({ type: 'spam', description: '', submitted: false });
                setShowReportModal(true);
                break;
            case 'leave':
                setShowLeaveModal(true);
                break;
            case 'delete':
                setShowDeleteModal(true);
                break;
        }
    };

    // Copy Link Handler
    const handleCopyLink = () => {
        const joinLink = `${window.location.origin}/join/${encodeURIComponent(modalChannel)}`;
        navigator.clipboard.writeText(joinLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    // Bot Message Handler
    const handleBotSend = () => {
        if (!botInput.trim()) return;

        const userMessage = botInput.trim();
        setBotMessages(prev => [...prev, { from: 'user', text: userMessage }]);
        setBotInput('');

        setTimeout(() => {
            let response = "🤔 I didn't understand that. Type /help to see available commands.";

            const cmd = userMessage.toLowerCase().replace('/', '');
            if (BOT_RESPONSES[cmd]) {
                response = BOT_RESPONSES[cmd];
            } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
                response = "👋 Hello! How can I help you today? Type /help for available commands.";
            } else if (userMessage.toLowerCase().includes('thank')) {
                response = "😊 You're welcome! Let me know if you need anything else.";
            }

            setBotMessages(prev => [...prev, { from: 'bot', text: response }]);
        }, 500);
    };

    // Report Submit Handler
    const handleReportSubmit = () => {
        if (!reportForm.description.trim()) return;
        setReportForm({ ...reportForm, submitted: true });
        setTimeout(() => {
            setShowReportModal(false);
            setReportForm({ type: 'spam', description: '', submitted: false });
        }, 2000);
    };

    // Edit Save Handler
    const handleSaveEdit = () => {
        if (editForm.name.trim() && onRenameChannel && editForm.name !== modalChannel) {
            onRenameChannel(modalChannel, editForm.name.trim());
        }
        setShowEditModal(false);
    };

    // Delete Handler
    const handleDeleteConfirm = () => {
        if (onDeleteChannel && modalChannel) {
            onDeleteChannel(modalChannel);
        }
        setShowDeleteModal(false);
    };

    // Leave Handler
    const handleLeaveConfirm = () => {
        if (onLeaveChannel && modalChannel) {
            onLeaveChannel(modalChannel);
        }
        setShowLeaveModal(false);
    };

    const closeContextMenu = () => {
        setContextMenu({ show: false, channel: null, x: 0, y: 0 });
    };

    const joinLink = `${window.location.origin}/join/${encodeURIComponent(modalChannel)}`;

    return (
        <div
            className={`channel-list ${isResizing ? 'resizing' : ''}`}
            style={{ width: width || 280 }}
        >
            <div className="channel-header">
                <h2>Teams</h2>
                <div className="header-actions">
                    <div
                        className={`icon-wrapper ${showFilter ? 'active' : ''}`}
                        onClick={() => setShowFilter(!showFilter)}
                        title="Filter"
                    >
                        <Filter size={16} />
                    </div>
                </div>
            </div>

            {showFilter && (
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            )}

            <div className="teams-list">
                {filteredRooms.map((room) => {
                    const style = getTeamStyle(room);
                    return (
                        <div
                            key={room}
                            className={`team-card ${currentRoom === room ? 'active' : ''}`}
                            onClick={() => switchRoom(room)}
                        >
                            <div
                                className="team-icon-box"
                                style={{ backgroundColor: style.bg }}
                            >
                                <span>{style.icon}</span>
                            </div>
                            <div className="team-info">
                                <span className="team-name">{room}</span>
                            </div>
                            <div
                                className="team-more-btn"
                                onClick={(e) => openContextMenu(e, room)}
                            >
                                <MoreHorizontal size={16} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu.show && (
                <div
                    ref={contextMenuRef}
                    className="channel-context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="context-menu-section">
                        <div className="context-menu-item" onClick={() => openModal('share', contextMenu.channel)}>
                            <Link size={16} />
                            <span>Share join link</span>
                        </div>
                        <div className="context-menu-item" onClick={() => openModal('invite', contextMenu.channel)}>
                            <UserPlus size={16} />
                            <span>Invite members</span>
                        </div>
                        <div className="context-menu-item" onClick={() => openModal('notifications', contextMenu.channel)}>
                            <Bell size={16} />
                            <span>Notifications</span>
                        </div>
                    </div>

                    <div className="context-menu-divider"></div>

                    <div className="context-menu-section">
                        <div className="context-menu-item" onClick={() => openModal('manage', contextMenu.channel)}>
                            <Settings size={16} />
                            <span>Manage community</span>
                        </div>
                        <div className="context-menu-item" onClick={() => openModal('edit', contextMenu.channel)}>
                            <Edit size={16} />
                            <span>Edit community</span>
                        </div>
                        <div className="context-menu-item" onClick={() => openModal('bot', contextMenu.channel)}>
                            <Bot size={16} />
                            <span>Community Bot</span>
                        </div>
                    </div>

                    <div className="context-menu-divider"></div>

                    <div className="context-menu-section">
                        <div className="context-menu-item" onClick={() => openModal('report', contextMenu.channel)}>
                            <AlertTriangle size={16} />
                            <span>Report a concern</span>
                        </div>
                    </div>

                    <div className="context-menu-divider"></div>

                    <div className="context-menu-section">
                        <div className="context-menu-item" onClick={() => openModal('leave', contextMenu.channel)}>
                            <LogOut size={16} />
                            <span>Leave community</span>
                        </div>
                        <div className="context-menu-item danger" onClick={() => openModal('delete', contextMenu.channel)}>
                            <Trash2 size={16} />
                            <span>Delete community</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Link Modal */}
            {showShareModal && (
                <div className="channel-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="channel-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowShareModal(false)}>×</button>
                        <div className="channel-modal-icon"><Share2 size={28} /></div>
                        <h3>Share Join Link</h3>
                        <p>Share this link to invite people to join {modalChannel}</p>
                        <div className="channel-link-box">
                            <input type="text" value={joinLink} readOnly />
                            <button className={copiedLink ? 'copied' : ''} onClick={handleCopyLink}>
                                {copiedLink ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="channel-modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="channel-modal-content wide" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowInviteModal(false)}>×</button>
                        <div className="channel-modal-icon"><UserPlus size={28} /></div>
                        <h3>Invite Members</h3>
                        <p>Add members to {modalChannel}</p>
                        <div className="channel-invite-search">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={inviteSearchTerm}
                                onChange={e => setInviteSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="channel-invite-list">
                            {allUsers
                                .filter(u =>
                                    u.username.toLowerCase().includes(inviteSearchTerm.toLowerCase()) &&
                                    !inviteMembers.some(m => m.username === u.username) &&
                                    !invitedUsers.includes(u.username)
                                )
                                .map((user, i) => (
                                    <div key={i} className="channel-invite-item">
                                        <div className="channel-invite-avatar">{user.username.charAt(0).toUpperCase()}</div>
                                        <span>{user.username}</span>
                                        <button onClick={() => {
                                            addMemberToChannel(user.username);
                                            setInvitedUsers(prev => [...prev, user.username]);
                                        }}>
                                            <UserPlus size={14} /> Add
                                        </button>
                                    </div>
                                ))
                            }
                            {invitedUsers.length > 0 && (
                                <div className="channel-invited-section">
                                    <h4>✓ Added ({invitedUsers.length})</h4>
                                    {invitedUsers.map((username, i) => (
                                        <div key={i} className="channel-invite-item added">
                                            <div className="channel-invite-avatar">{username.charAt(0).toUpperCase()}</div>
                                            <span>{username}</span>
                                            <span className="added-badge"><Check size={14} /> Added</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {allUsers.filter(u =>
                                u.username.toLowerCase().includes(inviteSearchTerm.toLowerCase()) &&
                                !inviteMembers.some(m => m.username === u.username) &&
                                !invitedUsers.includes(u.username)
                            ).length === 0 && invitedUsers.length === 0 && (
                                    <p className="no-users-msg">No users to invite</p>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Modal */}
            {showNotificationsModal && (
                <div className="channel-modal-overlay" onClick={() => setShowNotificationsModal(false)}>
                    <div className="channel-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowNotificationsModal(false)}>×</button>
                        <div className="channel-modal-icon"><Bell size={28} /></div>
                        <h3>Notification Settings</h3>
                        <p>Customize notifications for {modalChannel}</p>
                        <div className="channel-notification-options">
                            <label className="channel-notification-option">
                                <span>All messages</span>
                                <input type="checkbox" checked={notificationSettings.all}
                                    onChange={e => setNotificationSettings({ ...notificationSettings, all: e.target.checked })} />
                            </label>
                            <label className="channel-notification-option">
                                <span>Mentions only</span>
                                <input type="checkbox" checked={notificationSettings.mentions}
                                    onChange={e => setNotificationSettings({ ...notificationSettings, mentions: e.target.checked })} />
                            </label>
                            <label className="channel-notification-option">
                                <span>Replies to my messages</span>
                                <input type="checkbox" checked={notificationSettings.replies}
                                    onChange={e => setNotificationSettings({ ...notificationSettings, replies: e.target.checked })} />
                            </label>
                            <label className="channel-notification-option muted">
                                <span>🔇 Mute this channel</span>
                                <input type="checkbox" checked={notificationSettings.muted}
                                    onChange={e => setNotificationSettings({ ...notificationSettings, muted: e.target.checked })} />
                            </label>
                        </div>
                        <button className="channel-save-btn" onClick={() => setShowNotificationsModal(false)}>Save Settings</button>
                    </div>
                </div>
            )}

            {/* Manage Community Modal */}
            {showManageModal && (
                <div className="channel-modal-overlay" onClick={() => setShowManageModal(false)}>
                    <div className="channel-modal-content manage-modal" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowManageModal(false)}>×</button>
                        <div className="channel-modal-icon"><Users size={28} /></div>
                        <h3>Manage Community</h3>
                        <p>Manage members of {modalChannel}</p>

                        <div className="channel-manage-content">
                            {loadingMembers ? (
                                <div className="channel-loading">
                                    <div className="channel-spinner"></div>
                                    <span>Loading members...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Current Members */}
                                    <div className="channel-members-section">
                                        <h4>👥 Members ({channelMembers.length})</h4>
                                        <div className="channel-members-list">
                                            {channelMembers.length === 0 ? (
                                                <p className="no-users-msg">No members yet</p>
                                            ) : (
                                                channelMembers.map((member, i) => (
                                                    <div key={i} className="channel-member-item">
                                                        <div className="channel-member-avatar">
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="channel-member-info">
                                                            <span className="channel-member-name">
                                                                {member.username}
                                                                {member.username === channelCreator && (
                                                                    <Crown size={14} className="channel-admin-crown" title="Channel Admin" />
                                                                )}
                                                            </span>
                                                            <span className="channel-member-role">
                                                                {member.username === channelCreator ? 'Admin' : member.role || 'Member'}
                                                            </span>
                                                        </div>
                                                        {member.username !== channelCreator && (
                                                            <button
                                                                className="channel-remove-btn"
                                                                onClick={() => removeMemberFromChannel(member.username)}
                                                                title="Remove member"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Add Members */}
                                    <div className="channel-add-section">
                                        <h4>➕ Add Members</h4>
                                        <div className="channel-invite-search">
                                            <Search size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search users to add..."
                                                value={memberSearchTerm}
                                                onChange={e => setMemberSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="channel-available-users">
                                            {allUsers
                                                .filter(user =>
                                                    !channelMembers.some(m => m.username === user.username) &&
                                                    user.username.toLowerCase().includes(memberSearchTerm.toLowerCase())
                                                )
                                                .map((user, i) => (
                                                    <div key={i} className="channel-user-item" onClick={() => addMemberToChannel(user.username)}>
                                                        <div className="channel-user-avatar">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>{user.username}</span>
                                                        <UserPlus size={16} className="channel-add-icon" />
                                                    </div>
                                                ))
                                            }
                                            {allUsers.filter(user =>
                                                !channelMembers.some(m => m.username === user.username) &&
                                                user.username.toLowerCase().includes(memberSearchTerm.toLowerCase())
                                            ).length === 0 && (
                                                    <p className="no-users-msg">No users to add</p>
                                                )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Community Modal */}
            {showEditModal && (
                <div className="channel-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="channel-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        <div className="channel-modal-icon"><Edit size={28} /></div>
                        <h3>Edit Community</h3>
                        <div className="channel-edit-form">
                            <label>Community Name</label>
                            <input type="text" value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                            <label>Description</label>
                            <textarea value={editForm.description} placeholder="Describe your community..."
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                            <label className="channel-checkbox-label">
                                <input type="checkbox" checked={editForm.isPrivate}
                                    onChange={e => setEditForm({ ...editForm, isPrivate: e.target.checked })} />
                                <span>Private community (invite only)</span>
                            </label>
                        </div>
                        <button className="channel-save-btn" onClick={handleSaveEdit}>Save Changes</button>
                    </div>
                </div>
            )}

            {/* Community Bot Modal */}
            {showBotModal && (
                <div className="channel-modal-overlay" onClick={() => setShowBotModal(false)}>
                    <div className="channel-modal-content bot-modal" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowBotModal(false)}>×</button>
                        <div className="channel-bot-header">
                            <Bot size={24} />
                            <h3>Community Bot</h3>
                        </div>
                        <div className="channel-bot-chat">
                            {botMessages.map((msg, i) => (
                                <div key={i} className={`channel-bot-message ${msg.from}`}>
                                    {msg.from === 'bot' && <div className="channel-bot-avatar"><Bot size={16} /></div>}
                                    <div className="channel-bot-text">{msg.text}</div>
                                </div>
                            ))}
                        </div>
                        <div className="channel-bot-input">
                            <input
                                type="text"
                                placeholder="Type a command (e.g., /help)..."
                                value={botInput}
                                onChange={e => setBotInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleBotSend()}
                            />
                            <button onClick={handleBotSend}><Send size={16} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="channel-modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="channel-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="channel-modal-close" onClick={() => setShowReportModal(false)}>×</button>
                        <div className="channel-modal-icon warning"><AlertTriangle size={28} /></div>
                        <h3>Report a Concern</h3>
                        {reportForm.submitted ? (
                            <div className="channel-report-success">
                                <Check size={48} />
                                <h4>Report Submitted</h4>
                                <p>Thank you for reporting. Our team will review this shortly.</p>
                            </div>
                        ) : (
                            <>
                                <p>Help us keep ConnectSphere safe</p>
                                <div className="channel-report-form">
                                    <label>What are you reporting?</label>
                                    <select value={reportForm.type} onChange={e => setReportForm({ ...reportForm, type: e.target.value })}>
                                        <option value="spam">Spam or unwanted content</option>
                                        <option value="harassment">Harassment or bullying</option>
                                        <option value="hate">Hate speech</option>
                                        <option value="violence">Violence or threats</option>
                                        <option value="inappropriate">Inappropriate content</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <label>Describe the issue</label>
                                    <textarea
                                        placeholder="Please provide details about what you're reporting..."
                                        value={reportForm.description}
                                        onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                                    />
                                </div>
                                <button className="channel-report-btn" onClick={handleReportSubmit}>Submit Report</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Leave Community Modal */}
            {showLeaveModal && (
                <div className="channel-modal-overlay" onClick={() => setShowLeaveModal(false)}>
                    <div className="channel-modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="channel-modal-icon warning"><LogOut size={28} /></div>
                        <h3>Leave Community</h3>
                        <p>Are you sure you want to leave <strong>{modalChannel}</strong>?</p>
                        <p className="warning-text">You'll need an invitation to rejoin.</p>
                        <div className="channel-modal-actions">
                            <button className="channel-cancel-btn" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                            <button className="channel-danger-btn" onClick={handleLeaveConfirm}>Leave</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Community Modal */}
            {showDeleteModal && (
                <div className="channel-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="channel-modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="channel-modal-icon danger"><Trash2 size={28} /></div>
                        <h3>Delete Community</h3>
                        <p>Are you sure you want to delete <strong>{modalChannel}</strong>?</p>
                        <p className="danger-text">This action cannot be undone. All messages and files will be permanently deleted.</p>
                        <div className="channel-modal-actions">
                            <button className="channel-cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="channel-delete-btn" onClick={handleDeleteConfirm}>Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="add-channel-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} color="#5B5FC7" />
                <span>Add channel</span>
            </div>

            {/* Add Channel Modal */}
            {showAddModal && (
                <div className="add-channel-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="add-channel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create a new channel</h3>
                            <button className="close-modal" onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <label>Channel name</label>
                            <input
                                type="text"
                                placeholder="Enter channel name..."
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="create-btn"
                                onClick={handleAddChannel}
                                disabled={!newChannelName.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="resize-handle"
                onMouseDown={handleMouseDown}
            >
                <GripVertical size={12} />
            </div>
        </div>
    );
}

export default ChannelList;
