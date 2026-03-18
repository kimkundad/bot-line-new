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
    res.send('OK >.<');
  });

function normalizeTargetId(value, allowedPrefixes) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower === 'undefined' || lower === 'null') return null;
  if (!allowedPrefixes.some((prefix) => trimmed.startsWith(prefix))) return null;

  return trimmed;
}

  app.post('/webhook', line.middleware(config), async (req, res) => {
    const events = req.body.events;
  
    for (const event of events) {
      if (
        event.type === 'message' &&
        event.message.type === 'text' &&
        event.message.text.trim().toLowerCase() === 'ขอไอดี'
      ) {
        const source = event.source;
  
        // ตรวจสอบว่ามาจากกลุ่ม
        if (source.type === 'group' && source.groupId) {
          const groupId = source.groupId;
  
          try {
            await client.replyMessage(event.replyToken, {
              type: 'text',
              text: `Group ID ของกลุ่มนี้คือ: ${groupId}`,
            });
          } catch (err) {
            console.error('❌ Reply error:', err.originalError?.response?.data || err);
          }
        }
      }
    }
  
    res.send('OK');
  });

  
// ทดสอบ pushMessage แบบ manual
// app.get('/send-message', async (req, res) => {
//   const message = req.query.msg;
//   const imageUrl = req.query.image;
//   const groupId = req.query.group_id;

//   if (!message || !groupId) {
//     return res.status(400).send('Parameters "msg" and "group_id" are required.');
//   }

//   // เตรียม array สำหรับ message
//   const messages = [
//     {
//       type: 'text',
//       text: message,
//     },
//   ];

//   if (imageUrl) {
//     messages.push({
//       type: 'image',
//       originalContentUrl: imageUrl,
//       previewImageUrl: imageUrl,
//     });
//   }

//   try {
//     await client.pushMessage(groupId, messages);
//     res.send('✅ Message sent' + (imageUrl ? ' with image!' : '!'));
//   } catch (err) {
//     console.error('❌ LINE Error:', err.originalError?.response?.data || err);
//     res.status(500).send('❌ Error sending message');
//   }
// });


app.get('/send-message', async (req, res) => {
  const message = req.query.msg;
  const imageUrl = req.query.image;
  const userId = normalizeTargetId(req.query.user_id, ['U']); // Uxxxxxxxx
  const groupId = normalizeTargetId(req.query.group_id, ['C', 'R']); // Cxxxxxxxx / Rxxxxxxxx

  if (!message) {
    return res.status(400).send('Parameter "msg" is required.');
  }

  if (!userId && !groupId) {
    return res.status(400).send('Missing user_id or group_id');
  }

  const messages = [{ type: 'text', text: message }];
  if (imageUrl) {
    messages.push({
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    });
  }

  try {
    const target = userId || groupId;
    await client.pushMessage(target, messages);
    res.send('✅ Message sent');
  } catch (err) {
    const lineErr = err.originalError?.response?.data || err;
    const lineMessage = lineErr?.message || '';

    console.error('❌ LINE Error:', lineErr);

    if (typeof lineMessage === 'string' && lineMessage.includes('monthly limit')) {
      return res.status(429).send('LINE monthly limit reached');
    }

    res.status(500).send('❌ Error sending message');
  }
});



const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
});
