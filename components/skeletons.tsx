import { Card } from "@/components/ui";

// Designed loading states: the shape of the content that is coming, in muted blocks.
// Static on purpose (DESIGN.md: no decorative animation). The label is announced to screen readers.

const BAR = "block rounded bg-surface-muted";

function Loading({ label }: { label: string }) {
  return (
    <span role="status" className="sr-only">
      {label}
    </span>
  );
}

export function ListSkeleton({ label, rows = 5 }: { label: string; rows?: number }) {
  return (
    <div aria-busy="true">
      <Loading label={label} />
      <div className="mt-6 flex gap-3">
        <span className={`${BAR} h-10 w-40`} />
        <span className={`${BAR} h-10 w-40`} />
        <span className={`${BAR} h-10 w-28`} />
      </div>
      <Card className="mt-6 p-0">
        <ul className="divide-y divide-border">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="flex flex-col gap-2">
                <span className={`${BAR} h-4 w-72 max-w-full`} />
                <span className={`${BAR} h-3 w-48`} />
              </span>
              <span className={`${BAR} h-5 w-20 rounded-full`} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function CardsSkeleton({ label, cards = 3 }: { label: string; cards?: number }) {
  return (
    <div aria-busy="true">
      <Loading label={label} />
      <span className={`${BAR} mt-2 h-4 w-64`} />
      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: cards }, (_, i) => (
          <Card key={i}>
            <span className={`${BAR} h-4 w-64 max-w-full`} />
            <span className={`${BAR} mt-2 h-3 w-40`} />
            <span className={`${BAR} mt-6 h-4 w-32`} />
            <span className={`${BAR} mt-3 h-3 w-full`} />
            <span className={`${BAR} mt-2 h-3 w-3/4`} />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true">
      <Loading label={label} />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <span className={`${BAR} h-3 w-28`} />
            <span className={`${BAR} mt-3 h-8 w-20`} />
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`${BAR} mt-3 h-3 first:mt-0`} style={{ width: `${60 + ((i * 13) % 35)}%` }} />
        ))}
      </Card>
    </div>
  );
}
