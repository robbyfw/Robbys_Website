const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors()); // allow frontend to call this server
const PORT = 3000;

// Your Google AI Studio API key (KEEP SECRET!)
const API_KEY = "AIzaSyDjUGkkGixJQ0XKIiKdJkaH55LRFEsIduk";

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate',
      {
        prompt: { text: userMessage },
        temperature: 0.7,
        maxOutputTokens: 256
      },
      {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      }
    );

    const aiReply = response.data.candidates[0].output;
    res.json({ reply: aiReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
