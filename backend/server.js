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
    { role: "system", content: "You are an expert in educational design, specializing in creating effective Intended Learning Outcomes (ILOs) for undergraduate tutorials using the ABCD (Audience, Behavior, Condition, Degree) method. Your task is to provide constructive feedback on given ILOs and suggest improvements, ensuring they meet key criteria for effective tutorial ILOs." },
    { role: "user", content: `Provide feedback and enhancement for the following ILO: "${ilo}"

Use markdown formatting for headers (###) and bullet points (-).
For complete ILOs, structure your response as follows:
1. Feedback on original ILO:
   Positive aspects: [Highlight what's good about the ILO, even if it's just the attempt or a particular element]
   Specific: [Evaluate how clearly the ILO states what students should do. Is it tailored to the tutorial content? Does it use one clear action verb?]
   Measurable: [Comment on how well the outcome can be assessed within the tutorial setting. Are the criteria for success clear?]
   Active: [Assess how the ILO encourages student engagement and participation. Does it promote hands-on learning or critical thinking?]
   Relevant: [Evaluate the connection to course goals and real-world applications. Is it meaningful for the students' learning journey?]
   Time-bound: [Comment on whether the outcome is achievable in a single tutorial session. Is the scope appropriate?]

2. Enhanced ILO: [Provide an improved version of the ILO, ensuring it's specific, measurable, active, relevant, and achievable in a single tutorial session. Use one clear action verb for the behavior.]

3. Explanation of changes:
   A (Audience): [Any changes to make the audience more specific and appropriate]
   B (Behavior): [Changes to the action verb and task to improve clarity, engagement, and measurability]
   C (Condition): [Added or modified conditions to enhance relevance, context, and achievability]
   D (Degree): [How the criteria for success and measurability were improved]

4. Closing thought: [Encourage critical evaluation of the AI-generated ILO, reminding users to adapt it to their specific context and student needs]

For incomplete or vague ILOs, provide:
1. Brief guidance on creating a complete ILO using the ABCD method
2. A concise example of a SMART ILO tailored for tutorial settings
3. Encouragement to provide more specific details for a thorough analysis

Limit your response to 250 words, focusing on the most critical feedback and improvements.`
    }
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