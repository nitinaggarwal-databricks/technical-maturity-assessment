export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">
          Launch & Scale Communities of Practice
        </h1>
        <p className="text-slate-600 max-w-2xl">
          A one-stop portal for Databricks teams and customers to design, launch,
          and measure Communities of Practice: sessions, content, surveys, KPIs,
          and success stories.
        </p>
        <div className="flex gap-3">
          <a
            href="/cops"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            View CoPs
          </a>
        </div>
      </section>
    </div>
  );
}


