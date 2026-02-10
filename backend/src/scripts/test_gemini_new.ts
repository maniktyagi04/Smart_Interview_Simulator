
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }

    const modelName = 'gemini-2.0-flash'; 

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        console.log(`Sending request to Gemini (${modelName})...`);
        const result = await model.generateContent('Hello! Are you online?');
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
