const { default: mongoose } = require("mongoose");
const mongodb = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isGroup: { type: Boolean, default: false },
        name: { type: String, default: "" },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
        lastMessage: { 
            text: String,
            senderId: String,
            createdAt: Date
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);