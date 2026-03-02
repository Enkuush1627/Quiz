"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, RotateCcw, Sparkles } from "lucide-react";

interface Question {
  id: string;
  quizId: string;
  question: string;
  answers: string[];
  correct: string;
}

interface Quiz {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  questions: Question[];
  createdAt: string;
}

export default function QuizPageTake() {
  const params = useParams();
  const router = useRouter();

  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/${quizId}`);

        if (!res.ok) throw new Error("Failed to fetch quiz");

        const data: Quiz = await res.json();

        setQuiz(data);

        const initialAnswers: Record<string, string> = {};
        data.questions.forEach((q) => {
          initialAnswers[q.id] = "";
        });

        setAnswers(initialAnswers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let correctCount = 0;

    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);
  };

  const handleRetake = () => {
    if (!quiz) return;

    const reset: Record<string, string> = {};

    quiz.questions.forEach((q) => {
      reset[q.id] = "";
    });

    setAnswers(reset);
    setScore(0);
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const next = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1)
      setCurrentQuestionIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Skeleton className="w-125 h-75" />
      </div>
    );

  if (error) return <div className="p-8 text-red-500">{error}</div>;

  if (!quiz) return null;

  const current = quiz.questions[currentQuestionIndex];

  return (
    <div className="w-full flex justify-center py-20 bg-liner-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {!submitted ? (
            <>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Sparkles size={20} />
                Quick test
              </h1>

              <p className="text-sm text-slate-500 mb-6">
                Take a quick test about your knowledge from your content
              </p>
            </>
          ) : (
            <>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Sparkles size={20} />
                Quiz completed
              </h1>

              <p className="text-sm text-slate-500 mb-6">
                Let’s see what you did
              </p>
            </>
          )}

          {!submitted && (
            <div>
              <div className="mb-4 text-sm flex justify-end text-slate-500">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </div>

              <h3 className="text-xl font-medium mb-4">{current.question}</h3>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {current.answers.map((answer, i) => {
                  const selected = answers[current.id] === answer;

                  return (
                    <div
                      key={i}
                      onClick={() =>
                        !submitted && handleAnswerSelect(current.id, answer)
                      }
                      className={`
          py-2 px-4 rounded-lg border cursor-pointer
          transition-all duration-200 select-none

          ${
            selected
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"
          }
        `}
                    >
                      <span className="text-slate-800 font-medium">
                        {answer}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  onClick={prev}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="w-fit"
                >
                  Previous
                </Button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button onClick={handleSubmit} className="w-fit">
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={next} className="w-fit">
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}

          {submitted && (
            <div>
              <h2 className="text-xl font-semibold mb-6">
                Your score: {score} / {quiz.questions.length}
              </h2>

              <div className="space-y-5 mb-6">
                {quiz.questions.map((q, i) => {
                  const correct = answers[q.id] === q.correct;

                  return (
                    <div key={q.id} className="flex gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          correct
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {correct ? "✓" : "✕"}
                      </div>

                      <div>
                        <p className="font-medium">
                          {i + 1}. {q.question}
                        </p>

                        <p className="text-sm text-slate-500">
                          Your answer: {answers[q.id]}
                        </p>

                        {!correct && (
                          <p className="text-sm text-green-600">
                            Correct: {q.correct}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRetake} className="flex-1">
                  <RotateCcw />
                  Restart quiz
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/${quizId}`)}
                  className="flex-1"
                >
                  <Bookmark />
                  Save and leave
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
