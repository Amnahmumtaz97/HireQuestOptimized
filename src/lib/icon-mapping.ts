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
  return INDUSTRY_ICONS[industryKey] || {
    icon: Briefcase,
    label: 'Industry',
    gradient: 'from-gray-500 to-gray-600',
    accentColor: 'text-gray-400',
  }
}

/**
 * Get icon config by role key
 * Returns default icon if key not found
 */
export function getRoleIcon(roleKey: string): IconConfig {
  return ROLE_ICONS[roleKey] || {
    icon: Briefcase,
    label: 'Role',
    gradient: 'from-gray-500 to-gray-600',
    accentColor: 'text-gray-400',
  }
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
