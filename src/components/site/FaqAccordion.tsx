export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
}

/** Native disclosure list — same `<details>/<summary>` pattern already used for the negative prompt in PromptOutput. */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.question} className="group rounded-2xl border border-border bg-card p-5">
          <summary className="cursor-pointer list-none text-base font-medium text-card-foreground marker:content-none">
            {item.question}
          </summary>
          <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
