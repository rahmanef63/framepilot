import { redirect } from "next/navigation";

// Template folded into Pustaka — starter presets now live in the /library grid.
// This route is kept only as a redirect so old links / the "Dari template" flow
// land on the merged library.
export default function TemplatePage() {
  redirect("/library");
}
