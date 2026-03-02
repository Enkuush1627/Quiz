"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropsWithChildren, useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Quiz {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  questions: { id: string }[];
}

export const AppSidebar = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/all");

        if (!response.ok) {
          throw new Error("Failed to fetch quiz history");
        }

        const data: Quiz[] = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
      <Sidebar className="pt-14" collapsible="icon">
        <SidebarHeader>
          <div className="flex justify-between items-center">
            {isOpen && <h1 className="text-xl font-semibold">History</h1>}
            <SidebarTrigger></SidebarTrigger>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-2 space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <p className="text-xs text-red-600">{error}</p>
            ) : quizzes.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-4">No quizzes yet</p>
            ) : (
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/${quiz.id}`}
                    className="block p-3 rounded-lg hover:bg-slate-100 transition group"
                  >
                    <h3 className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {quiz.summary}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        {quiz.questions.length} questions
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </SidebarContent>
      </Sidebar>

      <div className="w-full h-screen flex justify-center items-center">
        {children}
      </div>
    </SidebarProvider>
  );
};
