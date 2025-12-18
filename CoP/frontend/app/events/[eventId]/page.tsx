"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  cop: {
    id: string;
    name: string;
  };
  survey?: {
    id: string;
    title: string;
  };
};

export default function EventPage({ params }: { params: { eventId: string } }) {
  const { data, isLoading, error } = useQuery<Event>({
    queryKey: ["event", params.eventId],
    queryFn: () => api<Event>(`/events/${params.eventId}`)
  });

  if (isLoading) return <div className="p-6">Loading event...</div>;
  if (error || !data) return <div className="p-6">Event not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <div className="text-sm text-slate-500">
          <Link href={`/cops/${data.cop.id}`} className="hover:underline">
            {data.cop.name}
          </Link>{" "}
          / Event
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
        <div className="flex gap-4 text-sm text-slate-600">
          <span className="px-2 py-1 rounded bg-slate-100">
            {data.eventType}
          </span>
          <span>
            {new Date(data.startsAt).toLocaleString()}
          </span>
          {data.location && <span>📍 {data.location}</span>}
        </div>
      </div>

      {data.description && (
        <div className="prose prose-sm max-w-none bg-white rounded-lg border p-6">
          <p className="text-slate-700">{data.description}</p>
        </div>
      )}

      {data.survey && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                📋 Feedback Survey
              </h3>
              <p className="text-xs text-blue-700 mt-1">{data.survey.title}</p>
            </div>
            <Link
              href={`/surveys/${data.survey.id}`}
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
            >
              Take Survey →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Event Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Type:</span>
            <span className="font-medium text-slate-900">{data.eventType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Starts:</span>
            <span className="font-medium text-slate-900">
              {new Date(data.startsAt).toLocaleString()}
            </span>
          </div>
          {data.endsAt && (
            <div className="flex justify-between">
              <span className="text-slate-600">Ends:</span>
              <span className="font-medium text-slate-900">
                {new Date(data.endsAt).toLocaleString()}
              </span>
            </div>
          )}
          {data.location && (
            <div className="flex justify-between">
              <span className="text-slate-600">Location:</span>
              <span className="font-medium text-slate-900">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


