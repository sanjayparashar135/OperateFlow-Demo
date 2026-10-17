import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { RoleProvider } from './context/RoleContext'
import { ActivityPage } from './pages/ActivityPage'
import { ApprovalsPlanningPage } from './pages/ApprovalsPlanningPage'
import { ExecutionPage } from './pages/ExecutionPage'
import { FollowUpsPage } from './pages/FollowUpsPage'
import { MeetingsPage } from './pages/MeetingsPage'
import { OverviewPage } from './pages/OverviewPage'
import { RequestsPage } from './pages/RequestsPage'

function App() {
  return (
    <RoleProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="approvals-planning" element={<ApprovalsPlanningPage />} />
          <Route path="execution" element={<ExecutionPage />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </RoleProvider>
  )
}

export default App
