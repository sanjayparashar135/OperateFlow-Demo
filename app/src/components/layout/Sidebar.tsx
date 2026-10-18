import { Link, NavLink, useLocation } from 'react-router-dom'
import { OperateFlowMark } from '../brand/OperateFlowMark'
import { NAV_ITEMS } from '../../data/navigation'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

function isNavActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/overview') return pathname === '/overview'
  if (itemPath === '/requests') {
    return pathname === '/requests' || pathname.startsWith('/requests/')
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { pathname } = useLocation()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-of-border bg-of-sidebar transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center border-b border-of-border px-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          aria-label="Return to OperateFlow welcome page"
        >
          <OperateFlowMark className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-of-ink">
              OperateFlow
            </p>
            <p className="truncate text-xs text-of-ink-muted">
              Delivery Coordination Platform
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isNavActive(pathname, item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/overview'}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-of-primary-soft text-of-primary'
                      : 'text-of-ink-secondary hover:bg-white hover:text-of-ink'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-of-border px-5 py-4">
        <p className="text-xs font-medium text-of-ink-muted">
          Northstar Financial Services
        </p>
        <p className="mt-1 text-xs text-of-ink-muted">
          Customer Onboarding Portal
        </p>
      </div>
    </aside>
  )
}
