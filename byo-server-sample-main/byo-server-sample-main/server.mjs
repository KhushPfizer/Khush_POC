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
 
// Helper function to add timeout to fetch
async function fetchWithTimeout(resource, options) {
  const { timeout = 9000 } = options; // Set timeout to 8 seconds by default
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}
 
// Function to poll Kore.AI for a response if the initial request requires it
async function pollKoreAI(pollId, maxRetries = 3, delay = 2000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const pollResponse = await fetch(`${KORE_AI_CONFIG.webhookUrl}/poll/${pollId}`, {
        headers: {
          'Authorization': `Bearer ${KORE_AI_CONFIG.jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
 
      if (pollResponse.ok) {
        const pollData = await pollResponse.json();
        if (pollData.data && pollData.data.length > 0) {
          return pollData.data.map(item => item.val).join(' ');
        }
      } else if (pollResponse.status === 404) {
        console.log('Polling not ready, retrying...');
        retries++;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`Kore.AI Polling API returned status ${pollResponse.status}`);
      }
    } catch (error) {
      console.error('Error during polling Kore.AI:', error);
      retries++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
 
  throw new Error('Max retries reached without getting a valid response from Kore.AI');
}
 
app.post('/api/v3/conversation', async (req, res) => {
  try {
    const payload = {
      session: { new: false },
      sessionId: currentSessionId,
      message: {
        type: 'text',
        val: req.body.userInput || 'Welcome Task',
      },
      from: { id: 'CDN_server' },
      to: { id: KORE_AI_CONFIG.botId }
    };
 
    console.log('Sending request to Kore.AI with payload:', payload);
 
    const response = await fetchWithTimeout(KORE_AI_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KORE_AI_CONFIG.jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 8000 // Set timeout to 8 seconds
    });
 
    const data = await response.json();
 
    console.log('Received response from Kore.AI:', data);
 
    if (data.conversationPayload && data.conversationPayload.sessionId) {
      currentSessionId = data.conversationPayload.sessionId;
      console.log('Updated sessionId:', currentSessionId);
    }
 
    if (data.data.length === 0 && data.pollId) {
      console.log(`Starting polling with pollId: ${data.pollId}`);
      const pollResult = await pollKoreAI(data.pollId);
      res.json({ answer: pollResult,
                conversationPayload: JSON.stringify(data),
                instructions: {}
      });
    } else {
      let allVals = data.data.map(item => item.val).join(' ');
      res.json({ answer: allVals,
                 conversationPayload: JSON.stringify(data),
                 instructions: {}
       });
    }
 
  } catch (error) {
    console.error('Error communicating with Kore.AI:', error);
 
    if (error.name === 'AbortError') {
      res.status(504).send('Request timed out');
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
