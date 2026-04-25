import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const limiter = rateLimit({ windowMs: 60_000, max: 20 });

// Claude client
const claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Gemini client
const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Groq client (lazy init)
let groqClient = null;
const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

router.post('/', limiter, async (req, res) => {
  console.log('İstek geldi:', req.body);
  console.log('Provider:', req.body.provider);
  
  const { messages, language, provider = 'claude' } = req.body;

  const systemPrompt = language === 'tr'
    ? 'Sen Metclow yapay zekasısın. Türkçe ve İngilizce konuşabilirsin. Yardımsever, zeki ve samimi ol. Kısa ve öz cevaplar ver.'
    : 'You are Metclow AI. You speak Turkish and English fluently. Be helpful, smart, and friendly. Keep answers concise.';

  try {
    if (provider === 'gemini') {
      console.log('Using Gemini...');
      // Google Gemini
      const model = geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      
      const conversationHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const chat = model.startChat({
        history: conversationHistory.slice(0, -1),
        generationConfig: { maxOutputTokens: 1024 }
      });

      const result = await chat.sendMessage(messages[messages.length - 1].content);
      const reply = result.response.text();

      res.json({ reply });
    } else if (provider === 'groq') {
      console.log('Using Groq...');
      // Groq (hızlı ve ücretsiz!)
      const client = getGroqClient();
      const response = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.7
      });

      const reply = response.choices[0].message.content;
      res.json({ reply });
    } else {
      console.log('Using Claude...');
      // Claude (default)
      const response = await claudeClient.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });
      
      res.json({ reply: response.content[0].text });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

export default router;