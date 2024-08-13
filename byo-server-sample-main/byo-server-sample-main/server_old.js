const http = require('http');
//const fetch = require('node-fetch'); 
const https = require('https');
const PORT = 5500;
 
const KORE_AI_CONFIG = {
  botName: 'Uneeq_Alex',
  botId: 'st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  clientId: 'cs-29aef81b-7af7-5412-b966-d7fca8d1c93b',
  clientSecret: 'lF0nfARgd9LfVQ1TbyF2fxbjz18NtD6YSOoLNEKVQDc=',
  webhookUrl: 'https://chatterbox43.pfizer.com:443/chatbot/v2/webhook/st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlhdCI6MTcyMDc5NjgxMywiZXhwIjoxNzIxNDAxNjEzfQ.eyJpYXQiOjE3MjA3OTY4MTMuNzYyOTY3LCJleHAiOjE3MjE0MDE2MTMuNzYyOTY3LCJhdWQiOiJQZml6ZXIiLCJpc3MiOiJjcy0yOWFlZjgxYi03YWY3LTU0MTItYjk2Ni1kN2ZjYThkMWM5M2IiLCJhcHBJZCI6ImNzLTI5YWVmODFiLTdhZjctNTQxMi1iOTY2LWQ3ZmNhOGQxYzkzYiIsInN1YiI6IjVmYTc4ZWNlLTQwNjAtMTFlZi1iZGVlLTEyNGUwNzM3OGNmYyIsImlzQW5vbnltb3VzIjp0cnVlfQ.TbAZikpN3FmxKCEGbHuiid97xa0ARTwiE5kq6Is2HUY'
};
 
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === 'https://chatterbox43.pfizer.com:443/chatbot/v2/webhook/st-719758b3-0c2e-5e55-9230-ebf7fbb2f4b3') {
    let data = '';
 
    req.on('data', chunk => {
      data += chunk;
    });
 
    req.on('end', async () => {
      let jsonData;
      try {
        console.log(`Received JSON: ${data}`);
        jsonData = JSON.parse(data);
      } catch (error) {
        res.statusCode = 400;
        res.end('Invalid JSON');
        return;
      }
 
      // Prepare the payload for Kore.AI webhook
      const payload = {
        session: { new: true },
        message: {
          type: 'text',
          val: jsonData.message.val || "Welcome Task"
        },
        from: { id: KORE_AI_CONFIG.botId },
        to: { id: KORE_AI_CONFIG.botId }
      };
 
      try {
        // Send the request to Kore.AI webhook
        const koreResponse = await fetch(KORE_AI_CONFIG.webhookUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlhdCI6MTcyMDc5NjgxMywiZXhwIjoxNzIxNDAxNjEzfQ.eyJpYXQiOjE3MjA3OTY4MTMuNzYyOTY3LCJleHAiOjE3MjE0MDE2MTMuNzYyOTY3LCJhdWQiOiJQZml6ZXIiLCJpc3MiOiJjcy0yOWFlZjgxYi03YWY3LTU0MTItYjk2Ni1kN2ZjYThkMWM5M2IiLCJhcHBJZCI6ImNzLTI5YWVmODFiLTdhZjctNTQxMi1iOTY2LWQ3ZmNhOGQxYzkzYiIsInN1YiI6IjVmYTc4ZWNlLTQwNjAtMTFlZi1iZGVlLTEyNGUwNzM3OGNmYyIsImlzQW5vbnltb3VzIjp0cnVlfQ.TbAZikpN3FmxKCEGbHuiid97xa0ARTwiE5kq6Is2HUY',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
 
        const koreResponseData = await koreResponse.json();
        console.log('Kore.AI response:', koreResponseData);
 
        // Send the response back to the original client
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(koreResponseData));
      } catch (error) {
        console.error('Error communicating with Kore.AI:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});
 
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

