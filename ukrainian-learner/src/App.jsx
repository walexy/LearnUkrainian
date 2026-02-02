import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CyrillicTrainer from './pages/CyrillicTrainer'
import ListeningLibrary from './pages/ListeningLibrary'
import Dashboard from './pages/Dashboard'
import useMilestones from './hooks/useMilestones'
import { MilestoneToastContainer } from './components/MilestoneToast'

function App() {
  const { newlyUnlocked, dismissMilestone } = useMilestones()

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cyrillic" element={<CyrillicTrainer />} />
        <Route path="/listening" element={<ListeningLibrary />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      {/* Milestone notifications */}
      {newlyUnlocked.length > 0 && (
        <MilestoneToastContainer
          milestones={newlyUnlocked}
          onDismiss={dismissMilestone}
        />
      )}
    </Layout>
  )
}

export default App
