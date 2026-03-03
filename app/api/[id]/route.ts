import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      questions: true,
    },
  });

  if (!quiz) {
    return new NextResponse("Quiz not found", { status: 404 });
  }

  return NextResponse.json(quiz);
}
