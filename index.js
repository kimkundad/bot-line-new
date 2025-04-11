require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');

// LINE config
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

//C5bc863f66ed0d48dcfec8a7a416e3da8
//C4d3ce1b3067c87ce9152de69a5a0071f
// home C89c19496448a8587e0547eef2147b6c1

// ถ้าใช้ Webhook ด้วย
app.get('/', (req, res) => {
    console.log(req.body); // ดูข้อมูลที่ถูกส่งมา
    res.send('OK');
  });

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(JSON.stringify(req.body, null, 2));
    res.send('OK');
  });

  
// ทดสอบ pushMessage แบบ manual
app.get('/send-message', async (req, res) => {
    const message = req.query.msg;
    const imageUrl = req.query.image;
  
    if (!message || !imageUrl) {
      return res.status(400).send('Both msg and image parameters are required.');
    }
  
    try {
      await client.pushMessage('C89c19496448a8587e0547eef2147b6c1', [
        {
          type: 'text',
          text: message,
        },
        {
          type: 'image',
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl,
        }
      ]);
  
      res.send('✅ Message and image sent!');
    } catch (err) {
      console.error('❌ LINE Error:', err.originalError?.response?.data || err);
      res.status(500).send('Error');
    }
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
});
