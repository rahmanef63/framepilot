import { LocaleLanding } from "@/components/landing/LocaleLanding";
import { landingMetadata } from "@/components/landing/meta";

export const metadata = landingMetadata("ar");

export default function Page() {
  return <LocaleLanding locale="ar" />;
}
