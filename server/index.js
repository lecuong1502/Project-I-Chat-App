const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

mongoose.connect('mongodb://127.0.0.1:27017/z-chat')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, birthday, phone, address } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            birthday,
            phone,
            address
        });

        await newUser.save();

        const { password: _, ...userData } = newUser._doc;
        res.status(201).json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" });
        }

        user.isOnline = true;
        await user.save();

        const { password: _, ...userData } = user._doc;
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Search user
app.get('/api/users', async (req, res) => {
    const keyword = req.query.search || '';
    try {
        const users = await User.find({
            $or: [
                { firstName: { $regex: keyword, $options: 'i' } },
                { lastName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        }).select("-password");         // Not return password when searching

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});


// Gửi tin nhắn
app.post("/api/messages", async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Lấy tin nhắn giữa 2 người
app.get("/api/messages/:userId1/:userId2", async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json(err);
    }
})

// Lấy danh sách những người đã từng nhắn tin với userId
app.get("/api/conversations/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Sắp xếp giảm dần theo thời gian để lấy những người nhắn gần đây nhất
        const messages = await Message.find({
            $or: [ { senderId: userId }, { receiverId: userId } ]
        }).sort({ createdAt: -1 });

        const partnerIds = [];
        const seen = new Set();

        messages.forEach(msg => {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!seen.has(partnerId)) {
                seen.add(partnerId);
                partnerIds.push(partnerId);
            }
        });

        const conversationList = await Promise.all(partnerIds.map(async (partnerId) => {
            const user = await User.findById(partnerId).select("-password");
            
            // Tìm tin nhắn mới nhất giữa mình và người này
            const lastMsg = await Message.findOne({
                $or: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            }).sort({ createdAt: -1 });

            // Trả về object User kèm thêm trường lastMessageText
            return {
                ...user._doc,
                lastMessageText: lastMsg ? lastMsg.text : "",
                lastMessageTime: lastMsg ? lastMsg.createdAt : ""
            };
        }));

        res.status(200).json(conversationList);
    } catch (error) {
        console.error(err);
        res.status(500).json(err);
    }
})

// SOCKET.IO
let onlineUsers = [];

io.on('connection', (socket) => {
    socket.on('addUser', async (userId) => {
        if (!userId) return;
        await User.findByIdAndUpdate(userId, { isOnline: true });

        if (!onlineUsers.some(u => u.userId === userId)) {
            onlineUsers.push({ userId, socketId: socket.id });
        }
        io.emit('getOnlineUsers', onlineUsers);
    });

    socket.on('sendMessage', ({ senderId, receiverId, text, replyTo }) => {
        const user = onlineUsers.find(u => u.userId === receiverId);
        if (user) {
            io.to(user.socketId).emit('getMessage', {
                senderId,
                text,
                replyTo,
                createdAt: new Date().toISOString(),
            });
        }
    });

    socket.on('disconnect', async () => {
        const disconnectedUser = onlineUsers.find(u => u.socketId === socket.id);
        if (disconnectedUser) {
            onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
            await User.findByIdAndUpdate(disconnectedUser.userId, { isOnline: false });
            io.emit('getOnlineUsers', onlineUsers);
        }
    });
});

server.listen(3001, () => {
    console.log('Server running on port 3001');
});