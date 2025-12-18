"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

type SurveyQuestion = {
  id: string;
  questionText: string;
  questionType: string;
  position: number;
};

type Survey = {
  id: string;
  title: string;
  surveyType: string;
  questions: SurveyQuestion[];
};

export default function SurveyPageClient({
  surveyId
}: {
  surveyId: string;
}) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<Survey>({
    queryKey: ["survey", surveyId],
    queryFn: () => api<Survey>(`/surveys/${surveyId}`)
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: {
      answers: { questionId: string; answerValue: string }[];
    }) =>
      api(`/surveys/${surveyId}/responses`, {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ["survey", surveyId, "stats"] });
    }
  });

  const statsQuery = useQuery({
    queryKey: ["survey", surveyId, "stats"],
    queryFn: () => api(`/surveys/${surveyId}/stats/basic`),
    enabled: submitted
  });

  if (isLoading) return <div className="p-6">Loading survey...</div>;
  if (error || !data) return <div className="p-6">Survey not found.</div>;

  const handleChange = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      answers: Object.entries(answers).map(([questionId, answerValue]) => ({
        questionId,
        answerValue
      }))
    };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{data.title}</h1>
        <p className="text-xs text-slate-500 mt-1">
          Type: {data.surveyType} | {data.questions.length} questions
        </p>
      </div>

      {submitted ? (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Thank you! Your response has been recorded.
        </div>
      ) : null}

      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border p-6">
          {data.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-medium text-slate-800 block">
                {q.questionText}
              </label>
              {["rating", "nps"].includes(q.questionType) ? (
                <div>
                  <input
                    type="number"
                    min={q.questionType === "rating" ? 1 : 0}
                    max={q.questionType === "rating" ? 5 : 10}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                    placeholder={q.questionType === "rating" ? "1-5" : "0-10"}
                  />
                  <span className="ml-2 text-xs text-slate-500">
                    {q.questionType === "rating" ? "(1-5)" : "(0-10)"}
                  </span>
                </div>
              ) : (
                <textarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="w-full min-h-[80px] rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Your answer..."
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-slate-800"
          >
            {mutation.isPending ? "Submitting..." : "Submit Response"}
          </button>
        </form>
      )}

      {submitted && statsQuery.data && (
        <div className="space-y-3 bg-white rounded-lg border p-6">
          <h2 className="text-sm font-semibold text-slate-700">
            Survey Statistics
          </h2>
          <div className="text-xs text-slate-600">
            <div>
              <strong>Total Responses:</strong>{" "}
              {statsQuery.data.responsesCount}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Object.entries(statsQuery.data.questions || {}).map(
              ([qId, stats]: [string, any]) => (
                <div key={qId} className="text-xs">
                  <div className="font-medium text-slate-700">
                    {stats.question}
                  </div>
                  <div className="text-slate-600">
                    {stats.avg !== undefined ? (
                      <>
                        Average: <strong>{stats.avg.toFixed(2)}</strong> ({stats.count} responses)
                      </>
                    ) : (
                      `${stats.count} responses`
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}


