import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Academy } from "@/components/academy/shell";
import { useAcademy } from "@/lib/academy/store";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const hydrate = useAcademy((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <Academy />;
}
