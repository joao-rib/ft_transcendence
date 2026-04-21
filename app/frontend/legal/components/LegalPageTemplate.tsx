import Background from "../../components/Background";
import LegalBackLink from "./LegalBackLink";

type LegalSection = {
  title: string;
  content: string;
};

interface LegalPageTemplateProps {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}

export default function LegalPageTemplate({
  title,
  description,
  updatedAt,
  sections,
}: LegalPageTemplateProps) {
  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <Background />
      <LegalBackLink />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-20">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-3">
            <p className="text-sm" style={{ color: "var(--text-accent)" }}>
              Legal
            </p>
            <h1
              className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--gradient-start), var(--gradient-mid), var(--gradient-end))",
              }}
            >
              {title}
            </h1>
            <p className="text-lg" style={{ color: "var(--text-accent)" }}>
              {description}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Last updated: {updatedAt}
            </p>
          </header>

          {sections.map((section) => (
            <section
              key={section.title}
              className="space-y-4 rounded-2xl border p-6 backdrop-blur-xl"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--overlay-light)",
              }}
            >
              <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {section.title}
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>{section.content}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
