const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Use SQLite for zero-config persistence
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING, // storing bcrypt hash
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'online'
    },
    avatarColor: {
        type: DataTypes.STRING,
        defaultValue: '#6264A7'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isMobileVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

const Message = sequelize.define('Message', {
    room: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Calendar Events Table
const CalendarEvent = sequelize.define('CalendarEvent', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'meeting' // meeting, video, reminder
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#5B5FC7'
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    attendees: {
        type: DataTypes.TEXT, // JSON string of attendee usernames
        defaultValue: '[]'
    }
});

// Activity/Notification Table
const Activity = sequelize.define('Activity', {
    type: {
        type: DataTypes.STRING, // mention, reaction, reply, team
        allowNull: false
    },
    targetUser: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fromUser: {
        type: DataTypes.STRING,
        allowNull: false
    },
    channel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Speed Dial Contacts
const SpeedDial = sequelize.define('SpeedDial', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contactUsername: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Call History
const CallHistory = sequelize.define('CallHistory', {
    callerUsername: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiverUsername: {
        type: DataTypes.STRING,
        allowNull: false
    },
    callType: {
        type: DataTypes.STRING, // voice, video
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // outgoing, incoming, missed
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Channel Members
const ChannelMember = sequelize.define('ChannelMember', {
    channel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'member' // admin, member
    }
});

// Channels Table
const Channel = sequelize.define('Channel', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// User Settings
const UserSettings = sequelize.define('UserSettings', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    theme: {
        type: DataTypes.STRING,
        defaultValue: 'light'
    },
    notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'English'
    }
});

const initDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // Creates tables if they don't exist
        console.log('Database connected and synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Message,
    CalendarEvent,
    Activity,
    SpeedDial,
    CallHistory,
    CallHistory,
    ChannelMember,
    Channel,
    UserSettings,
    initDB
};
