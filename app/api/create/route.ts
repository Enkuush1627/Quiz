import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { getPrisma } from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const gemini = new GoogleGenAI({ apiKey });
const model = "gemini-2.5-flash";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const prisma = getPrisma();

    const { title, content } = await request.json();

    const aiResult = await generateSummary(content);
    if (!aiResult) {
      return new Response("Gemini failed", { status: 500 });
    }

    const { summary, questions } = aiResult;

    const quiz = await prisma.quiz.create({
      data: {
        userId,
        title,
        content,
        summary,
      },
    });

    await prisma.question.createMany({
      data: questions.map((q: any) => ({
        quizId: quiz.id,
        question: q.question,
        answers: q.options,
        correct: q.options[q.correctIndex],
      })),
    });

    const fullQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: true },
    });

    return Response.json(fullQuiz);
  } catch (error) {
    console.error("POST error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

const prompt = `
You create study materials from the provided content.

Return ONLY valid JSON (no markdown, no extra text) that matches this shape:
{
  "summary": string,
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": 0|1|2|3
    }
  ]
}

Rules:
- summary: 4-8 sentences.
- exactly 5 questions.
- Only one correct option.
- No explanations.
`;

async function generateSummary(contents: string) {
  try {
    const response = await gemini.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: prompt,
      },
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return null;

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini parse error:", error);
    return null;
  }
}
