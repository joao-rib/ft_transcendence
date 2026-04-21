import LegalPageTemplate from "../legal/components/LegalPageTemplate";

const sections = [
  {
    title: "Use of the Service",
    content:
      "By creating an account or using this platform, you agree to use the service responsibly and in compliance with applicable laws.",
  },
  {
    title: "Accounts and Security",
    content:
      "You are responsible for maintaining the confidentiality of your credentials and for activity under your account.",
  },
  {
    title: "Limitation of Liability",
    content:
      "The service is provided on an as-is basis. To the extent allowed by law, we are not liable for indirect or consequential damages.",
  },
];

export default function TermsPage() {
  return (
    <LegalPageTemplate
      title="Terms of Service"
      description="Rules and conditions for using ft_transcendence"
      updatedAt="April 20, 2026"
      sections={sections}
    />
  );
}
