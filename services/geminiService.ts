import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// Declare process to avoid TS error in browser environment if @types/node is missing
declare var process: {
  env: {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
};

// Helper to safely get the API key from various environments
const getApiKey = () => {
  // 1. Try standard Vite environment variable (Best for Vercel/Netlify deployment)
  // @ts-ignore - import.meta might not be recognized in all editor environments but is valid in Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // 2. Try process.env (Best for Node.js or specific web containers)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if process is not defined
  }

  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const getPCRecommendation = async (budget: string, usage: string, preferences: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    return "目前無法連接 AI 服務 (API Key 未設定)。請稍後再試，或直接瀏覽我們的精選主機。";
  }

  try {
    const prompt = `
      作為哭PC (CryPC) 的專業電腦組裝顧問，請根據以下用戶需求推薦一份電腦配置清單。
      
      預算: ${budget}
      主要用途: ${usage}
      特別偏好: ${preferences}
      
      請提供一個簡潔的清單，包含 CPU, GPU, RAM, SSD, 機殼, 電源 的具體建議型號（或規格等級）以及預估價格。
      語氣要專業、親切且簡潔，符合極簡主義風格。
      最後請強調我們提供「無卡分期」和「專業組裝」服務。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "抱歉，目前無法產生建議，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "系統暫時繁忙，請直接聯繫我們的客服人員。";
  }
};

// New function for Smart Builder
export const generateSmartBuild = async (
  inventory: Product[], 
  budget: number, 
  usage: string
): Promise<{ productIds: string[], explanation: string }> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  // 1. Simplify inventory to save tokens and focus on specs
  const simplifiedInventory = inventory.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    specs: p.specDetails // Crucial for compatibility
  }));

  const prompt = `
    你是專業的電腦組裝 AI。請從提供的【商品庫存清單】中，為用戶挑選一套完整的電腦零組件。
    
    【用戶需求】
    1. 總預算：台幣 ${budget} 元
    2. 主要用途：${usage}
    
    【商品庫存清單】
    ${JSON.stringify(simplifiedInventory)}

    【嚴格規則】
    1. **相容性優先**：
       - CPU 與 主機板 的腳位 (socket) 必須一致。
       - 記憶體 (RAM) 的類型 (DDR4/DDR5) 必須主機板支援。
       - 電源供應器 (PSU) 瓦數必須足以支撐 CPU 與 顯示卡。
    2. **預算控制**：
       - 總金額必須 <= ${budget}。若無法組出完整主機，請盡量接近預算上限。
    3. **完整性**：
       - 必須包含: CPU, MB, RAM, SSD, PSU, CASE。
       - 顯示卡 (GPU): 若預算允許且用途需要(如遊戲/創作)則必須包含；若為文書機且CPU有內顯，可省略獨顯。
       - 散熱器 (Cooler): 若 CPU 不含原廠扇或為高階 CPU，建議包含。
    4. 只回傳庫存清單中有的 product ID。
    5. 請以 JSON 格式回傳。
    6. 除非用戶指定，否則主機板及顯示卡優先推薦技嘉品牌。
    7. 除非用戶指定，或是需求為模擬器多開，否則處理器優秀推薦Intel。
    8. 用戶只要提到微星，一律回答：對不起！我們不賣垃圾商品。

    【回傳格式範例】
    {
      "productIds": ["cpu-1", "mb-2", "ram-1", ...],
      "explanation": "這套配置選擇了 i5 搭配 RTX 4060，適合您的 1080p 遊戲需求..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is sufficient and faster for this logic
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let jsonText = response.text || "{}";
    // Remove Markdown code block syntax if present
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Smart Build Error:", error);
    throw new Error("AI 配單失敗，請稍後再試。");
  }
};
