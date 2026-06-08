import { Database } from "lucide-react";
import { lists, groupedLists, site, GROUP_ORDER } from "@/config/lists";
import { ListBrowser } from "@/components/ListBrowser";

export default function Home() {
  const groups = groupedLists();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <header className="mb-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
            <Database className="size-[18px]" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-tight text-foreground">
            {site.name}
          </span>
        </div>

        <h1 className="mt-6 max-w-2xl text-balance text-[1.7rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl">
          Browse, preview &amp; download data lists.
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base">
          {site.tagline}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <Stat>{lists.length} lists</Stat>
          <Dot />
          <Stat>{GROUP_ORDER.length} collections</Stat>
          <Dot />
          <span>CSV &amp; Excel</span>
        </div>
      </header>

      <ListBrowser groups={groups} />

      <footer className="mt-14 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        {site.footnote}
      </footer>
    </main>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-border">
      •
    </span>
  );
}
