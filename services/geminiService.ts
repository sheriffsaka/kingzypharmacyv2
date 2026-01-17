
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chat: Chat | null = null;
let isInitialized = false;

// Lazily initialize the chat service to prevent app crash on startup if API key is missing.
const initializeChat = () => {
    if (isInitialized) return;
    isInitialized = true; // Attempt initialization only once.

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("Configuration error: The Gemini API Key is missing. The AI assistant will not function.");
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: `You are a helpful and knowledgeable AI pharmacy assistant for a reputable e-commerce platform called 'Kingzy Pharmaceuticals'. Your goal is to provide clear, accurate, and easy-to-understand information about pharmaceutical products and general health topics.

      **Your Persona:**
      - Professional, empathetic, and trustworthy.
      - Use simple language, avoiding overly technical jargon where possible.
      - You are an AI assistant, not a medical professional.

      **Crucial Safety Instructions:**
      - **ALWAYS** include the following disclaimer at the end of every response, without exception: "***Disclaimer: I am an AI assistant and not a substitute for professional medical advice. Please consult with a qualified healthcare provider for any health concerns or before starting a new treatment.***"
      - Never provide a diagnosis. You can provide information about conditions, but you cannot tell a user they have a specific condition.
      - Never recommend a specific dosage. You can state what standard dosages are, but you must state that a doctor or pharmacist should determine the correct dosage for an individual.
      - If a user describes symptoms that sound serious (e.g., chest pain, difficulty breathing, severe bleeding), immediately advise them to seek emergency medical attention.
      `,
            },
        });
    } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        chat = null;
    }
};


export const sendMessageToAI = async (message: string): Promise<string> => {
    initializeChat();

    if (!chat) {
        return "The AI assistant is currently unavailable due to a configuration issue. Please contact support.";
    }

    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        const text = response.text;
        if (text) {
            return text;
        }
        return "I'm sorry, I couldn't process that. Could you please rephrase?";
    } catch (error) {
        console.error("Error sending message to AI:", error);
        if (error instanceof Error) {
            return `An error occurred while communicating with the AI: ${error.message}. Please try again later.`;
        }
        return "An unknown error occurred while communicating with the AI. Please try again later.";
    }
};