import ThemeToggle from "./ThemeToggle";

const SOCIAL_SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div className="brand">
            <img src="/assets/img/logo-light.png" alt="The Ntuli Foundation" />
            <p>A South African cultural institution grounded in the life, work, and philosophy of Prof Pitika Ntuli.</p>
            <div className="social">
              <a href="https://x.com/ntulifdn" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on X">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/ntuli_foundation" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on Instagram">
                <svg {...SOCIAL_SVG_PROPS}>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@ntulifoundation" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on YouTube">
                <svg {...SOCIAL_SVG_PROPS}>
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <div className="k">Contact</div>
            <ul>
              <li><a href="mailto:info@ntulifoundation.org">info@ntulifoundation.org</a></li>
              <li><a href="tel:+27834593423">+27 83 459 3423</a></li>
            </ul>
          </div>
          <div>
            <div className="k">Visit</div>
            <ul>
              <li>146 10th Road, Kew</li>
              <li>Johannesburg, South Africa</li>
            </ul>
          </div>
          <div>
            <div className="k">Newsletter</div>
            <ul><li>Letters from the threshold</li></ul>
            <a className="subscribe" href="mailto:info@ntulifoundation.org?subject=Subscribe">
              Subscribe <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 The Ntuli Foundation. All rights reserved.</span>
          <div className="bottom-right">
            <span className="motto">I am because we are.</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
