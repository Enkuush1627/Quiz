import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const prisma = getPrisma(); // 👈 энд авна

    const quizzes = await prisma.quiz.findMany({
      where: { userId },
      include: { questions: true },
    });

    return Response.json(quizzes);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
