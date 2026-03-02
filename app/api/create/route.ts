import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;

const gemini = new GoogleGenAI({ apiKey });

const model = "gemini-2.5-flash";

// export async function POST(request: Request) {
//   const { userId } = await auth();

//   if (!userId) return new Response("Unauthorized", { status: 401 });

//   const data = await request.json();

//   const { title, content } = data;

//   const response = await generateSummary(content);

//   if (!response)
//     return new Response("Failed to generate summary", { status: 500 });

//   const { summary, questions } = response;

//   const quiz = await prisma.quiz.create({
//     data: {
//       userId,
//       title,
//       content,
//       summary,
//     },
//   });

//   await prisma.question.createMany({
//     data: questions.map((q) => ({
//       quizId: quiz.id,
//       question: q.question,
//       answers: q.options,
//       correct: q.options[q.correctIndex],
//     })),
//   });

//   const fullQuiz = await prisma.quiz.findFirst({
//     where: { id: quiz.id },
//     include: {
//       questions: true,
//     },
//   });

//   return new Response(JSON.stringify(fullQuiz), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { title, content } = await request.json();

    const response = await generateSummary(content);

    if (!response) {
      console.error("generateSummary returned null");
      return new Response("Gemini failed", { status: 500 });
    }

    const { summary, questions } = response;

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

Return ONLY valid JSON (no markdown, no extra text) that matches this TypeScript shape:
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
- summary: 4-8 sentences, clear and faithful to the content.
- quiz: exactly 5 questions.
- Each question must be answerable using ONLY the given content.
- Options must be plausible; exactly one correct option per question.
- Do not include explanations.
- Avoid trick questions.
`;
type GeminiResponse = {
  summary: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
};

// async function generateSummary(
//   contents: string,
// ): Promise<GeminiResponse | null> {
//   const response = await gemini.models.generateContent({
//     model,
//     contents,
//     config: {
//       systemInstruction: prompt,
//     },
//   });

//   if (!response.candidates) return null;

//   if (!response.candidates[0].content) return null;

//   if (!response.candidates[0].content.parts) return null;

//   if (!response.candidates[0].content.parts[0].text) return null;

//   return JSON.parse(
//     response.candidates[0].content.parts[0].text
//       .replace("```json", "")
//       .replace("```", "")
//       .trim(),
//   );
// }
async function generateSummary(contents: string) {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: prompt,
      },
    });

    console.log("Gemini raw response:", JSON.stringify(response, null, 2));

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text returned from Gemini");
      return null;
    }

    return JSON.parse(text.replace("```json", "").replace("```", "").trim());
  } catch (error) {
    console.error("Gemini parse error:", error);
    return null;
  }
}
