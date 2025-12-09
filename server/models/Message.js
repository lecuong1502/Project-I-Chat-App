const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        senderId: { type: String, required: true },
        receiverId: { type: String, required: true },
        text: { type: String, required: true },
        replyTo: {
            id: { type: String },    // ID tin nhắn gốc
            text: { type: String },  // Nội dung tin nhắn gốc
            senderId: { type: String } // Người gửi tin gốc
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);