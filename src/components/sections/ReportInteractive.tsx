"use client";

import { useEffect, useRef, useState } from "react";
import { IconAlertTriangle, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { report } from "@/content/site";
import { PAINT_RANGES, paintStatus, sampleReport, type Status } from "@/content/report";

const km = new Intl.NumberFormat("en-IN").format(sampleReport.odometerKm);

const STATUS_WORD: Record<Status, string> = { pass: "Pass", attention: "Attention", fail: "Fail" };
function StatusIcon({ status, size = 20 }: { status: Status; size?: number }) {
  const Icon = status === "pass" ? IconCircleCheck : status === "attention" ? IconAlertTriangle : IconCircleX;
  return <Icon size={size} stroke={1.75} aria-hidden="true" className={`rp-status-icon rp-status-icon--${status}`} />;
}

/** Top-down outline (front at the top, the car's left on the viewer's left). Bumpers are plastic. */
const PANELS: Record<string, { d: string; tx: number; ty: number }> = {
  bonnet: { d: "M48 50H152L148 138Q100 144 52 138Z", tx: 100, ty: 96 },
  roof: { d: "M61 190Q100 194 139 190L141 288Q100 292 59 288Z", tx: 100, ty: 241 },
  tailgate: { d: "M54 334Q100 338 146 334L152 374Q100 380 48 374Z", tx: 100, ty: 357 },
  "lf-fender": { d: "M20 54L44 50L48 140L22 142Q16 98 20 54Z", tx: 33, ty: 97 },
  "rf-fender": { d: "M180 54L156 50L152 140L178 142Q184 98 180 54Z", tx: 167, ty: 97 },
  "lf-door": { d: "M22 146H50L54 232H24Z", tx: 37.5, ty: 189 },
  "rf-door": { d: "M178 146H150L146 232H176Z", tx: 162.5, ty: 189 },
  "lr-door": { d: "M24 236H54V316H25Z", tx: 39, ty: 276 },
  "rr-door": { d: "M176 236H146V316H175Z", tx: 161, ty: 276 },
  "l-quarter": { d: "M25 320H52L46 372L30 370Z", tx: 38, ty: 346 },
  "r-quarter": { d: "M175 320H148L154 372L170 370Z", tx: 162, ty: 346 },
};

function PaintMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <svg className="rp-car" viewBox="0 0 200 420" role="group" aria-label="Paint thickness by panel, top view, front at the top">
      {/* decorative: wheels, mirrors, glass and plastic bumpers */}
      <g className="rp-car__deco" aria-hidden="true">
        <rect x="4" y="68" width="12" height="52" rx="5" />
        <rect x="184" y="68" width="12" height="52" rx="5" />
        <rect x="6" y="318" width="12" height="52" rx="5" />
        <rect x="182" y="318" width="12" height="52" rx="5" />
        <ellipse cx="13" cy="152" rx="7" ry="4" />
        <ellipse cx="187" cy="152" rx="7" ry="4" />
      </g>
      <g className="rp-car__plastic" aria-hidden="true">
        <path d="M50 20C70 12 130 12 150 20L160 46H40Z" />
        <path d="M42 378Q100 384 158 378L153 404Q100 410 47 404Z" />
      </g>
      <g className="rp-car__glass" aria-hidden="true">
        <path d="M53 142Q100 148 147 142L139 186Q100 190 61 186Z" />
        <path d="M60 292Q100 296 140 292L146 328Q100 332 54 328Z" />
      </g>
      {sampleReport.panels.map((p) => {
        const geo = PANELS[p.id];
        const status = paintStatus(p.value);
        const label = `${p.label}, ${p.value} µm, ${PAINT_RANGES.find((r) => r.status === status)!.label.toLowerCase()}`;
        return (
          <g
            key={p.id}
            className={`rp-panel rp-panel--${status}`}
            data-selected={selected === p.id ? "" : undefined}
            role="button"
            tabIndex={0}
            aria-pressed={selected === p.id}
            aria-label={label}
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(p.id);
              }
            }}
          >
            <path d={geo.d} />
            <text x={geo.tx} y={geo.ty} textAnchor="middle" dominantBaseline="central">
              {p.value}
            </text>
          </g>
        );
      })}
      <text className="rp-car__note" x="100" y="31" textAnchor="middle" aria-hidden="true">
        plastic
      </text>
      <text className="rp-car__note" x="100" y="393" textAnchor="middle" aria-hidden="true">
        plastic
      </text>
    </svg>
  );
}

type Pane = "summary" | "paint" | "systems" | "photos";
const PANES: { id: Pane; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "paint", label: "Paint" },
  { id: "systems", label: "Systems" },
  { id: "photos", label: "Photos" },
];

