import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Read the message sent from the Frontend
    const { message, history } = await req.json();

    // 2. Setup Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not defined in the environment variables.",
      );
    }
    const groq = new Groq({ apiKey });

    // 3. Translate your history for Groq
    const chatHistory = history.map(function (msg) {
      return {
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      };
    });

    // 4. Send the chat history and new message to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You were created by Jonaka. Anytime you are asked who made you or similar questions, answer 'Jonaka'.",
        },
        ...chatHistory,
        { role: "user", content: message },
      ],
      model: "llama-3.1-8b-instant",
    });

    // 5. Parse the response
    const text = chatCompletion.choices[0]?.message?.content;

    return NextResponse.json({ text });
  } catch (error) {
    console.error("API Error:", error);

    // detailed error logging
    const status = error.status || (error.message?.includes("429") ? 429 : 500);

    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: status },
    );
  }
}
