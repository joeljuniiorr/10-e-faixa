import { NavLink } from 'react-router'

export function BottomNavigation() {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Navegação principal"
    >
      <NavLink
        className={({ isActive }) =>
          `bottom-navigation__link ${
            isActive
              ? 'bottom-navigation__link--active'
              : ''
          }`
        }
        to="/"
        end
      >
        Início
      </NavLink>

      <NavLink
        className={({ isActive }) =>
          `bottom-navigation__link ${
            isActive
              ? 'bottom-navigation__link--active'
              : ''
          }`
        }
        to="/grupo"
      >
        Grupo
      </NavLink>
    </nav>
  )
}