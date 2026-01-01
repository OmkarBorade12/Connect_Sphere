import React from 'react';
import { Bell, MessageSquare, Users, Calendar, Phone, Settings } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ activeTab, setActiveTab, username, unreadActivities = 0 }) {
    const menuItems = [
        { name: 'Activity', icon: <Bell size={24} strokeWidth={1.5} />, badge: unreadActivities },
        { name: 'Chat', icon: <MessageSquare size={24} strokeWidth={1.5} /> },
        { name: 'Teams', icon: <Users size={24} strokeWidth={1.5} /> },
        { name: 'Calendar', icon: <Calendar size={24} strokeWidth={1.5} /> },
        { name: 'Calls', icon: <Phone size={24} strokeWidth={1.5} /> },
    ];

    // Toggle tab: if clicking the active tab, go back to Teams (default)
    const handleTabClick = (tabName) => {
        if (activeTab === tabName) {
            // Toggle off - go back to default (Teams)
            setActiveTab('Teams');
        } else {
            setActiveTab(tabName);
        }
    };

    return (
        <div className="sidebar">
            {menuItems.map((item) => (
                <div
                    key={item.name}
                    className={`sidebar-item ${activeTab === item.name ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.name)}
                >
                    <div className="sidebar-icon-wrapper">
                        {item.icon}
                        {item.badge > 0 && (
                            <span className="sidebar-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                        )}
                    </div>
                    <span>{item.name}</span>
                </div>
            ))}

            <div className="sidebar-spacer"></div>

            {/* Settings */}
            <div
                className={`sidebar-item ${activeTab === 'Settings' ? 'active' : ''}`}
                onClick={() => handleTabClick('Settings')}
                title="Settings"
            >
                <Settings size={24} strokeWidth={1.5} />
                <span>Settings</span>
            </div>

            {/* User Avatar - Click to toggle Settings */}
            <div className="sidebar-user-section">
                <div
                    className="sidebar-user-avatar"
                    title={`Logged in as ${username} - Click for Settings`}
                    onClick={() => handleTabClick('Settings')}
                    style={{ cursor: 'pointer' }}
                >
                    {username ? username.charAt(0).toUpperCase() : '?'}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
