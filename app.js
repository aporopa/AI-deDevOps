import express from 'express';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8036;

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const openaiapi = new OpenAI({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_API_KEY
});

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.post('/chat', async (req, res) => {
    const messages = req.body.messages;
    const model = req.body.model;
    const temp = req.body.temp;

    const completion = await openaiapi.chat.completions.create({
        model,
        messages,
        temperature: temp
    });
    
    res.status(200).json({ result: completion.choices });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
