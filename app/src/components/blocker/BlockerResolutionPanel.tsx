import type { DeliveryRequest } from '../../types/delivery'
import type { PersonaId } from '../../types/persona'
import type {
  BlockerResolutionRecord,
  CollaborationChannelId,
  ConfirmedMeetingRecord,
  CoordinationActionId,
  DiagnosticDirectionId,
} from '../../types/simulation'
import {
  canConfirmStakeholderCommunication,
  canRecordTroubleshooting,
  canSelectCoordinationActions,
} from '../../data/capabilities'
import type { ConfirmStakeholderInput } from '../../data/blockerResolutionHelpers'
import { ScheduledMeetingAssociation } from '../meetings/ScheduledMeetingAssociation'
import { BusinessStatusPanel } from './BusinessStatusPanel'
import { DeliveryRiskCoordination } from './DeliveryRiskCoordination'
import { TroubleshootingAssistant } from './TroubleshootingAssistant'

interface BlockerResolutionPanelProps {
  request: DeliveryRequest
  personaId: PersonaId
  blockerResolution: BlockerResolutionRecord
  channelId: CollaborationChannelId
  meeting: ConfirmedMeetingRecord | undefined
  onRecordTroubleshooting: (input: {
    directionId: DiagnosticDirectionId
    progressNote: string
    needsIntegrationAssist: boolean
  }) => boolean
  onSaveCoordination: (actionIds: CoordinationActionId[]) => boolean
  onConfirmCommunication: (
    input: Omit<
      ConfirmStakeholderInput,
      'confirmedById' | 'referenceDate' | 'channelId'
    >,
  ) => boolean
}

export function BlockerResolutionPanel({
  request,
  personaId,
  blockerResolution,
  channelId,
  meeting,
  onRecordTroubleshooting,
  onSaveCoordination,
  onConfirmCommunication,
}: BlockerResolutionPanelProps) {
  if (personaId === 'ajay-raj') {
    return (
      <div className="flex flex-col gap-4">
        <TroubleshootingAssistant
          blockerResolution={blockerResolution}
          canRecord={canRecordTroubleshooting(personaId)}
          onRecord={onRecordTroubleshooting}
        />
        {meeting ? <ScheduledMeetingAssociation meeting={meeting} /> : null}
      </div>
    )
  }

  if (personaId === 'radhe-shyam') {
    return (
      <DeliveryRiskCoordination
        request={request}
        blockerResolution={blockerResolution}
        channelId={channelId}
        meeting={meeting}
        canCoordinate={
          canSelectCoordinationActions(personaId) &&
          canConfirmStakeholderCommunication(personaId)
        }
        onSaveCoordination={onSaveCoordination}
        onConfirmCommunication={(input) =>
          onConfirmCommunication({
            message: input.message,
            recipientId: input.recipientId,
            nextUpdateNote: input.nextUpdateNote,
            actionIds: input.actionIds,
          })
        }
      />
    )
  }

  if (personaId === 'john-harrison') {
    return (
      <BusinessStatusPanel
        request={request}
        blockerResolution={blockerResolution}
        meeting={meeting}
      />
    )
  }

  // Sanjay and other visible technical roles: lightweight technical context.
  return (
    <section className="rounded-xl border border-of-border bg-of-canvas/40 px-4 py-4">
      <h3 className="m-0 text-sm font-semibold text-of-ink">
        Blocker under investigation
      </h3>
      <p className="mt-2 m-0 text-sm text-of-ink-secondary">
        REQ1235 is Execution / Blocked / At Risk. Developer troubleshooting and
        project-manager stakeholder communication are in progress. Detailed
        AI-assisted actions are available to Ajay and Radhe.
      </p>
      {blockerResolution.troubleshooting.decisionState === 'recorded' ? (
        <p className="mt-2 m-0 text-sm text-of-ink-secondary">
          Ajay recorded troubleshooting progress
          {blockerResolution.troubleshooting.needsIntegrationAssist
            ? ' and flagged potential Integration Lead assistance'
            : ''}
          .
        </p>
      ) : null}
      {blockerResolution.stakeholderCommunication.decisionState ===
      'confirmed' ? (
        <p className="mt-2 m-0 text-sm text-of-ink-secondary">
          Radhe confirmed a business update for John Harrison.
        </p>
      ) : (
        <p className="mt-2 m-0 text-sm text-of-ink-muted">
          Business-facing stakeholder update has not been confirmed yet.
        </p>
      )}
      {meeting ? (
        <div className="mt-3">
          <ScheduledMeetingAssociation meeting={meeting} />
        </div>
      ) : null}
    </section>
  )
}
