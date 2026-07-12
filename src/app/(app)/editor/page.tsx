import { redirect } from "next/navigation";

// Studio moved to `/` (the app home). Keep `/editor` working for old links.
export default function EditorRedirect() {
  redirect("/");
}
