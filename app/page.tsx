import { Form } from "@/components/form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            TextExplain
          </h1>
          <p className="text-base leading-6 text-copy-muted">
            Paste any passage and this app finds the key words and concepts,
            then returns the same text with hover tooltips that explain them.
          </p>
        </header>
        <Form />
      </main>
    </div>
  );
}
