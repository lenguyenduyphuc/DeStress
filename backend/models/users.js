const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  chats: [
    {
      _id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
      },
      createAt:{
        type: Date,
        default: Date.now(), 
        required: true,
      }
    }
  ]
}, { timestamps: true });

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('UserChat', UserSchema);