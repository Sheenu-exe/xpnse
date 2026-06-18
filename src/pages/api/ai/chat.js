import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dbConnect from "@/libs/mongodb";
import Transaction from "@/models/Transaction";
import SavingsAccount from "@/models/SavingsAccount";

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
    const { messages, context, userId, accounts } = req.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);

    const logTransactionDeclaration = {
      name: "log_transaction",
      description: "Logs a new expense or income transaction for the user. Call this ONLY when the user explicitly tells you they spent or received money and you have all required parameters.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          amount: { type: SchemaType.NUMBER, description: "The numeric transaction amount." },
          category: { type: SchemaType.STRING, description: "The category (e.g. Food, Transport, Salary)." },
          type: { type: SchemaType.STRING, description: "Must be exactly 'expense' or 'income'." },
          title: { type: SchemaType.STRING, description: "A short 1-3 word title." },
          accountId: { type: SchemaType.STRING, description: "The precise ID of the account to deduct/add to." }
        },
        required: ["amount", "category", "type", "title", "accountId"],
      },
    };

    const undoTransactionDeclaration = {
      name: "undo_last_transaction",
      description: "Reverses and deletes the most recently logged transaction. Call this when the user says they made a mistake, didn't actually spend that, or wants to undo their last entry.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {},
      },
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: [logTransactionDeclaration, undoTransactionDeclaration] }]
    });

    const accountListStr = accounts && accounts.length > 0 
      ? accounts.map(a => `${a.name} (ID: ${a._id})`).join('\n    ')
      : "No accounts found.";
    const accountNames = accounts ? accounts.map(a => a.name).join(', ') : '';

    const systemPrompt = `
    You are XPNSR's elite AI financial advisor. Your name is 'Aura'. Your tone is Gen-Z, highly direct, confident, and a bit edgy but extremely professional.
    Keep your answers concise, formatted cleanly as PLAIN TEXT ONLY. DO NOT use markdown, asterisks, or hash symbols.
    
    Here is the user's current finances right now:
    ${context}

    The user has the following bank accounts:
    ${accountListStr}

    AUTONOMOUS ACTIONS:
    - If the user tells you they spent or received money, you have the ability to log it using the log_transaction tool.
      HOWEVER, you MUST know which account they used. If they don't specify, DO NOT guess. Ask them which account they used.
      Whenever you ask them to choose an account, you MUST append exactly this string at the very end of your response: |||OPTIONS: ${accountNames}
    - If the user says they made a mistake, wants to undo, or didn't actually spend that money, use the undo_last_transaction tool.

    Use this context to accurately answer their questions.
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
    
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "log_transaction") {
        if (!userId) return res.status(400).json({ reply: "I need you to log in properly before I can touch your DB." });
        
        await dbConnect();
        const args = call.args;
        
        // Add transaction
        const newTx = new Transaction({
          title: args.title,
          amount: args.amount,
          category: args.category,
          type: args.type,
          date: new Date().toISOString(),
          description: "Logged by Aura",
          userId: userId,
          accountId: args.accountId
        });
        await newTx.save();

        // Update account balance
        const account = await SavingsAccount.findById(args.accountId);
        if (account) {
          if (args.type === "expense") {
            account.currentBalance -= args.amount;
          } else {
            account.currentBalance += args.amount;
          }
          await account.save();
        }
        
        return res.status(200).json({ reply: `Done! I've logged the ${args.type} of $${args.amount} for ${args.category}. Your DB is updated.` });
      } else if (call.name === "undo_last_transaction") {
        if (!userId) return res.status(400).json({ reply: "I need you to log in properly before I can touch your DB." });
        
        await dbConnect();
        
        const lastTx = await Transaction.findOne({ userId }).sort({ _id: -1 });
        if (!lastTx) {
          return res.status(200).json({ reply: "I couldn't find any recent transactions to undo." });
        }

        if (lastTx.accountId) {
          const account = await SavingsAccount.findById(lastTx.accountId);
          if (account) {
            if (lastTx.type === "expense") {
              account.currentBalance += lastTx.amount;
            } else {
              account.currentBalance -= lastTx.amount;
            }
            await account.save();
          }
        }

        await Transaction.findByIdAndDelete(lastTx._id);
        return res.status(200).json({ reply: `Got it. I've reversed the ${lastTx.type} of $${lastTx.amount} for ${lastTx.category} and scrubbed it from your ledger.` });
      }
    }

    let text = response.text();
    text = text.replace(/[*#`]/g, '');

    // Parse out options if present
    let options = null;
    if (text.includes("|||OPTIONS:")) {
      const parts = text.split("|||OPTIONS:");
      text = parts[0].trim();
      const optsStr = parts[1].trim();
      options = optsStr.split(',').map(o => o.trim()).filter(o => o.length > 0);
    }

    return res.status(200).json({ reply: text, options });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({ error: "Failed to generate chat response" });
  }
}
