/**
 * Lucide React Icon Mapping Utility
 * Maps industry/category keys to Lucide React icons with metadata
 */

import {
  Code2, Braces, Terminal,
  Globe, Monitor, Layout,
  Smartphone, AppWindow,
  Brain, Sparkles, Bot,
  Cpu, Network, Binary,
  Database, BarChart3, PieChart,
  Shield, Lock, Fingerprint,
  Cloud, Server,
  GitBranch, Workflow, ServerCog,
  PenTool, Palette,
  Gamepad2,
  Blocks, Link,
  Router, Wifi,
  Microchip,
  Calculator, Landmark, Megaphone, Users, GraduationCap,
  Gavel, HeartPulse, Scale, TrendingUp, FileSpreadsheet,
  Search, LineChart, Receipt, BriefcaseBusiness, Building2,
  Factory, HardHat, Wrench, Activity, ClipboardList, BookOpen,
  BrainCircuit, Languages, NotebookPen,
  Briefcase,
  LucideIcon,
} from 'lucide-react'

// Placeholder for CheckCircle2Variant since it's not a direct export
// We'll use Sparkles as a substitute for QA/Testing icons
const CheckCircle2Variant = Sparkles

export interface IconConfig {
  icon: LucideIcon
  label: string
  gradient: string
  accentColor: string
}

/**
 * Industry-level icon mappings
 * Maps industryKey to primary icon and styling
 */
export const INDUSTRY_ICONS: Record<string, IconConfig> = {
  computer_science: {
    icon: Terminal,
    label: 'Computer Science',
    gradient: 'from-blue-900 to-blue-700',
    accentColor: 'text-blue-300',
  },
  software_engineering: {
    icon: Code2,
    label: 'Software Engineering',
    gradient: 'from-indigo-800 to-blue-600',
    accentColor: 'text-indigo-300',
  },
  information_technology: {
    icon: Monitor,
    label: 'Information Technology',
    gradient: 'from-cyan-800 to-sky-600',
    accentColor: 'text-cyan-300',
  },
  finance: {
    icon: Landmark,
    label: 'Finance',
    gradient: 'from-emerald-800 to-teal-600',
    accentColor: 'text-emerald-300',
  },
  accounting: {
    icon: Calculator,
    label: 'Accounting',
    gradient: 'from-green-800 to-emerald-600',
    accentColor: 'text-green-300',
  },
  marketing: {
    icon: Megaphone,
    label: 'Marketing',
    gradient: 'from-pink-800 to-rose-600',
    accentColor: 'text-pink-300',
  },
  human_resources: {
    icon: Users,
    label: 'Human Resources',
    gradient: 'from-violet-800 to-purple-600',
    accentColor: 'text-violet-300',
  },
  business_administration: {
    icon: Building2,
    label: 'Business Administration',
    gradient: 'from-amber-800 to-orange-600',
    accentColor: 'text-amber-300',
  },
  economics: {
    icon: TrendingUp,
    label: 'Economics',
    gradient: 'from-yellow-800 to-amber-600',
    accentColor: 'text-yellow-300',
  },
  electrical_engineering: {
    icon: Cpu,
    label: 'Electrical Engineering',
    gradient: 'from-sky-800 to-blue-600',
    accentColor: 'text-sky-300',
  },
  mechanical_engineering: {
    icon: Factory,
    label: 'Mechanical Engineering',
    gradient: 'from-slate-800 to-slate-600',
    accentColor: 'text-slate-300',
  },
  civil_engineering: {
    icon: HardHat,
    label: 'Civil Engineering',
    gradient: 'from-orange-800 to-yellow-600',
    accentColor: 'text-orange-300',
  },
  data_science: {
    icon: BarChart3,
    label: 'Data Science',
    gradient: 'from-sky-800 to-cyan-600',
    accentColor: 'text-sky-300',
  },
  artificial_intelligence: {
    icon: BrainCircuit,
    label: 'Artificial Intelligence',
    gradient: 'from-fuchsia-800 to-violet-600',
    accentColor: 'text-fuchsia-300',
  },
  healthcare: {
    icon: HeartPulse,
    label: 'Healthcare',
    gradient: 'from-red-800 to-pink-600',
    accentColor: 'text-rose-300',
  },
  law: {
    icon: Scale,
    label: 'Law',
    gradient: 'from-stone-800 to-amber-700',
    accentColor: 'text-stone-300',
  },
  psychology: {
    icon: Brain,
    label: 'Psychology',
    gradient: 'from-purple-800 to-fuchsia-600',
    accentColor: 'text-purple-300',
  },
  education: {
    icon: GraduationCap,
    label: 'Education',
    gradient: 'from-blue-800 to-indigo-600',
    accentColor: 'text-blue-300',
  },
  software_it: {
    icon: Code2,
    label: 'Software / IT',
    gradient: 'from-blue-800 to-blue-600',
    accentColor: 'text-blue-300',
  },
  data_ai: {
    icon: Brain,
    label: 'Data / AI',
    gradient: 'from-sky-800 to-sky-600',
    accentColor: 'text-sky-300',
  },
  product: {
    icon: Briefcase,
    label: 'Product',
    gradient: 'from-amber-800 to-amber-600',
    accentColor: 'text-amber-300',
  },
  cybersecurity: {
    icon: Shield,
    label: 'Cybersecurity',
    gradient: 'from-red-800 to-red-600',
    accentColor: 'text-red-300',
  },
  mobile_development: {
    icon: Smartphone,
    label: 'Mobile Development',
    gradient: 'from-emerald-800 to-emerald-600',
    accentColor: 'text-emerald-300',
  },
  systems_networking: {
    icon: Router,
    label: 'Systems & Networking',
    gradient: 'from-cyan-800 to-cyan-600',
    accentColor: 'text-cyan-300',
  },
  databases_backend: {
    icon: Database,
    label: 'Databases & Backend',
    gradient: 'from-orange-800 to-orange-600',
    accentColor: 'text-orange-300',
  },
  computer_science_core: {
    icon: Terminal,
    label: 'Computer Science Core',
    gradient: 'from-blue-900 to-blue-700',
    accentColor: 'text-blue-300',
  },
}

