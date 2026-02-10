import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });



async function listModels() {
    try {
        console.log("Checking API Key:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json() as { error?: { message: string }; models?: Array<{ name: string; supportedGenerationMethods: string[] }> };
        
        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        console.log("\n✅ Available Models for your Key:");
        data.models?.forEach((m: { name: string; supportedGenerationMethods: string[] }) => {
            console.log(`- ${m.name.split('/').pop()} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        console.error("❌ Connection Error:", error);
    }
}

listModels();
