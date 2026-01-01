import React, { useState, useEffect, useRef } from 'react';
import { Send, Bold, Italic, Underline, Smile, Paperclip, Video, Phone, MoreHorizontal, X, FileText, Download, UserPlus, Image, Link, File, Lock, Check, Search, Users, Trash2, Crown, Ban, Flag } from 'lucide-react';
import './ChatArea.css';

// Common emojis for quick picker
const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤔', '🤗', '🤩', '😏', '😐', '😑', '😶', '🙄', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '👻', '💀', '👽', '🤖', '💩'],
    'Gestures': ['👍', '👎', '👋', '🙌', '👏', '🤝', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '🙏', '💪', '🤲', '👐', '💅', '🤳', '🖕', '✊', '👊', '🤛', '🤜', '🤚', '🖐️', '✋', '🖖', '🤏', '🙆', '🙅', '🤷', '🙋', '🙇', '🤦'],
    'Hearts': ['❤️', '🧡', '�', '�', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💞', '💋'],
    'Objects': ['💡', '💣', '🎉', '🎊', '🎈', '🎁', '🎀', '🎓', '👑', '💍', '💄', '💎', '🔑', '🗝️', '🕰️', '⏰', '⏳', '⌚', '💾', '💿', '📱', '💻', '📷', '📹', '🔔', '🔕', '📢', '📣', '📯', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁'],
    'Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '�️', '�️', '🦂', '�', '�', '🦎', '🦖', '🦕', '�', '🦑', '🦐', '🦞', '🦀', '�', '🐠', '🐟', '🐬', '🐳', '🐋', '�', '�', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄']
};

