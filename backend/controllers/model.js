const axios = require('axios');

const generateModelResponse = async (userMessage) => {
  try {
    messages = [{"role": "user", "content": userMessage}]
    
    const response = await axios.post('http://localhost:5000/generate', {
      messages: messages
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm sorry, I couldn't process your request at the moment.";
  }
};

module.exports = { generateModelResponse };