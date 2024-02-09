import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user: { 
        type: String,
        trim: true
    },
    text: {
        type: String,
        trim: true}
}, 
{  timestamps: { createdAt: true, updatedAt: false }, versionKey: false, strict: false  });

// Can create custom toJSON function to always clean up returned data for what we need
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject._id = returnedObject._id.toString();
      delete returnedObject.createdAt;
    }
  })

export const Message =  mongoose.model('graphql-chat-message', userSchema, 'graphql-chat-message');