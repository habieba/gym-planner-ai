export default function InfoTip({ text }) {
    return (
      <span className="group relative inline-flex">
        <button
          type="button"
          className="ml-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted transition hover:border-primary hover:text-primary"
          aria-label="More information"
        >
          ?
        </button>
  
        <span className="invisible absolute left-1/2 top-7 z-20 w-64 -translate-x-1/2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-normal text-foreground opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          {text}
        </span>
      </span>
    );
  }