const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email không được trùng
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
        default: null
    },
    phone: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },

    avatar: {
        type: String,
        default: function () {
            // Tạo avatar mặc định dựa trên tên nếu người dùng chưa có
            return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=random`;
        }
    },
    isOnline: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.virtual('fullname').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);