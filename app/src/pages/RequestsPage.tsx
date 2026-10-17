import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/requests')

export function RequestsPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
