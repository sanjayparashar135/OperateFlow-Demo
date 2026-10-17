import { PagePlaceholder } from '../components/layout/PagePlaceholder'
import { getNavItemByPath } from '../data/navigation'

const page = getNavItemByPath('/execution')

export function ExecutionPage() {
  return (
    <PagePlaceholder title={page.title} description={page.description} />
  )
}
