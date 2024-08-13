import express from 'express';
import fetch from 'node-fetch';
 
const app = express();
const PORT = 5500;
let currentSessionId = ''; // Store session ID here
 
const KORE_AI_CONFIG = {
  botId: 'st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  webhookUrl: 'https://chatterbox43.pfizer.com:443/chatbot/v2/webhook/st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlhdCI6MTcyMzQ2OTU5MywiZXhwIjoxNzI0MDc0MzkzfQ.eyJpYXQiOjE3MjM0Njk1OTMuMDY1NDA5MiwiZXhwIjoxNzI0MDc0MzkzLjA2NTQwOTIsImF1ZCI6IlBmaXplciIsImlzcyI6ImNzLTI5YWVmODFiLTdhZjctNTQxMi1iOTY2LWQ3ZmNhOGQxYzkzYiIsImFwcElkIjoiY3MtMjlhZWY4MWItN2FmNy01NDEyLWI5NjYtZDdmY2E4ZDFjOTNiIiwic3ViIjoiNmM0MzZjOTAtNThhZi0xMWVmLWI0MGEtYTY4NDc1NWZiMzAxIiwiaXNBbm9ueW1vdXMiOnRydWV9.f9lvqgkp4IC8AanpHO7Lxx6FLjw0qvs74iqZgQ15Nu4'
};
 
app.use(express.json());
 
app.post('/api/v3/conversation', async (req, res) => {
  try {
    const payload = {
      session: { new: false }, // keeping new session to false
      sessionId: currentSessionId, // Use current session ID
      message: {
        type: 'text',
        val: req.body.userInput || 'Welcome Task', // User input from the request body
      },
      from: { id: 'local_server' },
      to: { id: KORE_AI_CONFIG.botId }
    };
 
    // Make the request to Kore.AI
    const response = await fetch(KORE_AI_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KORE_AI_CONFIG.jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('Received response from kore.AI');

    if (!response.ok) {
      throw new Error(`Kore.AI API returned status ${response.status}`);
    }
 
    const data = await response.json();
 
    // Update the session ID if provided by Kore.AI
    if (data.conversationPayload && data.conversationPayload.sessionId) {
      currentSessionId = data.conversationPayload.sessionId;
      console.log('Updated sessionId:', currentSessionId);
    }
 
    // Combine all "val" fields into a single response string
    const allVals = data.data.map(item => item.val).join(' ');
 
    // Format the response to the client
    const formattedResponse = {
      answer: allVals, // Concatenated response text
      conversationPayload: JSON.stringify(data), // Entire payload for reference
      instructions: {} // Any additional instructions (optional)
    };
 
    res.json(formattedResponse);
 
  } catch (error) {
    console.error('Error communicating with Kore.AI:', error);
    res.status(500).send('Internal Server Error');
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

