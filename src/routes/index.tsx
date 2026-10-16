import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthGate } from "@/components/academy/auth-gate";
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
  return (
    <AuthGate>
      <Academy />
    </AuthGate>
  );
}
