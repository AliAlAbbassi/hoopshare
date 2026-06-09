import { orderedLists, site } from "@/config/lists";
import { ListBrowser } from "@/components/ListBrowser";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <header className="mb-8">
        <h1 className="text-[1.7rem] font-bold leading-[1.15] tracking-tight text-foreground sm:whitespace-nowrap sm:text-4xl">
          {site.headline}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base">
          {site.tagline}
        </p>
      </header>

      <ListBrowser lists={orderedLists()} />

      <footer className="mt-14 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        {site.footnote}
      </footer>
    </main>
  );
}
