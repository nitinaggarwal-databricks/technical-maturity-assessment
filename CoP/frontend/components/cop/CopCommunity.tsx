'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type UseCase = {
  id: string;
  title: string;
  description?: string;
  impact?: string;
  createdAt: string;
};

type Champion = {
  id: string;
  userId: string;
  reason: string;
  recognizedAt: string;
};

type CopCommunityProps = {
  copId: string;
};

export default function CopCommunity({ copId }: CopCommunityProps) {
  const { data: usecases, isLoading: loadingUseCases } = useQuery({
    queryKey: ['usecases', copId],
    queryFn: () => api<UseCase[]>(`/cops/${copId}/usecases`),
  });

  const { data: champions, isLoading: loadingChampions } = useQuery({
    queryKey: ['champions', copId],
    queryFn: () => api<Champion[]>(`/cops/${copId}/champions`),
  });

  if (loadingUseCases && loadingChampions) {
    return <div className="text-slate-500">Loading community data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Use Cases / Success Stories */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Success Stories</h3>
        {usecases && usecases.length > 0 ? (
          <div className="space-y-4">
            {usecases.map((usecase) => (
              <div key={usecase.id} className="border rounded-lg p-4">
                <h4 className="font-medium">{usecase.title}</h4>
                {usecase.description && (
                  <p className="text-sm text-slate-600 mt-2">{usecase.description}</p>
                )}
                {usecase.impact && (
                  <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm">
                    <span className="font-medium text-green-800">Impact:</span>{' '}
                    <span className="text-green-700">{usecase.impact}</span>
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-3">
                  {new Date(usecase.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500">No success stories yet.</div>
        )}
      </section>

      {/* Champions */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Champion Recognition</h3>
        {champions && champions.length > 0 ? (
          <div className="space-y-3">
            {champions.map((champion) => (
              <div key={champion.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Champion</div>
                    <p className="text-sm text-slate-600 mt-1">{champion.reason}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      Recognized {new Date(champion.recognizedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500">No champions recognized yet.</div>
        )}
      </section>
    </div>
  );
}