function ChatArea({ currentRoom, title, messages, author, sendMessage, isDm }) {
    const [currentMessage, setCurrentMessage] = useState("");
    const messagesEndRef = useRef(null);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const headerMenuRef = useRef(null);

    // Call Simulation State
    const [isCalling, setIsCalling] = useState(false);
    const [callType, setCallType] = useState("");

    // Formatting & Emoji State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState("Smileys");
    const [attachedFile, setAttachedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Header Menu & Side Panel State
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [sidePanel, setSidePanel] = useState({ show: false, type: null });

    // Members State
    const [allUsers, setAllUsers] = useState([]);
    const [channelMembers, setChannelMembers] = useState([]);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [channelCreator, setChannelCreator] = useState(null);

    const displayTitle = title || currentRoom;

    const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
        ? "http://localhost:3001"
        : "";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch users and channel members
    useEffect(() => {
        if (sidePanel.type === 'members' && sidePanel.show) {
            fetchUsersAndMembers();
        }
    }, [sidePanel, currentRoom]);

    const fetchUsersAndMembers = async () => {
        setLoadingMembers(true);
        try {
            const usersRes = await fetch(`${baseUrl}/api/users`);
            if (usersRes.ok) {
                const users = await usersRes.json();
                setAllUsers(users);
            }

            const membersRes = await fetch(`${baseUrl}/api/channels/${encodeURIComponent(currentRoom)}/members`);
            if (membersRes.ok) {
                const members = await membersRes.json();
                setChannelMembers(members);
                // First member with role 'admin' or first member is the creator
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
            const res = await fetch(`${baseUrl}/api/channels/${encodeURIComponent(currentRoom)}/members`, {
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
            await fetch(`${baseUrl}/api/channels/${encodeURIComponent(currentRoom)}/members/${username}`, {
                method: 'DELETE'
            });
            fetchUsersAndMembers();
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    // Close header menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
                setShowHeaderMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Side Panel Handlers
    const openSidePanel = (type) => {
        setSidePanel({ show: true, type });
        setShowHeaderMenu(false);
    };

    const closeSidePanel = () => {
        setSidePanel({ show: false, type: null });
        setMemberSearchTerm('');
    };

    // Get shared content from messages
    const getSharedContent = () => {
        const fileMessages = messages.filter(msg => msg.message.includes('[FILE:'));
        return fileMessages.map(msg => {
            const match = msg.message.match(/\[FILE:([^:]+):([^\]]+)\]/);
            if (match) {
                return { url: match[1], name: match[2], author: msg.author, time: msg.time };
            }
            return null;
        }).filter(Boolean);
    };

    // Get shared links from messages
    const getSharedLinks = () => {
        const linkPattern = /(https?:\/\/[^\s<]+)/g;
        const links = [];
        messages.forEach(msg => {
            const matches = msg.message.match(linkPattern);
            if (matches) {
                matches.forEach(url => {
                    links.push({ url, author: msg.author, time: msg.time });
                });
            }
        });
        return links;
    };

    // Get shared media (images)
    const getSharedMedia = () => {
        return getSharedContent().filter(f => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f.name));
    };

    // Get shared documents (non-image files)
    const getSharedDocuments = () => {
        return getSharedContent().filter(f => !/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f.name));
    };

    // Upload file to server
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            const response = await fetch(`${baseUrl}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Upload failed');
                return null;
            }
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = async () => {
        const editor = editorRef.current;
        const htmlContent = editor ? editor.innerHTML : '';
        const textContent = editor ? editor.innerText.trim() : '';

        let messageToSend = '';

        if (attachedFile) {
            const uploadResult = await uploadFile(attachedFile.file);
            if (uploadResult) {
                messageToSend = `[FILE:${uploadResult.url}:${uploadResult.originalName}]`;
                if (textContent) {
                    messageToSend = textContent + '\n' + messageToSend;
                }
            }
        } else if (htmlContent && textContent) {
            messageToSend = htmlContent;
        }

        if (messageToSend) {
            sendMessage(messageToSend);
            if (editor) {
                editor.innerHTML = '';
            }
            setCurrentMessage("");
            setAttachedFile(null);
        }
    };

    // Menu Actions
    const handleClearChat = async () => {
        if (confirm("Are you sure you want to clear the chat history? This cannot be undone.")) {
            try {
                const res = await fetch(`${baseUrl}/api/messages/${encodeURIComponent(currentRoom)}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    window.location.reload();
                }
            } catch (err) {
                console.error("Failed to clear chat", err);
            }
        }
        setShowHeaderMenu(false);
    };

    const handleBlockUser = () => {
        alert("User blocked successfully! (Simulation)");
        setShowHeaderMenu(false);
    };

    const handleReportUser = () => {
        alert("User reported to administration.");
        setShowHeaderMenu(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Call Logic
    const startCall = (type) => {
        setCallType(type);
        setIsCalling(true);
        setTimeout(() => setIsCalling(false), 3000);
    };

    // Rich Text Formatting
    const applyFormat = (command) => {
        document.execCommand(command, false, null);
        editorRef.current?.focus();
    };

    const handleBold = () => applyFormat('bold');
    const handleItalic = () => applyFormat('italic');
    const handleUnderline = () => applyFormat('underline');

    // Emoji insertion
    const insertEmoji = (emoji) => {
        const editor = editorRef.current;
        if (editor) {
            editor.focus();
            document.execCommand('insertText', false, emoji);
        }
        setShowEmojiPicker(false);
    };

    // File attachment
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedFile({
                file: file,
                name: file.name,
                size: file.size
            });
        }
        e.target.value = '';
    };

    const removeAttachment = () => {
        setAttachedFile(null);
    };

    // Render message content
    const renderMessageContent = (messageText) => {
        if (!messageText) return null;

        const fileMatch = messageText.match(/\[FILE:([^:]+):([^\]]+)\]/);
        if (fileMatch) {
            const fileUrl = fileMatch[1];
            const fileName = fileMatch[2];
            const textBefore = messageText.substring(0, messageText.indexOf('[FILE:'));

            return (
                <>
                    {textBefore && <span dangerouslySetInnerHTML={{ __html: textBefore }} />}
                    <a
                        href={fileUrl}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-attachment-link"
                    >
                        <FileText size={16} />
                        <span>{fileName}</span>
                        <Download size={14} />
                    </a>
                </>
            );
        }

        return <span dangerouslySetInnerHTML={{ __html: messageText }} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Filter users not in channel
    const availableUsers = allUsers.filter(user =>
        !channelMembers.some(m => m.username === user.username) &&
        user.username.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );

    // Check if current user is admin
    const isAdmin = author === channelCreator;

    return (
        <div className="chat-area">
            {/* Call Overlay */}
            {isCalling && (
                <div className="call-overlay">
                    <div className="call-card">
                        <div className="call-avatar">{displayTitle.charAt(0)}</div>
                        <h3>Calling {displayTitle}...</h3>
                        <p>Connecting via {callType}...</p>
                        <button className="hangup-btn" onClick={() => setIsCalling(false)}>End Call</button>
                    </div>
                </div>
            )}

            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="channel-avatar">
                        {displayTitle.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="channel-details">
                        <h3>{displayTitle}</h3>
                        <span className="channel-status">
                            <Lock size={12} /> Members only
                        </span>
                    </div>
                </div>
                <div className="chat-header-actions">
                    <div className="icon-btn" onClick={() => startCall('Video')} title="Start Video Call">
                        <Video size={20} />
                    </div>
                    <div className="icon-btn" onClick={() => startCall('Voice')} title="Start Voice Call">
                        <Phone size={20} />
                    </div>
                    <div className="divider"></div>
                    <div className="header-menu-wrapper" ref={headerMenuRef}>
                        <div
                            className={`icon-btn ${showHeaderMenu ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(!showHeaderMenu); }}
                        >
                            <MoreHorizontal size={20} />
                        </div>

                        {showHeaderMenu && (
                            <div className="header-dropdown-menu">
                                <div className="dropdown-item" onClick={() => openSidePanel('media')}>
                                    <Image size={16} />
                                    <span>Shared Media</span>
                                </div>
                                <div className="dropdown-item" onClick={() => openSidePanel('links')}>
                                    <Link size={16} />
                                    <span>Shared Links</span>
                                </div>
                                <div className="dropdown-item" onClick={() => openSidePanel('documents')}>
                                    <FileText size={16} />
                                    <span>Shared Documents</span>
                                </div>
                                <div className="dropdown-divider"></div>
                                {isDm ? (
                                    <>
                                        <div className="dropdown-item danger" onClick={handleBlockUser}>
                                            <Ban size={16} />
                                            <span>Block User</span>
                                        </div>
                                        <div className="dropdown-item danger" onClick={handleReportUser}>
                                            <Flag size={16} />
                                            <span>Report User</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="dropdown-item" onClick={() => openSidePanel('members')}>
                                        <Users size={16} />
                                        <span>Members</span>
                                    </div>
                                )}
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item danger" onClick={handleClearChat}>
                                    <Trash2 size={16} />
                                    <span>Clear Chat</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Panel */}
            {sidePanel.show && (
                <div className="side-panel">
                    <div className="side-panel-header">
                        <h3>
                            {sidePanel.type === 'members' && '👥 Channel Members'}
                            {sidePanel.type === 'media' && '🖼️ Shared Media'}
                            {sidePanel.type === 'links' && '🔗 Shared Links'}
                            {sidePanel.type === 'documents' && '📄 Shared Documents'}
                        </h3>
                        <button className="close-panel" onClick={closeSidePanel}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="side-panel-content">
                        {/* Members Panel */}
                        {sidePanel.type === 'members' && (
                            <div className="members-section">
                                {loadingMembers ? (
                                    <div className="loading-members">
                                        <div className="spinner"></div>
                                        <p>Loading members...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Current Members */}
                                        <div className="members-list">
                                            <h4>Members ({channelMembers.length})</h4>
                                            {channelMembers.length === 0 ? (
                                                <p className="no-members">No members yet</p>
                                            ) : (
                                                channelMembers.map((member, i) => (
                                                    <div key={i} className="member-item">
                                                        <div className="member-avatar">
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="member-info">
                                                            <span className="member-name">
                                                                {member.username}
                                                                {member.username === channelCreator && (
                                                                    <Crown size={14} className="admin-crown" title="Channel Admin" />
                                                                )}
                                                            </span>
                                                            <span className="member-role">
                                                                {member.username === channelCreator ? 'Admin' : member.role || 'Member'}
                                                            </span>
                                                        </div>
                                                        {/* Only admin can remove members, and admin cannot remove themselves */}
                                                        {isAdmin && member.username !== author && (
                                                            <button
                                                                className="remove-member-btn"
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

                                        {/* Add Members (Admin only) */}
                                        {isAdmin && (
                                            <div className="add-members-section">
                                                <h4>Add Members</h4>
                                                <div className="member-search">
                                                    <Search size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search users..."
                                                        value={memberSearchTerm}
                                                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="available-users">
                                                    {availableUsers.length === 0 ? (
                                                        <p className="no-users">No users to add</p>
                                                    ) : (
                                                        availableUsers.map((user, i) => (
                                                            <div key={i} className="user-item" onClick={() => addMemberToChannel(user.username)}>
                                                                <div className="user-avatar">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="user-name">{user.username}</span>
                                                                <UserPlus size={16} className="add-icon" />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Media Panel */}
                        {sidePanel.type === 'media' && (
                            <div className="shared-content-list">
                                {getSharedMedia().length === 0 ? (
                                    <div className="empty-shared">
                                        <Image size={48} />
                                        <p>No media shared yet</p>
                                        <span>Images and photos shared in this channel will appear here</span>
                                    </div>
                                ) : (
                                    <div className="media-grid">
                                        {getSharedMedia().map((file, i) => (
                                            <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="media-item">
                                                <img src={file.url} alt={file.name} />
                                                <div className="media-overlay">
                                                    <span>{file.name}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Links Panel */}
                        {sidePanel.type === 'links' && (
                            <div className="shared-content-list">
                                {getSharedLinks().length === 0 ? (
                                    <div className="empty-shared">
                                        <Link size={48} />
                                        <p>No links shared yet</p>
                                        <span>Links shared in this channel will appear here</span>
                                    </div>
                                ) : (
                                    getSharedLinks().map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="shared-item link-item">
                                            <div className="link-icon">
                                                <Link size={20} />
                                            </div>
                                            <div className="link-info">
                                                <span className="link-url">{link.url}</span>
                                                <small>Shared by {link.author} • {link.time}</small>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Documents Panel */}
                        {sidePanel.type === 'documents' && (
                            <div className="shared-content-list">
                                {getSharedDocuments().length === 0 ? (
                                    <div className="empty-shared">
                                        <FileText size={48} />
                                        <p>No documents shared yet</p>
                                        <span>Files and documents shared in this channel will appear here</span>
                                    </div>
                                ) : (
                                    getSharedDocuments().map((file, i) => (
                                        <a key={i} href={file.url} download={file.name} className="shared-item document-item">
                                            <div className="document-icon">
                                                <FileText size={24} />
                                            </div>
                                            <div className="document-info">
                                                <span className="document-name">{file.name}</span>
                                                <small>Shared by {file.author} • {file.time}</small>
                                            </div>
                                            <Download size={18} className="download-icon" />
                                        </a>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="empty-channel">
                        <div className="empty-channel-icon">💬</div>
                        <h3>No messages yet</h3>
                        <p>Be the first to start a conversation in <strong>{displayTitle}</strong></p>
                        <p className="private-notice">
                            <Lock size={14} /> This channel is private. Only joined members can view messages.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isSelf = msg.author === author;
                    const isSequence = index > 0 && messages[index - 1].author === msg.author;

                    return (
                        <div key={index} className={`message-item ${isSelf ? 'self' : ''} ${isSequence ? 'sequence' : ''}`}>
                            {!isSequence && (
                                <div className="message-avatar">
                                    {msg.author.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {isSequence && <div className="message-spacer"></div>}

                            <div className="message-content-wrapper">
                                {!isSequence && (
                                    <div className="message-meta">
                                        <span className="message-author">{msg.author}</span>
                                        <span className="message-time">{msg.time}</span>
                                    </div>
                                )}
                                <div className="message-bubble">
                                    {renderMessageContent(msg.message)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="input-container">
                    <div className="input-toolbar">
                        <button className="tool-btn" onClick={handleBold} title="Bold (Ctrl+B)">
                            <Bold size={16} />
                        </button>
                        <button className="tool-btn" onClick={handleItalic} title="Italic (Ctrl+I)">
                            <Italic size={16} />
                        </button>
                        <button className="tool-btn" onClick={handleUnderline} title="Underline (Ctrl+U)">
                            <Underline size={16} />
                        </button>
                        <div className="divider-small"></div>
                        <button
                            className="tool-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach file"
                            disabled={isUploading}
                        >
                            <Paperclip size={16} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {attachedFile && (
                        <div className="attachment-preview">
                            <FileText size={16} />
                            <span className="attachment-name">{attachedFile.name}</span>
                            <span className="attachment-size">({formatFileSize(attachedFile.size)})</span>
                            <button className="remove-attachment" onClick={removeAttachment}>
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div
                        ref={editorRef}
                        className="rich-text-editor"
                        contentEditable
                        onKeyDown={handleKeyPress}
                        data-placeholder="Type a new message"
                        suppressContentEditableWarning
                    />

                    <div className="input-footer">
                        <div className="left-actions">
                            <button
                                className={`tool-btn ${showEmojiPicker ? 'active' : ''}`}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                title="Insert emoji"
                            >
                                <Smile size={18} />
                            </button>

                            {showEmojiPicker && (
                                <div className="emoji-picker">
                                    <div className="emoji-tabs" style={{ display: 'flex', gap: '4px', padding: '8px', overflowX: 'auto', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveEmojiCategory(cat)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: activeEmojiCategory === cat ? '#5B5FC7' : '#f0f0f0',
                                                    color: activeEmojiCategory === cat ? 'white' : '#666',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="emoji-grid" style={{ maxHeight: '200px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                                        {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
                                            <button
                                                key={i}
                                                className="emoji-btn"
                                                onClick={() => insertEmoji(emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            className={`send-btn ${(editorRef.current?.innerText?.trim() || attachedFile) ? 'active' : ''}`}
                            onClick={handleSend}
                            disabled={isUploading}
                        >
                            {isUploading ? '...' : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatArea;
