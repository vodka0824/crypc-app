
export enum Category {
  CPU = '處理器',
  MB = '主機板',
  GPU = '顯示卡',
  RAM = '記憶體',
  SSD = '固態硬碟',
  CASE = '機殼',
  PSU = '電源供應器',
  COOLER = '散熱器(水冷)', // Renamed
  AIR_COOLER = '散熱器(風冷)', // New Category
  MONITOR = '螢幕',
  SOFTWARE = '軟體',
  OTHERS = '其它'
}

export interface ProductSpecs {
  brand?: string;       // 品牌 (Intel, AMD, ASUS...)
  socket?: string;      // 腳位 (LGA1700, AM5...)
  chipset?: string;     // 晶片組 (Z790, B760...)
  series?: string;      // 系列 (RTX 40, RX 7000...)
  vram?: string;        // 顯存 (24GB, 16GB...)
  type?: string;        // 類型 (DDR4, DDR5, ATX, MATX...)
  memoryType?: string;  // 記憶體支援 (DDR4, DDR5) - 用於主機板
  capacity?: string;    // 容量 (32GB, 1TB...)
  wattage?: string;     // 瓦數 (850W, 1000W...) - 用於 PSU 供電量
  efficiency?: string;  // 轉換效率 (80+ 金牌, 銅牌...) - 用於 PSU
  tdp?: string;         // TDP 功耗 (125W, 285W...) - 用於 CPU/GPU
  resolution?: string;  // 解析度 (螢幕)
  size?: string;        // 尺寸 (螢幕, 散熱器)
  refreshRate?: string; // 更新率 (螢幕)
  licenseType?: string; // 授權類型 (軟體)
  
  // New Fields
  radiatorSupport?: string; // 水冷排支援 (機殼)
  coolerHeight?: string;    // 散熱器高度/限高 (機殼, 散熱器)
  gpuLength?: string;       // 顯卡長度/限長 (機殼, 顯示卡)

  [key: string]: string | undefined; // Index signature allows dynamic access via string keys
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image?: string;       // Made optional as requested
  specs?: string[];     // 顯示在卡片上的簡略規格
  specDetails?: ProductSpecs; // 用於篩選的詳細規格數據
  discount?: number;
  lastUpdated?: number; // Timestamp
  popularity?: number;  // Used for ranking products (e.g. quick picks)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BuilderItem extends Product {
  uniqueId: string; // 用於區分同商品列表中的不同實例
  quantity: number;
}

export type BuildState = Record<Category, BuilderItem[]>;

// New interface for saving templates
export interface BuildTemplate {
  id: string;
  name: string;
  timestamp: number;
  items: { productId: string; quantity: number }[]; // Only store ID to fetch latest price on load
}
