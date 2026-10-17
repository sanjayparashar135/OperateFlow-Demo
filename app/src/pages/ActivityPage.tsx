import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/activity')

export function ActivityPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
