import type { LucideIcon } from 'lucide-react'
import {
  BrainCircuit,
  Briefcase,
  Building2,
  Cloud,
  Code2,
  Database,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  Layout,
  MessageCircle,
  Network,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  TestTube2,
  Workflow,
} from 'lucide-react'
import type { PathSubcategoryKey } from '@/lib/learning-paths/constants'

export const PATH_SUBCATEGORY_ICONS: Record<PathSubcategoryKey, LucideIcon> = {
  languages: Code2,
  frontend: Layout,
  backend: Server,
  databases: Database,
  cs_fundamentals: GraduationCap,
  system_design: Network,
  ai_ml: BrainCircuit,
  cloud: Cloud,
  devops: Workflow,
  testing: TestTube2,
  mobile: Smartphone,
  cybersecurity: Shield,
  game_dev: Gamepad2,
  behavioral: MessageCircle,
  role_based: Briefcase,
  pakistan: Building2,
  dsa: Sparkles,
  project: FolderKanban,
}

export function pathSubcategoryIcon(key: string): LucideIcon {
  return PATH_SUBCATEGORY_ICONS[key as PathSubcategoryKey] || FolderKanban
}