/**
 * Role category-level icon mappings
 * Maps roleKey to specific icons for more granular categorization
 */
export const ROLE_ICONS: Record<string, IconConfig> = {
  backend: {
    icon: Server,
    label: 'Backend Engineering',
    gradient: 'from-blue-600 to-cyan-600',
    accentColor: 'text-cyan-300',
  },
  frontend: {
    icon: Layout,
    label: 'Frontend Engineering',
    gradient: 'from-indigo-600 to-violet-600',
    accentColor: 'text-indigo-300',
  },
  full_stack: {
    icon: Blocks,
    label: 'Full Stack',
    gradient: 'from-blue-700 to-purple-600',
    accentColor: 'text-blue-300',
  },
  devops: {
    icon: Cloud,
    label: 'DevOps',
    gradient: 'from-sky-600 to-cyan-600',
    accentColor: 'text-sky-300',
  },
  it_support: {
    icon: Monitor,
    label: 'IT Support',
    gradient: 'from-cyan-700 to-blue-600',
    accentColor: 'text-cyan-300',
  },
  systems_admin: {
    icon: ServerCog,
    label: 'Systems Administration',
    gradient: 'from-slate-700 to-slate-600',
    accentColor: 'text-slate-300',
  },
  it_security: {
    icon: Shield,
    label: 'IT Security',
    gradient: 'from-red-700 to-rose-600',
    accentColor: 'text-red-300',
  },
  corporate_finance: {
    icon: Landmark,
    label: 'Corporate Finance',
    gradient: 'from-emerald-700 to-teal-600',
    accentColor: 'text-emerald-300',
  },
  investment_banking: {
    icon: LineChart,
    label: 'Investment Banking',
    gradient: 'from-green-700 to-emerald-600',
    accentColor: 'text-green-300',
  },
  financial_analysis: {
    icon: TrendingUp,
    label: 'Financial Analysis',
    gradient: 'from-teal-700 to-cyan-600',
    accentColor: 'text-teal-300',
  },
  risk_management: {
    icon: Shield,
    label: 'Risk Management',
    gradient: 'from-amber-700 to-orange-600',
    accentColor: 'text-amber-300',
  },
  taxation: {
    icon: Receipt,
    label: 'Taxation',
    gradient: 'from-yellow-700 to-amber-600',
    accentColor: 'text-yellow-300',
  },
  auditing: {
    icon: ClipboardList,
    label: 'Auditing',
    gradient: 'from-lime-700 to-green-600',
    accentColor: 'text-lime-300',
  },
  financial_modeling: {
    icon: PieChart,
    label: 'Financial Modeling',
    gradient: 'from-emerald-700 to-green-600',
    accentColor: 'text-emerald-300',
  },
  financial_accounting: {
    icon: FileSpreadsheet,
    label: 'Financial Accounting',
    gradient: 'from-green-700 to-emerald-600',
    accentColor: 'text-green-300',
  },
  management_accounting: {
    icon: Calculator,
    label: 'Management Accounting',
    gradient: 'from-teal-700 to-green-600',
    accentColor: 'text-teal-300',
  },
  tax_accounting: {
    icon: Receipt,
    label: 'Tax Accounting',
    gradient: 'from-yellow-700 to-orange-600',
    accentColor: 'text-yellow-300',
  },
  digital_marketing: {
    icon: Megaphone,
    label: 'Digital Marketing',
    gradient: 'from-pink-700 to-rose-600',
    accentColor: 'text-pink-300',
  },
  seo: {
    icon: Search,
    label: 'SEO',
    gradient: 'from-fuchsia-700 to-pink-600',
    accentColor: 'text-fuchsia-300',
  },
  sem: {
    icon: TrendingUp,
    label: 'SEM',
    gradient: 'from-rose-700 to-orange-600',
    accentColor: 'text-rose-300',
  },
  branding: {
    icon: Palette,
    label: 'Branding',
    gradient: 'from-purple-700 to-fuchsia-600',
    accentColor: 'text-purple-300',
  },
  social_media: {
    icon: Globe,
    label: 'Social Media Marketing',
    gradient: 'from-sky-700 to-blue-600',
    accentColor: 'text-sky-300',
  },
  content_marketing: {
    icon: NotebookPen,
    label: 'Content Marketing',
    gradient: 'from-violet-700 to-purple-600',
    accentColor: 'text-violet-300',
  },
  product_marketing: {
    icon: BriefcaseBusiness,
    label: 'Product Marketing',
    gradient: 'from-indigo-700 to-purple-600',
    accentColor: 'text-indigo-300',
  },
  recruitment: {
    icon: Users,
    label: 'Recruitment',
    gradient: 'from-violet-700 to-purple-600',
    accentColor: 'text-violet-300',
  },
  employee_relations: {
    icon: Users,
    label: 'Employee Relations',
    gradient: 'from-purple-700 to-fuchsia-600',
    accentColor: 'text-purple-300',
  },
  payroll: {
    icon: Calculator,
    label: 'Payroll',
    gradient: 'from-blue-700 to-indigo-600',
    accentColor: 'text-blue-300',
  },
  performance_management: {
    icon: Activity,
    label: 'Performance Management',
    gradient: 'from-cyan-700 to-sky-600',
    accentColor: 'text-cyan-300',
  },
  organizational_behavior: {
    icon: Brain,
    label: 'Organizational Behavior',
    gradient: 'from-fuchsia-700 to-violet-600',
    accentColor: 'text-fuchsia-300',
  },
  operations: {
    icon: Workflow,
    label: 'Operations',
    gradient: 'from-amber-700 to-orange-600',
    accentColor: 'text-amber-300',
  },
  strategy: {
    icon: GitBranch,
    label: 'Strategy',
    gradient: 'from-orange-700 to-red-600',
    accentColor: 'text-orange-300',
  },
  project_management: {
    icon: BriefcaseBusiness,
    label: 'Project Management',
    gradient: 'from-blue-700 to-cyan-600',
    accentColor: 'text-blue-300',
  },
  microeconomics: {
    icon: TrendingUp,
    label: 'Microeconomics',
    gradient: 'from-yellow-700 to-amber-600',
    accentColor: 'text-yellow-300',
  },
  macroeconomics: {
    icon: Landmark,
    label: 'Macroeconomics',
    gradient: 'from-amber-700 to-orange-600',
    accentColor: 'text-amber-300',
  },
  econometrics: {
    icon: BarChart3,
    label: 'Econometrics',
    gradient: 'from-lime-700 to-emerald-600',
    accentColor: 'text-lime-300',
  },
  power_systems: {
    icon: Cpu,
    label: 'Power Systems',
    gradient: 'from-yellow-700 to-orange-600',
    accentColor: 'text-yellow-300',
  },
  electronics: {
    icon: Microchip,
    label: 'Electronics',
    gradient: 'from-sky-700 to-blue-600',
    accentColor: 'text-sky-300',
  },
  embedded_systems: {
    icon: Microchip,
    label: 'Embedded Systems',
    gradient: 'from-cyan-700 to-teal-600',
    accentColor: 'text-cyan-300',
  },
  control_systems: {
    icon: Workflow,
    label: 'Control Systems',
    gradient: 'from-indigo-700 to-sky-600',
    accentColor: 'text-indigo-300',
  },
  signal_processing: {
    icon: Activity,
    label: 'Signal Processing',
    gradient: 'from-blue-700 to-violet-600',
    accentColor: 'text-blue-300',
  },
  thermodynamics: {
    icon: Wrench,
    label: 'Thermodynamics',
    gradient: 'from-red-700 to-orange-600',
    accentColor: 'text-red-300',
  },
  fluid_mechanics: {
    icon: Workflow,
    label: 'Fluid Mechanics',
    gradient: 'from-cyan-700 to-blue-600',
    accentColor: 'text-cyan-300',
  },
  machine_design: {
    icon: Factory,
    label: 'Machine Design',
    gradient: 'from-slate-700 to-zinc-600',
    accentColor: 'text-slate-300',
  },
  structural: {
    icon: HardHat,
    label: 'Structural Engineering',
    gradient: 'from-orange-700 to-yellow-600',
    accentColor: 'text-orange-300',
  },
  geotechnical: {
    icon: HardHat,
    label: 'Geotechnical',
    gradient: 'from-amber-700 to-lime-600',
    accentColor: 'text-amber-300',
  },
  transportation: {
    icon: Router,
    label: 'Transportation',
    gradient: 'from-blue-700 to-cyan-600',
    accentColor: 'text-blue-300',
  },
  machine_learning: {
    icon: BrainCircuit,
    label: 'Machine Learning',
    gradient: 'from-fuchsia-700 to-violet-600',
    accentColor: 'text-fuchsia-300',
  },
  data_engineering: {
    icon: Database,
    label: 'Data Engineering',
    gradient: 'from-cyan-700 to-sky-600',
    accentColor: 'text-cyan-300',
  },
  deep_learning: {
    icon: Bot,
    label: 'Deep Learning',
    gradient: 'from-violet-700 to-fuchsia-600',
    accentColor: 'text-violet-300',
  },
  nlp: {
    icon: Languages,
    label: 'NLP',
    gradient: 'from-indigo-700 to-violet-600',
    accentColor: 'text-indigo-300',
  },
  clinical: {
    icon: HeartPulse,
    label: 'Clinical Knowledge',
    gradient: 'from-red-700 to-pink-600',
    accentColor: 'text-rose-300',
  },
  health_admin: {
    icon: ClipboardList,
    label: 'Healthcare Administration',
    gradient: 'from-cyan-700 to-teal-600',
    accentColor: 'text-cyan-300',
  },
  public_health: {
    icon: Activity,
    label: 'Public Health',
    gradient: 'from-emerald-700 to-teal-600',
    accentColor: 'text-emerald-300',
  },
  corporate_law: {
    icon: Gavel,
    label: 'Corporate Law',
    gradient: 'from-stone-700 to-amber-600',
    accentColor: 'text-stone-300',
  },
  criminal_law: {
    icon: Scale,
    label: 'Criminal Law',
    gradient: 'from-red-700 to-orange-600',
    accentColor: 'text-red-300',
  },
  intellectual_property: {
    icon: Fingerprint,
    label: 'Intellectual Property',
    gradient: 'from-violet-700 to-indigo-600',
    accentColor: 'text-violet-300',
  },
  clinical_psych: {
    icon: Brain,
    label: 'Clinical Psychology',
    gradient: 'from-fuchsia-700 to-pink-600',
    accentColor: 'text-fuchsia-300',
  },
  organizational_psych: {
    icon: Users,
    label: 'Organizational Psychology',
    gradient: 'from-purple-700 to-violet-600',
    accentColor: 'text-purple-300',
  },
  cognitive_psych: {
    icon: BrainCircuit,
    label: 'Cognitive Psychology',
    gradient: 'from-indigo-700 to-blue-600',
    accentColor: 'text-indigo-300',
  },
  pedagogy: {
    icon: BookOpen,
    label: 'Pedagogy',
    gradient: 'from-blue-700 to-indigo-600',
    accentColor: 'text-blue-300',
  },
  curriculum: {
    icon: NotebookPen,
    label: 'Curriculum Design',
    gradient: 'from-cyan-700 to-blue-600',
    accentColor: 'text-cyan-300',
  },
  edtech: {
    icon: Monitor,
    label: 'Educational Technology',
    gradient: 'from-indigo-700 to-cyan-600',
    accentColor: 'text-indigo-300',
  },
  cs_core: {
    icon: Terminal,
    label: 'Computer Science Core',
    gradient: 'from-blue-700 to-indigo-600',
    accentColor: 'text-blue-300',
  },
  networking: {
    icon: Network,
    label: 'Networking',
    gradient: 'from-cyan-700 to-blue-600',
    accentColor: 'text-cyan-300',
  },
  web_development: {
    icon: Globe,
    label: 'Web Development',
    gradient: 'from-sky-700 to-indigo-600',
    accentColor: 'text-sky-300',
  },
  cloud_computing: {
    icon: Cloud,
    label: 'Cloud Computing',
    gradient: 'from-sky-700 to-cyan-600',
    accentColor: 'text-sky-300',
  },
  // Software / IT roles
  engineering: {
    icon: Code2,
    label: 'Engineering',
    gradient: 'from-blue-500 to-blue-600',
    accentColor: 'text-blue-400',
  },
  quality_assurance: {
    icon: CheckCircle2Variant,
    label: 'QA / Testing',
    gradient: 'from-slate-800 to-slate-700',
    accentColor: 'text-slate-300',
  },
  devops_cloud: {
    icon: Cloud,
    label: 'DevOps / Cloud',
    gradient: 'from-sky-500 to-sky-600',
    accentColor: 'text-sky-400',
  },

  // Data / AI roles
  analytics: {
    icon: BarChart3,
    label: 'Analytics',
    gradient: 'from-sky-800 to-sky-600',
    accentColor: 'text-sky-300',
  },
  data_science_ml: {
    icon: Cpu,
    label: 'Data Science / ML',
    gradient: 'from-emerald-800 to-emerald-600',
    accentColor: 'text-emerald-300',
  },

  // Product roles
  product_management: {
    icon: Briefcase,
    label: 'Product Management',
    gradient: 'from-amber-500 to-amber-600',
    accentColor: 'text-amber-400',
  },

  // Cybersecurity roles
  soc_analyst: {
    icon: Shield,
    label: 'SOC Analyst',
    gradient: 'from-red-500 to-red-600',
    accentColor: 'text-red-400',
  },
  appsec: {
    icon: Lock,
    label: 'Application Security',
    gradient: 'from-rose-800 to-rose-600',
    accentColor: 'text-rose-300',
  },

  // Mobile Development roles
  android: {
    icon: Smartphone,
    label: 'Android Developer',
    gradient: 'from-green-500 to-green-600',
    accentColor: 'text-green-400',
  },
  ios: {
    icon: AppWindow,
    label: 'iOS Developer',
    gradient: 'from-slate-400 to-slate-500',
    accentColor: 'text-slate-300',
  },

  // Systems & Networking roles
  network_engineering: {
    icon: Router,
    label: 'Network Engineering',
    gradient: 'from-cyan-500 to-cyan-600',
    accentColor: 'text-cyan-400',
  },
  systems_programming: {
    icon: Microchip,
    label: 'Systems Programming',
    gradient: 'from-emerald-500 to-emerald-600',
    accentColor: 'text-emerald-400',
  },

  // Databases & Backend roles
  backend_engineering: {
    icon: Server,
    label: 'Backend Engineer',
    gradient: 'from-orange-500 to-orange-600',
    accentColor: 'text-orange-400',
  },
  database_engineering: {
    icon: Database,
    label: 'Database / SQL',
    gradient: 'from-yellow-600 to-yellow-700',
    accentColor: 'text-yellow-300',
  },

  // Computer Science Core roles
  dsa_interview: {
    icon: Terminal,
    label: 'DSA / Algorithms',
    gradient: 'from-blue-600 to-blue-700',
    accentColor: 'text-blue-400',
  },
  oop_design: {
    icon: Braces,
    label: 'OOP / Design',
    gradient: 'from-blue-600 to-blue-700',
    accentColor: 'text-blue-300',
  },
}

