'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type Event = {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
};

type CopOverviewProps = {
  copId: string;
};

export default function CopOverview({ copId }: CopOverviewProps) {
  const { data: events } = useQuery({
    queryKey: ['events', copId],
    queryFn: () => api<Event[]>(`/cops/${copId}/events`),
  });

  const upcomingEvents = events?.filter(
    (e) => new Date(e.eventDate) > new Date()
  ).slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Mission</h3>
        <p className="text-slate-600">
          Drive Databricks adoption and best-practice sharing across teams.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Current Phase</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Growth
        </span>
      </section>

      {upcomingEvents.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-3">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-slate-500">
                  {new Date(event.eventDate).toLocaleDateString()} • {event.eventType}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
