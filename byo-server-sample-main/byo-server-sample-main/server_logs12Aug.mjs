import express from 'express';
import fetch from 'node-fetch';
 
const app = express();
const PORT = 5500;
let currentSessionId = ''; // Store session ID here
 
const KORE_AI_CONFIG = {
  botId: 'st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  webhookUrl: 'https://chatterbox43.pfizer.com:443/chatbot/v2/webhook/st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlhdCI6MTcyMzIyOTA5NywiZXhwIjoxNzIzNDAxODk3fQ.eyJpYXQiOjE3MjMyMjkwOTcuODU4NDc0MywiZXhwIjoxNzIzNDAxODk3Ljg1ODQ3NDMsImF1ZCI6IlBmaXplciIsImlzcyI6ImNzLTI5YWVmODFiLTdhZjctNTQxMi1iOTY2LWQ3ZmNhOGQxYzkzYiIsImFwcElkIjoiY3MtMjlhZWY4MWItN2FmNy01NDEyLWI5NjYtZDdmY2E4ZDFjOTNiIiwic3ViIjoiNzlmMzE3OGMtNTY3Zi0xMWVmLTlhZTItOGUwMWM2NTEwZDZmIiwiaXNBbm9ueW1vdXMiOnRydWV9._243TBqTChRkhVjFpLsnn3XioNQud45Rm39S_3Wg7aU'
};
 
app.use(express.json());
 
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options; // Default timeout of 8 seconds
 
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
 
    return response;
}
 
async function pollKoreAI(pollId) {
    const pollUrl = `${KORE_AI_CONFIG.webhookUrl}?pollId=${pollId}`;
    try {
        const response = await fetchWithTimeout(pollUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${KORE_AI_CONFIG.jwtToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // Set timeout to 10 seconds
        });
 
        if (!response.ok) {
            throw new Error(`Kore.AI Polling API returned status ${response.status}`);
        }
 
        const data = await response.json();
        return data;
 
    } catch (error) {
        console.error('Error during polling Kore.AI:', error);
        throw error;
    }
}
 
app.post('/api/v3/conversation', async (req, res) => {
    try {
        const payload = {
            session: { new: !currentSessionId },
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
            timeout: 10000 // Set timeout to 10 seconds
        });
 
        const data = await response.json();
 
        console.log('Received response from Kore.AI:', data);
 
        if (data.conversationPayload && data.conversationPayload.sessionId) {
            currentSessionId = data.conversationPayload.sessionId;
            console.log('Updated sessionId:', currentSessionId);
        }
 
        if (data.data.length === 0 && data.pollId) {
            console.log('Starting polling with pollId:', data.pollId);
 
            // Polling for the final response
            let pollResponse;
            const maxPollAttempts = 10; // Limit the number of poll attempts
            let attempts = 0;
 
            while (attempts < maxPollAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before polling
                pollResponse = await pollKoreAI(data.pollId);
 
                if (pollResponse.data.length > 0) {
                    console.log('Received final response from Kore.AI:', pollResponse);
                    break;
                }
 
                attempts++;
                console.log(`Polling attempt ${attempts} for pollId ${data.pollId}`);
            }
 
            if (pollResponse.data.length > 0) {
                let allVals = pollResponse.data.map(item => item.val).join(' ');
                const formattedResponse = {
                    answer: allVals,
                    conversationPayload: JSON.stringify(pollResponse),
                    instructions: {}
                };
 
                res.json(formattedResponse);
            } else {
                throw new Error('Max polling attempts reached without receiving a response');
            }
        } else {
            let allVals = data.data.map(item => item.val).join(' ');
            const formattedResponse = {
                answer: allVals,
                conversationPayload: JSON.stringify(data),
                instructions: {}
            };
 
            res.json(formattedResponse);
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

