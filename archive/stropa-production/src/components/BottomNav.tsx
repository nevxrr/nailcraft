import { NavLink } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

export function BottomNav() {
  const { lowStock } = useStore()
  const alertCount = lowStock.length

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
        <span className="nav-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16v12H4z" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M9 12h6" />
          </svg>
        </span>
        <span>Заказы</span>
      </NavLink>

      <NavLink
        to="/warehouse"
        className={({ isActive }) => (isActive ? 'active' : '')}
      >
        <span className="nav-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9.5 12 4l9 5.5V20H3V9.5z" />
            <path d="M12 4v16" />
            <path d="M3 9.5h18" />
          </svg>
          {alertCount > 0 && (
            <span className="nav-badge">{alertCount > 9 ? '9+' : alertCount}</span>
          )}
        </span>
        <span>Склад</span>
      </NavLink>

      <NavLink
        to="/orders/new"
        className={({ isActive }) =>
          `nav-fab ${isActive ? 'active' : ''}`
        }
      >
        <span className="nav-fab-btn" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span>Новый</span>
      </NavLink>
    </nav>
  )
}
