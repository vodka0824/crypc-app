import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, PenTool, Cpu, Recycle, ChevronLeft, ChevronRight } from 'lucide-react';
import GeminiAdvisor from '../components/GeminiAdvisor';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1920", // Minimalist Setup
      title: "極致效能，極簡美學。",
      subtitle: "為您打造獨一無二的專屬主機。專業組裝，無卡分期，讓夢想規格觸手可及。",
      buttonText: "開始自選估價",
      link: "/"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&q=80&w=1920", // Gaming RGB
      title: "主宰戰場，生而為贏。",
      subtitle: "搭載最新 RTX 40 系列顯卡，體驗光線追蹤的極致視覺饗宴。",
      buttonText: "查看電競主機",
      link: "/diy?tab=gaming"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=1920", // Creator Studio
      title: "靈感湧現，無縫創作。",
      subtitle: "專為設計師與創作者優化。強大的多工處理能力，讓創意不再等待。",
      buttonText: "創作者專區",
      link: "/diy?tab=creator"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 md:space-y-20 pb-20">
      {/* Hero Carousel Section */}
      <section className="relative h-[80vh] md:h-[85vh] bg-black overflow-hidden">
        {/* Background Images with Cross-fade */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform scale-105"
            />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl mx-auto space-y-6 md:space-y-8">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`transition-all duration-700 transform ${
                  index === currentSlide 
                    ? 'opacity-100 translate-y-0 delay-300' 
                    : 'opacity-0 translate-y-8 absolute inset-0 flex flex-col items-center justify-center pointer-events-none'
                }`}
                style={{ display: index === currentSlide ? 'block' : 'none' }} // Prevent layout shift from absolute positioning logic above
              >
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-4 md:mb-6 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light mb-6 md:mb-8 drop-shadow-md px-2">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 md:pt-4">
                  <Link 
                    to={slide.link} 
                    className="px-6 py-3.5 md:px-8 md:py-4 bg-white text-black rounded-full font-medium text-base md:text-lg hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {slide.buttonText} <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-30 flex justify-center gap-2 md:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 md:w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* DIY Categories Section (Redesigned with Images) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">DIY 主機系列</h2>
          <p className="text-sm md:text-base text-gray-500">針對不同需求量身打造的精選方案</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { 
              title: '文書主機', 
              desc: '高效辦公，穩定耐用', 
              image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800', // Bright clean desk
              link: '/diy?tab=office' 
            },
            { 
              title: '電競主機', 
              desc: '極致幀數，稱霸戰場', 
              image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800', // Gaming setup
              link: '/diy?tab=gaming' 
            },
            { 
              title: '創作者主機', 
              desc: '多工運算，靈感不間斷', 
              image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', // Creative workspace
              link: '/diy?tab=creator' 
            },
            { 
              title: '客製化噴圖', 
              desc: '獨一無二，展現自我', 
              image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800', // Neon/Artistic
              link: '/diy?tab=custom' 
            },
          ].map((item, idx) => (
            <Link 
              key={idx} 
              to={item.link} 
              className="group relative h-64 md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
               {/* Background Image */}
               <img 
                 src={item.image} 
                 alt={item.title}
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

               {/* Content */}
               <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                 <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{item.title}</h3>
                 <div className="overflow-hidden max-h-20 transition-all duration-500 ease-in-out">
                    <p className="text-gray-300 text-xs md:text-sm mb-2 md:mb-4 opacity-90">{item.desc}</p>
                 </div>
                 <div className="flex items-center text-white font-medium text-xs md:text-sm gap-2 mt-1">
                   前往專區 <ArrowRight className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
                 </div>
               </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Slider (Horizontal Scroll) */}
      <section className="max-w-7xl mx-auto px-4 relative group">
        <div className="flex justify-between items-end mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">限時優惠主機</h2>
            <Link to="/diy" className="text-sm md:text-base text-blue-600 hover:underline">查看全部</Link>
        </div>
        
        {/* Navigation Buttons for PC */}
        <button 
            onClick={scrollLeft}
            className="absolute left-2 top-[60%] -translate-y-1/2 z-10 p-3 bg-white/90 shadow-lg rounded-full border border-gray-100 text-gray-700 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
            onClick={scrollRight}
            className="absolute right-2 top-[60%] -translate-y-1/2 z-10 p-3 bg-white/90 shadow-lg rounded-full border border-gray-100 text-gray-700 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
            <ChevronRight className="h-6 w-6" />
        </button>

        <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 md:gap-6 pb-8 hide-scrollbar snap-x scroll-smooth">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-72 md:w-96 snap-center bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group/card">
                    <div className="relative h-48 md:h-56 mb-4 md:mb-6 overflow-hidden rounded-2xl bg-gray-100">
                         <img src={`https://picsum.photos/400/300?random=${i}`} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" alt="Promo PC" />
                         <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">限時 9 折</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">極速創作者 Pro {i}</h3>
                    <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4">i9-14900K / RTX 4090 / 64G RAM</p>
                    <div className="flex justify-between items-center">
                        <span className="text-xl md:text-2xl font-bold text-gray-900">NT$ 85,000</span>
                        <span className="text-xs md:text-sm text-gray-400 line-through">NT$ 95,000</span>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-16 text-gray-900">為什麼選擇 哭PC？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[
                    { icon: CreditCard, title: '靈活分期', desc: '支持信用卡與無卡分期，輕鬆擁有。' },
                    { icon: Cpu, title: '專業組裝', desc: '整線美觀，嚴格燒機測試，品質保證。' },
                    { icon: PenTool, title: '客製化機殼', desc: '獨家噴圖技術，打造您的個性外觀。' },
                    { icon: Recycle, title: '舊機回收', desc: '高價回收舊電腦，換新機更划算。' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full mb-4 md:mb-6">
                            <item.icon className="h-5 w-5 md:h-6 md:w-6 text-gray-900" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{item.title}</h3>
                        <p className="text-sm md:text-base text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="max-w-5xl mx-auto px-4">
          <GeminiAdvisor />
      </section>

    </div>
  );
};

export default Home;