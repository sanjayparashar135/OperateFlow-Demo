import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Workflow,
} from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  title: string
  description: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Overview',
    title: 'Overview',
    description:
      'Portfolio view of delivery requests, attention items, and lifecycle distribution for Northstar Financial Services.',
    icon: LayoutDashboard,
  },
  {
    path: '/requests',
    label: 'Requests',
    title: 'Requests',
    description:
      'Browse and open enhancement requests across the OperateFlow delivery lifecycle.',
    icon: ClipboardList,
  },
  {
    path: '/approvals-planning',
    label: 'Approvals & Planning',
    title: 'Approvals & Planning',
    description:
      'Technical review queue with AI-assisted historical estimation and planning decisions.',
    icon: CheckSquare,
  },
  {
    path: '/execution',
    label: 'Execution',
    title: 'Execution',
    description:
      'Track in-flight delivery work, progress updates, and deadline-aware monitoring.',
    icon: Workflow,
  },
  {
    path: '/follow-ups',
    label: 'Follow-ups',
    title: 'Follow-ups',
    description:
      'Simulated Teams-style status checks and developer responses within OperateFlow.',
    icon: MessageSquare,
  },
  {
    path: '/meetings',
    label: 'Meetings',
    title: 'Meetings',
    description:
      'Natural-language meeting preparation with simulated attendees, agenda, and time slots.',
    icon: CalendarDays,
  },
  {
    path: '/activity',
    label: 'Activity',
    title: 'Activity',
    description:
      'Unified timeline of intake, planning, follow-ups, blockers, and meeting actions.',
    icon: Activity,
  },
]

export function getNavItemByPath(pathname: string): NavItem {
  const exact = NAV_ITEMS.find((item) => item.path === pathname)
  if (exact) {
    return exact
  }

  return NAV_ITEMS[0]
}
