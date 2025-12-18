'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

type Cop = {
  id: string;
  name: string;
  mission: string;
  phase: string;
  customer: {
    name: string;
  };
};

export default function CopsPage() {
  const { data: cops, isLoading, error } = useQuery({
    queryKey: ['cops'],
    queryFn: () => api<Cop[]>('/cops'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading CoPs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Error loading CoPs</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Communities of Practice</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cops?.map((cop) => (
          <div key={cop.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{cop.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{cop.customer.name}</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {cop.phase}
              </span>
            </div>

            <p className="text-slate-600 mb-4">{cop.mission}</p>

            <Link
              href={`/cops/${cop.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800"
            >
              View Dashboard
            </Link>
          </div>
        ))}
      </div>

      {!cops || cops.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No CoPs found. Create your first CoP to get started!
        </div>
      )}
    </div>
  );
}
