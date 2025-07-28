
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const { query } = req.body;
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an API documentation bot. Answer based on the OpenAPI spec.' },
        { role: 'user', content: query }
      ],
    });
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
