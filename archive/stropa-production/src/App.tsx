import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NewOrderPage } from './pages/NewOrderPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { OrdersPage } from './pages/OrdersPage'
import { WarehousePage } from './pages/WarehousePage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OrdersPage />} />
        <Route path="orders/new" element={<NewOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="warehouse" element={<WarehousePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
