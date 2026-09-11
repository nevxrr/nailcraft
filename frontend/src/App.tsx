import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { CoursePage } from './pages/CoursePage'
import { LoginPage } from './pages/LoginPage'
import { BookingPage, CabinetHome, CabinetLayout } from './pages/CabinetPages'
import {
  CrmFunnel,
  CrmGroups,
  CrmLayout,
  CrmPayments,
  CrmScripts,
  CrmStudentCard,
  CrmStudents,
} from './pages/CrmPages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/course" element={<Navigate to="/cabinet/course" replace />} />
      <Route path="/cabinet" element={<CabinetLayout />}>
        <Route index element={<CabinetHome />} />
        <Route path="booking" element={<BookingPage />} />
      </Route>
      <Route path="/cabinet/course" element={<CoursePage />} />
      <Route path="/crm" element={<CrmLayout />}>
        <Route index element={<CrmFunnel />} />
        <Route path="students" element={<CrmStudents />} />
        <Route path="students/:id" element={<CrmStudentCard />} />
        <Route path="groups" element={<CrmGroups />} />
        <Route path="payments" element={<CrmPayments />} />
        <Route path="scripts" element={<CrmScripts />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
