// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/ask-doc', async (req, res) => {
  const { question, swagger } = req.body;

  console.log('📥 Incoming request:', JSON.stringify(req.body, null, 2));

  if (!question || !swagger) {
    console.warn('⚠️ Missing input: ', { question, swagger });
    return res.status(400).json({ error: 'Missing question or swagger.' });
  }

  try {
    const prompt = `
You are an API documentation assistant. Based on the following Swagger/OpenAPI spec, answer the user's question.

Swagger:
${JSON.stringify(swagger, null, 2)}

Question: ${question}
Answer:
    `;

    console.log('📝 Prompt sent to OpenAI:\n', prompt.substring(0, 1000)); // Truncate long logs

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    console.log('✅ OpenAI API response received:', JSON.stringify(chatResponse, null, 2));

    const answer = chatResponse.choices[0]?.message?.content?.trim() || 'No response from model.';
    res.json({ answer });
  } catch (err) {
    console.error('❌ Error during OpenAI API call:', err);
    res.status(500).json({
      error: 'Failed to fetch response from OpenAI.',
      details: err.message || err,
    });
  }
});

app.get('/', (req, res) => {
  res.send('✅ API Doc Bot is running!');
});

app.listen(port, () => {
  console.log(`🚀 Webhook server is listening on port ${port}`);
});
