import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-10 md:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-bold tracking-tight mb-4 block">哭PC</span>
            <p className="text-gray-500 text-sm leading-relaxed">
              重新定義電腦購買體驗。極簡、專業、值得信賴。
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">產品服務</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/diy" className="hover:text-black">精選主機</Link></li>
              <li><Link to="/" className="hover:text-black">客製化組裝</Link></li>
              <li><Link to="/" className="hover:text-black">舊機回收</Link></li>
              <li><Link to="/" className="hover:text-black">無卡分期</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">客戶支援</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-black">訂單查詢</Link></li>
              <li><Link to="/" className="hover:text-black">常見問題</Link></li>
              <li><Link to="/" className="hover:text-black">保固條款</Link></li>
              <li><Link to="/" className="hover:text-black">聯絡客服</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">關注我們</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CryPC Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;