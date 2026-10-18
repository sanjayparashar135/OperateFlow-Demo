import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { RoleProvider } from './context/RoleContext'
import { SimulationProvider } from './context/SimulationContext'
import { ActivityPage } from './pages/ActivityPage'
import { ApprovalsPlanningPage } from './pages/ApprovalsPlanningPage'
import { ExecutionPage } from './pages/ExecutionPage'
import { FollowUpsPage } from './pages/FollowUpsPage'
import { IntakePage } from './pages/IntakePage'
import { MeetingsPage } from './pages/MeetingsPage'
import { OverviewPage } from './pages/OverviewPage'
import { RequestDetailsPage } from './pages/RequestDetailsPage'
import { RequestsPage } from './pages/RequestsPage'

function App() {
  return (
    <RoleProvider>
      <SimulationProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="requests/new" element={<IntakePage />} />
            <Route path="requests/:requestId" element={<RequestDetailsPage />} />
            <Route path="approvals-planning" element={<ApprovalsPlanningPage />} />
            <Route path="execution" element={<ExecutionPage />} />
            <Route path="follow-ups" element={<FollowUpsPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SimulationProvider>
    </RoleProvider>
  )
}

export default App
