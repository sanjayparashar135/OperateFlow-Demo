import { ArrowRight } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { OperateFlowMark } from '../components/brand/OperateFlowMark'
import { LifecycleFlowHero } from '../components/landing/LifecycleFlowHero'
import { useRole } from '../context/useRole'
import type { PersonaId } from '../types/persona'

export function LandingPage() {
  const navigate = useNavigate()
  const { personas, currentPersona, setPersonaId } = useRole()
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>(
    currentPersona.id,
  )
  const personaSelectId = useId()

  useEffect(() => {
    document.title = 'OperateFlow · Welcome'
  }, [])

  function handleEnter(event: FormEvent) {
    event.preventDefault()
    setPersonaId(selectedPersonaId)
    navigate('/overview')
  }

  return (
    <div className="of-landing relative flex min-h-full flex-col overflow-hidden">
      <div className="of-landing-atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="of-landing-orb of-landing-orb-a" aria-hidden="true" />
      <div className="of-landing-orb of-landing-orb-b" aria-hidden="true" />

      <div className="relative z-10 flex min-h-full flex-1 flex-col px-4 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12 lg:px-12">
        <header className="of-landing-brand mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="of-landing-mark mb-5 flex items-center justify-center">
            <OperateFlowMark className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>
          <h1 className="of-landing-title text-[2.35rem] font-semibold tracking-tight text-of-ink sm:text-5xl lg:text-[3.35rem]">
            OperateFlow
          </h1>
          <p className="of-landing-subtitle mt-3 max-w-xl text-base font-medium text-of-primary sm:text-lg">
            AI-Powered Delivery Coordination Platform
          </p>
          <p className="of-landing-tagline mt-3 max-w-2xl text-sm leading-relaxed text-of-ink-secondary sm:text-base">
            Smarter Coordination. Complete Visibility. Faster Delivery.
          </p>
        </header>

        <section className="of-landing-hero mx-auto mt-8 flex w-full max-w-5xl flex-1 flex-col justify-center sm:mt-10 lg:mt-12">
          <p className="of-landing-hero-eyebrow mb-4 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-of-ink-muted">
            Delivery lifecycle
          </p>
          <LifecycleFlowHero />
        </section>

        <footer className="of-landing-enter relative z-10 mx-auto mt-10 w-full max-w-md sm:mt-12">
          <form
            onSubmit={handleEnter}
            className="of-landing-enter-panel flex flex-col items-stretch gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-of-panel backdrop-blur-md sm:flex-row sm:items-end sm:gap-3 sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor={personaSelectId}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-of-ink-muted"
              >
                Enter as
              </label>
              <select
                id={personaSelectId}
                value={selectedPersonaId}
                onChange={(event) =>
                  setSelectedPersonaId(event.target.value as PersonaId)
                }
                className="w-full rounded-xl border border-of-border bg-of-surface px-3 py-2.5 text-sm font-medium text-of-ink shadow-sm transition-colors hover:border-of-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              >
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} — {persona.role}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="of-landing-enter-btn inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-of-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-[background-color,transform,box-shadow] hover:bg-of-primary-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary active:scale-[0.98] sm:min-w-[7.5rem]"
            >
              Enter
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}
