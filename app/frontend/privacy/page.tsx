import LegalPageTemplate from "../legal/components/LegalPageTemplate";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect account information such as username, email address, and authentication data required to create and secure your account.",
  },
  {
    title: "How We Use Information",
    content:
      "Your information is used to provide gameplay features, account access, and service reliability. We do not sell personal data.",
  },
  {
    title: "Data Security and Retention",
    content:
      "We apply reasonable technical safeguards and retain data only for as long as necessary to operate the service and comply with legal obligations.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      description="How we collect, use, and protect your data in ft_transcendence"
      updatedAt="April 20, 2026"
      sections={sections}
    />
  );
}
