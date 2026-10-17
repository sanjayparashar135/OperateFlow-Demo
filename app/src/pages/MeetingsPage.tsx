import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/meetings')

export function MeetingsPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
