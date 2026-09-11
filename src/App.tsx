import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import {
  BookingPage,
  CabinetHome,
  CabinetLayout,
  LessonsPage,
  LoginPage,
} from './pages/CabinetPages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cabinet/login" element={<LoginPage />} />
      <Route path="/cabinet" element={<CabinetLayout />}>
        <Route index element={<CabinetHome />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="booking" element={<BookingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
