import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testGeneration() {
    try {
        console.log("Testing Generation with gemini-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Say hello in one word.");
        console.log("✅ Response:", result.response.text());
    } catch (error) {
        const err = error as { message?: string; response?: { data?: unknown } };
        console.error("❌ Generation Error:", err.message || String(error));
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

testGeneration();
