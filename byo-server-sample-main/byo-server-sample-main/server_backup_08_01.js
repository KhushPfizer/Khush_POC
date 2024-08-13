import express from 'express';
import fetch from 'node-fetch';
 
const app = express();
const PORT = 5500;
let currentSessionId = ''; // Store session ID here

const KORE_AI_CONFIG = {
  botId: 'st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  webhookUrl: 'https://chatterbox43.pfizer.com:443/chatbot/v2/webhook/st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlhdCI6MTcyMjI2OTA1MCwiZXhwIjoxNzIyODczODUwfQ.eyJpYXQiOjE3MjIyNjkwNTAuODc2Mjg4NCwiZXhwIjoxNzIyODczODUwLjg3NjI4ODQsImF1ZCI6IlBmaXplciIsImlzcyI6ImNzLTI5YWVmODFiLTdhZjctNTQxMi1iOTY2LWQ3ZmNhOGQxYzkzYiIsImFwcElkIjoiY3MtMjlhZWY4MWItN2FmNy01NDEyLWI5NjYtZDdmY2E4ZDFjOTNiIiwic3ViIjoiMzE1YjJkZjItNGRjNC0xMWVmLWJhZjktMjI3NTNlMzY5MTZhIiwiaXNBbm9ueW1vdXMiOnRydWV9.mC-autSAjas2onNWmS8pdU4quq2KXusHFq4p9JP_j2Q'
};
 
app.use(express.json());
 
app.post('/api/v3/conversation', async (req, res) => {
  try {
    const payload = {
      session: { new: false },// setting new session to false
      sessionId: currentSessionId, // reading session id 
      message: {
        type: 'text',
        val: req.body.userInput ,
      },
      from: { id: 'CDN_server' },
      to: { id: KORE_AI_CONFIG.botId }
    };
 
    const response = await fetch(KORE_AI_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KORE_AI_CONFIG.jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
 
    if (!response.ok) {
      throw new Error(`Kore.AI API returned status ${response.status}`);
    }
 
    const data = await response.json();
    if (data.conversationPayload && data.conversationPayload.sessionId) {       
      currentSessionId = data.conversationPayload.sessionId;       
      console.log('Updated sessionId:', currentSessionId); }
   
 
    // Format the response body
    const formattedResponse = {
      answer: data.data[0].val, // storing response text is in this field
      conversationPayload: JSON.stringify(data),
      instructions: {}
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


