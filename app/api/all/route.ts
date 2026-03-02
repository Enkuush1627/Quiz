import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json([], { status: 200 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        userId,
      },
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(quizzes);
  } catch (error) {
    console.error("GET /api/all error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
