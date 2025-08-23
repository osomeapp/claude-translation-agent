require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLanguage = 'zh' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Language mapping
        const languageMap = {
            'zh': 'Chinese (Simplified)',
            'fil': 'Filipino (Tagalog)'
        };

        const targetLangName = languageMap[targetLanguage] || 'Chinese (Simplified)';

        // Claude API integration for translation
        const Anthropic = require('@anthropic-ai/sdk');
        
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: `Translate the following text to ${targetLangName}. Preserve the original formatting, line breaks, and paragraph structure. Only provide the translation, no explanations or additional text:\n\n${text}`
            }]
        });

        const translation = message.content[0].text;
        res.json({ translation, targetLanguage });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ 
            error: 'Translation failed', 
            details: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Translation agent server running on http://localhost:${PORT}`);
});