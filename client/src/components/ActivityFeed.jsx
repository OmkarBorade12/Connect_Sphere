import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, AtSign, Users, Bell, Clock, Check, CheckCheck, ArrowRight, ThumbsUp, Reply, UserPlus, Megaphone } from 'lucide-react';
import './ActivityFeed.css';

function ActivityFeed({ username, onNavigateToChannel }) {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
        ? "http://localhost:3001"
        : "";

    // Generate realistic sample activities based on current time
    const generateRealisticActivities = () => {
        const now = new Date();
        const activities = [
            {
                id: 1,
                type: 'mention',
                fromUser: 'Sarah Johnson',
                fromAvatar: 'SJ',
                avatarColor: '#E91E63',
                channel: 'Development',
                channelType: 'channel',
                message: `Hey @${username}, can you review the latest PR for the authentication module? Need your input before we merge.`,
                read: false,
                createdAt: new Date(now - 5 * 60000).toISOString(), // 5 mins ago
                priority: 'high'
            },
            {
                id: 2,
                type: 'reaction',
                fromUser: 'Mike Chen',
                fromAvatar: 'MC',
                avatarColor: '#2196F3',
                channel: 'General',
                channelType: 'channel',
                message: 'Great presentation today! 👏',
                reaction: '👍',
                read: false,
                createdAt: new Date(now - 15 * 60000).toISOString(), // 15 mins ago
                priority: 'normal'
            },
            {
                id: 3,
                type: 'reply',
                fromUser: 'Emily Davis',
                fromAvatar: 'ED',
                avatarColor: '#4CAF50',
                channel: 'Announcements',
                channelType: 'channel',
                message: "Sounds good! I'll prepare the documents and share them with the team by EOD.",
                originalMessage: 'Can everyone review the Q4 roadmap?',
                read: false,
                createdAt: new Date(now - 45 * 60000).toISOString(), // 45 mins ago
                priority: 'normal'
            },
            {
                id: 4,
                type: 'mention',
                fromUser: 'Alex Turner',
                fromAvatar: 'AT',
                avatarColor: '#FF9800',
                channel: 'Off-Topic',
                channelType: 'channel',
                message: `@${username} Did you see the game last night? That was incredible!`,
                read: true,
                createdAt: new Date(now - 2 * 3600000).toISOString(), // 2 hours ago
                priority: 'low'
            },
            {
                id: 5,
                type: 'team',
                fromUser: 'Jordan Lee',
                fromAvatar: 'JL',
                avatarColor: '#9C27B0',
                channel: 'Project Alpha Team',
                channelType: 'team',
                message: 'You have been added to the Project Alpha Team',
                read: true,
                createdAt: new Date(now - 5 * 3600000).toISOString(), // 5 hours ago
                priority: 'normal'
            },
            {
                id: 6,
                type: 'reply',
                fromUser: 'Chris Wilson',
                fromAvatar: 'CW',
                avatarColor: '#00BCD4',
                channel: 'Development',
                channelType: 'channel',
                message: "I've pushed the fixes to the staging branch. Ready for QA testing.",
                originalMessage: 'Any updates on the bug fixes?',
                read: true,
                createdAt: new Date(now - 8 * 3600000).toISOString(), // 8 hours ago
                priority: 'normal'
            },
            {
                id: 7,
                type: 'reaction',
                fromUser: 'Lisa Park',
                fromAvatar: 'LP',
                avatarColor: '#FF5722',
                channel: 'Random',
                channelType: 'channel',
                message: 'Check out this awesome meme I found',
                reaction: '😂',
                read: true,
                createdAt: new Date(now - 24 * 3600000).toISOString(), // 1 day ago
                priority: 'low'
            },
            {
                id: 8,
                type: 'mention',
                fromUser: 'David Kim',
                fromAvatar: 'DK',
                avatarColor: '#795548',
                channel: 'General',
                channelType: 'channel',
                message: `@${username} The meeting notes have been uploaded to the shared drive.`,
                read: true,
                createdAt: new Date(now - 48 * 3600000).toISOString(), // 2 days ago
                priority: 'normal'
            }
        ];

        return activities.map(a => ({
            ...a,
            time: formatRelativeTime(new Date(a.createdAt))
        }));
    };

    useEffect(() => {
        fetchActivities();

        // Poll for new activities
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, [username]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/activities?username=${username}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    const formatted = data.map(activity => ({
                        ...activity,
                        time: formatRelativeTime(new Date(activity.createdAt))
                    }));
                    setActivities(formatted);
                } else {
                    // Use realistic sample data if no real data
                    setActivities(generateRealisticActivities());
                }
            } else {
                setActivities(generateRealisticActivities());
            }
        } catch (err) {
            console.error('Failed to fetch activities:', err);
            setActivities(generateRealisticActivities());
        } finally {
            setLoading(false);
        }
    };

    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'mention': return <AtSign size={16} />;
            case 'reaction': return <ThumbsUp size={16} />;
            case 'reply': return <Reply size={16} />;
            case 'team': return <UserPlus size={16} />;
            default: return <Bell size={16} />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'mention': return '#5B5FC7';
            case 'reaction': return '#E91E63';
            case 'reply': return '#4CAF50';
            case 'team': return '#FF9800';
            default: return '#6264A7';
        }
    };

    const getActivityTitle = (activity) => {
        switch (activity.type) {
            case 'mention':
                return `mentioned you in #${activity.channel}`;
            case 'reaction':
                return `reacted ${activity.reaction || '👍'} to your message in #${activity.channel}`;
            case 'reply':
                return `replied to you in #${activity.channel}`;
            case 'team':
                return `added you to ${activity.channel}`;
            default:
                return 'sent you a notification';
        }
    };

    const handleMarkAsRead = async (activityId, e) => {
        e.stopPropagation();
        try {
            await fetch(`${baseUrl}/api/activities/${activityId}/read`, {
                method: 'PUT'
            });
            setActivities(activities.map(a =>
                a.id === activityId ? { ...a, read: true } : a
            ));
        } catch (err) {
            // Optimistic update
            setActivities(activities.map(a =>
                a.id === activityId ? { ...a, read: true } : a
            ));
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`${baseUrl}/api/activities/read-all`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
        } catch (err) {
            // Continue with optimistic update
        }
        setActivities(activities.map(a => ({ ...a, read: true })));
    };

    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        // Mark as read when clicked
        if (!activity.read) {
            handleMarkAsRead(activity.id, { stopPropagation: () => { } });
        }
    };

    const closeActivityDetail = () => {
        setSelectedActivity(null);
    };

    // Filter activities based on selected filter
    const getFilteredActivities = () => {
        let filtered = [...activities];

        switch (filter) {
            case 'mentions':
                filtered = activities.filter(a => a.type === 'mention');
                break;
            case 'replies':
                filtered = activities.filter(a => a.type === 'reply');
                break;
            case 'reactions':
                filtered = activities.filter(a => a.type === 'reaction');
                break;
            case 'all':
            default:
                break;
        }

        return filtered;
    };

    const filteredActivities = getFilteredActivities();
    const unreadCount = activities.filter(a => !a.read).length;

    // Get counts for each filter
    const mentionCount = activities.filter(a => a.type === 'mention' && !a.read).length;
    const replyCount = activities.filter(a => a.type === 'reply' && !a.read).length;
    const reactionCount = activities.filter(a => a.type === 'reaction' && !a.read).length;

    return (
        <div className="activity-feed">
            {/* Activity Detail Panel */}
            {selectedActivity && (
                <div className="activity-detail-overlay" onClick={closeActivityDetail}>
                    <div className="activity-detail-panel" onClick={e => e.stopPropagation()}>
                        <div className="detail-header">
                            <div className="detail-avatar" style={{ backgroundColor: selectedActivity.avatarColor || getActivityColor(selectedActivity.type) }}>
                                {selectedActivity.fromAvatar || selectedActivity.fromUser?.charAt(0)}
                            </div>
                            <div className="detail-info">
                                <h3>{selectedActivity.fromUser}</h3>
                                <span className="detail-action">{getActivityTitle(selectedActivity)}</span>
                            </div>
                            <button className="close-detail" onClick={closeActivityDetail}>×</button>
                        </div>

                        <div className="detail-content">
                            {selectedActivity.type === 'reply' && selectedActivity.originalMessage && (
                                <div className="original-message">
                                    <span className="original-label">Replying to:</span>
                                    <p>"{selectedActivity.originalMessage}"</p>
                                </div>
                            )}

                            <div className="message-content">
                                <p>{selectedActivity.message}</p>
                            </div>

                            <div className="detail-meta">
                                <Clock size={14} />
                                <span>{selectedActivity.time}</span>
                                <span className="meta-divider">•</span>
                                <span>#{selectedActivity.channel}</span>
                            </div>
                        </div>

                        <div className="detail-actions">
                            <button
                                className="action-btn primary"
                                onClick={() => {
                                    if (onNavigateToChannel && selectedActivity.channel) {
                                        onNavigateToChannel(selectedActivity.channel);
                                        closeActivityDetail();
                                    }
                                }}
                            >
                                <ArrowRight size={16} />
                                Go to message
                            </button>
                            <button className="action-btn secondary" onClick={closeActivityDetail}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="activity-header">
                <div className="activity-header-left">
                    <div className="activity-icon-wrapper">
                        <Bell size={24} />
                    </div>
                    <div className="activity-title">
                        <h2>Activity</h2>
                        <span className="activity-subtitle">Stay updated with your mentions and replies</span>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                        <CheckCheck size={16} />
                        Mark all as read ({unreadCount})
                    </button>
                )}
            </div>

            <div className="activity-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    <Bell size={14} />
                    All
                    {unreadCount > 0 && <span className="filter-badge">{unreadCount}</span>}
                </button>
                <button
                    className={`filter-btn ${filter === 'mentions' ? 'active' : ''}`}
                    onClick={() => setFilter('mentions')}
                >
                    <AtSign size={14} />
                    Mentions
                    {mentionCount > 0 && <span className="filter-badge mention">{mentionCount}</span>}
                </button>
                <button
                    className={`filter-btn ${filter === 'replies' ? 'active' : ''}`}
                    onClick={() => setFilter('replies')}
                >
                    <Reply size={14} />
                    Replies
                    {replyCount > 0 && <span className="filter-badge reply">{replyCount}</span>}
                </button>
                <button
                    className={`filter-btn ${filter === 'reactions' ? 'active' : ''}`}
                    onClick={() => setFilter('reactions')}
                >
                    <Heart size={14} />
                    Reactions
                    {reactionCount > 0 && <span className="filter-badge reaction">{reactionCount}</span>}
                </button>
            </div>

            <div className="activity-list">
                {loading ? (
                    <div className="activity-loading">
                        <div className="spinner"></div>
                        <p>Loading activities...</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="no-activities">
                        {filter === 'all' ? (
                            <>
                                <div className="empty-icon">🔔</div>
                                <h3>No activities yet</h3>
                                <p>When someone mentions you, replies to your messages, or reacts to your posts, you'll see it here.</p>
                            </>
                        ) : (
                            <>
                                <div className="empty-icon">
                                    {filter === 'mentions' && '📢'}
                                    {filter === 'replies' && '💬'}
                                    {filter === 'reactions' && '❤️'}
                                </div>
                                <h3>No {filter} yet</h3>
                                <p>
                                    {filter === 'mentions' && "When someone @mentions you in a channel, you'll see it here."}
                                    {filter === 'replies' && "When someone replies to your messages, you'll see it here."}
                                    {filter === 'reactions' && "When someone reacts to your messages, you'll see it here."}
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Group by time */}
                        {filteredActivities.some(a => !a.read) && (
                            <div className="activity-group">
                                <div className="group-header">
                                    <span className="group-label new">New</span>
                                    <div className="group-line"></div>
                                </div>
                                {filteredActivities.filter(a => !a.read).map((activity) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        getActivityIcon={getActivityIcon}
                                        getActivityColor={getActivityColor}
                                        getActivityTitle={getActivityTitle}
                                        onClick={handleActivityClick}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </div>
                        )}

                        {filteredActivities.some(a => a.read) && (
                            <div className="activity-group">
                                <div className="group-header">
                                    <span className="group-label">Earlier</span>
                                    <div className="group-line"></div>
                                </div>
                                {filteredActivities.filter(a => a.read).map((activity) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        getActivityIcon={getActivityIcon}
                                        getActivityColor={getActivityColor}
                                        getActivityTitle={getActivityTitle}
                                        onClick={handleActivityClick}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {filteredActivities.length > 0 && !filteredActivities.some(a => !a.read) && (
                <div className="activity-footer">
                    <div className="caught-up">
                        <span className="caught-up-icon">✨</span>
                        <p>You're all caught up!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Activity Item Component
function ActivityItem({ activity, getActivityIcon, getActivityColor, getActivityTitle, onClick, onMarkAsRead }) {
    return (
        <div
            className={`activity-item ${!activity.read ? 'unread' : ''} ${activity.priority === 'high' ? 'high-priority' : ''}`}
            onClick={() => onClick(activity)}
        >
            <div className="activity-left">
                <div
                    className="activity-avatar"
                    style={{ backgroundColor: activity.avatarColor || getActivityColor(activity.type) }}
                >
                    {activity.fromAvatar || activity.fromUser?.charAt(0)}
                </div>
                <div
                    className="activity-type-badge"
                    style={{ backgroundColor: getActivityColor(activity.type) }}
                >
                    {getActivityIcon(activity.type)}
                </div>
            </div>

            <div className="activity-content">
                <div className="activity-header-row">
                    <span className="activity-user">{activity.fromUser}</span>
                    <span className="activity-action">{getActivityTitle(activity)}</span>
                </div>

                {activity.message && (
                    <div className="activity-message">
                        {activity.type === 'reaction' && (
                            <span className="reaction-emoji">{activity.reaction || '👍'}</span>
                        )}
                        <span className="message-text">"{activity.message}"</span>
                    </div>
                )}

                <div className="activity-footer-row">
                    <div className="activity-time">
                        <Clock size={12} />
                        <span>{activity.time}</span>
                    </div>
                    <div className="activity-channel">
                        <span>#{activity.channel}</span>
                    </div>
                </div>
            </div>

            <div className="activity-right">
                {!activity.read && (
                    <button
                        className="mark-read-btn"
                        onClick={(e) => onMarkAsRead(activity.id, e)}
                        title="Mark as read"
                    >
                        <Check size={14} />
                    </button>
                )}
                <div className="view-arrow">
                    <ArrowRight size={16} />
                </div>
            </div>

            {!activity.read && <div className="unread-indicator"></div>}
        </div>
    );
}

export default ActivityFeed;
