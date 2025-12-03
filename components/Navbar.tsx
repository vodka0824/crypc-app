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

  // Common button class for consistent "Bell/Icon" design
  const getButtonClass = (path?: string) => {
    const active = path ? isActive(path) : false;
    return `relative p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold group active:scale-95 border ${
      active 
        ? 'bg-black text-white border-black shadow-md' 
        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100 hover:text-black hover:border-gray-200'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group mr-2 flex-shrink-0">
            <div className="bg-black text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                <Monitor className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-black truncate">哭PC</span>
          </Link>

          {/* Unified Action Buttons (Icon Buttons) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
             {/* New Quote Button */}
             <Link
                to="/"
                className={getButtonClass('/')}
                title="新增估價單"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">估價</span>
              </Link>
              
              {/* Admin Button */}
              <Link
                to="/admin"
                className={getButtonClass('/admin')}
                title="系統後台"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">後台</span>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 mx-1"></div>

              {/* Cart Button */}
              <button 
                onClick={toggleCart} 
                className={getButtonClass()}
                title="查看報價單"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">清單</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;