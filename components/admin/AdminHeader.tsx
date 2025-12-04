
// components/admin/AdminHeader.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AdminHeaderProps {
  isLoading: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ isLoading }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
        後台管理系統
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
      </h1>
      <p className="text-gray-500 mt-2 text-base md:text-lg">
        {isLoading ? '正在同步 Firebase 資料庫...' : '管理您的商品資料庫。'}
      </p>
    </div>
  );
};

export default AdminHeader;
