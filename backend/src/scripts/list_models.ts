
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        console.log(`Fetching models from ${url}...`);
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json() as { models?: Array<{ name: string; displayName: string; supportedGenerationMethods: string[] }> };
        // console.log(JSON.stringify(data, null, 2));

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m: { name: string; displayName: string; supportedGenerationMethods: string[] }) => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    const name = m.name.replace('models/', '');
                    console.log(`- ${name} (${m.displayName})`);
                }
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModels();
