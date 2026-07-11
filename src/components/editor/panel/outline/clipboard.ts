// concept copyText/fallbackCopy (~2365) — clipboard with a legacy execCommand path.
export function copyText(txt: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(() => fallbackCopy(txt));
  } else fallbackCopy(txt);
}

function fallbackCopy(txt: string) {
  const ta = document.createElement("textarea");
  ta.value = txt;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}
