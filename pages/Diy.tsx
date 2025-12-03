
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Monitor, Gamepad2, Cpu, Palette, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { Product, Category } from '../types';

interface DiyProps {
  addToCart: (product: Product) => void;
}

const Diy: React.FC<DiyProps> = ({ addToCart }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('office');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'office', name: '文書主機', icon: Monitor },
    { id: 'gaming', name: '電競主機', icon: Gamepad2 },
    { id: 'creator', name: '創作者主機', icon: Cpu },
    { id: 'custom', name: '客製化噴圖', icon: Palette },
  ];

  const prebuiltHosts = {
    office: [
      {
        id: 'office-1',
        name: 'CryPC Air 文書版',
        price: 12900,
        category: Category.OTHERS, // Changed from PREBUILT to OTHERS
        image: 'https://picsum.photos/400/400?random=101',
        description: '適合日常辦公、網頁瀏覽、股票看盤。安靜省電。',
        specs: ['Intel i3-12100', '8GB DDR4 3200', '500GB NVMe SSD', '靜音機殼', '400W 銅牌電源'],
      },
      {
        id: 'office-2',
        name: 'CryPC Air Pro 文書進階版',
        price: 16900,
        category: Category.OTHERS, // Changed from PREBUILT to OTHERS
        image: 'https://picsum.photos/400/400?random=102',
        description: '多工處理更流暢，適合大量文書處理與輕度修圖。',
        specs: ['Intel i5-12400', '16GB DDR4 3200', '1TB NVMe SSD', '商務黑機殼', '500W 銅牌電源'],
      },
    ],
    gaming: [
      {
        id: 'gaming-1',
        name: 'CryPC Force 戰鬥版',
        price: 32900,
        category: Category.OTHERS, // Changed from PREBUILT to OTHERS
        image: 'https://picsum.photos/400/400?random=103',
        description: 'FHD 遊戲順跑，高CP值入門首選。',
        specs: ['Intel i5-13400F', 'RTX 4060 8G', '16GB DDR5 5600', '1TB Gen4 SSD', '650W 金牌電源'],
      },
      {
        id: 'gaming-2',
        name: 'CryPC Elite 旗艦版',
        price: 58900,
        category: Category.OTHERS, // Changed from PREBUILT to OTHERS
        image: 'https://picsum.photos/400/400?random=104',
        description: '2K/4K 3A大作全開，極致光追體驗。',
        specs: ['Intel i7-14700K', 'RTX 4070 Ti Super', '32GB DDR5 6000', '2TB Gen4 SSD', '850W 金牌電源'],
      },
    ],
    creator: [
      {
        id: 'creator-1',
        name: 'CryPC Studio 創作者版',
        price: 45900,
        category: Category.OTHERS, // Changed from PREBUILT to OTHERS
        image: 'https://picsum.photos/400/400?random=105',
        description: '影片剪輯、3D建模入門，穩定高效。',
        specs: ['AMD R9 7900X', 'RTX 4060 Ti 16G', '64GB DDR5 5600', '2TB Gen4 SSD', '750W 金牌電源'],
      },
      {
        id: 'creator-2',
        name: 'CryPC Workstation 工作站',
        price: 88000,
        category: Category.OTHERS, // Changed from PREBUILT to OTHERS
        image: 'https://picsum.photos/400/400?random=106',
        description: '工業級渲染、AI運算，極致生產力工具。',
        specs: ['Intel i9-14900K', 'RTX 4090 24G', '128GB DDR5 5600', '4TB Gen4 SSD', '1200W 白金電源'],
      },
    ],
  };

  const galleryImages = [1, 2, 3, 4, 5, 6].map(i => `https://picsum.photos/600/400?random=${200 + i}`);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      {/* Header */}
      <div className="bg-white py-10 md:py-16 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">DIY 主機專區</h1>
          <p className="text-base md:text-xl text-gray-500">
            無論是文書、電競還是創作，我們都準備了最佳配置。
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-[#F5F5F7]/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto hide-scrollbar pb-1">
          <div className="flex justify-center min-w-max p-2 space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {activeTab === 'custom' ? (
          // Custom Spray Painting Content
          <div className="space-y-12">
            <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
              <div className="lg:w-1/2 space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">客製化機殼噴圖服務</h2>
                <p className="text-gray-500 leading-relaxed text-base md:text-lg">
                  想要一台獨一無二的主機？我們的專業噴漆團隊能將您的想像化為現實。
                  從動漫角色、科幻圖騰到極簡幾何，我們提供最高品質的耐熱噴漆與細緻工藝。
                </p>
                <ul className="space-y-3">
                  {['進口耐熱塗料，持久不掉色', '專業設計師 1對1 討論', '支援全機或局部客製', '提供 3D 模擬預覽'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                      <Check className="h-5 w-5 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2">
                  預約諮詢 <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <div className="lg:w-1/2 w-full">
                <img 
                  src="https://picsum.photos/800/600?random=999" 
                  alt="Custom Spray Work" 
                  className="rounded-2xl shadow-lg w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">作品集錦</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="group relative aspect-video overflow-hidden rounded-2xl bg-gray-200">
                    <img src={img} alt={`Gallery ${idx}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold border border-white px-4 py-2 rounded-full">查看詳情</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Host Lists (Document, Gaming, Creator)
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {prebuiltHosts[activeTab as keyof typeof prebuiltHosts]?.map((host) => (
              <div key={host.id} className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* Image: Banner on mobile (h-56), Square on Desktop (aspect-square) */}
                <div className="w-full h-56 md:h-auto md:w-1/2 md:aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center relative group flex-shrink-0">
                  <img src={host.image} alt={host.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{host.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{host.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {host.specs?.map((spec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                          <span className="line-clamp-1">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-xl md:text-2xl font-bold text-gray-900">NT$ {host.price.toLocaleString()}</span>
                    <button 
                      onClick={() => addToCart(host)}
                      className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 active:scale-95"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Diy;
