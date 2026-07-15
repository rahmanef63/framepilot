"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ds/Button";
import { useT } from "@/i18n";
import { DOCS, type DocBlock } from "./docs-content";

// TOC (left, sticky) + content (right). Scroll-spy highlights the active section
// via IntersectionObserver; TOC click smooth-scrolls to it.
export default function DocsPage() {
  const { t } = useT();
  const [active, setActive] = useState(DOCS[0].id);

  useEffect(() => {
    // active = the last section whose top has passed a threshold; clamp to the
    // last section at page bottom so the first AND last TOC items can be active.
    const onScroll = () => {
      const de = document.documentElement;
      if (window.innerHeight + window.scrollY >= de.scrollHeight - 4) {
        setActive(DOCS[DOCS.length - 1].id);
        return;
      }
      let cur = DOCS[0].id;
      for (const s of DOCS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 130) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="docs-wrap">
      <nav className="docs-toc" aria-label={t("docs.tocAria")}>
        <div className="docs-toc-h">{t("docs.tocHeading")}</div>
        {DOCS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={"docs-toc-a" + (active === s.id ? " active" : "")}
          >
            {t(s.title)}
          </a>
        ))}
      </nav>

      <div className="docs-body">
        {DOCS.map((s) => (
          <section key={s.id} id={s.id} className="docs-section">
            <h2 className="docs-h2">{t(s.title)}</h2>
            <p className="docs-lead">{t(s.lead)}</p>
            {s.blocks.map((b, i) => (
              <Block key={i} b={b} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function Block({ b }: { b: DocBlock }) {
  const { t } = useT();
  if (b.type === "p") return <p className="docs-p">{t(b.text)}</p>;
  if (b.type === "list")
    return (
      <ul className="docs-list">
        {b.items.map((it, i) => (
          <li key={i}>{t(it)}</li>
        ))}
      </ul>
    );
  if (b.type === "steps")
    return (
      <div className="docs-steps">
        {b.items.map((it) => (
          <div key={it.n} className="docs-step">
            <span className="docs-step-n">{it.n}</span>
            <div>
              <div className="docs-step-t">{t(it.t)}</div>
              <div className="docs-step-d">{t(it.d)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  // cta
  return (
    <Link href={b.href} style={{ textDecoration: "none", alignSelf: "flex-start" }}>
      <Button variant="primary" size="md">
        {t(b.label)}
      </Button>
    </Link>
  );
}
