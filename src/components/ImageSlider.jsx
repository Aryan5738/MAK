import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue } from '../firebase';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const fallbackBanners = [
 { 
  id: 1, 
  imageUrl: 'https://images.unsplash.com/photo-1559526324-4f8172775d11?w=800&auto=format&fit=crop&q=60', 
  title: 'Premium Investment Plans',
  subtitle: '₹200 Invest -> ₹1600 Return in 7 Days',
  badge: 'LIMITED OFFER'
 },
 { 
  id: 2, 
  imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60', 
  title: 'Daily Auto Profit Credit',
  subtitle: 'Har din automatic wallet me profit',
  badge: 'AUTO PAYOUT'
 },
 { 
  id: 3, 
  imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format&fit=crop&q=60', 
  title: 'Refer & Earn 20%',
  subtitle: 'Team banao, lifetime commission kamao',
  badge: '3 LEVEL MLM'
 },
];

export default function ImageSlider() {
 const [banners, setBanners] = useState(fallbackBanners);

 useEffect(() => {
  const bannerRef = ref(realtimeDb, 'banners');
  const unsub = onValue(bannerRef, (snap) => {
   if (snap.exists()) {
    const data = snap.val();
    const list = Object.entries(data).map(([id, val]) => ({ id, ...val, title: val.title || 'Premium Plan', subtitle: val.subtitle || 'Invest Now', badge: val.badge || 'HOT' }));
    if (list.length > 0) setBanners(list);
   }
  });
  return () => unsub();
 }, []);

 return (
  <div className="mx-4 mt-4 rounded-[20px] overflow-hidden shadow-card">
   <Swiper
    modules={[Autoplay, Pagination]}
    autoplay={{ delay: 3500, disableOnInteraction: false }}
    pagination={{ clickable: true, dynamicBullets: true }}
    loop={true}
    className="rounded-[20px]"
   >
    {banners.map((b) => (
     <SwiperSlide key={b.id}>
      <div className="relative h-[168px] w-full bg-slate-900 overflow-hidden">
       <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
       {/* Premium Overlay */}
       <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
       
       {/* Green Accent */}
       <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0FB86F] to-[#00E58F]"></div>
       
       {/* Content */}
       <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
         <div className="bg-[#0FB86F] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest flex items-center gap-1 shadow-lg">
          <Zap className="w-3 h-3" fill="white" />
          {b.badge}
         </div>
         <div className="w-8 h-8 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
         </div>
        </div>
        
        <div>
         <h3 className="font-black text-white text-[16px] leading-tight drop-shadow-sm flex items-center gap-2">
          {b.title}
          <ShieldCheck className="w-4 h-4 text-green-400" />
         </h3>
         <p className="text-[12px] text-white/80 mt-1 font-medium">{b.subtitle}</p>
         <div className="mt-3 flex items-center gap-2">
          <div className="bg-white text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
           Start Investing
           <div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center ml-1">
            <span className="text-white text-[10px]">↗</span>
           </div>
          </div>
          <span className="text-[10px] text-white/60 font-medium">Live Mode</span>
         </div>
        </div>
       </div>
      </div>
     </SwiperSlide>
    ))}
   </Swiper>
  </div>
 );
}
