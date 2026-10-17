import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/approvals-planning')

export function ApprovalsPlanningPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
