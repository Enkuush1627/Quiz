import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const quiz = await prisma.quiz.findFirst({
    where: {
      id: params.id,
      userId,
    },
    include: {
      questions: true,
    },
  });

  return Response.json(quiz);
}
