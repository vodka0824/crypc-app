import React from 'react';
import { Award, Users, Smile, Clock } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">關於 哭PC</h1>
        <p className="text-xl text-gray-500">不只是一台電腦，更是一種極致的生活態度。</p>
      </div>

      <div className="prose prose-lg mx-auto text-gray-600 mb-20">
        <p>
          成立於 2024 年，哭PC (CryPC) 致力於打破傳統電腦商場的雜亂形象。我們相信，購買高性能電腦不應該是一個充滿術語和不確定性的過程。
        </p>
        <p>
          我們的團隊由一群熱愛硬體、遊戲與設計的狂熱份子組成。我們採用極簡主義的美學設計，結合頂級的硬體規格，為您打造內外兼修的完美主機。無論您是追求極致幀數的電競玩家，還是需要穩定輸出的專業創作者，我們都懂您的需求。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <Award className="h-8 w-8 text-black mb-4" />
           <h3 className="text-xl font-bold mb-2">職人精神</h3>
           <p className="text-gray-500">每一台主機都由資深技師手工組裝，整線近乎苛求，確保散熱與美觀的最佳平衡。</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <Clock className="h-8 w-8 text-black mb-4" />
           <h3 className="text-xl font-bold mb-2">24H 支援</h3>
           <p className="text-gray-500">即使是深夜，我們的線上客服與技術支援團隊依然隨時待命（全天候客服支援）。</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <Smile className="h-8 w-8 text-black mb-4" />
           <h3 className="text-xl font-bold mb-2">無卡分期</h3>
           <p className="text-gray-500">與多家融資公司合作，提供低門檻的無卡分期服務，學生、自由接案者皆可申請。</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <Users className="h-8 w-8 text-black mb-4" />
           <h3 className="text-xl font-bold mb-2">社群連結</h3>
           <p className="text-gray-500">定期舉辦線下聚會與線上抽獎，不只是買賣，更是朋友。</p>
        </div>
      </div>
    </div>
  );
};

export default About;