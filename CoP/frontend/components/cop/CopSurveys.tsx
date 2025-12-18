'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

type Survey = {
  id: string;
  title: string;
  surveyType: string;
  createdAt: string;
};

type CopSurveysProps = {
  copId: string;
};

export default function CopSurveys({ copId }: CopSurveysProps) {
  const { data: surveys, isLoading } = useQuery({
    queryKey: ['surveys', copId],
    queryFn: () => api<Survey[]>(`/surveys/cop/${copId}`),
  });

  if (isLoading) {
    return <div className="text-slate-500">Loading surveys...</div>;
  }

  if (!surveys || surveys.length === 0) {
    return <div className="text-slate-500">No surveys yet.</div>;
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <div key={survey.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{survey.title}</h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded">
                  {survey.surveyType}
                </span>
                <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Link
              href={`/surveys/${survey.id}`}
              className="ml-4 px-3 py-1.5 text-sm bg-slate-900 text-white rounded hover:bg-slate-800"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
