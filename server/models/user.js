import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true}
}, 
{  timestamps: { createdAt: true, updatedAt: true }, versionKey: false, strict: false  });

export const User =  mongoose.model('graphql-chat-user', userSchema, 'graphql-chat-user');