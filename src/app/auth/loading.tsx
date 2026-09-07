/**
 * Auth-segment loading skeleton. Renders inside the auth layout (signal rail +
 * panel), so it only fills the panel area with quiet placeholders that match
 * the sign-in form's rhythm.
 */
export default function AuthLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-44 rounded bg-surface-raised" />
        <div className="h-4 w-60 rounded bg-surface-raised" />
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-10 rounded bg-surface-raised" />
        <div className="h-10 rounded bg-surface-raised" />
        <div className="h-11 rounded bg-surface-raised" />
      </div>
    </div>
  );
}
