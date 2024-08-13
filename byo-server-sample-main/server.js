const express = require('express');
const axios = require('axios');
 
const app = express();
const PORT = 5500;
 
const KORE_AI_CONFIG = {
  botId: 'st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  webhookUrl: 'https://chatterbox43.pfizer.com:443/chatbot/v2/webhook/st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlhdCI6MTcyMDc5NjgxMywiZXhwIjoxNzIxNDAxNjEzfQ.eyJpYXQiOjE3MjA3OTY4MTMuNzYyOTY3LCJleHAiOjE3MjE0MDE2MTMuNzYyOTY3LCJhdWQiOiJQZml6ZXIiLCJpc3MiOiJjcy0yOWFlZjgxYi03YWY3LTU0MTItYjk2Ni1kN2ZjYThkMWM5M2IiLCJhcHBJZCI6ImNzLTI5YWVmODFiLTdhZjctNTQxMi1iOTY2LWQ3ZmNhOGQxYzkzYiIsInN1YiI6IjVmYTc4ZWNlLTQwNjAtMTFlZi1iZGVlLTEyNGUwNzM3OGNmYyIsImlzQW5vbnltb3VzIjp0cnVlfQ.TbAZikpN3FmxKCEGbHuiid97xa0ARTwiE5kq6Is2HUY'
};
 
app.use(express.json());
 
app.get('/', (req, res) => {
  res.send('Welcome to the Kore.AI integration server');
});
 
app.post('/api/v3/conversation', async (req, res) => {
  try {
    const payload = {
      session: { new: true },
      message: {
        type: 'text',
        val: req.body.message.val || "Welcome Task"
      },
      from: { id: KORE_AI_CONFIG.botId },
      to: { id: KORE_AI_CONFIG.botId }
    };
 
    const response = await axios.post(KORE_AI_CONFIG.webhookUrl, payload, {
      headers: {
        'Authorization': `Bearer ${KORE_AI_CONFIG.jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
 
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with Kore.AI:', error);
    res.status(500).send('Internal Server Error');
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});