require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  console.log("✅ Incoming webhook request body:", req.body);

  const userQuery = req.body.query || "How to use this API?";
  const apiDetails = req.body.api || "This is a dummy OpenAPI spec.";

  const prompt = `You are an AI documentation assistant. Based on the following API info:\n\n${apiDetails}\n\nAnswer the user query:\n${userQuery}`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("❌ Error while calling OpenAI:", err.response?.data || err.message);
    res.status(500).send("Something went wrong.");
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook server is listening on port ${port}`);
});
