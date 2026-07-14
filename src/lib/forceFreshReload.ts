/**
 * Hard cache-bust reload — the "Muat ulang versi" button in the editor ⋯ menu.
 *
 * A plain location.reload() can hand back the SAME stale bundle from the SW /
 * HTTP cache after a Dokploy deploy, leaving the user on old JS. This unregisters
 * every service worker, drops every named Cache Storage entry, then reloads with a
 * `_v=` query so any CDN/proxy revalidates too. Each async step is timeout-raced so
 * a hung Cache Storage call (rare on iOS) still reaches the reload within ~3s.
 *
 * Ported from CareerPack shared/lib/staleBundle.ts (auto-detection dropped — this
 * is a manual button, so no polling / loop-guard needed).
 */

function withTimeout(p: Promise<unknown>, ms: number): Promise<void> {
  return Promise.race([
    p.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]);
}

export async function forceFreshReload(): Promise<void> {
  const swWork = (async () => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    }
  })();
  await withTimeout(swWork, 1500);

  const cacheWork = (async () => {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
  })();
  await withTimeout(cacheWork, 1500);

  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("_v", Date.now().toString(36));
    window.location.replace(url.toString());
  }
}
