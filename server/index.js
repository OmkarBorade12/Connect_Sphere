const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    initDB,
    User,
    Message,
    CalendarEvent,
    Activity,
    SpeedDial,
    CallHistory,
    ChannelMember,
    Channel,
    UserSettings
} = require('./db');

// --- Configuration ---
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'super_secret_key_change_in_production'; // Simple secret

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Enable JSON body parsing for API

// --- Database Init ---
initDB();

// --- Uploads Directory ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Static Files ---
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// --- File Upload Endpoint ---
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size
    });
});

// --- API Routes (Authentication) ---

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Missing fields" });

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ error: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword });

        // Create default user settings
        await UserSettings.findOrCreate({ where: { username: newUser.username } });

        // Add to default 'General' channel
        await Channel.findOrCreate({ where: { name: 'General' }, defaults: { createdBy: 'system' } });
        await ChannelMember.create({ channel: 'General', username: newUser.username, role: 'member' });

        const token = jwt.sign({ username: newUser.username, id: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: newUser.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // Update user status to online
        await User.update({ status: 'online' }, { where: { username } });

        // Ensure user is in General channel (Backfill for existing users)
        await Channel.findOrCreate({ where: { name: 'General' }, defaults: { createdBy: 'system' } });
        const inGeneral = await ChannelMember.findOne({ where: { channel: 'General', username } });
        if (!inGeneral) {
            await ChannelMember.create({ channel: 'General', username, role: 'member' });
        }

        const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get Users (for DMs)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'status', 'avatarColor', 'email', 'mobile']
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update user status
app.put('/api/users/:username/status', async (req, res) => {
    try {
        const { username } = req.params;
        const { status } = req.body;
        await User.update({ status }, { where: { username } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update User Profile
app.put('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { mobile, email } = req.body;
        await User.update({ mobile, email }, { where: { username } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get User Profile
app.get('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'status', 'avatarColor', 'email', 'mobile', 'isEmailVerified', 'isMobileVerified']
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Send Verification Code (Simulated)
app.post('/api/verify/send-code', (req, res) => {
    // In a real app, integrate SMS/Email provider
    const { type, contact } = req.body;
    console.log(`Sending verification code to ${type}: ${contact}`);
    res.json({ success: true, message: "Code sent (Check logs - for demo any code works)" });
});

// Confirm Verification Code (Simulated)
app.post('/api/verify/confirm-code', async (req, res) => {
    const { username, type, code } = req.body;
    if (code && code.length >= 4) {
        const field = type === 'email' ? 'isEmailVerified' : 'isMobileVerified';
        await User.update({ [field]: true }, { where: { username } });
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid code" });
    }
});

// Clear chat history
app.delete('/api/messages/:room', async (req, res) => {
    try {
        const { room } = req.params;
        await Message.destroy({ where: { room } });
        // Emit event to clear client side immediately if connected?
        // Ideally socket should handle real-time clearing, but client can reload or handle success
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Calendar Event Routes ---

// Get all events for a user
app.get('/api/events', async (req, res) => {
    try {
        const { username } = req.query;
        const events = await CalendarEvent.findAll({
            order: [['date', 'ASC'], ['startTime', 'ASC']]
        });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Create event
app.post('/api/events', async (req, res) => {
    try {
        const { title, description, date, startTime, endTime, type, color, createdBy, attendees } = req.body;
        const event = await CalendarEvent.create({
            title, description, date, startTime, endTime, type, color, createdBy,
            attendees: JSON.stringify(attendees || [])
        });
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update event
app.put('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, startTime, endTime, type, color, attendees } = req.body;
        await CalendarEvent.update(
            { title, description, date, startTime, endTime, type, color, attendees: JSON.stringify(attendees || []) },
            { where: { id } }
        );
        const updated = await CalendarEvent.findByPk(id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await CalendarEvent.destroy({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Activity Routes ---

// Get activities for a user
app.get('/api/activities', async (req, res) => {
    try {
        const { username } = req.query;
        const activities = await Activity.findAll({
            where: { targetUser: username },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Create activity
app.post('/api/activities', async (req, res) => {
    try {
        const { type, targetUser, fromUser, channel, message } = req.body;
        const activity = await Activity.create({ type, targetUser, fromUser, channel, message });
        res.json(activity);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Mark activity as read
app.put('/api/activities/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await Activity.update({ read: true }, { where: { id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Mark all activities as read
app.put('/api/activities/read-all', async (req, res) => {
    try {
        const { username } = req.body;
        await Activity.update({ read: true }, { where: { targetUser: username } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Speed Dial Routes ---

// Get speed dial contacts
app.get('/api/speed-dial', async (req, res) => {
    try {
        const { username } = req.query;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const speedDials = await SpeedDial.findAll({
            where: { userId: user.id },
            order: [['order', 'ASC']]
        });

        // Get user details for each contact
        const contacts = await Promise.all(speedDials.map(async (sd) => {
            const contact = await User.findOne({ where: { username: sd.contactUsername } });
            return {
                id: sd.id,
                username: sd.contactUsername,
                status: contact?.status || 'offline',
                order: sd.order
            };
        }));

        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add to speed dial
app.post('/api/speed-dial', async (req, res) => {
    try {
        const { username, contactUsername } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const existing = await SpeedDial.findOne({
            where: { userId: user.id, contactUsername }
        });
        if (existing) return res.status(400).json({ error: "Already in speed dial" });

        const count = await SpeedDial.count({ where: { userId: user.id } });
        const speedDial = await SpeedDial.create({
            userId: user.id,
            contactUsername,
            order: count
        });
        res.json(speedDial);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Remove from speed dial
app.delete('/api/speed-dial/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await SpeedDial.destroy({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Call History Routes ---

// Get call history
app.get('/api/call-history', async (req, res) => {
    try {
        const { username } = req.query;
        const { Op } = require('sequelize');
        const calls = await CallHistory.findAll({
            where: {
                [Op.or]: [
                    { callerUsername: username },
                    { receiverUsername: username }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        // Format calls with proper status relative to the requester
        const formattedCalls = calls.map(call => ({
            id: call.id,
            name: call.callerUsername === username ? call.receiverUsername : call.callerUsername,
            type: call.callerUsername === username ? 'outgoing' : (call.status === 'missed' ? 'missed' : 'incoming'),
            callType: call.callType,
            duration: call.duration,
            time: call.createdAt
        }));

        res.json(formattedCalls);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Create call history entry
app.post('/api/call-history', async (req, res) => {
    try {
        const { callerUsername, receiverUsername, callType, status, duration } = req.body;
        const call = await CallHistory.create({
            callerUsername, receiverUsername, callType, status, duration
        });
        res.json(call);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Channel Routes ---

// Get all channels
app.get('/api/channels', async (req, res) => {
    try {
        const channels = await Channel.findAll();
        if (channels.length === 0) {
            const defaults = ['General', 'Random'];
            const created = [];
            for (const name of defaults) {
                created.push(await Channel.create({ name, createdBy: 'system' }));
            }
            return res.json(created);
        }
        res.json(channels);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Create channel
app.post('/api/channels', async (req, res) => {
    try {
        const { name, createdBy } = req.body;
        const existing = await Channel.findOne({ where: { name } });
        if (existing) return res.status(400).json({ error: "Channel exists" });

        const channel = await Channel.create({ name, createdBy: createdBy || 'system' });
        if (createdBy) {
            await ChannelMember.create({ channel: name, username: createdBy, role: 'admin' });
        }
        res.json(channel);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete channel
app.delete('/api/channels/:name', async (req, res) => {
    try {
        const { name } = req.params;
        await Channel.destroy({ where: { name } });
        await ChannelMember.destroy({ where: { channel: name } });
        await Message.destroy({ where: { room: name } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Rename channel
app.put('/api/channels/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { newName } = req.body;
        await Channel.update({ name: newName }, { where: { name } });
        await Message.update({ room: newName }, { where: { room: name } });
        await ChannelMember.update({ channel: newName }, { where: { channel: name } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Channel Members Routes ---

// Get channel members
app.get('/api/channels/:channel/members', async (req, res) => {
    try {
        const { channel } = req.params;
        const members = await ChannelMember.findAll({ where: { channel } });

        // Get user details
        const memberDetails = await Promise.all(members.map(async (m) => {
            const user = await User.findOne({ where: { username: m.username } });
            return {
                username: m.username,
                role: m.role,
                status: user?.status || 'offline'
            };
        }));

        res.json(memberDetails);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add member to channel
app.post('/api/channels/:channel/members', async (req, res) => {
    try {
        const { channel } = req.params;
        const { username } = req.body;

        const existing = await ChannelMember.findOne({ where: { channel, username } });
        if (existing) return res.status(400).json({ error: "Already a member" });

        const member = await ChannelMember.create({ channel, username });
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Remove member from channel
app.delete('/api/channels/:channel/members/:username', async (req, res) => {
    try {
        const { channel, username } = req.params;
        await ChannelMember.destroy({ where: { channel, username } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- User Settings Routes ---

// Get user settings
app.get('/api/settings/:username', async (req, res) => {
    try {
        const { username } = req.params;
        let settings = await UserSettings.findOne({ where: { username } });

        if (!settings) {
            settings = await UserSettings.create({ username });
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update user settings
app.put('/api/settings/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { theme, notifications, language } = req.body;

        await UserSettings.update(
            { theme, notifications, language },
            { where: { username } }
        );

        const updated = await UserSettings.findOne({ where: { username } });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let users = {}; // Online tracking

io.on("connection", (socket) => {
    socket.on("join_room", async (data) => {
        const { room, username } = data;
        socket.join(room);
        users[socket.id] = { username, room }; // Track online

        // Update user status
        await User.update({ status: 'online' }, { where: { username } });

        // Fetch History from DB
        const history = await Message.findAll({
            where: { room },
            limit: 50,
            order: [['createdAt', 'ASC']]
        });

        const formattedHistory = history.map(h => ({
            room: h.room,
            author: h.author,
            message: h.content,
            time: h.timestamp,
            id: h.id
        }));

        socket.emit("receive_message_history", formattedHistory);
        io.to(room).emit("user_joined", { username, room });

        // Broadcast online status update
        io.emit("user_status_update", { username, status: 'online' });
    });

    socket.on("send_message", async (data) => {
        const { room, author, message, time } = data;

        // Save to DB
        const SavedMsg = await Message.create({
            room,
            author,
            content: message,
            timestamp: time
        });

        const msgData = {
            room,
            author,
            message,
            time,
            id: SavedMsg.id
        };

        io.to(room).emit("receive_message", msgData);

        // Check for mentions and create activities
        const mentionPattern = /@(\w+)/g;
        let match;
        while ((match = mentionPattern.exec(message)) !== null) {
            const mentionedUser = match[1];
            if (mentionedUser !== author) {
                await Activity.create({
                    type: 'mention',
                    targetUser: mentionedUser,
                    fromUser: author,
                    channel: room,
                    message: message.substring(0, 100)
                });
                // Emit activity to mentioned user
                io.emit("new_activity", {
                    targetUser: mentionedUser,
                    type: 'mention',
                    fromUser: author,
                    channel: room
                });
            }
        }
    });

    // Handle call events
    socket.on("initiate_call", async (data) => {
        const { callerUsername, receiverUsername, callType } = data;

        // Create call history entry
        await CallHistory.create({
            callerUsername,
            receiverUsername,
            callType,
            status: 'outgoing',
            duration: null
        });

        // Notify the receiver
        io.emit("incoming_call", {
            callerUsername,
            receiverUsername,
            callType
        });
    });

    socket.on("end_call", async (data) => {
        const { callId, duration } = data;
        if (callId && duration) {
            await CallHistory.update({ duration }, { where: { id: callId } });
        }
    });

    socket.on("disconnect", async () => {
        const user = users[socket.id];
        if (user) {
            // Update user status to offline
            await User.update({ status: 'offline' }, { where: { username: user.username } });

            io.to(user.room).emit("user_left", { username: user.username });
            io.emit("user_status_update", { username: user.username, status: 'offline' });
            delete users[socket.id];
        }
    });
});

// Catch-all for SPA - must be last
app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
    }
    const indexFile = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).send('Application build not found. Run npm run build in client folder.');
    }
});

server.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`ConnectSphere is FULLY OPERATIONAL`);
    console.log(`Server & Frontend running at: http://localhost:${PORT}`);
    console.log(`Database: SQLite (All features enabled)`);
    console.log(`--------------------------------------------------`);
});
