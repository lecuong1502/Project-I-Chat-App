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
            if(user._id) socket.current.emit("addUser", user._id);

            socket.current.on("getMessage", (data) => {
                setArrivalMessage({
                    sender: data.senderId,
                    text: data.text,
                    createdAt: Date.now(),
                    type: 'text'
                });
            });
        } catch (error) {
            console.error("User data error:", error);
            navigate("/");
        }
    }, [navigate]);

    // Xử lý tin nhắn đến
    useEffect(() => {
        if (arrivalMessage && activeChat && arrivalMessage.sender === activeChat._id) {
            setMessages((prev) => [...prev, arrivalMessage]);
        }
    }, [arrivalMessage, activeChat]);

    // Auto scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Notifications
    useEffect(() => {
        if (arrivalMessage) {
            if (activeChat && arrivalMessage.sender === activeChat._id) {
                setMessages((prev) => [...prev, arrivalMessage]);
            } else {
                setNotifications((prev) => [arrivalMessage.sender, ...prev]);
            }
        }
    }, [arrivalMessage, activeChat])

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
    const handleSelectUser = (user) => {
        setActiveChat(user);
        setSearchResults([]); 
        setSearchQuery("");
        setMessages([]); 

        const isExist = conversations.some(u => u._id === user._id);
        if (!isExist) {
            setConversations([...conversations, user]);
        }

        setNotifications((prev) => prev.filter((n) => n !== user._id));
    };

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        const msgData = {
            senderId: currentUser._id,
            receiverId: activeChat._id,
            text: newMessage
        };

        socket.current.emit("sendMessage", msgData);
        setMessages([...messages, { sender: "me", text: newMessage, type: 'text' }]);
        setNewMessage("");
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
    };

    if (!currentUser) return <div style={{display:'flex', justifyContent:'center', marginTop: 50}}>Loading...</div>;

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
                        <div style={{padding: '0 15px'}}>
                            <p style={{fontSize: 12, color: '#999'}}>Search Result:</p>
                            {searchResults.map(user => (
                                <div key={user._id} className="user-item" onClick={() => handleSelectUser(user)}>
                                    <img src={user.avatar || "https://via.placeholder.com/50"} alt="avt" className="avatar" />
                                    <div className="user-info">
                                        <h4>{user.firstName} {user.lastName}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                </div>
                            ))}
                            <hr style={{margin: '10px 0', border: 'none', borderBottom: '1px solid #eee'}}/>
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
                                <div style={{position: 'relative'}}>
                                    <img src={user.avatar} alt="avatar" className="avatar" />
                                    {/* Dấu chấm xanh online */}
                                    {user.isOnline && <div className="online-dot-avatar"></div>}
                                </div>
                                
                                <div className="user-info">
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        {/* Nếu có tin nhắn chưa đọc thì bôi đậm tên */}
                                        <h4 style={{fontWeight: unreadCount > 0 ? '800' : '600'}}>
                                            {user.firstName} {user.lastName}
                                        </h4>
                                        {/* Hiển thị thời gian (Optional - làm sau) */}
                                    </div>

                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <p className={`online-status ${unreadCount > 0 ? 'unread-text' : ''}`}>
                                            {unreadCount > 0 
                                                ? "New message" 
                                                : (user.isOnline ? "Active now" : "Offline")
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
                            {messages.map((msg, index) => (
                                <div ref={scrollRef} key={index} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            ))}
                        </div>

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
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="chat" style={{width: 80, opacity: 0.5, marginBottom: 20}}/>
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
                            <span style={{color: '#0084ff', fontSize: 13}}>See All</span>
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