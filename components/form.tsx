"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { analyzeTextAction } from "@/lib/actions";
import type { LocatedTerm } from "@/lib/locate-terms";

type Status = "idle" | "loading" | "done";

function AnnotatedText({
  text,
  annotations,
}: {
  text: string;
  annotations: LocatedTerm[];
}) {
  if (annotations.length === 0) {
    return <p className="whitespace-pre-wrap leading-7 text-foreground">{text}</p>;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;

  annotations.forEach((annotation, index) => {
    if (annotation.start > cursor) {
      parts.push(
        <span key={`plain-${cursor}`}>
          {text.slice(cursor, annotation.start)}
        </span>,
      );
    }

    parts.push(
      <span
        key={`term-${index}`}
        className="group relative inline cursor-help font-medium text-brand underline decoration-brand underline-offset-4"
      >
        {text.slice(annotation.start, annotation.end)}
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-xs -translate-x-1/2 rounded-xl bg-surface-elevated px-3 py-2 text-sm font-normal text-foreground shadow-lg group-hover:block"
        >
          {annotation.explanation}
        </span>
      </span>,
    );

    cursor = annotation.end;
  });

  if (cursor < text.length) {
    parts.push(<span key={`plain-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <p className="whitespace-pre-wrap leading-7 text-foreground">{parts}</p>;
}

export function Form() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [annotations, setAnnotations] = useState<LocatedTerm[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setStatus("loading");
    setResultText("");
    setAnnotations([]);

    const result = await analyzeTextAction(text);

    if (!result.ok) {
      setError(result.message);
      setStatus("idle");
      return;
    }

    setResultText(result.text);
    setAnnotations(result.annotations);
    setStatus("done");
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError(null);
          }}
          placeholder="paste your text..."
          rows={8}
          className="form-textarea w-full resize-y rounded-xl border border-transparent bg-surface px-4 py-3 text-foreground placeholder:text-copy-muted focus:border-brand focus:outline-none"
        />
        {error && (
          <p role="alert" className="text-sm text-copy-muted">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "loading" || !text.trim()}
          className="self-start rounded-xl bg-brand px-5 py-2.5 font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Explain text
        </button>
      </form>

      {(status === "loading" || status === "done") && (
        <section
          aria-live="polite"
          className="min-h-24 rounded-2xl bg-surface px-4 py-4"
        >
          {status === "loading" ? (
            <div className="flex items-center gap-3 text-copy-muted">
              <div className="loader" aria-hidden />
              <span>Explaining…</span>
            </div>
          ) : (
            <AnnotatedText text={resultText} annotations={annotations} />
          )}
        </section>
      )}
    </div>
  );
}
