export default function HomeFooterLinks() {
  return (
    <div className="flex items-center justify-center gap-6 pt-4 text-sm">
      <a href="/frontend/rules" className="transition-colors" style={{ color: "var(--text-accent)" }}>
        Rules
      </a>
      <span style={{ color: "var(--text-muted)" }}>•</span>
      <a href="/privacy" className="transition-colors" style={{ color: "var(--text-accent)" }}>
        Privacy Policy
      </a>
      <span style={{ color: "var(--text-muted)" }}>•</span>
      <a href="/support" className="transition-colors" style={{ color: "var(--text-accent)" }}>
        Terms of Service
      </a>
    </div>
  );
}
