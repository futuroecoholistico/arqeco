import type { ReactNode } from "react";

type Chapter = "overview" | "profile" | "strategy" | "dimensions" | "recommendations" | "plan" | "transformation";

const angles = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/** Editorial linework: decorative only; report headings supply the accessible meaning. */
export function ChapterArt({ chapter }: { chapter: Chapter }) {
  let drawing: ReactNode;

  switch (chapter) {
    case "overview":
      drawing = <>
        {[28, 43, 58].map((r) => <circle key={r} cx="80" cy="80" r={r} />)}
        {angles.map((a, i) => <line key={i} x1={80 + 61 * Math.cos(a)} y1={80 + 61 * Math.sin(a)} x2={80 + 69 * Math.cos(a)} y2={80 + 69 * Math.sin(a)} />)}
        <path className="stroke-accent" d="M80 51 101 80 80 109 59 80Z M80 51V109 M59 80h42" />
        <circle cx="80" cy="80" r="5" className="fill-gold stroke-none" />
      </>;
      break;
    case "profile":
      drawing = <>
        <circle cx="80" cy="80" r="57" /><circle cx="80" cy="80" r="39" />
        {[0, 60, 120].map((deg) => <ellipse key={deg} cx="80" cy="80" rx="22" ry="54" transform={`rotate(${deg} 80 80)`} />)}
        <circle cx="80" cy="80" r="7" className="fill-accent stroke-none" />
        <path className="stroke-gold" d="M80 9v10 M80 141v10 M9 80h10 M141 80h10" />
      </>;
      break;
    case "strategy":
      drawing = <>
        <path d="M31 43h98v74H31z M31 80h98 M80 43v74" />
        <circle cx="55" cy="61" r="11" /><path className="stroke-accent" d="M94 51h23v20H94z M43 105l12-20 12 20Z M105 85l15 16-15 16-15-16Z" />
        <path className="stroke-gold" d="M23 35V24h11 M126 24h11v11 M23 125v11h11 M126 136h11v-11" />
      </>;
      break;
    case "dimensions":
      drawing = <>
        {[30, 52].map((r) => <circle key={r} cx="80" cy="80" r={r} />)}
        {Array.from({ length: 5 }, (_, i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
          return <g key={i}><line x1="80" y1="80" x2={80 + 52 * Math.cos(a)} y2={80 + 52 * Math.sin(a)} /><circle cx={80 + 52 * Math.cos(a)} cy={80 + 52 * Math.sin(a)} r="5" className="fill-accent stroke-none" /></g>;
        })}
        <path className="stroke-gold" d="M80 50 109 71 98 105 62 105 51 71Z" />
      </>;
      break;
    case "recommendations":
      drawing = <>
        <path d="M80 22 126 48v64l-46 26-46-26V48Z M34 48l46 26 46-26 M80 74v64" />
        <path className="stroke-accent" d="M57 60 80 35l23 25 M51 102l20 12 M89 114l20-12" />
        <circle cx="80" cy="74" r="5" className="fill-gold stroke-none" />
      </>;
      break;
    case "plan":
      drawing = <>
        <path d="M28 119h104 M38 109V50 M80 109V35 M122 109V58" />
        <circle cx="38" cy="50" r="13" /><circle cx="80" cy="35" r="13" /><circle cx="122" cy="58" r="13" />
        <path className="stroke-accent" d="M38 50 80 35l42 23 M26 131h108" />
        <circle cx="38" cy="50" r="3" className="fill-gold stroke-none" /><circle cx="80" cy="35" r="3" className="fill-gold stroke-none" /><circle cx="122" cy="58" r="3" className="fill-gold stroke-none" />
      </>;
      break;
    case "transformation":
      drawing = <>
        <path d="M25 114V45l55-23 55 23v69l-55 24Z M80 22v116 M25 45l55 24 55-24 M25 114l55-24 55 24" />
        <path className="stroke-accent" d="M95 77h25v29H95z M40 74l25 9v24l-25-9Z" />
        <path className="stroke-gold" d="M94 9v12 M88 15h12 M125 24v12 M119 30h12" />
      </>;
  }

  return <svg aria-hidden="true" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" className="h-20 w-20 shrink-0 text-primary/65 md:h-28 md:w-28">{drawing}</svg>;
}

export function ElementArt({ element }: { element: "terra" | "agua" | "fogo" | "ar" | "eter" }) {
  const drawings = {
    terra: <><path d="M12 52 32 15l20 37Z M17 43h30 M23 33h18" /><path d="M32 10v-5 M8 52h48" /></>,
    agua: <><path d="M32 8C24 22 14 32 14 42a18 18 0 0 0 36 0C50 32 40 22 32 8Z M21 43c2 7 7 11 14 11 M26 36l5-7" /></>,
    fogo: <><path d="M32 6c5 16-4 20 5 29 1-7 7-11 8-14 12 17 8 34-5 38-15 5-27-5-27-18 0-10 9-17 9-24 2 10 5 12 10 16Z" /><path d="M32 40c-7 8-7 17 0 20 8-3 8-12 0-20Z" /></>,
    ar: <><path d="M8 25h36c12 0 13-15 4-15-5 0-8 3-8 7 M5 36h47 M13 48h27c10 0 11 12 2 12-4 0-6-2-6-5" /></>,
    eter: <><circle cx="32" cy="32" r="22" /><circle cx="32" cy="32" r="13" /><path d="M32 4v56 M4 32h56 M12 12l40 40 M52 12 12 52" /><circle cx="32" cy="32" r="4" /></>,
  };
  const colors = { terra: "text-terra", agua: "text-agua", fogo: "text-fogo", ar: "text-ar", eter: "text-eter" };
  return <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" className={`mx-auto mb-3 h-14 w-14 ${colors[element]}`}>{drawings[element]}</svg>;
}