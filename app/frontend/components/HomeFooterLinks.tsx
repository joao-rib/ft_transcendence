export default function HomeFooterLinks() {
	return (
		<div className="flex justify-center items-center gap-6 text-sm pt-4">
			<a
				href="/frontend/rules"
				className="transition-colors"
				style={{ color: "var(--text-accent)" }}
			>
				Rules
			</a>
			<span style={{ color: "var(--text-muted)" }}>•</span>
			<a href="#privacy" className="transition-colors" style={{ color: "var(--text-accent)" }}>
				Privacy
			</a>
			<span style={{ color: "var(--text-muted)" }}>•</span>
			<a href="#support" className="transition-colors" style={{ color: "var(--text-accent)" }}>
				Support
			</a>
		</div>
	);
}
