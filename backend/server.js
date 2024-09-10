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
        { role: "system", content: "You are an expert in educational design, specializing in creating effective Intended Learning Outcomes (ILOs) using the ABCD (Audience, Behavior, Condition, Degree) method. Your task is to provide constructive feedback on given ILOs and suggest improvements." },
        { role: "user", content: `Provide feedback and enhancement for the following ILO: "${ilo}"
     
    Please structure your response as follows:
    1. Feedback on original ILO:
       Measurable: [Comment on how well the outcome can be assessed]
       Specific: [Evaluate how clearly the ILO states what students should do]
       Achievable: [Assess if the outcome is realistic for a tutorial session]
       Observable: [Comment on how the learning can be demonstrated]
       Appropriate Level: [Evaluate the cognitive level using Bloom's Taxonomy]
     
    2. Enhanced ILO: [Provide an improved version of the ILO]
     
    3. Explanation of changes:
       A (Audience): [Any changes to the audience]
       B (Behavior): [Changes to the action verb and task]
       C (Condition): [Added or modified conditions]
       D (Degree): [How measurability was improved]
     
    4. Closing thought: [Add a brief statement encouraging critical evaluation of the AI-generated ILO and reminding not to use it directly without consideration]
     
    Limit your response to 250 words.` }
      ],
      max_tokens: 400
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