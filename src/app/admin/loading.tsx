/**
 * Admin-segment loading skeleton.
 *
 * The admin layout is async — it awaits `auth()` to resolve the signed-in user
 * for the navbar — so navigating here suspends on a network-bound call. Without
 * this fallback the screen simply holds on the previous route until the session
 * resolves, which reads as a frozen page.
 *
 * Mirrors the dashboard's rhythm: heading, dropzone, then the document grid.
 */
export default function AdminLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-12">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-56 rounded bg-surface-raised" />
          <div className="h-4 w-80 max-w-full rounded bg-surface-raised" />
        </div>
        <div className="h-48 rounded-2xl border border-dashed border-line-strong" />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <div className="h-4 w-24 rounded bg-surface-raised" />
          <div className="h-3 w-16 rounded bg-surface-raised" />
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index}>
              <div className="h-[9.5rem] rounded-2xl border border-line bg-surface" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
