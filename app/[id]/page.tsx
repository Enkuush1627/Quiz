"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface Quiz {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  questions: unknown[];
  createdAt: string;
}

const QuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quizId = params.id as string;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${quizId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.status}`);
        }

        const data: Quiz = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleTakeQuiz = () => {
    router.push(`/${quizId}/quiz`);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="p-4 bg-red-50 border border-red-300 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-slate-600">Quiz not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#000000] mb-2">
            <Sparkles />
            Article Quiz Generator
          </h1>
          <p className="font-semibold text-sm text-[#737373] flex gap-1 items-center">
            <BookOpen size={15} />
            Summarized content
          </p>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#000000] mb-2">
              {quiz.title}
            </h1>
          </div>

          {quiz.summary && (
            <div className="mb-8 line-clamp-6 p-6 bg-blue-50 border border-blue-300 rounded-lg">
              <p className="text-slate-700 leading-relaxed">{quiz.summary}</p>
            </div>
          )}
          <div className="flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white text-[#18181B] font-medium text-sm border border-[#E4E4E7]"
                >
                  See content
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{quiz.title}</DialogTitle>

                  <DialogDescription>Full article content</DialogDescription>
                </DialogHeader>

                <div className="mt-4 whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {quiz.content}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={handleTakeQuiz}
              className="w-fit bg-[#18181B] hover:bg-gray-400 text-[#FAFAFA] font-medium text-sm"
            >
              Take Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
