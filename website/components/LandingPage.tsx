import { PreviewTabs } from "@/components/PreviewTabs";
import {
  cliSplash,
  installCommands,
  optionsList,
  pageCopy,
  usageBlock
} from "@/lib/content";

export function LandingPage() {
  const year = new Date().getFullYear();
  const installCommand = installCommands[1];

  return (
    <div className="workspace">
      <main id="top" className="workspace-main">
        <section className="splash-shell" aria-label="claude-export summary">
          <div className="cli-splash">
            <pre className="cli-art" aria-hidden="true">
              {cliSplash.art.join("\n")}
            </pre>

            <div className="cli-meta">
              <span className="cli-meta-primary">{cliSplash.version}</span>

              <div className="cli-meta-desktop" aria-hidden="true">
                {cliSplash.desktopLines.map((line) => (
                  <span key={line} className="cli-meta-secondary">
                    {line}
                  </span>
                ))}
              </div>

              <ul className="cli-meta-mobile">
                {cliSplash.mobileLines.map((line) => (
                  <li key={line} className="cli-meta-secondary">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="terminal-composer" aria-label="claude-export description">
              <div className="terminal-rule" aria-hidden="true" />

              <div className="terminal-input-row">
                <span className="terminal-prompt" aria-hidden="true">
                  ❯
                </span>
                <p className="terminal-input-text">
                  {pageCopy.description}
                  <span className="terminal-caret" aria-hidden="true" />
                </p>
              </div>

              <div className="terminal-rule" aria-hidden="true" />

              <div className="terminal-status-row">
                <span className="terminal-mode">-- INSERT --</span>
                <span className="terminal-status">◐ medium · /effort</span>
              </div>
            </div>
          </div>
        </section>

        <section className="workspace-rail">
          <section className="rail-panel rail-panel-usage">
            {installCommand ? (
              <div className="rail-install">
                <p className="command-label">Install globally</p>
                <div className="rail-install-row">
                  <pre className="command-block">
                    <code>{installCommand.value}</code>
                  </pre>
                </div>
              </div>
            ) : null}

            <p className="rail-label">Usage</p>
            <pre className="usage-block rail-code">
              <code>{usageBlock}</code>
            </pre>

            <dl className="options-list">
              {optionsList.map((option) => (
                <div key={option.flag}>
                  <dt>
                    <span className="mono">{option.flag}</span>
                  </dt>
                  <dd>{option.description}</dd>
                </div>
              ))}
            </dl>
          </section>
        </section>

        <section className="preview-shell">
          <PreviewTabs />
        </section>
      </main>

      <footer className="footer">
        <p className="footer-line">{pageCopy.footer}</p>
        <p className="footer-meta">
          <span>{year}</span>
          <span className="footer-divider">/</span>
          claude-export
        </p>
        <div className="footer-links">
          <a
            className="footer-link"
            href="https://github.com/MihirSahu/claude-export"
            target="_blank"
            rel="noreferrer"
            aria-label="claude-export on GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className="footer-link-icon"
            >
              <path
                fill="currentColor"
                d="M12 .5C5.649.5.5 5.649.5 12A11.5 11.5 0 0 0 8.36 22.04c.575.106.786-.25.786-.556 0-.274-.01-1-.015-1.963-3.251.707-3.937-1.566-3.937-1.566-.532-1.352-1.3-1.712-1.3-1.712-1.063-.727.08-.712.08-.712 1.175.083 1.793 1.206 1.793 1.206 1.044 1.789 2.739 1.272 3.406.973.106-.756.409-1.272.744-1.564-2.595-.295-5.324-1.297-5.324-5.773 0-1.275.456-2.318 1.204-3.136-.12-.296-.522-1.486.114-3.099 0 0 .983-.315 3.22 1.198A11.207 11.207 0 0 1 12 6.174c.993.004 1.993.134 2.928.395 2.236-1.513 3.218-1.198 3.218-1.198.638 1.613.236 2.803.116 3.099.75.818 1.202 1.861 1.202 3.136 0 4.487-2.733 5.474-5.337 5.763.42.36.794 1.07.794 2.157 0 1.558-.014 2.814-.014 3.197 0 .31.207.668.792.555A11.502 11.502 0 0 0 23.5 12C23.5 5.649 18.351.5 12 .5Z"
              />
            </svg>
          </a>

          <a
            className="footer-link"
            href="https://www.npmjs.com/package/claude-export"
            target="_blank"
            rel="noreferrer"
            aria-label="claude-export on npm"
          >
            <span className="footer-npm-badge" aria-hidden="true">
              npm
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
}
