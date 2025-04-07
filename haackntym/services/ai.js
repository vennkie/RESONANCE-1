const express = require('express');
const bodyParser = require('body-parser');
const { InferenceClient } = require('@huggingface/inference');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const client = new InferenceClient({
    apiKey: process.env.HUGGINGFACE_API_KEY,
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/process-text', async (req, res) => {
    const { text } = req.body;

    try {
        // Validate input
        const validatedText = validateInput(text);

        // Generate response from AI
        const aiResponse = await generateResponse(validatedText);
        
        // Analyze sentiment
        const sentiment = await analyzeSentiment(validatedText);

        // Extract entities
        const entities = await extractEntities(validatedText);

        // Summarize the text
        const summary = await summarizeText(validatedText);

        res.json({
            aiResponse,
            sentiment,
            entities,
            summary
        });
    } catch (error) {
        console.error('Error processing text:', error);
        res.status(500).json({ error: 'Failed to process text' });
    }
});

// AI text generation
async function generateResponse(text) {
    try {
        if (!text) {
            throw new Error('Empty input text');
        }
        const response = await client.textGeneration({
            model: 'llama-7b',
            inputs: text,
            parameters: { max_length: 150, temperature: 0.7 }
        });
        return response[0].generated_text;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw new Error('AI processing failed');
    }
}

// Sentiment analysis
async function analyzeSentiment(text) {
    try {
        const response = await client.textGeneration({
            model: 'llama-7b',
            inputs: `Sentiment analysis: ${text}`,
            parameters: { max_length: 10 }
        });
        return response[0].generated_text.toLowerCase();
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        throw new Error('Failed to analyze sentiment.');
    }
}

// Entity extraction
async function extractEntities(text) {
    try {
        const response = await client.textGeneration({
            model: 'llama-7b',
            inputs: `Extract entities from the following text: ${text}`,
            parameters: { max_length: 150 }
        });
        return response[0].generated_text;
    } catch (error) {
        console.error('Error extracting entities:', error);
        throw new Error('Failed to extract entities.');
    }
}

// Summarize the text
async function summarizeText(text) {
    try {
        const response = await client.textGeneration({
            model: 'llama-7b',
            inputs: `Summarize this: ${text}`,
            parameters: { max_length: 200 }
        });
        return response[0].generated_text;
    } catch (error) {
        console.error('Error summarizing text:', error);
        throw new Error('Failed to summarize text.');
    }
}

// Input validation
function validateInput(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input');
    }
    if (text.length > 1000) {
        throw new Error('Input text too long');
    }
    return text.trim();
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
