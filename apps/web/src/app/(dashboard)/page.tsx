import { PremiumShell } from "@components/layout/PremiumShell";

export default function DashboardHomePage() {
  return (
    <PremiumShell
      title="Review your current build context."
      subtitle="Use this workspace to keep your build steps, prompts, and proof in one calm, consistent place."
      step={1}
      totalSteps={4}
      status="Not Started"
      primary={
        <>
          <p>
            This area represents the primary workspace for your current step.
            Use it to capture requirements, structure information, or sketch the
            flow before any implementation begins.
          </p>
          <p>
            The goal is to keep interactions predictable and uncluttered so you
            can focus on the work rather than the interface.
          </p>
        </>
      }
    />
  );
}