/**
 * Get icon config by industry key
 * Returns default icon if key not found
 */
export function getIndustryIcon(industryKey: string): IconConfig {
  return (
    INDUSTRY_ICONS[industryKey] || {
      icon:
        industryKey.includes('engineering') ? Wrench
          : industryKey.includes('science') ? Brain
            : industryKey.includes('technology') ? Monitor
              : industryKey.includes('finance') || industryKey.includes('economics') ? Landmark
                : industryKey.includes('marketing') ? Megaphone
                  : industryKey.includes('health') ? HeartPulse
                    : industryKey.includes('law') ? Scale
                      : industryKey.includes('education') ? GraduationCap
                        : Briefcase,
      label: 'Industry',
      gradient: 'from-gray-500 to-gray-600',
      accentColor: 'text-gray-400',
    }
  )
}

/**
 * Get icon config by role key
 * Returns default icon if key not found
 */
export function getRoleIcon(roleKey: string): IconConfig {
  return (
    ROLE_ICONS[roleKey] || {
      icon:
        roleKey.includes('finance') || roleKey.includes('account') || roleKey.includes('tax') ? Calculator
          : roleKey.includes('market') || roleKey === 'seo' || roleKey === 'sem' ? Megaphone
            : roleKey.includes('recruit') || roleKey.includes('employee') ? Users
              : roleKey.includes('law') ? Gavel
                : roleKey.includes('health') || roleKey.includes('clinical') ? HeartPulse
                  : roleKey.includes('data') || roleKey.includes('analytics') ? BarChart3
                    : roleKey.includes('machine') || roleKey.includes('ai') || roleKey.includes('nlp') ? BrainCircuit
                      : roleKey.includes('network') ? Network
                        : roleKey.includes('cloud') || roleKey.includes('devops') ? Cloud
                          : roleKey.includes('backend') || roleKey.includes('database') ? Server
                            : roleKey.includes('frontend') || roleKey.includes('web') ? Layout
                              : roleKey.includes('mobile') ? Smartphone
                                : roleKey.includes('security') ? Shield
                                  : roleKey.includes('education') || roleKey.includes('curriculum') || roleKey.includes('pedagogy') ? BookOpen
                                    : roleKey.includes('psych') ? Brain
                                      : roleKey.includes('project') || roleKey.includes('product') ? BriefcaseBusiness
                                        : Briefcase,
      label: 'Role',
      gradient: 'from-gray-500 to-gray-600',
      accentColor: 'text-gray-400',
    }
  )
}

/**
 * Get icon config by any key (tries industry, then role)
 */
export function getIcon(key: string, type: 'industry' | 'role' = 'industry'): IconConfig {
  if (type === 'industry') {
    return getIndustryIcon(key)
  }
  return getRoleIcon(key)
}

/**
 * Icon size presets for different use cases
 */
export const ICON_SIZES = {
  xs: { container: 'h-8 w-8', icon: 'h-4 w-4' },
  sm: { container: 'h-10 w-10', icon: 'h-5 w-5' },
  md: { container: 'h-14 w-14', icon: 'h-7 w-7' },
  lg: { container: 'h-16 w-16', icon: 'h-8 w-8' },
  xl: { container: 'h-20 w-20', icon: 'h-10 w-10' },
} as const

export type IconSize = keyof typeof ICON_SIZES
