import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/follow-ups')

export function FollowUpsPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
