import type { ReactNode } from "react";

type ShellStatus = "Not Started" | "In Progress" | "Shipped";

interface PremiumShellProps {
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  status: ShellStatus;
  primary: ReactNode;
}

export function PremiumShell(props: PremiumShellProps) {
  const { title, subtitle, step, totalSteps, status, primary } = props;

  const statusClassName =
    status === "In Progress"
      ? "kn-status-badge kn-status-badge--in-progress"
      : status === "Shipped"
      ? "kn-status-badge kn-status-badge--shipped"
      : "kn-status-badge";

  return (
    <div className="kn-shell">
      <header className="kn-shell__topbar">
        <div className="kn-shell__topbar-left">KodNest Premium Build System</div>
        <div className="kn-shell__topbar-center">
          Step {step} / {totalSteps}
        </div>
        <div className="kn-shell__topbar-right">
          <span className={statusClassName}>{status}</span>
        </div>
      </header>

      <section className="kn-shell__header">
        <h1 className="kn-shell__headline">{title}</h1>
        <p className="kn-shell__subtext">{subtitle}</p>
      </section>

      <section className="kn-shell__body">
        <div className="kn-shell__primary">
          <div className="kn-card">
            <h2 className="kn-card__title">Primary workspace</h2>
            <div className="kn-card__body">{primary}</div>
          </div>
        </div>

        <aside className="kn-shell__secondary">
          <div className="kn-card">
            <div className="kn-secondary-section">
              <h3 className="kn-secondary-section__title">Step context</h3>
              <p className="kn-secondary-section__text">
                Keep this step focused and well-documented. Use the prompt box
                to capture the instructions you will reuse while you build.
              </p>
            </div>

            <label className="kn-secondary-section__title" htmlFor="kn-prompt">
              Reusable prompt
            </label>
            <textarea
              id="kn-prompt"
              className="kn-prompt-box"
              placeholder="Describe what should be built, in calm and precise language."
            />

            <div className="kn-secondary-actions" aria-label="Prompt actions">
              <button type="button" className="kn-button kn-button--primary">
                Copy
              </button>
              <button type="button" className="kn-button kn-button--secondary">
                Build in Lovable
              </button>
              <button type="button" className="kn-button kn-button--secondary">
                It Worked
              </button>
              <button type="button" className="kn-button kn-button--secondary">
                Error
              </button>
              <button type="button" className="kn-button kn-button--secondary">
                Add Screenshot
              </button>
            </div>
          </div>
        </aside>
      </section>

      <footer className="kn-shell__footer">
        <div className="kn-proof-footer">
          <div className="kn-proof-footer__row">
            <div className="kn-proof-item">
              <label className="kn-proof-item__label">
                <input type="checkbox" /> UI Built
              </label>
              <input
                className="kn-proof-item__input"
                placeholder="Link or note confirming the UI is complete."
              />
            </div>

            <div className="kn-proof-item">
              <label className="kn-proof-item__label">
                <input type="checkbox" /> Logic Working
              </label>
              <input
                className="kn-proof-item__input"
                placeholder="Describe or link to where core logic is verified."
              />
            </div>

            <div className="kn-proof-item">
              <label className="kn-proof-item__label">
                <input type="checkbox" /> Test Passed
              </label>
              <input
                className="kn-proof-item__input"
                placeholder="Reference test runs or checks for this step."
              />
            </div>

            <div className="kn-proof-item">
              <label className="kn-proof-item__label">
                <input type="checkbox" /> Deployed
              </label>
              <input
                className="kn-proof-item__input"
                placeholder="Environment, URL, or note confirming deployment."
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

