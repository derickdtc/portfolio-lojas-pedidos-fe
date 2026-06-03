import { LogOut, Package, ReceiptText, Upload } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { IconButton } from '../ui/IconButton';

const navItems = [
  { to: '/', label: 'Estoque', icon: Package },
  { to: '/pedidos', label: 'Pedidos', icon: ReceiptText },
  { to: '/importar', label: 'Importar', icon: Upload }
];

function Navigation({ compact = false }: { compact?: boolean }) {
  return (
    <nav className={compact ? 'grid grid-cols-3 gap-1' : 'space-y-2'}>
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg font-black transition',
                compact
                  ? 'min-h-14 flex-col justify-center gap-1 px-2 text-[11px]'
                  : 'min-h-12 gap-3 px-3 text-sm',
                isActive ? 'bg-forest text-white shadow-soft' : 'text-moss hover:bg-white'
              ].join(' ')
            }
            end={item.to === '/'}
            key={item.to}
            to={item.to}
          >
            <Icon size={compact ? 20 : 19} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-line bg-paper/95 p-5 lg:block">
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-forest text-white">
            <Package size={25} strokeWidth={2.5} />
          </div>
          <p className="text-xs font-extrabold uppercase text-clay">Controle da loja</p>
        </div>

        <Navigation />

        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-line bg-white p-3">
          <p className="truncate text-xs font-extrabold uppercase text-[#738075]">Usuário</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-black text-moss">{user?.username}</p>
            <IconButton icon={<LogOut size={18} />} label="Sair" onClick={logout} tone="dark" />
          </div>
        </div>
      </aside>

      <header className="safe-top sticky top-0 z-30 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">          
          <IconButton icon={<LogOut size={18} />} label="Sair" onClick={logout} tone="dark" />
        </div>
      </header>

      <main className="pb-24 lg:ml-64 lg:pb-0">
        <Outlet />
      </main>

      <div className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-paper/95 p-2 backdrop-blur lg:hidden">
        <Navigation compact />
      </div>
    </div>
  );
}
