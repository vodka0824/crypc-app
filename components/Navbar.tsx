
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Monitor, Settings, Plus } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  toggleCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, toggleCart }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Modernized button styles: using generic soft background instead of solid black for active
  const getButtonClass = (path?: string) => {
    const active = path ? isActive(path) : false;
    return `relative p-2.5 rounded-2xl transition-all duration-300 flex items-center gap-2 font-bold group active:scale-95 ${
      active 
        ? 'bg-accent/10 text-accent shadow-inner' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-black'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 shadow-sm h-16 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group mr-4 flex-shrink-0">
            <div className="bg-black text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-gray-200">
                <Monitor className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-accent transition-colors">哭PC</span>
          </Link>

          {/* Unified Action Buttons (Icon Buttons) */}
          <div className="flex items-center gap-1 sm:gap-2">
             {/* New Quote Button */}
             <Link
                to="/"
                className={getButtonClass('/')}
                title="新增估價單"
              >
                <Plus className={`h-5 w-5 ${isActive('/') ? 'stroke-[2.5px]' : ''}`} />
                <span className="hidden sm:inline text-sm">估價</span>
              </Link>
              
              {/* Admin Button */}
              <Link
                to="/admin"
                className={getButtonClass('/admin')}
                title="系統後台"
              >
                <Settings className={`h-5 w-5 ${isActive('/admin') ? 'stroke-[2.5px]' : ''}`} />
                <span className="hidden sm:inline text-sm">後台</span>
              </Link>

              {/* Divider */}
              <div className="h-5 w-px bg-gray-200 mx-2"></div>

              {/* Cart Button - Uses Accent Color for primary action feel */}
              <button 
                onClick={toggleCart} 
                className="relative p-2.5 rounded-2xl transition-all duration-300 flex items-center gap-2 font-bold group active:scale-95 text-gray-600 hover:bg-gray-100 hover:text-black"
                title="查看報價單"
              >
                <div className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm ring-2 ring-white">
                        {cartCount}
                    </span>
                    )}
                </div>
                <span className="hidden sm:inline text-sm">清單</span>
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
