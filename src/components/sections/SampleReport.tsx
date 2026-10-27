import { report } from "@/content/site";
import { sampleReport } from "@/content/report";
import { SmartImage } from "@/components/ui/SmartImage";
import { ReportInteractive } from "./ReportInteractive";

export function SampleReport() {
  const photos = sampleReport.photos.map((p) => ({
    caption: p.caption,
    node: <SmartImage slot={p.slot} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw" imgClassName="rp__photo-img" />,
  }));
  return (
    <section id="report" className="section section--paper rp-section" data-theme="light" data-sc-act="report" aria-labelledby="report-title">
      <div className="container-x">
        <header className="section-head" data-reveal>
          <h2 id="report-title" className="t-h2">
            {report.title}
          </h2>
          <p className="t-lead">{report.sub}</p>
        </header>
        <ReportInteractive photos={photos} />
        <div className="rp__cta">
          <button type="button" className="btn btn--primary btn--lg" data-book="">
            Book an inspection
          </button>
        </div>
      </div>
    </section>
  );
}
