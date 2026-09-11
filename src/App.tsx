import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { CoursePage, TelegramLoginPage } from './pages/CoursePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/course" element={<CoursePage />} />
      <Route path="/login" element={<TelegramLoginPage />} />
      <Route path="/cabinet" element={<Navigate to="/course" replace />} />
      <Route path="/cabinet/*" element={<Navigate to="/course" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
