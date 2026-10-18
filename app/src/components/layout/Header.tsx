import { Bell, Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRole } from '../../context/useRole'
import { getNavItemByPath } from '../../data/navigation'
import type { PersonaId } from '../../types/persona'
import { Avatar } from '../ui/Avatar'
import { IconButton } from '../ui/IconButton'
import { ResetDemoButton } from './ResetDemoButton'
import { SimulationBadge } from './SimulationBadge'

interface HeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { pathname } = useLocation()
  const currentNav = getNavItemByPath(pathname)
  const { personas, currentPersona, setPersonaId } = useRole()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const panelId = useId()
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = `${currentNav.title} · OperateFlow`
  }, [currentNav.title])

  useEffect(() => {
    if (!notificationsOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [notificationsOpen])

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-of-border bg-of-surface px-4 sm:px-6">
      <IconButton
        label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        className="lg:hidden"
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1 className="m-0 truncate text-lg font-semibold tracking-tight text-of-ink">
          {currentNav.title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <SimulationBadge />
        <ResetDemoButton />

        <label className="sr-only" htmlFor="role-switcher">
          Switch persona
        </label>
        <select
          id="role-switcher"
          value={currentPersona.id}
          onChange={(event) => setPersonaId(event.target.value as PersonaId)}
          className="max-w-[12rem] cursor-pointer rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink shadow-sm transition-colors hover:border-of-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary sm:max-w-xs"
        >
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name} — {persona.role}
            </option>
          ))}
        </select>

        <div className="relative" ref={notificationRef}>
          <IconButton
            label="Notifications"
            aria-expanded={notificationsOpen}
            aria-controls={panelId}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </IconButton>

          {notificationsOpen ? (
            <div
              id={panelId}
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-of-border bg-of-surface p-4 shadow-of-panel"
            >
              <p className="text-sm font-semibold text-of-ink">Notifications</p>
              <p className="mt-2 text-sm leading-relaxed text-of-ink-muted">
                No new notifications
              </p>
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 border-l border-of-border pl-3 sm:flex">
          <Avatar initials={currentPersona.initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-of-ink">
              {currentPersona.name}
            </p>
            <p className="truncate text-xs text-of-ink-muted">
              {currentPersona.role}
            </p>
          </div>
        </div>

        <div className="sm:hidden">
          <Avatar initials={currentPersona.initials} size="sm" />
        </div>
      </div>
    </header>
  )
}
