import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

console.log('✅ Starting server...');
console.log('🧪 Loaded OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Present' : '❌ MISSING');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/webhook', async (req, res) => {
  console.log('📥 Incoming request:', JSON.stringify(req.body, null, 2));
  const { question, swagger } = req.body;

  const prompt = `
You are an API documentation assistant. Based on the following Swagger/OpenAPI spec, answer the user's question.

Swagger:
${JSON.stringify(swagger, null, 2)}

Question: ${question}
Answer:
  `.trim();

  console.log('📝 Prompt sent to OpenAI:\n', prompt);

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful API documentation assistant.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4-turbo'
    });

    const answer = completion.choices[0].message.content;
    console.log('✅ Answer from OpenAI:', answer);
    res.json({ answer });
  } catch (error) {
    console.error('❌ Error during OpenAI API call:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook server is listening on port ${port}`);
});
