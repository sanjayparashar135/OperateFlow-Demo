import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/')

export function OverviewPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
