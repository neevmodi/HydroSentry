import { BrowserRouter, Routes, Route } from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'

import CommandCenter from './pages/CommandCenter'
import Monitoring from './pages/Monitoring'
import RiskIntelligence from './pages/RiskIntelligence'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import SensorNetwork from './pages/SensorNetwork'

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<CommandCenter />} />

          <Route
            path="/monitoring"
            element={<Monitoring />}
          />

          <Route
            path="/risk"
            element={<RiskIntelligence />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/sensors"
            element={<SensorNetwork />}
          />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  )
}

export default App