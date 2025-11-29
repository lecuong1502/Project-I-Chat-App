import React, { useState } from "react";
import './Mainboard.css';
import { FaSearch, FaPhoneAlt, FaVideo, FaInfoCircle, FaImage, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { use } from "react";
import { useNavigate } from "react-router-dom";

// --- MOCK DATA ---
const users = [
    { id: 1, name: "Vijaydam Murugavel", avatar: "https://i.pravatar.cc/150?img=1", status: "Active now", lastMsg: "What a way to end the game!" },
    { id: 2, name: "Vinoth Raja", avatar: "https://i.pravatar.cc/150?img=2", status: "Active 5m ago", lastMsg: "Hahaa!!" },
    { id: 3, name: "Sam Maniraj", avatar: "https://i.pravatar.cc/150?img=3", status: "Offline", lastMsg: "Hahaa!!" },
    { id: 4, name: "Rajesh Manz", avatar: "https://i.pravatar.cc/150?img=4", status: "Online", lastMsg: "See you tomorrow" },
];

const messages = [
    { id: 1, sender: "me", text: "Check this out", type: "text" },
    { id: 2, sender: "me", text: "", type: "image", img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 3, sender: "them", text: "Wow! That looks amazing.", type: "text" },
    { id: 4, sender: "them", text: "Where is the party dude?", type: "text" },
    { id: 5, sender: "me", text: "I'm still thinking about it!!", type: "text" },
];

const sharedImages = [
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60"
];

const Mainboard = () => {
    const [activeUser, setActiveUser] = useState(users[0]);
    const navigate = useNavigate();

    // Log out 
    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        navigate("/");
    };

    return (
        <div className="main-board-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Z-Chat</h2>
                    {/* <FaSmile size={24} color="#0084ff" /> */}
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Logout
                    </button>
                </div>

                <div className="search-bar">
                    <FaSearch />
                    <input type="text" placeholder="Search in Z-Chat" />
                </div>

                <div className="user-list">
                    {users.map(user => (
                        <div
                            key={users.id}
                            className={`user-item ${activeUser.id === user.id ? 'active' : ''}`}
                            onClick={() => setActiveUser(user)}
                        >
                            <img src={user.avatar} alt="avatar" className="avatar" />
                            <div className="user-info">
                                <h4>{user.name}</h4>
                                <p>{user.lastMsg}</p>
                            </div>
                        </div>
                    ))};
                </div>
            </div>

            {/* --- CENTER CHAT WINDOW --- */}
            <div className="chat-window">
                <div className="chat-header">
                    <div className="chat-header-user">
                        <img src={activeUser.avatar} alt="avt" className="avatar" style={{ width: 40, height: 40 }} />
                        <div className="user-info">
                            <h4>{activeUser.name}</h4>
                            <p style={{ fontSize: 12, color: '#65676b' }}>{activeUser.status}</p>
                        </div>
                    </div>

                    <div className="chat-actions">
                        <FaPhoneAlt />
                        <FaVideo />
                        <FaInfoCircle />
                    </div>
                </div>

                <div className="chat-body">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                            {msg.type === 'image' ? (
                                <img src={msg.img} alt="sent" className="message-img" />
                            ) : (
                                <p>{msg.text}</p>
                            )}
                        </div>
                    ))};
                </div>

                <div className="chat-footer">
                    <FaImage size={20} color="#0084ff" style={{ cursor: 'pointer' }} />
                    <input type="text" placeholder="Type a message..." />
                    <FaPaperPlane size={20} color="#0084ff" style={{ cursor: 'pointer' }} />
                </div>
            </div>

            {/* --- RIGHT INFO PANEL --- */}
            <div className="info-panel">
                <div className="profile-section">
                    <img src={activeUser.avatar} alt="profile" className="big-avatar" />
                    <h3>{activeUser.name}</h3>
                    <p style={{ color: '#65676b' }}>Facebook Profile</p>
                </div>

                <div className="options-list">
                    <div className="option-item">
                        <span>Conversation Color</span>
                        <span style={{ width: 20, height: 20, background: '#0084ff', borderRadius: '50%' }}></span>
                    </div>

                    <div className="option-item">
                        <span>Shared Photos</span>
                        <span>See All</span>
                    </div>

                    <div className="shared-photos">
                        {sharedImages.map((img, index) => (
                            <img key={index} src={img} alt="shared" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mainboard;