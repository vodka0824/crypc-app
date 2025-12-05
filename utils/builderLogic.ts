
import { Product, Category, BuildState, BuilderItem } from '../types';

export const parseWattage = (val?: string): number => {
  if (!val) return 0;
  const match = val.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
};

export const parseDimension = (val?: string): number => {
  if (!val) return 9999;
  const match = val.match(/(\d+)/);
  return match ? parseInt(match[0]) : 9999;
};

export const checkCompatibility = (item: Product, build: BuildState): string | null => {
    const primaryCpu = build[Category.CPU]?.[0];
    const primaryMb = build[Category.MB]?.[0];
    const primaryRam = build[Category.RAM]?.[0];
    const primaryCase = build[Category.CASE]?.[0];
    const primaryGpu = build[Category.GPU]?.[0];
    const primaryAirCooler = build[Category.AIR_COOLER]?.[0];

    // 1. MB Checks
    if (item.category === Category.MB) {
        if (primaryCpu?.specDetails?.socket && item.specDetails?.socket !== primaryCpu.specDetails.socket) {
            return `腳位不符: CPU ${primaryCpu.specDetails.socket} vs MB ${item.specDetails?.socket}`;
        }
        if (primaryRam?.specDetails?.type && item.specDetails?.memoryType) {
            if (primaryRam.specDetails.type !== item.specDetails.memoryType) {
                return `記憶體不符: RAM ${primaryRam.specDetails.type} vs MB 支援 ${item.specDetails.memoryType}`;
            }
        }
    }

    // 2. CPU Checks
    if (item.category === Category.CPU && primaryMb?.specDetails?.socket) {
      if (item.specDetails?.socket !== primaryMb.specDetails.socket) {
        return `腳位不符: MB ${primaryMb.specDetails.socket} vs CPU ${item.specDetails?.socket}`;
      }
    }

    // 3. RAM Checks
    if (item.category === Category.RAM) {
        if (primaryMb?.specDetails?.memoryType && item.specDetails?.type !== primaryMb.specDetails.memoryType) {
             return `記憶體不符: MB 支援 ${primaryMb.specDetails.memoryType} vs RAM ${item.specDetails?.type}`;
        }
        const otherRam = build[Category.RAM]?.find((r: BuilderItem) => r.id !== item.id);
        if (otherRam && otherRam.specDetails?.type !== item.specDetails?.type) {
             return `混插警告: ${otherRam.specDetails?.type} 與 ${item.specDetails?.type}`;
        }
    }

    // 4. Physical Size Checks (GPU vs Case)
    if (item.category === Category.GPU && primaryCase?.specDetails?.gpuLength) {
        const caseLimit = parseDimension(primaryCase.specDetails.gpuLength);
        const gpuLen = parseDimension(item.specDetails?.gpuLength);
        if (gpuLen > caseLimit) {
            return `顯卡過長: 卡 ${gpuLen}mm > 機殼限 ${caseLimit}mm`;
        }
    }
    if (item.category === Category.CASE && primaryGpu?.specDetails?.gpuLength) {
        const caseLimit = parseDimension(item.specDetails?.gpuLength);
        const gpuLen = parseDimension(primaryGpu.specDetails.gpuLength);
        if (gpuLen > caseLimit) {
            return `機殼過小: 限長 ${caseLimit}mm < 顯卡 ${gpuLen}mm`;
        }
    }

    // 5. Physical Size Checks (Air Cooler vs Case)
    if (item.category === Category.AIR_COOLER && primaryCase?.specDetails?.coolerHeight) {
        const caseLimit = parseDimension(primaryCase.specDetails.coolerHeight);
        const coolerH = parseDimension(item.specDetails?.coolerHeight);
        if (coolerH > caseLimit) {
            return `散熱器過高: 高 ${coolerH}mm > 機殼限 ${caseLimit}mm`;
        }
    }
    if (item.category === Category.CASE && primaryAirCooler?.specDetails?.coolerHeight) {
        const caseLimit = parseDimension(item.specDetails?.coolerHeight);
        const coolerH = parseDimension(primaryAirCooler.specDetails.coolerHeight);
        if (coolerH > caseLimit) {
            return `機殼過窄: 限高 ${caseLimit}mm < 散熱器 ${coolerH}mm`;
        }
    }
    
    return null;
};
