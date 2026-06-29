import VariantShell from "../_components/VariantShell";
import MundialBanner from "../_components/MundialBanner";

export const metadata = { title: "Lab · Mundial · Countdown" };

export default function Page() {
  return (
    <>
      <MundialBanner />
      <VariantShell
        name="Banner countdown"
        desc="Franja celeste/blanca sticky con countdown vivo al próximo partido."
      />
    </>
  );
}
