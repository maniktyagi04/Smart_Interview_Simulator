import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface InterviewContext {
    type: 'TECHNICAL' | 'HR';
    topics: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EASY/MEDIUM/HARD';
    role?: string;
}

export class InterviewerService {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: `
You are Sarah, an elite technical interviewer at a top-tier tech company (Google, Meta, OpenAI level). You are conducting a professional coding interview.

# CRITICAL RULES - NEVER VIOLATE THESE:

## 1. ABSOLUTE ZERO-LINK POLICY ⛔
- **YOU MUST NEVER, EVER PROVIDE ANY URLs OR LINKS IN YOUR RESPONSES**
- If you receive a problem statement that is a link (e.g., Codeforces URL), you MUST:
  * Use your internal knowledge to write out the COMPLETE problem statement
  * Include: Problem Title, Full Description, Constraints, Input/Output Format, and Examples
  * Format everything in clean Markdown
  * NEVER say "here is the link" or "check this URL" - THIS IS FORBIDDEN
- If you don't know the exact problem, create a similar high-quality problem based on the title/topic

## 2. NEVER GIVE AWAY SOLUTIONS 🚫
- **NEVER provide the complete code solution or direct logic fixes**
- When students ask "how do I solve this?", give conceptual hints only:
  * "Have you considered using a hash map to track...?"
  * "Think about the time complexity - can you avoid nested loops?"
  * "What data structure would help you access elements in O(1)?"
- Guide them to discover the solution themselves

## 3. BE HELPFUL & EDUCATIONAL ✅
- When students ask questions or express confusion:
  * ALWAYS respond constructively and encouragingly
  * Provide clear, educational explanations
  * Break down complex concepts into understandable parts
  * Reference their previous code/statements to maintain context
- Example good responses:
  * "Great question! Let me clarify: when we talk about hash collisions..."
  * "I see where you're going. The key insight here is..."
  * "Good attempt! You're on the right track. Consider this edge case..."

## 4. PROBLEM PRESENTATION 📝
- Present problems with FULL details in the chat itself:
  * Problem title
  * Complete description
  * All constraints and requirements
  * Input/Output format
  * At least 2-3 example test cases
- Use clean Markdown formatting with headers, code blocks, and bullet points

## 5. INTERVIEW CONDUCT 🎯
- Ask ONE question at a time
- Maintain professional, sharp, encouraging tone
- Use precise technical vocabulary (e.g., "amortized complexity", "idempotency", "cache invalidation")
- Dig deep with 6-10 follow-up questions per topic:
  * "What's the time complexity? Can you optimize it?"
  * "How would this scale to 1 billion records?"
  * "What edge cases are you handling?"
  * "What trade-offs does your approach have?"

## 6. CODE REVIEW 👨‍💻
When students share code:
- Analyze for correctness, efficiency, and edge cases
- Point out specific issues: "Line 5 doesn't handle empty arrays"
- Ask about complexity: "What's your time and space complexity?"
- Encourage optimization: "Can you reduce this from O(N²) to O(N)?"

## 7. EVALUATION FOCUS 📊
Assess candidates on:
- Code correctness & efficiency
- Problem-solving approach
- Communication clarity
- Edge case handling
- System design thinking (for senior topics)

Remember: You are an ELITE interviewer. Be sharp, professional, technically accurate, and NEVER provide links or full solutions. Your goal is to evaluate while helping them learn through guided discovery.
            `,
        });
    }

    async generateInitialGreeting(context: InterviewContext, startingQuestion?: { title: string, problemStatement: string }) {
        let prompt = `Start the interview. Context: 
        - Type: ${context.type}
        - Topics: ${(context.topics || []).join(', ')}
        - Difficulty: ${context.difficulty}
        
        Introduce yourself VERY briefly (1-2 sentences max).`;

        if (startingQuestion) {
            const isLink = startingQuestion.problemStatement.startsWith('http') || startingQuestion.problemStatement.includes('codeforces.com') || startingQuestion.problemStatement.includes('leetcode.com') || startingQuestion.problemStatement.length < 150;
            
            if (isLink) {
                prompt += `\n\n⚠️⚠️⚠️ ULTRA-CRITICAL INSTRUCTION ⚠️⚠️⚠️

The problem statement provided is a URL/LINK: "${startingQuestion.problemStatement}"

❌ YOU MUST ABSOLUTELY NEVER DO THIS:
- DON'T say "Here is the problem: [link]"
- DON'T say "Check out this problem at..."
- DON'T say "Visit this URL..."
- DON'T include the URL "${startingQuestion.problemStatement}" in ANY form
- DON'T give a short summary and then refer them to the link

✅ YOU MUST DO THIS INSTEAD:
Write out the COMPLETE problem from your memory. If you know the problem "${startingQuestion.title}", expand it fully.
If you don't have the exact problem, CREATE an equivalent high-quality problem based on the title.

REQUIRED FORMAT (copy this structure exactly):

---

## ${startingQuestion.title}

**Description:**
[Write the full problem description here - at least 3-5 sentences explaining what the candidate needs to do]

**Constraints:**
- [List all limits, e.g., "1 ≤ N ≤ 10^5"]
- [List data type limits, e.g., "All numbers are integers"]
- [Time limit: usually 1-2 seconds]

**Input Format:**
[Explain exactly how the input is provided]

**Output Format:**
[Explain exactly what needs to be returned or printed]

**Examples:**

Example 1:
\`\`\`
Input: [concrete input]
Output: [expected output]
Explanation: [why this is the answer]
\`\`\`

Example 2:
\`\`\`
Input: [concrete input]
Output: [expected output]  
Explanation: [why this is the answer]
\`\`\`

---

After presenting this COMPLETE problem, ask: "How would you approach this problem? Feel free to think aloud or start coding."

REMINDER: The candidate should see the FULL problem above, NOT a link to "${startingQuestion.problemStatement}". NEVER include that URL.`;
            } else {
                prompt += `\n\nNow present this technical problem to the candidate:

**Title**: ${startingQuestion.title}

**Problem Statement**:
${startingQuestion.problemStatement}

Format it beautifully using Markdown. Then ask them to explain their initial thoughts or start coding.`;
            }
        } else {
            prompt += `\n\nNow ask a technical question based on the context above.`;
        }

        const result = await this.generateSafeContent(prompt);
        return result;
    }

    async processInteraction(
        history: { role: 'user' | 'model', parts: { text: string }[] }[], 
        userInput: string,
        context?: { 
            nextQuestion?: { title: string, problemStatement: string, topic: string }, 
            isInterviewComplete?: boolean 
        }
    ) {
        console.log('InterviewerService: Processing interaction...');
            
        // Sanitize history: ensure it's not empty and has valid roles
        const rawHistory = history
            .map(h => ({
                role: (h.role === 'user' ? 'user' : 'model') as 'user' | 'model',
                parts: h.parts.map(p => ({ text: p.text || '' })).filter(p => p.text.trim() !== '')
            }))
            .filter(h => h.parts.length > 0);

        // Gemini API Requirement: History must start with 'user'
        if (rawHistory.length > 0 && rawHistory[0].role === 'model') {
            rawHistory.unshift({
                role: 'user',
                parts: [{ text: 'Please start the interview.' }]
            });
        }

        // Repair History: Ensure alternation (User -> Model -> User -> Model)
        // Gemini throws 400 if roles are not alternating
        const validHistory: { role: 'user' | 'model', parts: { text: string }[] }[] = [];
        
        for (const msg of rawHistory) {
            if (validHistory.length === 0) {
                validHistory.push(msg);
            } else {
                const lastMsg = validHistory[validHistory.length - 1];
                if (lastMsg.role === msg.role) {
                    // Merge with previous message
                    lastMsg.parts.push(...msg.parts);
                } else {
                    validHistory.push(msg);
                }
            }
        }

        // TRUNCATE HISTORY: Prevent context length errors
        // Keep first message (initial question/greeting) + last N messages
        const MAX_HISTORY_MESSAGES = 20; // Last 10 exchanges (user + model pairs)
        let finalHistory = validHistory;
        
        if (validHistory.length > MAX_HISTORY_MESSAGES + 1) {
            const firstMessage = validHistory[0]; // Initial greeting/question
            const recentMessages = validHistory.slice(-(MAX_HISTORY_MESSAGES));
            finalHistory = [firstMessage, ...recentMessages];
            console.log(`InterviewerService: Truncated history from ${validHistory.length} to ${finalHistory.length} messages`);
        }

        console.log('InterviewerService: Final History Length:', finalHistory.length);

        const chat = this.model.startChat({
            history: finalHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // Inject System Control Instructions
        let systemNote = "";
        
        if (context?.isInterviewComplete) {
             systemNote = `[System: The interview time is over or all topics are covered. Please politely conclude the interview now. Give a brief encouraging closing statement and say "INTERVIEW_FINISHED". Do not ask any more questions.]`;
        } else if (context?.nextQuestion) {
             const q = context.nextQuestion;
             const isLink = q.problemStatement.startsWith('http') || q.problemStatement.includes('codeforces.com') || q.problemStatement.includes('leetcode.com');
             
             if (isLink) {
                 systemNote = `[System: Moving to next topic: ${q.topic}. 
                 
🚨 CRITICAL: The problem "${q.title}" is provided as a LINK. You MUST:
1. Write out the COMPLETE problem statement from your knowledge
2. Include: Title, Description, Constraints, Input/Output Format, Examples
3. NEVER share the URL: ${q.problemStatement}
4. If you don't know it, create a similar high-quality problem

Transition naturally and present the full problem now.]`;
             } else {
                 systemNote = `[System: We are moving to the next topic: ${q.topic}. Please transition to this new question: "${q.title}". Problem: ${q.problemStatement}. Ask this question now.]`;
             }
        }
        
        // Detect if the user is asking a question - remind AI to be helpful
        const questionIndicators = ['?', 'how', 'what', 'why', 'can you', 'could you', 'explain', 'help', 'understand', 'confused', 'don\'t get'];
        const isUserQuestion = questionIndicators.some(indicator => userInput.toLowerCase().includes(indicator));
        
        if (isUserQuestion) {
            systemNote += ` [Reminder: The candidate is asking a question. Be HELPFUL and EDUCATIONAL. Provide clear explanations without giving away the full solution. Guide them with conceptual hints and encourage their thinking.]`;
        }
        
        // Ensure Code Verification Instruction
        if (userInput.includes('function') || userInput.includes('def ') || userInput.includes('class ')) {
             systemNote += ` [System: The user provided code. VERIFY it against test cases. If it's correct, ask about time complexity. If incorrect, point out the specific logic error without giving the fix.]`;
        }
        
        // General reminder to never share links
        systemNote += ` [Critical: NEVER provide URLs or links in your response. Always present problems with full details.]`;

        try {
            const result = await this.sendSafeMessage(chat, `${systemNote} ${userInput}`);
            return result;
            
        } catch (error) {
             console.error('AI Interaction Error:', error);
             // Fallback: Return a seamless response if API fails
             const genericResponses = [
                 "That's an interesting approach. Could you walk me through the time complexity of your solution?",
                 "I see what you did there. How would you handle edge cases, such as empty inputs or very large datasets?",
                 "Good point. Now, if we were to scale this system to millions of users, what bottlenecks might arise?",
                 "Understood. Let's pivot slightly. Can you explain the trade-offs between your chosen approach and an alternative?",
                 "Excellent. Moving on, how would you ensure this code is thread-safe in a concurrent environment?"
             ];
             const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
             
             // Removed mock branding as requested by user for a pro experience
             return randomResponse;
        }
    }

    private containsLink(text: string): boolean {
        // Regex to match http://, https://, www., codeforces.com, leetcode.com
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(codeforces\.com)|(leetcode\.com)/i;
        return urlRegex.test(text);
    }

    private async generateSafeContent(prompt: string): Promise<string> {
        let result = await this.model.generateContent(prompt);
        let text = result.response.text();
        let attempts = 0;

        while (this.containsLink(text) && attempts < 3) {
            console.log(`InterviewerService: Detected link in response (attempt ${attempts + 1}). Retrying...`);
            const retryPrompt = `SYSTEM ALERT: You provided a URL/Link which is strictly forbidden. 
            
            REWRITE your entire response. 
            EXPAND the link content into full text (Title, Description, Input, Output, Examples). 
            DO NOT include the URL. 
            Just provide the content directly.`;
            
            result = await this.model.generateContent(prompt + "\n\n" + retryPrompt);
            text = result.response.text();
            attempts++;
        }
        return text;
    }

    private async sendSafeMessage(chat: { sendMessage: (msg: string) => Promise<{ response: { text: () => string } }> }, message: string): Promise<string> {
        let result = await chat.sendMessage(message);
        let text = result.response.text();
        let attempts = 0;

        while (this.containsLink(text) && attempts < 3) {
            console.log(`InterviewerService: Detected link in chat response (attempt ${attempts + 1}). Retrying...`);
            const retryMsg = `SYSTEM ALERT: You provided a URL/Link which is strictly forbidden. 
            
            REWRITE your last response completely. 
            EXPAND the link into full text. 
            DO NOT output the URL.`;
            
            result = await chat.sendMessage(retryMsg);
            text = result.response.text();
            attempts++;
        }
        return text;
    }

    async evaluateFinalPerformance(transcript: string, context: InterviewContext, knownQuestions: Array<{ title: string; problemStatement: string; rubric: string; idealAnswer: string }> = []) {
        // Use a model with larger context window if needed, but flash is usually sufficient
        const evalModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        
        let questionBankContext = "";
        if (knownQuestions.length > 0) {
            questionBankContext = `
            ### Known Question Bank (Reference):
            Use the following detailed rubrics and ideal answers if the interview questions match or are very similar to these:
            ${knownQuestions.map((q, i) => `
            Q${i+1}: ${q.title}
            Problem: ${q.problemStatement}
            Rubric: ${q.rubric}
            Ideal Answer: ${q.idealAnswer}
            `).join('\n')}
            `;
        }

        const prompt = `
        As an expert technical interviewer, analyze the following interview transcript and provide a structured evaluation.
        
        ### Interview Context:
        - Type: ${context.type}
        - Topics: ${(context.topics || []).join(', ')}
        - Difficulty: ${context.difficulty}

        ${questionBankContext}

        ### Transcript:
        ${transcript}

        ### Task:
        1. Identify distinct Question & Answer pairs from the transcript.
        2. Evaluate the candidate's performance for each question.
           - **CRITICAL**: If a question matches one from the "Known Question Bank", you MUST use the provided "Rubric" and "Ideal Answer" for your evaluation.
           - If it's a generic question, evaluate based on general best practices.
        3. Provide an overall summary and score.

        ### Important:
        - Return ONLY valid JSON.
        - Do not include markdown formatting like \`\`\`json.
        - Ensure the structure matches exactly.

        ### Return JSON format:
        {
          "score": 0..100,
          "summary": "Plain English AI Summary explaining overall performance",
          "verdict": "Strong Hire" | "Hire" | "Lean Hire" | "No Hire",
          "confidenceScore": 0.0..1.0, 
          "skills": {
            "problemSolving": { "score": 0..100, "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
            "dataStructures": { "score": 0..100, "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
            "algorithmicThinking": { "score": 0..100, "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
            "codeQuality": { "score": 0..100, "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
            "timeSpaceComplexity": { "score": 0..100, "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
            "communication": { "score": 0..100, "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" }
          },
          "behavior": {
             "problemUnderstanding": { "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
             "explanationClarity": { "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
             "handlingHints": { "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
             "timeManagement": { "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" },
             "confidenceUnderPressure": { "status": "Strong" | "Average" | "Needs Improvement", "explanation": "string" }
          },
          "codeReview": {
             "selectedSnippet": "The most significant code snippet written by the student",
             "reviewComments": ["Bullet point 1", "Bullet point 2"],
             "optimizedSolution": "AI suggested improved solution code",
             "complexityComparison": {
                "student": { "time": "e.g., O(n^2)", "space": "e.g., O(n)" },
                "optimized": { "time": "e.g., O(n)", "space": "e.g., O(1)" }
             }
          },
          "improvementPlan": {
             "priorityFixes": ["Fix 1", "Fix 2"],
             "recommendedTopics": ["Topic 1", "Topic 2"],
             "practiceStrategy": "Concrete next steps"
          },
          "questions": [
            {
              "question": "The question asked",
              "userAnswer": "The candidate's answer",
              "idealAnswer": "A brief ideal answer",
              "score": 0..100,
              "evaluation": {
                 "strengths": ["string"],
                 "weaknesses": ["string"],
                 "improvementTips": ["string"]
              }
            }
          ]
        }
        `;

        try {
            const result = await evalModel.generateContent(prompt);
            let text = result.response.text();
            
            console.log("Raw Evaluation Response:", text.substring(0, 200) + "...");

            // Robust Clean-up
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Attempt to find the first '{' and last '}' to handle any preamble text
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1) {
                text = text.substring(firstBrace, lastBrace + 1);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('Evaluation Error:', error);
            return {
                score: 0,
                summary: "Failed to generate detailed evaluation due to technical error.",
                verdict: "No Hire",
                confidenceScore: 0,
                skills: {
                    problemSolving: { score: 0, status: "Needs Improvement", explanation: "Evaluation failed." },
                    dataStructures: { score: 0, status: "Needs Improvement", explanation: "Evaluation failed." },
                    algorithmicThinking: { score: 0, status: "Needs Improvement", explanation: "Evaluation failed." },
                    codeQuality: { score: 0, status: "Needs Improvement", explanation: "Evaluation failed." },
                    timeSpaceComplexity: { score: 0, status: "Needs Improvement", explanation: "Evaluation failed." },
                    communication: { score: 0, status: "Needs Improvement", explanation: "Evaluation failed." }
                },
                behavior: {
                    problemUnderstanding: { status: "Needs Improvement", explanation: "Evaluation failed." },
                    explanationClarity: { status: "Needs Improvement", explanation: "Evaluation failed." },
                    handlingHints: { status: "Needs Improvement", explanation: "Evaluation failed." },
                    timeManagement: { status: "Needs Improvement", explanation: "Evaluation failed." },
                    confidenceUnderPressure: { status: "Needs Improvement", explanation: "Evaluation failed." }
                },
                codeReview: {
                    selectedSnippet: "N/A",
                    reviewComments: ["Evaluation failed."],
                    optimizedSolution: "N/A",
                    complexityComparison: {
                        student: { time: "N/A", space: "N/A" },
                        optimized: { time: "N/A", space: "N/A" }
                    }
                },
                improvementPlan: {
                    priorityFixes: ["Retry interview"],
                    recommendedTopics: [],
                    practiceStrategy: "System error occurred during evaluation."
                },
                questions: []
            };
        }
    }
}
