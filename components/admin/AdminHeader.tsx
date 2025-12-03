// components/admin/AdminHeader.tsx
import React from 'react';
import { Loader2, Upload, Database, Plus } from 'lucide-react';

interface AdminHeaderProps {
  isLoading: boolean;
  onAddNew: () => void;
  onImport: () => void;
  onReset: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ isLoading, onAddNew, onImport, onReset }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
          後台管理系統
          {isLoading && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
        </h1>
        <p className="hidden md:block text-gray-500 mt-2 text-lg">
          {isLoading ? '正在同步 Firebase 資料庫...' : '管理您的商品資料庫。'}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto md:flex md:gap-3">
        <button onClick={onImport} className="px-3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm font-bold"><Upload className="h-5 w-5" /> 匯入</button>
        <button onClick={onReset} className="px-3 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1.5 font-bold whitespace-nowrap" title="上傳預設資料到 Firebase">
          <Database className="h-5 w-5" /> 初始化
        </button>
        <button onClick={onAddNew} className="px-3 py-3 bg-black text-white rounded-xl hover:bg-gray-800 flex items-center justify-center gap-1.5 font-bold"><Plus className="h-5 w-5" /> 新增</button>
      </div>
    </div>
  );
};

export default AdminHeader;
