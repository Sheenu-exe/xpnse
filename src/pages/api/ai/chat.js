import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(401).json({ 
      error: "No API Key", 
      reply: "Hold up! I need a GEMINI_API_KEY to function. Add it to your .env.local file to unlock my brain." 
    });
  }

  try {
    const { messages, context } = req.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
    You are XPNSR's elite AI financial advisor. Your name is 'X'. Your tone is Gen-Z, highly direct, confident, and a bit edgy but extremely professional and helpful. You do not give legal advice, but you give amazing mathematical and practical financial advice.
    Keep your answers concise, formatted cleanly as PLAIN TEXT ONLY.
    CRITICAL: DO NOT use any markdown formatting. DO NOT use asterisks (*), hash symbols (#), or bold text. Return strictly plain text.
    Use slang like "bag", "stash", "burn rate", "W", "L" sparingly but effectively.
    
    Here is the absolute truth about the user's current finances right now:
    ${context}

    Use this context to accurately answer their questions. If they ask if they can afford something, do the math based on their Total Balance and Monthly Income/Spending.
    `;

    // The chat history format for Gemini
    // messages from UI look like: { role: 'user' | 'ai', text: '...' }
    // Gemini expects: { role: 'user' | 'model', parts: [{text: '...'}] }
    
    // We start the history by injecting the system prompt as the first user message, 
    // and a dummy acknowledgment from the model. This is a common way to simulate a system prompt in Gemini if systemInstruction isn't explicitly used.
    const history = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I am X. I have access to the user's financial telemetry. Ready to advise." }] }
    ];

    // Append the actual conversation history (excluding the very last message which we will send as the prompt)
    const conversationHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [...history, ...conversationHistory],
    });

    const latestMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/[*#`]/g, '');

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({ error: "Failed to generate chat response" });
  }
}
