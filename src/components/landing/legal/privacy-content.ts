import type { LegalPageContent } from './types'

export const PRIVACY_POLICY: LegalPageContent = {
  slug: 'privacy',
  eyebrow: 'Privacy Policy',
  title: 'How HireQuest handles your data',
  summary:
    'This policy explains what we collect when you practice interviews, upload a resume, or manage your account — and the choices you have.',
  lastUpdated: 'August 17, 2026',
  chips: ['Accounts', 'Resumes', 'AI sessions', 'Your controls'],
  sealVariant: 'privacy',
  disclaimer:
    'This Privacy Policy is provided for transparency about how HireQuest works today. It is not legal advice. If you need counsel for your jurisdiction or business, consult a qualified attorney.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      paragraphs: [
        'HireQuest (“we”, “us”) provides AI-powered interview preparation. We collect only what we need to run the service, improve your practice experience, and keep accounts secure.',
        'By using HireQuest, you agree to this policy. If you do not agree, please do not use the platform.',
      ],
    },
    {
      id: 'information-we-collect',
      title: 'Information we collect',
      bullets: [
        'Account details such as name, email address, and authentication identifiers when you sign up or sign in.',
        'Profile information you choose to provide, including headline, experience, skills, links, and profile photo.',
        'Resume files and parsed resume fields when you upload a CV (PDF or DOCX).',
        'Interview configuration choices such as role, topics, difficulty, and session settings.',
        'Interview responses, scores, feedback, and session metadata generated during practice.',
        'Usage data such as pages visited, feature interactions, and basic device/browser information.',
        'Support messages or feedback you send us directly.',
      ],
    },
    {
      id: 'accounts-profiles',
      title: 'Accounts & profiles',
      paragraphs: [
        'Your account lets you save progress, return to past sessions, and personalize interview generation. Profile fields help tailor question difficulty and context.',
        'Some profile preferences may be stored locally in your browser (for example, draft profile data) in addition to server-side account storage where applicable.',
      ],
    },
    {
      id: 'resumes-interviews',
      title: 'Resumes & interview data',
      paragraphs: [
        'When you upload a resume, we parse it to suggest skills, experience level, education, and links. Parsed content may be used to pre-fill profile fields and tailor generated interviews.',
        'During sessions, your answers, code submissions, and AI-generated feedback are stored so you can review results and track improvement over time.',
      ],
    },
    {
      id: 'ai-processing',
      title: 'AI processing',
      paragraphs: [
        'HireQuest uses third-party AI providers to generate interview questions, evaluate responses, and produce feedback. Relevant session or resume context may be sent to those providers solely to deliver the feature you requested.',
        'Do not submit confidential, proprietary, or sensitive information you are not allowed to share. Practice content should be suitable for an interview-prep environment.',
      ],
    },
    {
      id: 'cookies-storage',
      title: 'Cookies & local storage',
      bullets: [
        'Authentication cookies/session tokens to keep you signed in.',
        'Theme and UI preferences.',
        'Local profile or draft data stored in your browser when you edit your profile.',
        'Analytics or reliability signals that help us understand product usage (where enabled).',
      ],
    },
    {
      id: 'sharing',
      title: 'How we share information',
      paragraphs: [
        'We do not sell your personal information. We share data only with service providers that help us operate HireQuest (hosting, authentication, AI inference, email delivery) under appropriate confidentiality and security obligations.',
        'We may disclose information if required by law, to protect rights and safety, or in connection with a merger, acquisition, or asset sale with notice where permitted.',
      ],
    },
    {
      id: 'retention',
      title: 'Data retention',
      paragraphs: [
        'We retain account and session data while your account is active and for a reasonable period afterward so you can access history and results.',
        'You may request deletion of your account or specific data where applicable features are available, subject to legal or operational retention needs.',
      ],
    },
    {
      id: 'security',
      title: 'Security',
      paragraphs: [
        'We use administrative, technical, and organizational measures designed to protect data against unauthorized access, loss, or misuse. No method of transmission or storage is completely secure.',
        'For more detail on platform safeguards, see our Security page.',
      ],
    },
    {
      id: 'your-choices',
      title: 'Your choices',
      bullets: [
        'Update profile fields and links in your account settings.',
        'Remove uploaded resume data from your profile where supported.',
        'Sign out of devices you no longer use.',
        'Contact us to ask about access, correction, or deletion requests.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      paragraphs: [
        'HireQuest is not directed to children under 13 (or the minimum age required in your country). We do not knowingly collect personal information from children.',
      ],
    },
    {
      id: 'international',
      title: 'International users',
      paragraphs: [
        'If you access HireQuest from outside the country where our infrastructure is located, your information may be processed in other jurisdictions with different data-protection laws.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'Questions about this policy or your data? Email privacy@hirequest.app (placeholder — replace with your operational contact before production launch).',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. We will revise the “Last updated” date at the top of this page. Continued use after changes means you accept the updated policy.',
      ],
    },
  ],
}
