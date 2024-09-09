require('dotenv').config();
console.log('Environment variables:', process.env);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('ENDPOINT:', process.env.ENDPOINT);
console.log('API_VERSION:', process.env.API_VERSION);

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: `${process.env.ENDPOINT}/openai/deployments/gpt-4o-mini`,
  defaultQuery: { "api-version": process.env.API_VERSION },
  defaultHeaders: { "api-key": process.env.OPENAI_API_KEY }
});

app.post('/enhance-ilo', async (req, res) => {
  try {
    const { ilo } = req.body;
    console.log('Received ILO:', ilo);

    if (!ilo) {
      throw new Error('No ILO provided');
    }

    console.log('Sending request to Azure OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert in educational design, specializing in creating effective Intended Learning Outcomes (ILOs). Your task is to enhance the given ILO to make it more specific, measurable, achievable, relevant, and time-bound (SMART). Provide constructive feedback and suggestions for improvement." },
        { role: "user", content: `Please enhance the following ILO: ${ilo}` }
      ],
      max_tokens: 300
    });

    console.log('Azure OpenAI API Response:', completion);

    res.json({ enhancedILO: completion.choices[0].message.content });
  } catch (error) {
    console.error('Detailed Error:', error);
    res.status(500).json({ error: 'An error occurred while enhancing the ILO', details: error.message, stack: error.stack });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));