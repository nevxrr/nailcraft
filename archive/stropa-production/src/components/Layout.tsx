import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useStore } from '../store/StoreContext'
import { Link } from 'react-router-dom'

export function Layout() {
  const { lowStock } = useStore()
  const location = useLocation()
  const hideNav =
    location.pathname.startsWith('/orders/') &&
    location.pathname !== '/orders/new'

  return (
    <div className="app-shell">
      <div className="bg-atmosphere" aria-hidden />
      <header className="top-bar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden />
          <div>
            <p className="brand-name">СТРОПА</p>
            <p className="brand-sub">Производство · ошейники</p>
          </div>
        </div>
        {lowStock.length > 0 && location.pathname !== '/warehouse' && (
          <Link to="/warehouse" className="alert-pill">
            {lowStock.length} на исходе
          </Link>
        )}
      </header>

      <main className={`page ${hideNav ? 'page-detail' : ''}`}>
        <Outlet />
      </main>

      {!hideNav && <BottomNav />}
    </div>
  )
}
