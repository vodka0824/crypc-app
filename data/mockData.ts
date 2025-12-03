
import { Category, Product, ProductSpecs } from '../types';

// --- Filter Configuration ---
export type FilterConfig = {
  key: keyof ProductSpecs;
  label: string;
};

export const categoryFilters: Record<string, FilterConfig[]> = {
  [Category.CPU]: [
    { key: 'brand', label: '處理器品牌' },
    { key: 'socket', label: 'CPU 腳位' },
    { key: 'chipset', label: '主機板晶片組' },
    { key: 'tdp', label: 'TDP 功耗' },
  ],
  [Category.MB]: [
    { key: 'brand', label: '品牌' },
    { key: 'socket', label: 'CPU 腳位' },
    { key: 'chipset', label: '晶片組' },
    { key: 'memoryType', label: '記憶體規格' },
    { key: 'type', label: '尺寸規格' },
  ],
  [Category.GPU]: [
    { key: 'brand', label: '晶片廠商' },
    { key: 'series', label: '顯卡系列' },
    { key: 'vram', label: '記憶體容量' },
    { key: 'gpuLength', label: '顯卡長度' }, // New
    { key: 'tdp', label: 'TDP 功耗' },
  ],
  [Category.RAM]: [
    { key: 'type', label: '記憶體規格' },
    { key: 'capacity', label: '總容量' },
  ],
  [Category.SSD]: [
    { key: 'capacity', label: '容量' },
    { key: 'type', label: '介面' },
  ],
  [Category.CASE]: [
    { key: 'brand', label: '品牌' },
    { key: 'type', label: '尺寸' },
    { key: 'radiatorSupport', label: '水冷排支援' }, // New
    { key: 'coolerHeight', label: '散熱器高度' }, // New (Max height)
    { key: 'gpuLength', label: '顯卡長度' }, // New (Max length)
  ],
  [Category.PSU]: [
    { key: 'wattage', label: '瓦數' },
    { key: 'efficiency', label: '轉換效率' },
    { key: 'brand', label: '品牌' },
  ],
  [Category.COOLER]: [
    { key: 'type', label: '散熱類型' },
    { key: 'size', label: '尺寸' },
    { key: 'brand', label: '品牌' },
  ],
  [Category.AIR_COOLER]: [ // New Category Filters
    { key: 'brand', label: '品牌' },
    { key: 'coolerHeight', label: '高度' },
    { key: 'socket', label: '支援腳位' },
  ],
  [Category.MONITOR]: [
    { key: 'brand', label: '品牌' },
    { key: 'resolution', label: '解析度' },
    { key: 'panelType', label: '面板型態' }, // Added
    { key: 'size', label: '尺寸' },
    { key: 'refreshRate', label: '更新率' },
  ],
  [Category.SOFTWARE]: [
    { key: 'brand', label: '發行商' },
    { key: 'licenseType', label: '授權類型' },
  ],
  [Category.OTHERS]: [], // No specific filters for OTHERS
};

export const categoryDisplayMap: Record<string, string> = {
  [Category.CPU]: 'CPU 處理器',
  [Category.MB]: 'MB 主機板',
  [Category.GPU]: 'GPU 顯示卡',
  [Category.RAM]: 'RAM 記憶體',
  [Category.SSD]: 'SSD 固態硬碟',
  [Category.CASE]: 'CASE 機殼',
  [Category.PSU]: 'PSU 電源供應',
  [Category.COOLER]: '水冷散熱器',
  [Category.AIR_COOLER]: '風冷散熱器',
  [Category.MONITOR]: 'MONITOR 螢幕',
  [Category.SOFTWARE]: 'SOFTWARE 軟體',
  [Category.OTHERS]: '其它商品',
};

