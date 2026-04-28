import Link from "next/link";

export default function HomeFooterLinks() {
	return (
		<div className="flex justify-center items-center gap-6 text-sm pt-4">
			<Link href="/rules" className="transition-colors" style={{ color: "var(--text-accent)" }}>
				Rules
			</Link>
			<span style={{ color: "var(--text-muted)" }}>•</span>
			<Link href="/privacy" className="transition-colors" style={{ color: "var(--text-accent)" }}>
				Privacy Policy
			</Link>
			<span style={{ color: "var(--text-muted)" }}>•</span>
			<Link href="/terms" className="transition-colors" style={{ color: "var(--text-accent)" }}>
				Terms of Service
			</Link>
		</div>
	);
}