export function ReportInteractive({ photos }: { photos: { caption: string; node: React.ReactNode }[] }) {
  const r = sampleReport;
  const [pane, setPane] = useState<Pane>("summary");
  const [panel, setPanel] = useState("rf-fender");
  const [seen, setSeen] = useState(false);
  const ring = useRef<SVGSVGElement>(null);

  // The score ring draws to its value once, when the report comes into view.
  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sel = r.panels.find((p) => p.id === panel)!;
  const selStatus = paintStatus(sel.value);
  const counts = r.systems.reduce((acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }), {} as Record<Status, number>);
  const C = 2 * Math.PI * 52;

  return (
    <article className="rp" aria-labelledby="rp-heading">
      <header className="rp__head">
        <div>
          <h3 id="rp-heading" className="rp__title">
            Vehicle health report
          </h3>
          <p className="rp__meta">
            <span>{r.vehicle}</span>
            <span>{km} km</span>
            <span>{r.type}</span>
          </p>
        </div>
        <p className="rp__label">{report.label}</p>
      </header>

      <div className="rp__switch" role="group" aria-label="Report views">
        {PANES.map((p) => (
          <button key={p.id} type="button" className="rp__switch-btn" aria-pressed={pane === p.id} aria-controls={`rp-pane-${p.id}`} onClick={() => setPane(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="rp__grid">
        <section id="rp-pane-summary" className="rp__pane rp__summary" data-active={pane === "summary" ? "" : undefined} aria-label="Summary">
          <div className="rp__score">
            <svg ref={ring} viewBox="0 0 120 120" className="rp__ring" data-seen={seen ? "" : undefined} aria-hidden="true">
              <circle cx="60" cy="60" r="52" className="rp__ring-track" />
              <circle cx="60" cy="60" r="52" className="rp__ring-value" style={{ strokeDasharray: C, strokeDashoffset: seen ? C * (1 - r.score / 100) : C }} />
            </svg>
            <p className="rp__score-text">
              <span className="rp__score-num">{r.score}</span>
              <span className="rp__score-of">/100</span>
              <span className="rp__score-label">Health score</span>
            </p>
          </div>
          <div className="rp__verdict">
            <p className="rp__verdict-label">Verdict</p>
            <p className="rp__verdict-word">{r.verdict.label}</p>
            <p className="rp__verdict-body">{r.verdict.body}</p>
            <ul className="rp__tally" role="list">
              <li>
                <StatusIcon status="pass" size={18} /> {counts.pass ?? 0} pass
              </li>
              <li>
                <StatusIcon status="attention" size={18} /> {counts.attention ?? 0} attention
              </li>
              <li>
                <StatusIcon status="fail" size={18} /> {counts.fail ?? 0} fail
              </li>
            </ul>
          </div>
          <div className="rp__obd">
            <p className="rp__obd-label">OBD scan</p>
            {r.obd.map((o) => (
              <p key={o.code} className="rp__obd-row">
                <span className="rp__code">{o.code}</span>
                <span>{o.text}</span>
                <span className="rp__obd-status">
                  <StatusIcon status={o.status} size={18} /> {STATUS_WORD[o.status]}
                </span>
              </p>
            ))}
          </div>
        </section>

        <section id="rp-pane-paint" className="rp__pane rp__paint" data-active={pane === "paint" ? "" : undefined} aria-label="Paint thickness">
          <p className="rp__pane-title">Paint thickness (µm)</p>
          <PaintMap selected={panel} onSelect={setPanel} />
          <p className={`rp__reading rp__reading--${selStatus}`} aria-live="polite">
            <StatusIcon status={selStatus} size={18} />
            <span>
              <strong>{sel.label}</strong> {sel.value} µm, {PAINT_RANGES.find((x) => x.status === selStatus)!.label.toLowerCase()}
            </span>
          </p>
          <ul className="rp__legend" role="list">
            <li className="rp__legend--pass">≤160 µm factory range</li>
            <li className="rp__legend--attention">161–300 repaint likely</li>
            <li className="rp__legend--fail">&gt;300 filler or repair likely</li>
          </ul>
          <p className="rp__fine">Ranges vary by manufacturer. Bumpers are plastic, so they get a visual check.</p>
        </section>

        <section id="rp-pane-systems" className="rp__pane rp__systems" data-active={pane === "systems" ? "" : undefined} aria-label="Systems">
          <ul className="rp__rows" role="list">
            {r.systems.map((s) => (
              <li key={s.name} className={`rp__row rp__row--${s.status}`}>
                <StatusIcon status={s.status} />
                <span className="rp__row-name">{s.name}</span>
                <span className="rp__row-status">{STATUS_WORD[s.status]}</span>
                <span className="rp__row-note">{s.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="rp-pane-photos" className="rp__pane rp__photos" data-active={pane === "photos" ? "" : undefined} aria-label="Photo evidence">
          {photos.map((p) => (
            <figure key={p.caption} className="rp__photo">
              {p.node}
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </section>
      </div>
    </article>
  );
}
