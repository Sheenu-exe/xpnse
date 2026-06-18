import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful fallback if key is missing so the dashboard doesn't crash
    return res.status(200).json({
      insights: [
        "Waiting for AI initialization...",
        "Connect Gemini API to unlock custom insights.",
        "Your baseline metrics look stable."
      ]
    });
  }

  try {
    const { transactions, totalBalance, monthlyIncome, monthlySpending } = req.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format data for the prompt
    const recentSpends = transactions?.slice(0, 10).map(t => `${t.type === 'expense' ? '-' : '+'}$${t.amount} (${t.category})`).join(', ') || 'No recent transactions.';

    const prompt = `
    You are XPNSR's elite AI financial advisor. Your tone is Gen-Z, highly direct, confident, and a bit edgy but professional (like a mix of a crypto trader and a wealth manager). Keep it extremely concise. 
    
    Here is the user's current data:
    Total Balance: $${totalBalance}
    Monthly Income: $${monthlyIncome}
    Monthly Spending: $${monthlySpending}
    Recent Transactions: ${recentSpends}

    Based on this data, provide exactly 3 short, punchy financial insights or warnings (maximum 1-2 sentences each). 
    CRITICAL INSTRUCTION: Do NOT use markdown. Do NOT number them. Do NOT use asterisks (*), hash symbols (#), or bold text. Return strictly plain text.
    Just return them separated by a newline character (\\n).
    Focus on burn rate, weird spending patterns, or congratulating them on saving. Use slang sparingly but effectively (e.g., "bag", "burn rate", "stash", "W").
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/[*#`]/g, '');

    const insightsArray = text.split('\n').map(i => i.trim()).filter(i => i.length > 0).slice(0, 3);

    return res.status(200).json({ insights: insightsArray });

  } catch (error) {
    console.error("AI Insight Error:", error);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
}
