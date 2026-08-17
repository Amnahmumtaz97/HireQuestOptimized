import type { LegalPageContent } from './types'

export const SECURITY_OVERVIEW: LegalPageContent = {
  slug: 'security',
  eyebrow: 'Security',
  title: 'How we protect HireQuest accounts & data',
  summary:
    'A practical overview of account protection, application safeguards, AI data handling, and how we respond when something goes wrong.',
  lastUpdated: 'August 17, 2026',
  chips: ['Auth', 'Encryption', 'AI boundaries', 'Incidents'],
  sealVariant: 'security',
  disclaimer:
    'This page describes HireQuest’s current security practices in plain language. It is not a formal attestation, SOC report, or guarantee. Practices evolve as the product and infrastructure change.',
  sections: [
    {
      id: 'principles',
      title: 'Security principles',
      paragraphs: [
        'HireQuest is built for interview practice — accounts, resumes, and session answers deserve careful handling. We aim for least-privilege access, secure defaults, and clear boundaries around AI processing.',
        'Security is shared: we protect the platform, and you protect your credentials and what you upload.',
      ],
    },
    {
      id: 'account-protection',
      title: 'Account protection',
      bullets: [
        'Passwords are hashed with industry-standard algorithms before storage (never stored in plain text).',
        'Sessions use authenticated cookies/tokens managed by our auth stack (NextAuth).',
        'OAuth options (where enabled) reduce password reuse by relying on Google or GitHub identity providers.',
        'You should use a unique password, enable provider MFA where available, and sign out of shared devices.',
      ],
    },
    {
      id: 'application-safeguards',
      title: 'Application safeguards',
      bullets: [
        'Server routes check authentication before returning interview, profile, or admin data.',
        'Input validation on API payloads reduces malformed or abusive requests.',
        'Rate limits on sensitive endpoints (such as resume parsing) help reduce abuse.',
        'Role-gated admin surfaces are separated from normal learner account access.',
      ],
    },
    {
      id: 'data-in-transit',
      title: 'Data in transit & at rest',
      paragraphs: [
        'Traffic to HireQuest should be served over HTTPS in production so credentials and session data are encrypted in transit.',
        'Application data (accounts, interview sessions, paths) is stored in our database with access limited to application credentials. Browser local storage may hold profile drafts or preferences on your device — clear site data if you use a shared computer.',
      ],
    },
    {
      id: 'ai-boundaries',
      title: 'AI processing boundaries',
      paragraphs: [
        'Interview generation and feedback call third-party AI providers with the context needed for that request (for example, role, topics, resume excerpts, or answers).',
        'Treat AI prompts like you would treat an interviewer: do not paste secrets, employer proprietary systems, or personal data you are not allowed to share. See our Privacy Policy for how AI processing relates to personal data.',
      ],
    },
    {
      id: 'uploads',
      title: 'Resumes & uploads',
      bullets: [
        'Resume uploads are limited to supported formats (PDF/DOCX) and size caps.',
        'Parsed resume fields are used to personalize practice — review auto-filled profile fields before saving.',
        'Remove resume data from your profile when you no longer want it retained in product storage.',
      ],
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure & operations',
      paragraphs: [
        'HireQuest runs on modern cloud hosting. Database and environment secrets are kept out of client bundles and source control.',
        'We monitor for errors and availability issues to keep practice sessions reliable. Exact tooling may change as we scale.',
      ],
    },
    {
      id: 'responsible-disclosure',
      title: 'Responsible disclosure',
      paragraphs: [
        'If you believe you have found a security vulnerability, please report it privately. Do not publicly disclose issues before we have a chance to investigate and remediate.',
        'Email security@hirequest.app (placeholder — replace with your operational contact before production launch) with steps to reproduce and impact. We will acknowledge reports and prioritize based on severity.',
      ],
    },
    {
      id: 'your-role',
      title: 'Your role in security',
      bullets: [
        'Keep your email and password confidential; do not share accounts.',
        'Review connected OAuth apps and revoke access you no longer need.',
        'Be careful with public or shared machines — sign out after sessions.',
        'Upload only resumes and content you are authorized to use.',
      ],
    },
    {
      id: 'incident-response',
      title: 'Incidents & notices',
      paragraphs: [
        'If we become aware of a security incident that affects personal data, we will investigate, contain impact, and notify affected users and regulators where required by law.',
        'Status updates for major outages may appear on product channels or email when available.',
      ],
    },
    {
      id: 'related',
      title: 'Related policies',
      paragraphs: [
        'Privacy Policy covers collection and use of personal data. Terms of Use cover acceptable use and AI output disclaimers. This Security page focuses on how we protect the product itself.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'Security questions or vulnerability reports: security@hirequest.app (placeholder). For privacy requests, see the Privacy Policy contact section.',
      ],
    },
  ],
}
