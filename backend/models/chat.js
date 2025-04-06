const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  history: [
    {
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true
      },
      parts: [
        {
          text: {
            type: String,
            required: true
          }
        }
      ]
    }
  ]
}, { timestamps: true });

chatSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Chat', chatSchema);

