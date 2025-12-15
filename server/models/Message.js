const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        senderId: { type: String, required: true },
        receiverId: { type: String, required: true },
        text: { type: String, default: "" },

        type: { 
            type: String, 
            enum: ['text', 'image', 'file'], // Giới hạn chỉ nhận 3 giá trị này
            default: 'text' 
        },

        fileUrl: { type: String, default: "" }, // Link ảnh/file từ Cloudinary trả về
        fileName: { type: String, default: "" },
        
        replyTo: {
            id: { type: String },    // ID tin nhắn gốc
            text: { type: String },  // Nội dung tin nhắn gốc
            senderId: { type: String } // Người gửi tin gốc
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);