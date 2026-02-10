
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }
    console.log('Using API Key:', key.substring(0, 5) + '...');

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        console.log('Sending request to Gemini...');
        const result = await model.generateContent('Hello! Are you working?');
        const response = result.response;
        console.log('✅ Response:', response.text());
    } catch (error) {
        const err = error as { message?: string; response?: unknown };
        console.error('❌ Gemini API Error:', err.message || String(error));
        if (err.response) {
            console.error('Details:', JSON.stringify(err.response, null, 2));
        }
    }
}

testGemini();
