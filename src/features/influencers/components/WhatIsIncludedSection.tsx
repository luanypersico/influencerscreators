export interface WhatIsIncludedSectionProps {
  items: string[];
}

/** "O que acompanha esta influencer?" — turns the purchase from abstract into a concrete list. */
export function WhatIsIncludedSection({ items }: WhatIsIncludedSectionProps) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground"
        >
          <span aria-hidden="true" className="mt-0.5 text-primary">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
