'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type ContentAsset = {
  id: string;
  title: string;
  assetType: string;
  assetUrl?: string;
  description?: string;
  createdAt: string;
};

type CopContentProps = {
  copId: string;
};

export default function CopContent({ copId }: CopContentProps) {
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', copId],
    queryFn: () => api<ContentAsset[]>(`/content/cop/${copId}`),
  });

  if (isLoading) {
    return <div className="text-slate-500">Loading content...</div>;
  }

  if (!content || content.length === 0) {
    return <div className="text-slate-500">No content yet.</div>;
  }

  return (
    <div className="space-y-4">
      {content.map((asset) => (
        <div key={asset.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{asset.title}</h4>
              {asset.description && (
                <p className="text-sm text-slate-600 mt-1">{asset.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded">
                  {asset.assetType}
                </span>
                <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {asset.assetUrl && (
              <a
                href={asset.assetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-3 py-1.5 text-sm bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                View
              </a>
            )}
          </div>

          {/* Special handling for DBSQL dashboards */}
          {asset.assetType === 'dbsql_dashboard' && asset.assetUrl && (
            <div className="mt-4 border rounded">
              <iframe
                src={asset.assetUrl}
                className="w-full h-96"
                title={asset.title}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


