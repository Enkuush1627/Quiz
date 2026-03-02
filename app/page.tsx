"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles } from "lucide-react";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correct: string;
}

interface QuizResponse {
  id: string;
  title: string;
  content: string;
  summary: string;
  questions: Question[];
  createdAt: string;
}

const Home = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API error: ${response.status}`);
      }

      const data: QuizResponse = await response.json();

      setTitle("");
      setContent("");

      router.push(`/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-[#000000] flex items-center gap-2">
            <Sparkles />
            Article Quiz Generator
          </h1>
          <p className="text-[#71717A] mb-8 text-base">
            Paste your article below to generate a summarize and quiz question.
            Your articles will saved in the sidebar for future reference.
          </p>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-1 text-sm font-semibold text-[#71717A] mb-2">
                <FileText size={15} />
                Article Title
              </label>
              <Input
                placeholder="Enter a title for your article..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-semibold text-[#71717A] mb-2">
                <FileText size={15} />
                Article Content
              </label>
              <textarea
                placeholder="Paste your article content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateSummary}
                disabled={loading}
                className="w-fit bg-black hover:bg-gray-400 text-white font-semibold py-3"
              >
                {loading ? "Creating Quiz..." : "Generate Quiz"}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
