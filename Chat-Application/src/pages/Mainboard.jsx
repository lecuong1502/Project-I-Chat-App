import React, { useState, useEffect, useRef } from "react";
import './Mainboard.css'; // Link file CSS
import { FaSearch, FaPhoneAlt, FaVideo, FaInfoCircle, FaImage, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const Mainboard = () => {
    const navigate = useNavigate();
    const socket = useRef();
    const scrollRef = useRef();

    const [currentUser, setCurrentUser] = useState(null);

    // States cho Chat
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null); // Lưu tin nhắn đang muốn reply
    const [showOptionId, setShowOptionId] = useState(null);

    const sharedImages = [
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=100&q=60",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=60",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=60"
    ];

    // --- LOGIC KẾT NỐI ---
    useEffect(() => {
        const userString = localStorage.getItem("user");
        if (!userString) {
            navigate("/");
            return;
        }

        try {
            const user = JSON.parse(userString);
            setCurrentUser(user);

            socket.current = io("http://localhost:3001");
            if (user._id) socket.current.emit("addUser", user._id.toString());

            socket.current.on("getMessage", (data) => {
                setArrivalMessage({
                    sender: data.senderId,
                    text: data.text,
                    replyTo: data.replyTo,
                    createdAt: Date.now(),
                    type: 'text'
                });
            });
        } catch (error) {
            console.error("User data error:", error);
            navigate("/");
        }

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [navigate]);

    // Xử lý tin nhắn đến
    useEffect(() => {
        if (arrivalMessage) {
            if (activeChat && arrivalMessage.sender === activeChat._id) {
                // Nếu đang chat với người gửi -> Thêm vào tin nhắn
                setMessages((prev) => [...prev, arrivalMessage]);
            } else {
                // Nếu không -> Thêm vào thông báo
                setNotifications((prev) => [arrivalMessage.sender, ...prev]);
            }

            setConversations(prev => prev.map(conv => {
                if (conv._id === arrivalMessage.sender) {
                    return { ...conv, lastMessageText: arrivalMessage.text };
                }
                return conv;
            }));

            setArrivalMessage(null);
        }
    }, [arrivalMessage, activeChat]);

    // Auto scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const getConversations = async () => {
            if (currentUser) {
                try {
                    const res = await axios.get(`http://localhost:3001/api/conversations/${currentUser._id}`);
                    setConversations(res.data);
                } catch (err) {
                    console.error("Lỗi lấy danh sách hội thoại:", err);
                }
            }
        };

        getConversations();
    }, [currentUser]);

    // Tìm kiếm User
    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            if (!searchQuery.trim()) return;
            try {
                const res = await axios.get(`http://localhost:3001/api/users?search=${searchQuery}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Chọn User để chat
    const handleSelectUser = async (user) => {
        setActiveChat(user);
        setSearchResults([]);
        setSearchQuery("");
        setMessages([]);

        const isExist = conversations.some(u => u._id === user._id);
        if (!isExist) {
            setConversations([...conversations, user]);
        }

        setNotifications((prev) => prev.filter((n) => n !== user._id));

        try {
            const res = await axios.get(`http://localhost:3001/api/messages/${currentUser._id}/${user._id}`);

            const formattedMessages = res.data.map(msg => ({
                sender: msg.senderId,
                text: msg.text,
                createdAt: msg.createdAt,
                _id: msg._id
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", err);
        }
    };

    // Hàm chọn reply một tin nhắn
    const handleReply = (msg) => {
        setReplyingTo(msg);
        setShowOptionId(null);
        document.querySelector('.chat-footer input').focus();
    };

    // Hàm hủy reply
    const cancelReply = () => {
        setReplyingTo(null);
    };

    // Xử lý click chuột trái vào tin nhắn để hiện nút Reply
    const handleMessageClick = (msgId) => {
        if (showOptionId === msgId) {
            setShowOptionId(null);
        } else {
            setShowOptionId(msgId);
        }
    };

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        const messageText = newMessage;

        const replyData = replyingTo ? {
            id: replyingTo._id,
            text: replyingTo.text,
            senderId: replyingTo.sender
        } : null;

        const msgData = {
            senderId: currentUser._id.toString(),
            receiverId: activeChat._id.toString(),
            text: messageText
        };

        socket.current.emit("sendMessage", msgData);

        try {
            const res = await axios.post("http://localhost:3001/api/messages", {
                senderId: currentUser._id,
                receiverId: activeChat._id,
                text: messageText,
                replyTo: replyData
            });

            // Cập nhật giao diện ngay lập tức
            setMessages([...messages, {
                sender: currentUser._id,
                text: messageText,
                replyTo: replyData,
                createdAt: Date.now()
            }]);

            setConversations(prev => prev.map(conv => {
                if (conv._id === activeChat._id) {
                    return { ...conv, lastMessageText: messageText };
                }
                return conv;
            }));

            setNewMessage(""); // Xóa ô nhập liệu
            setReplyingTo(null);
        } catch (err) {
            console.error("Lỗi gửi tin nhắn:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (!currentUser) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>Loading...</div>;

    return (
        <div className="main-board-container">
            {/* --- SIDEBAR --- */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Z-Chat</h2>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>

                <div className="search-bar">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search in Z-Chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                <div className="user-list">
                    {/* Hiển thị kết quả tìm kiếm */}
                    {searchResults.length > 0 && (
                        <div style={{ padding: '0 15px' }}>
                            <p style={{ fontSize: 12, color: '#999' }}>Search Result:</p>
                            {searchResults.map(user => (
                                <div key={user._id} className="user-item" onClick={() => handleSelectUser(user)}>
                                    <img src={user.avatar || "https://via.placeholder.com/50"} alt="avt" className="avatar" />
                                    <div className="user-info">
                                        <h4>{user.firstName} {user.lastName}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                </div>
                            ))}
                            <hr style={{ margin: '10px 0', border: 'none', borderBottom: '1px solid #eee' }} />
                        </div>
                    )}

                    {/* Hiển thị danh sách chat */}
                    {conversations.map(user => {
                        // Tính số lượng tin nhắn chưa đọc của user này
                        const unreadCount = notifications.filter(n => n === user._id).length;

                        return (
                            <div
                                key={user._id}
                                className={`user-item ${activeChat?._id === user._id ? 'active' : ''}`}
                                onClick={() => handleSelectUser(user)}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img src={user.avatar} alt="avatar" className="avatar" />
                                    {/* Dấu chấm xanh online */}
                                    {user.isOnline && <div className="online-dot-avatar"></div>}
                                </div>

                                <div className="user-info">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {/* Nếu có tin nhắn chưa đọc thì bôi đậm tên */}
                                        <h4 style={{ fontWeight: unreadCount > 0 ? '800' : '600' }}>
                                            {user.firstName} {user.lastName}
                                        </h4>
                                        {/* Hiển thị thời gian (Optional - làm sau) */}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p className={`last-msg-text ${unreadCount > 0 ? 'unread-text' : ''}`}>
                                            {unreadCount > 0
                                                ? "New message"
                                                : (user.lastMessageText || "No messages yet")
                                            }
                                        </p>

                                        {/* HIỂN THỊ SỐ LƯỢNG TIN NHẮN CHƯA ĐỌC */}
                                        {unreadCount > 0 && (
                                            <span className="notification-badge">{unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- CHAT WINDOW --- */}
            <div className="chat-window">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-user">
                                <img src={activeChat.avatar} alt="avt" className="avatar" style={{ width: 40, height: 40 }} />
                                <div className="user-info">
                                    <h4>{activeChat.firstName} {activeChat.lastName}</h4>
                                    <p style={{ fontSize: 13, color: '#65676b' }}>
                                        {activeChat.isOnline ? "Active now" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="chat-actions">
                                <FaPhoneAlt /> <FaVideo /> <FaInfoCircle />
                            </div>
                        </div>

                        <div className="chat-body">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === currentUser._id || msg.sender === "me" || msg.sender === currentUser._id.toString();

                                return (
                                    <div ref={scrollRef} key={index} className={`message-wrapper ${isMe ? 'my-msg' : 'friend-msg'}`}>

                                        {/* Wrapper để xử lý click hiện nút Reply */}
                                        <div className="message-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

                                            {/* Nút Reply (Hiện bên trái tin nhắn mình, bên phải tin nhắn bạn) */}
                                            {showOptionId === index && (
                                                <div className={`reply-btn ${isMe ? 'reply-left' : 'reply-right'}`} onClick={() => handleReply(msg)}>
                                                    Reply
                                                </div>
                                            )}

                                            <div
                                                className={`message ${isMe ? 'sent' : 'received'}`}
                                                onClick={() => handleMessageClick(index)} // Sự kiện Click chuột trái
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {/* --- PHẦN HIỂN THỊ TIN NHẮN GỐC (QUOTE) --- */}
                                                {msg.replyTo && (
                                                    <div className="reply-quote-block">
                                                        <span className="reply-sender-name">
                                                            {msg.replyTo.senderId === currentUser._id ? "You" : (activeChat ? activeChat.firstName : "Friend")}
                                                        </span>
                                                        <p className="reply-text-content">{msg.replyTo.text}</p>
                                                    </div>
                                                )}

                                                {/* Nội dung tin nhắn chính */}
                                                <p>{msg.text}</p>
                                            </div>

                                        </div>

                                        <span className="msg-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="chat-footer-container">
                            {/* --- THANH PREVIEW KHI ĐANG REPLY --- */}
                            {replyingTo && (
                                <div className="reply-preview-bar">
                                    <div className="reply-info">
                                        <span>Replying to <b>{replyingTo.sender === currentUser._id ? "Yourself" : "Friend"}</b></span>
                                        <p>{replyingTo.text}</p>
                                    </div>
                                    <button onClick={cancelReply} className="close-reply-btn">×</button>
                                </div>
                            )}

                            {/* Input cũ */}
                            <div className="chat-footer">
                                <FaImage size={20} color="#0084ff" style={{ cursor: 'pointer' }} />
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <FaPaperPlane
                                    size={20}
                                    color="#0084ff"
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleSendMessage}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="chat" style={{ width: 80, opacity: 0.5, marginBottom: 20 }} />
                        <h3>Welcome, {currentUser.firstName}!</h3>
                        <p>Select a conversation or search for someone to start chatting.</p>
                    </div>
                )}
            </div>

            {/* --- RIGHT INFO PANEL --- */}
            {activeChat && (
                <div className="info-panel">
                    <div className="profile-section">
                        <img src={activeChat.avatar} alt="profile" className="big-avatar" />
                        <h3>{activeChat.firstName} {activeChat.lastName}</h3>
                        <p style={{ color: '#65676b', fontSize: 13 }}>Facebook Profile</p>
                    </div>

                    <div className="options-list">
                        <div className="option-item">
                            <span>Conversation Color</span>
                            <span style={{ width: 20, height: 20, background: '#0084ff', borderRadius: '50%' }}></span>
                        </div>

                        <div className="option-item">
                            <span>Shared Photos</span>
                            <span style={{ color: '#0084ff', fontSize: 13 }}>See All</span>
                        </div>

                        <div className="shared-photos">
                            {sharedImages.map((img, index) => (
                                <img key={index} src={img} alt="shared" />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mainboard;