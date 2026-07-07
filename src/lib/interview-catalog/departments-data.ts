import type { DepartmentConfig, SpecializationConfig } from '@/lib/interview-catalog/types'
import { buildComputerScienceDepartmentFromLegacy } from '@/lib/interview-catalog/legacy-cs'

const B = ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Stakeholder Management']

function spec(
  key: string,
  label: string,
  technicalTopics: string[],
  behavioralTopics: string[] = B,
  technicalQuestionRatio = 70,
): SpecializationConfig {
  return {
    key,
    label,
    technicalTopics,
    behavioralTopics,
    technicalQuestionRatio,
    durationEnabled: true,
    durations: [20, 30, 45, 60],
  }
}

const OTHER_DEPARTMENTS: DepartmentConfig[] = [
  {
    key: 'software_engineering',
    label: 'Software Engineering',
    specializations: [
      spec('backend', 'Backend Engineering', ['APIs', 'Microservices', 'System Design', 'Databases', 'Caching']),
      spec('frontend', 'Frontend Engineering', ['React', 'TypeScript', 'CSS', 'Performance', 'Accessibility']),
      spec('full_stack', 'Full Stack', ['APIs', 'React', 'Databases', 'Auth', 'Deployment']),
      spec('devops', 'DevOps', ['CI/CD', 'Docker', 'Kubernetes', 'Monitoring', 'Infrastructure as Code']),
    ],
  },
  {
    key: 'information_technology',
    label: 'Information Technology',
    specializations: [
      spec('it_support', 'IT Support', ['Troubleshooting', 'Networking', 'Active Directory', 'Ticketing']),
      spec('systems_admin', 'Systems Administration', ['Linux', 'Windows Server', 'Virtualization', 'Backups']),
      spec('it_security', 'IT Security', ['Access Control', 'Incident Response', 'SIEM', 'Endpoint Security']),
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    specializations: [
      spec('corporate_finance', 'Corporate Finance', ['Budgeting', 'Forecasting', 'Working Capital', 'Capital Structure']),
      spec('investment_banking', 'Investment Banking', [
        'Valuation',
        'Mergers & Acquisitions',
        'Financial Statements',
        'Capital Markets',
        'DCF',
        'Equity Research',
      ]),
      spec('financial_analysis', 'Financial Analysis', ['Ratio Analysis', 'Variance Analysis', 'Modeling', 'Reporting']),
      spec('risk_management', 'Risk Management', ['Market Risk', 'Credit Risk', 'VaR', 'Stress Testing']),
      spec('taxation', 'Taxation', ['Corporate Tax', 'Tax Planning', 'Compliance', 'International Tax']),
      spec('auditing', 'Auditing', ['Internal Controls', 'Audit Procedures', 'IFRS', 'GAAP']),
      spec('financial_modeling', 'Financial Modeling', ['DCF', 'LBO', 'Three-Statement Models', 'Sensitivity Analysis']),
    ],
  },
  {
    key: 'accounting',
    label: 'Accounting',
    specializations: [
      spec('financial_accounting', 'Financial Accounting', ['Journal Entries', 'Ledgers', 'IFRS', 'GAAP']),
      spec('management_accounting', 'Management Accounting', ['Costing', 'Budgeting', 'Variance Analysis']),
      spec('tax_accounting', 'Tax Accounting', ['Tax Returns', 'Deferred Tax', 'Compliance']),
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    specializations: [
      spec('digital_marketing', 'Digital Marketing', [
        'SEO',
        'Google Ads',
        'Meta Ads',
        'Email Marketing',
        'Analytics',
        'Content Strategy',
      ]),
      spec('seo', 'SEO', ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Link Building']),
      spec('sem', 'SEM', ['Google Ads', 'Campaign Structure', 'Bidding', 'Quality Score']),
      spec('branding', 'Branding', ['Brand Strategy', 'Positioning', 'Messaging', 'Identity']),
      spec('social_media', 'Social Media Marketing', ['Content Calendar', 'Community Management', 'Paid Social']),
      spec('content_marketing', 'Content Marketing', ['Content Strategy', 'Copywriting', 'Editorial Planning']),
      spec('product_marketing', 'Product Marketing', ['Go-to-Market', 'Positioning', 'Launch Plans', 'Competitive Analysis']),
    ],
  },
  {
    key: 'human_resources',
    label: 'Human Resources',
    specializations: [
      spec('recruitment', 'Recruitment', ['Sourcing', 'Interviewing', 'Employer Branding', 'ATS']),
      spec('employee_relations', 'Employee Relations', ['Conflict Resolution', 'Policy', 'Engagement']),
      spec('payroll', 'Payroll', ['Payroll Processing', 'Benefits', 'Compliance', 'Tax Withholding']),
      spec('performance_management', 'Performance Management', ['OKRs', 'Reviews', 'Feedback', 'PIP']),
      spec('organizational_behavior', 'Organizational Behavior', ['Culture', 'Change Management', 'Motivation']),
    ],
  },
  {
    key: 'business_administration',
    label: 'Business Administration',
    specializations: [
      spec('operations', 'Operations', ['Process Improvement', 'KPIs', 'Supply Chain Basics']),
      spec('strategy', 'Strategy', ['Market Analysis', 'Competitive Strategy', 'Business Models']),
      spec('project_management', 'Project Management', ['Agile', 'Scrum', 'Risk', 'Stakeholders']),
    ],
  },
  {
    key: 'economics',
    label: 'Economics',
    specializations: [
      spec('microeconomics', 'Microeconomics', ['Supply & Demand', 'Elasticity', 'Market Structures']),
      spec('macroeconomics', 'Macroeconomics', ['GDP', 'Inflation', 'Monetary Policy', 'Fiscal Policy']),
      spec('econometrics', 'Econometrics', ['Regression', 'Hypothesis Testing', 'Time Series']),
    ],
  },
  {
    key: 'electrical_engineering',
    label: 'Electrical Engineering',
    specializations: [
      spec('power_systems', 'Power Systems', ['Transformers', 'Grid Stability', 'Protection Systems']),
      spec('electronics', 'Electronics', ['Analog Circuits', 'Digital Logic', 'Semiconductors']),
      spec('embedded_systems', 'Embedded Systems', ['Microcontrollers', 'RTOS', 'Firmware', 'Peripherals']),
      spec('control_systems', 'Control Systems', ['PID', 'State Space', 'Stability', 'Feedback']),
      spec('signal_processing', 'Signal Processing', ['Fourier Analysis', 'Filters', 'DSP', 'Sampling']),
    ],
  },
  {
    key: 'mechanical_engineering',
    label: 'Mechanical Engineering',
    specializations: [
      spec('thermodynamics', 'Thermodynamics', ['Heat Transfer', 'Energy Systems', 'Cycles']),
      spec('fluid_mechanics', 'Fluid Mechanics', ['Bernoulli', 'Turbulence', 'Pumps']),
      spec('machine_design', 'Machine Design', ['Stress Analysis', 'Materials', 'CAD Basics']),
    ],
  },
  {
    key: 'civil_engineering',
    label: 'Civil Engineering',
    specializations: [
      spec('structural', 'Structural Engineering', ['Loads', 'Concrete', 'Steel Design']),
      spec('geotechnical', 'Geotechnical', ['Soil Mechanics', 'Foundations', 'Slope Stability']),
      spec('transportation', 'Transportation', ['Traffic Engineering', 'Highway Design', 'Planning']),
    ],
  },
  {
    key: 'data_science',
    label: 'Data Science',
    specializations: [
      spec('analytics', 'Analytics', ['SQL', 'Dashboards', 'A/B Testing', 'Metrics']),
      spec('machine_learning', 'Machine Learning', ['Supervised Learning', 'Feature Engineering', 'Model Evaluation']),
      spec('data_engineering', 'Data Engineering', ['ETL', 'Pipelines', 'Warehousing', 'Spark']),
    ],
  },
  {
    key: 'artificial_intelligence',
    label: 'Artificial Intelligence',
    specializations: [
      spec('machine_learning', 'Machine Learning', ['Regression', 'Classification', 'Ensembles', 'Validation']),
      spec('deep_learning', 'Deep Learning', ['Neural Networks', 'CNNs', 'RNNs', 'Transformers']),
      spec('nlp', 'NLP', ['Tokenization', 'Embeddings', 'LLMs', 'Text Classification']),
    ],
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    specializations: [
      spec('clinical', 'Clinical Knowledge', ['Patient Care', 'Diagnosis Basics', 'Medical Ethics']),
      spec('health_admin', 'Healthcare Administration', ['HIPAA', 'Operations', 'Quality Improvement']),
      spec('public_health', 'Public Health', ['Epidemiology', 'Health Policy', 'Prevention']),
    ],
  },
  {
    key: 'law',
    label: 'Law',
    specializations: [
      spec('corporate_law', 'Corporate Law', ['Contracts', 'M&A', 'Compliance', 'Governance']),
      spec('criminal_law', 'Criminal Law', ['Elements of Crime', 'Procedure', 'Evidence']),
      spec('intellectual_property', 'Intellectual Property', ['Patents', 'Trademarks', 'Copyright']),
    ],
  },
  {
    key: 'psychology',
    label: 'Psychology',
    specializations: [
      spec('clinical_psych', 'Clinical Psychology', ['Assessment', 'Therapeutic Approaches', 'Ethics']),
      spec('organizational_psych', 'Organizational Psychology', ['Motivation', 'Teams', 'Leadership']),
      spec('cognitive_psych', 'Cognitive Psychology', ['Memory', 'Attention', 'Decision Making']),
    ],
  },
  {
    key: 'education',
    label: 'Education',
    specializations: [
      spec('pedagogy', 'Pedagogy', ['Lesson Planning', 'Assessment', 'Classroom Management']),
      spec('curriculum', 'Curriculum Design', ['Learning Objectives', 'Standards', 'Differentiation']),
      spec('edtech', 'Educational Technology', ['LMS', 'Digital Tools', 'Accessibility']),
    ],
  },
]

export const INTERVIEW_CATALOG_DEPARTMENTS: DepartmentConfig[] = [
  buildComputerScienceDepartmentFromLegacy(),
  ...OTHER_DEPARTMENTS,
]