// --- Mock Products Data ---
export const initialProducts: Product[] = [
  // CPU - Intel
  { 
    id: 'cpu-1', name: 'Intel i9-14900K', price: 19800, category: Category.CPU, description: '24核/32緒 3.2G(↑6.0G)/36M/UHD770/125W', image: '', 
    specDetails: { brand: 'Intel', socket: 'LGA1700', chipset: 'Z790', tdp: '125W' } 
  },
  { 
    id: 'cpu-2', name: 'Intel i7-14700K', price: 14500, category: Category.CPU, description: '20核/28緒 3.4G(↑5.6G)/33M/UHD770/125W', image: '', 
    specDetails: { brand: 'Intel', socket: 'LGA1700', chipset: 'Z790', tdp: '125W' } 
  },
  { 
    id: 'cpu-3', name: 'Intel i5-12400F', price: 4200, category: Category.CPU, description: '6核/12緒 2.5G(↑4.4G)/18M/無內顯/65W', image: '', 
    specDetails: { brand: 'Intel', socket: 'LGA1700', chipset: 'B760', tdp: '65W' } 
  },
  // CPU - AMD
  { 
    id: 'cpu-4', name: 'AMD Ryzen 9 7950X', price: 18500, category: Category.CPU, description: '16核/32緒 4.5G(↑5.7G)/64M/RDNA2/170W', image: '', 
    specDetails: { brand: 'AMD', socket: 'AM5', chipset: 'X670', tdp: '170W' } 
  },
  { 
    id: 'cpu-5', name: 'AMD Ryzen 7 7800X3D', price: 13800, category: Category.CPU, description: '8核/16緒 4.2G(↑5.0G)/96M/RDNA2/120W', image: '', 
    specDetails: { brand: 'AMD', socket: 'AM5', chipset: 'B650', tdp: '120W' } 
  },
  // Motherboards (MB)
  {
    id: 'mb-1', name: 'ASUS ROG MAXIMUS Z790 HERO', price: 19990, category: Category.MB, description: 'LGA1700/DDR5/ATX/Wi-Fi 6E/5G LAN/雷電4', image: '',
    specDetails: { brand: 'ASUS', socket: 'LGA1700', chipset: 'Z790', type: 'ATX', memoryType: 'DDR5' }
  },
  {
    id: 'mb-2', name: 'Gigabyte B760M AORUS ELITE', price: 5490, category: Category.MB, description: 'LGA1700/DDR4/mATX/2.5G LAN/12+1+1相', image: '',
    specDetails: { brand: 'Gigabyte', socket: 'LGA1700', chipset: 'B760', type: 'MATX', memoryType: 'DDR4' }
  },
  {
    id: 'mb-3', name: 'MSI MAG X670E TOMAHAWK', price: 9990, category: Category.MB, description: 'AM5/DDR5/ATX/Wi-Fi 6E/2.5G LAN', image: '',
    specDetails: { brand: 'MSI', socket: 'AM5', chipset: 'X670', type: 'ATX', memoryType: 'DDR5' }
  },
  {
    id: 'mb-4', name: 'ASUS TUF GAMING B650-PLUS', price: 6290, category: Category.MB, description: 'AM5/DDR5/ATX/2.5G LAN/軍規用料', image: '',
    specDetails: { brand: 'ASUS', socket: 'AM5', chipset: 'B650', type: 'ATX', memoryType: 'DDR5' }
  },
  // GPU
  { 
    id: 'gpu-1', name: 'ASUS ROG RTX 4090 O24G', price: 62000, category: Category.GPU, description: '24G GDDR6X/35.8cm/三風扇/3.5 slot', image: '', 
    specDetails: { brand: 'NVIDIA', series: 'RTX 40 Series', vram: '24GB', tdp: '450W', gpuLength: '358mm' } 
  },
  { 
    id: 'gpu-2', name: 'Gigabyte RTX 4060 Eagle OC', price: 10990, category: Category.GPU, description: '8G GDDR6/24.2cm/三風扇/雙槽', image: '', 
    specDetails: { brand: 'NVIDIA', series: 'RTX 40 Series', vram: '8GB', tdp: '115W', gpuLength: '242mm' } 
  },
  // RAM
  { 
    id: 'ram-1', name: 'G.SKILL Trident Z5 RGB', price: 4500, category: Category.RAM, description: '32GB(16Gx2) DDR5-6000/CL30/黑銀', image: '', 
    specDetails: { type: 'DDR5', capacity: '32GB' } 
  },
  { 
    id: 'ram-2', name: 'Kingston Fury Beast', price: 1600, category: Category.RAM, description: '16GB(8Gx2) DDR4-3200/CL16/黑', image: '', 
    specDetails: { type: 'DDR4', capacity: '16GB' } 
  },
  // SSD
  { 
    id: 'ssd-1', name: 'Samsung 990 PRO 2TB', price: 5800, category: Category.SSD, description: 'M.2 PCIe 4.0/讀:7450M/寫:6900M/TLC', image: '', 
    specDetails: { capacity: '2TB', type: 'M.2 NVMe' } 
  },
  // Case (Updated with new fields)
  { 
    id: 'case-1', name: 'NZXT H9 Flow', price: 5990, category: Category.CASE, description: '雙艙/全景透側/ATX/內附風扇x4/白', image: 'https://picsum.photos/300/300?random=16', 
    specDetails: { brand: 'NZXT', type: 'ATX', radiatorSupport: '360mm', coolerHeight: '165mm', gpuLength: '435mm' } 
  },
  // PSU
  { 
    id: 'psu-1', name: 'Seasonic Vertex GX-1000', price: 6490, category: Category.PSU, description: '1000W/金牌/全模組/ATX3.0/10年保', image: '', 
    specDetails: { wattage: '1000W', brand: 'Seasonic', efficiency: '金牌' } 
  },
  // Cooler (Liquid)
  { 
    id: 'cooler-1', name: 'NZXT Kraken Elite 360', price: 9990, category: Category.COOLER, description: '360mm/2.36吋LCD/FDB風扇/6年保', image: '', 
    specDetails: { type: '水冷', brand: 'NZXT', size: '360mm', coolerHeight: '52mm' } 
  },
  // Air Cooler (New Mock Item)
  {
    id: 'ac-1', name: 'Noctua NH-D15', price: 3690, category: Category.AIR_COOLER, description: '雙塔/雙扇/6導管/高相容性', image: '',
    specDetails: { brand: 'Noctua', coolerHeight: '165mm', socket: 'LGA1700, AM5' }
  },
  // Monitor
  {
    id: 'mon-1', name: 'ASUS ROG Swift OLED PG27AQDM', price: 29900, category: Category.MONITOR, description: '27吋/2K/OLED/240Hz/0.03ms', image: '',
    specDetails: { brand: 'ASUS', size: '27"', resolution: '2K', panelType: '平面', refreshRate: '240Hz' }
  },
  {
    id: 'mon-2', name: 'BenQ GW2480 Plus', price: 3288, category: Category.MONITOR, description: '24吋/FHD/IPS/光智慧/護眼', image: '',
    specDetails: { brand: 'BenQ', size: '24"', resolution: 'FHD', panelType: '平面', refreshRate: '60Hz' }
  },
  {
    id: 'mon-3', name: 'Samsung Odyssey G5', price: 7990, category: Category.MONITOR, description: '32吋/2K/1000R/165Hz/1ms', image: '',
    specDetails: { brand: 'Samsung', size: '32"', resolution: '2K', panelType: '曲面', refreshRate: '165Hz' }
  },
  // Software
  {
    id: 'sw-1', name: 'Windows 11 Home 家用隨機版', price: 3990, category: Category.SOFTWARE, description: '64位元/繁體中文', image: '',
    specDetails: { brand: 'Microsoft', licenseType: 'OEM' }
  },
  {
    id: 'sw-2', name: 'Office 2021 家用版', price: 4390, category: Category.SOFTWARE, description: '買斷型/Word,Excel,PowerPoint', image: '',
    specDetails: { brand: 'Microsoft', licenseType: 'Retail' }
  }
];
