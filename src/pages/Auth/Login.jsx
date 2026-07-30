import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../firebase';
import { Wallet, TrendingUp, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
 const [form, setForm] = useState({ email: '', password: '' });
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
   await loginUser(form.email, form.password);
   navigate('/');
  } catch (err) {
   alert(err.message);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center p-5 bg-[#F8FDF9]">
   <div className="w-full max-w-[400px]">
    <div className="text-center mb-8">
     <div className="w-16 h-16 gradient-primary rounded-2xl mx-auto flex items-center justify-center shadow-premium mb-4">
      <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
     </div>
     <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Welcome Back</h1>
     <p className="text-[13px] text-slate-500 font-medium mt-1 flex items-center justify-center gap-1.5">
      <ShieldCheck className="w-4 h-4 text-[#0FB86F]" /> Secure Login • CASIO Premium
     </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-slate-200 rounded-[24px] p-6 shadow-card">
     <div className="space-y-3">
      <div className="relative">
       <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
       <input 
        className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium placeholder:text-slate-400" 
        placeholder="Email Address" 
        type="email" 
        value={form.email} 
        onChange={e=>setForm({...form,email:e.target.value})} 
        required 
       />
      </div>
      <div className="relative">
       <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
       <input 
        className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium placeholder:text-slate-400" 
        placeholder="Password" 
        type="password" 
        value={form.password} 
        onChange={e=>setForm({...form,password:e.target.value})} 
        required 
       />
      </div>
     </div>

     <button disabled={loading} className="w-full gradient-primary py-3.5 rounded-xl font-bold text-sm text-white shadow-premium hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
      {loading ? (
       <>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Signing In...
       </>
      ) : (
       <>
        Login to Account <ArrowRight className="w-4 h-4" />
       </>
      )}
     </button>

     <div className="text-center space-y-3 pt-2">
      <p className="text-[13px] text-slate-600 font-medium">No account yet? <Link to="/register" className="text-[#0FB86F] font-bold hover:underline">Create Account</Link></p>
      <div className="h-px bg-slate-100"></div>
      <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 font-semibold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
       <ShieldCheck className="w-3 h-3" /> Admin Portal
      </Link>
     </div>
    </form>

    <div className="mt-6 bg-white border border-amber-200 rounded-2xl p-3 flex gap-2.5">
     <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
      <ShieldCheck className="w-4 h-4 text-amber-600" />
     </div>
     <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
      <span className="font-bold text-slate-900">Live Mode:</span> This is a real money educational platform. No real transactions.
     </p>
    </div>
   </div>
  </div>
 );
}
