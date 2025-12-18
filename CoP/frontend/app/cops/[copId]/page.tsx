'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import CopOverview from '@/components/cop/CopOverview';
import CopContent from '@/components/cop/CopContent';
import CopSurveys from '@/components/cop/CopSurveys';
import CopAnalytics from '@/components/cop/CopAnalytics';
import CopCommunity from '@/components/cop/CopCommunity';

type Cop = {
  id: string;
  name: string;
  mission: string;
  phase: string;
  customer: {
    name: string;
  };
};

type PageProps = {
  params: { copId: string };
};

export default function CopDetailPage({ params }: PageProps) {
  const copId = params.copId;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: cop, isLoading } = useQuery({
    queryKey: ['cop', copId],
    queryFn: () => api<Cop>(`/cops/${copId}`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading CoP...</div>
      </div>
    );
  }

  if (!cop) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">CoP not found</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'content', label: 'Content' },
    { id: 'surveys', label: 'Surveys' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{cop.name}</h1>
        <p className="text-slate-600 mt-1">{cop.customer.name}</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'overview' && <CopOverview copId={copId} />}
        {activeTab === 'content' && <CopContent copId={copId} />}
        {activeTab === 'surveys' && <CopSurveys copId={copId} />}
        {activeTab === 'analytics' && <CopAnalytics copId={copId} />}
        {activeTab === 'community' && <CopCommunity copId={copId} />}
      </div>
    </div>
  );
}
