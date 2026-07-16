/**
 * docs-content — SSOT for the /docs pages. Pure data (LOC-exempt); page.tsx maps
 * it into a TOC + sections. Refreshed from the retired public landing copy.
 *
 * String fields (title/lead/text/items/label/step t+d) hold i18n KEYS (docs.*)
 * resolved with t() at the render site in page.tsx — NOT display text. `id`/`href`/`n`
 * stay literal (section anchors, routes, step numbers).
 */

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "steps"; items: { n: string; t: string; d: string }[] }
  | { type: "list"; items: string[] }
  | { type: "cta"; label: string; href: string };

export type DocSection = { id: string; title: string; lead: string; blocks: DocBlock[] };

export const DOCS: DocSection[] = [
  {
    id: "kenalan",
    title: "docs.introTitle",
    lead: "docs.introLead",
    blocks: [
      { type: "p", text: "docs.introP1" },
      { type: "p", text: "docs.introP2" },
      { type: "cta", label: "docs.introCtaStudio", href: "/" },
    ],
  },
  {
    id: "mulai",
    title: "docs.quickstartTitle",
    lead: "docs.quickstartLead",
    blocks: [
      {
        type: "steps",
        items: [
          { n: "01", t: "docs.step1Title", d: "docs.step1Desc" },
          { n: "02", t: "docs.step2Title", d: "docs.step2Desc" },
          { n: "03", t: "docs.step3Title", d: "docs.step3Desc" },
        ],
      },
    ],
  },
  {
    id: "prompt",
    title: "docs.promptTitle",
    lead: "docs.promptLead",
    blocks: [
      { type: "p", text: "docs.promptP1" },
      { type: "p", text: "docs.promptP2" },
    ],
  },
  {
    id: "platform",
    title: "docs.platformTitle",
    lead: "docs.platformLead",
    blocks: [
      {
        type: "list",
        items: [
          "docs.platformRunway",
          "docs.platformKling",
          "docs.platformVeo",
          "docs.platformLuma",
          "docs.platformHailuo",
          "docs.platformPika",
          "docs.platformHiggsfield",
          "docs.platformWan",
          "docs.platformSeedance",
          "docs.platformLtx",
        ],
      },
      { type: "p", text: "docs.platformCameraTag" },
      { type: "p", text: "legal.trademarks" },
    ],
  },
  {
    id: "impor",
    title: "docs.importTitle",
    lead: "docs.importLead",
    blocks: [
      { type: "p", text: "docs.importP1" },
      { type: "p", text: "docs.importP2" },
      { type: "cta", label: "docs.importCtaLibrary", href: "/library" },
    ],
  },
];
