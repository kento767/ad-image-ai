/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Edit3, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Layout, 
  Palette, 
  Type,
  ChevronRight,
  Menu,
  X,
  MousePointer2,
  Layers
} from 'lucide-react';

// --- Types ---
type Theme = 'modern' | 'brutal' | 'premium' | 'utility' | 'atmospheric' | 'organic' | 'pop';

// --- Components ---

const Navbar = ({ theme, onThemeChange }: { theme: Theme, onThemeChange: (t: Theme) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getNavStyles = () => {
    switch (theme) {
      case 'brutal': return 'bg-white border-b-4 border-black py-4';
      case 'premium': return 'bg-black/80 backdrop-blur-md border-b border-white/10 py-6 text-white';
      case 'atmospheric': return 'bg-transparent py-6 text-white';
      case 'organic': return 'bg-[#f5f5f0] py-6 text-[#5A5A40]';
      case 'utility': return 'bg-white border-b border-slate-100 py-3';
      case 'pop': return 'bg-[#FFD700] border-b-4 border-[#FF1493] py-4';
      default: return 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-4';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavStyles()}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'brutal' ? 'bg-lime-400 border-2 border-black' : 
            theme === 'premium' ? 'bg-white text-black' : 
            theme === 'atmospheric' ? 'bg-orange-500 text-white' :
            theme === 'organic' ? 'bg-[#5A5A40] text-white' :
            theme === 'utility' ? 'bg-slate-900 text-white rounded-md' :
            theme === 'pop' ? 'bg-[#FF1493] text-white rounded-full' :
            'bg-indigo-600 text-white'
          }`}>
            <Sparkles size={18} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${
            theme === 'premium' ? 'font-serif' : 
            theme === 'organic' ? 'font-organic text-2xl' :
            theme === 'pop' ? 'font-pop text-2xl text-[#FF1493]' :
            'font-display'
          }`}>
            広告画像AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex bg-slate-100/50 backdrop-blur-sm p-1 rounded-full border border-slate-200/20">
            {(['modern', 'brutal', 'premium', 'utility', 'atmospheric', 'organic', 'pop'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  theme === t 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : theme === 'atmospheric' || theme === 'premium' ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <a href="#" className="text-sm font-medium hover:opacity-70 transition-opacity">機能</a>
          <button className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            theme === 'brutal' ? 'bg-lime-400 border-2 border-black hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            theme === 'premium' ? 'bg-white text-black hover:bg-slate-200' :
            theme === 'atmospheric' ? 'bg-orange-600 text-white hover:bg-orange-700' :
            theme === 'organic' ? 'bg-[#5A5A40] text-white rounded-full' :
            theme === 'utility' ? 'bg-slate-900 text-white rounded-md' :
            theme === 'pop' ? 'bg-[#FF1493] text-white hover:scale-105 shadow-[0_4px_0_0_#C71585] active:translate-y-1 active:shadow-none' :
            'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>
            無料で始める
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

// --- Theme 1: Modern Tech ---
const ModernTheme = () => (
  <div className="pt-24 bg-slate-50 min-h-screen">
    {/* Hero */}
    <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-6">
          <Zap size={14} />
          <span>次世代の広告クリエイティブ</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
          テキストから<br />
          <span className="text-indigo-600">売れる広告</span>を<br />
          瞬時に生成。
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
          広告画像AIは、最新のAI技術を駆使して、あなたのビジネスに最適な広告画像を数秒で作成します。生成後の微調整もAIがサポート。
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 group">
            今すぐ無料で試す
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
            デモを見る
          </button>
        </div>

        {/* Prompt Demo */}
        <div className="mt-12 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">AIへの指示（プロンプト）</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-sm text-slate-600 italic">
              「都会のカフェでノートPCを開く20代女性、背景は少しぼかして、柔らかな朝の光」
            </div>
            <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <Zap size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
          <img 
            src="https://picsum.photos/seed/ad-tech/800/800" 
            alt="AI Generated Ad" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Floating UI elements */}
        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
            <p className="text-sm font-bold text-slate-900">生成完了</p>
          </div>
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[240px]">
          <div className="flex items-center gap-2 mb-3">
            <Edit3 size={16} className="text-indigo-600" />
            <span className="text-sm font-bold">AI編集モード</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-indigo-600"></div>
            </div>
            <p className="text-xs text-slate-500">「背景を夏らしく変更して」</p>
          </div>
        </div>
      </motion.div>
    </section>

    {/* Stats */}
    <section className="bg-white py-20 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: '生成画像数', value: '1,000,000+' },
          { label: '導入企業', value: '5,000+' },
          { label: 'コスト削減', value: '85%' },
          { label: '満足度', value: '98%' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// --- Theme 2: Brutalist Creative ---
const BrutalTheme = () => (
  <div className="pt-24 bg-white min-h-screen font-display">
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-12 gap-0 border-4 border-black">
        <div className="lg:col-span-7 p-8 lg:p-16 border-b-4 lg:border-b-0 lg:border-r-4 border-black">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-black text-white px-4 py-1 text-sm font-bold uppercase tracking-widest mb-8">
              No More Boring Ads
            </span>
            <h1 className="text-6xl lg:text-8xl font-black uppercase leading-[0.9] mb-8">
              AIで広告を<br />
              <span className="bg-lime-400 px-2">ハック</span>せよ。
            </h1>
            <p className="text-xl font-bold mb-12 max-w-md">
              デザインの知識は不要。言葉だけで、世界を驚かせるクリエイティブを生み出す。
            </p>
            <button className="w-full sm:w-auto px-12 py-6 bg-black text-white text-2xl font-black uppercase hover:bg-lime-400 hover:text-black transition-colors border-4 border-black shadow-[8px_8px_0px_0px_rgba(163,230,53,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
              Get Started Now
            </button>
          </motion.div>
        </div>
        
        <div className="lg:col-span-5 bg-lime-400 p-8 flex items-center justify-center overflow-hidden relative">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="relative z-10"
          >
            <div className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white p-2">
              <img 
                src="https://picsum.photos/seed/brutal-ad/600/800" 
                alt="Brutal AI Ad" 
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-8xl font-black opacity-10 select-none">01</div>
          <div className="absolute bottom-4 left-4 text-8xl font-black opacity-10 select-none">AI</div>
        </div>
      </div>

      {/* Marquee */}
      <div className="mt-20 overflow-hidden border-y-4 border-black py-4 bg-black text-white whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-20 text-4xl font-black uppercase"
        >
          {Array(10).fill(0).map((_, i) => (
            <span key={i} className="flex items-center gap-4">
              <Sparkles className="text-lime-400" />
              AI Generated Ads
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  </div>
);

// --- Theme 3: Premium Editorial ---
const PremiumTheme = () => (
  <div className="pt-24 bg-[#0a0a0a] text-white min-h-screen font-sans">
    <section className="max-w-7xl mx-auto px-6 py-20 min-h-[80vh] flex flex-col justify-center items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-xs uppercase tracking-[0.4em] text-white/40 mb-8 block">
          The Future of Creative Excellence
        </span>
        <h1 className="text-7xl lg:text-9xl font-serif italic font-light leading-tight mb-12">
          Artistry <span className="font-sans not-italic font-bold tracking-tighter">meets</span> Intelligence
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-16 font-light leading-relaxed">
          最高峰のAIが、あなたのビジョンを洗練された広告へと昇華させます。<br />
          美しさと成果、その両立を。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <button className="px-12 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-slate-200 transition-all">
            体験を開始する
          </button>
          <a href="#" className="group flex items-center gap-2 text-lg font-medium border-b border-white/20 pb-1 hover:border-white transition-all">
            ポートフォリオを見る
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </section>

    {/* Featured Image */}
    <section className="px-6 pb-32">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="aspect-[21/9] rounded-3xl overflow-hidden relative group"
        >
          <img 
            src="https://picsum.photos/seed/luxury-ad/1600/900" 
            alt="Luxury AI Ad" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-12">
            <div className="max-w-lg">
              <h3 className="text-3xl font-serif italic mb-4">緻密なディテール</h3>
              <p className="text-white/60">AIが生成する画像は、細部に至るまで完璧にコントロールされています。プロフェッショナルな品質を、あなたの手に。</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="bg-white text-black py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16">
          {[
            { icon: ImageIcon, title: '無限のバリエーション', desc: '一つのプロンプトから、何百もの異なるスタイルを生成。' },
            { icon: Edit3, title: '直感的なAI編集', desc: '部分的な変更やスタイルの統一も、AIとの対話で完結。' },
            { icon: Layout, title: '広告枠に最適化', desc: 'SNS、バナー、ポスターなど、あらゆるサイズに自動調整。' },
          ].map((f, i) => (
            <div key={i} className="space-y-6">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                <f.icon size={24} />
              </div>
              <h4 className="text-2xl font-bold">{f.title}</h4>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// --- Theme 4: Utility Minimal ---
const UtilityTheme = () => (
  <div className="pt-16 bg-[#f8f9fa] min-h-screen font-sans">
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-12 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              広告制作を、<br />もっとシンプルに。
            </h1>
            <p className="text-slate-500 mb-10 leading-relaxed">
              複雑なツールはもう不要です。広告画像AIは、直感的な操作と高度な自動化で、あなたのクリエイティブ業務を劇的に効率化します。
            </p>
            <div className="space-y-4 mb-10">
              {[
                '1クリックでサイズ展開',
                'AIによる自動キャッチコピー生成',
                'ブランドカラーの自動適用'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-slate-900">
                    <CheckCircle2 size={14} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
            <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              今すぐ試す
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="bg-slate-50 p-12 flex items-center justify-center border-l border-slate-100">
            <div className="w-full space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">Performance</span>
                  <span className="text-xs font-bold text-emerald-600">+24% CTR</span>
                </div>
                <div className="h-32 bg-slate-50 rounded-lg flex items-end gap-2 p-4">
                  {[40, 70, 45, 90, 65, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cost</p>
                  <p className="text-xl font-bold">-80%</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Speed</p>
                  <p className="text-xl font-bold">5sec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

// --- Theme 5: Atmospheric Immersive ---
const AtmosphericTheme = () => (
  <div className="min-h-screen bg-[#0a0502] text-white relative overflow-hidden font-sans">
    {/* Atmospheric Background */}
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
    </div>

    <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          想像を、現実に。
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-16 leading-relaxed">
          AIとの対話が、あなたのクリエイティビティを解き放つ。<br />
          言葉が形になり、広告が命を宿す瞬間を体験してください。
        </p>
        
        <div className="relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 p-2 rounded-2xl flex items-center gap-4">
            <div className="flex-1 px-6 py-4 text-left text-white/40 italic">
              「夕暮れの海辺で、光り輝く未来的なスニーカー...」
            </div>
            <button className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all">
              生成
            </button>
          </div>
        </div>
      </motion.div>
    </section>

    <section className="relative z-10 py-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">直感的なAI編集</h2>
            <p className="text-white/50 leading-relaxed">
              生成された画像の一部をなぞるだけで、AIがあなたの意図を汲み取り、自然に書き換えます。プロのレタッチャーが隣にいるような感覚を。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <MousePointer2 className="text-orange-500 mb-4" />
              <h4 className="font-bold mb-2">スマート選択</h4>
              <p className="text-xs text-white/40">対象物を自動認識し、瞬時に選択・編集。</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Layers className="text-indigo-500 mb-4" />
              <h4 className="font-bold mb-2">レイヤー管理</h4>
              <p className="text-xs text-white/40">AIが要素を分離。自由自在な配置が可能。</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-indigo-500/20 rounded-3xl blur-2xl"></div>
          <img 
            src="https://picsum.photos/seed/atmos-ad/800/800" 
            alt="Atmospheric AI Ad" 
            className="relative z-10 w-full h-full object-cover rounded-3xl border border-white/10"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </section>
  </div>
);

// --- Theme 6: Warm Organic ---
const OrganicTheme = () => (
  <div className="pt-24 bg-[#f5f5f0] min-h-screen font-organic text-[#5A5A40]">
    <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 space-y-8">
        <h1 className="text-6xl md:text-7xl font-medium leading-[1.1]">
          心地よい広告を、<br />
          <span className="italic">AIと共に。</span>
        </h1>
        <p className="text-xl leading-relaxed max-w-lg">
          デジタルな世界に、温もりを。広告画像AIは、ライフスタイルに寄り添う、ナチュラルで美しいクリエイティブを提案します。
        </p>
        <div className="pt-4">
          <button className="bg-[#5A5A40] text-white px-10 py-4 rounded-full text-lg font-medium hover:opacity-90 transition-all shadow-xl shadow-[#5A5A40]/20">
            はじめる
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="aspect-[3/4] rounded-[100px] overflow-hidden shadow-2xl rotate-3">
          <img 
            src="https://picsum.photos/seed/organic-ad/800/1000" 
            alt="Organic AI Ad" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full p-8 shadow-xl flex items-center justify-center text-center -rotate-6">
          <p className="text-sm font-bold leading-tight">
            100%<br />AI Generated<br />Artistry
          </p>
        </div>
      </div>
    </section>

    <section className="py-32 px-6 bg-white/50">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <h2 className="text-4xl font-medium italic">「らしさ」を大切にするAI</h2>
        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">ブランドの声を聴く</h4>
            <p className="leading-relaxed opacity-80">
              あなたのブランドが持つ独自の雰囲気や価値観をAIが理解し、一貫性のあるビジュアルを生成し続けます。
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">日常を美しく切り取る</h4>
            <p className="leading-relaxed opacity-80">
              作り込まれた広告感ではなく、人々の生活に自然に溶け込むような、ストーリー性のある画像を生成します。
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

// --- Theme 7: Pop Playful ---
const PopTheme = () => (
  <div className="pt-24 bg-[#FFD700] min-h-screen font-pop text-[#FF1493] overflow-hidden">
    <section className="max-w-7xl mx-auto px-6 py-20 relative">
      {/* Decorative Blobs */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-[#00CED1] rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF69B4] rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-6"
        >
          <div className="inline-block bg-[#FF1493] text-white px-6 py-2 rounded-full text-lg font-bold shadow-[0_4px_0_0_#C71585] rotate-[-2deg]">
            AIで、もっと楽しく！ ✨
          </div>
        </motion.div>

        <h1 className="text-7xl md:text-9xl font-black mb-8 leading-none tracking-tight drop-shadow-[0_8px_0_#FFFFFF]">
          POP IT UP!<br />
          <span className="text-white drop-shadow-[0_8px_0_#FF1493]">AI AD GEN</span>
        </h1>

        <p className="text-2xl md:text-3xl font-bold text-[#C71585] max-w-2xl mb-12">
          ワクワクする広告を、AIと一緒に作っちゃおう！<br />
          あなたの言葉が、カラフルな魔法に変わる。
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <button className="px-12 py-6 bg-[#FF1493] text-white text-3xl font-black rounded-full shadow-[0_8px_0_0_#C71585] hover:translate-y-1 hover:shadow-[0_4px_0_0_#C71585] active:translate-y-2 active:shadow-none transition-all">
            今すぐやってみる！
          </button>
        </div>
      </div>

      {/* Floating Stickers */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { color: '#00CED1', label: 'CUTE!', img: 'https://picsum.photos/seed/pop1/400/400' },
          { color: '#FF69B4', label: 'COOL!', img: 'https://picsum.photos/seed/pop2/400/400' },
          { color: '#ADFF2F', label: 'FUN!', img: 'https://picsum.photos/seed/pop3/400/400' },
          { color: '#FF4500', label: 'WOW!', img: 'https://picsum.photos/seed/pop4/400/400' },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
            className="relative group cursor-pointer"
          >
            <div className={`absolute inset-0 bg-[${item.color}] rounded-3xl rotate-3 group-hover:rotate-6 transition-transform`}></div>
            <div className="relative bg-white border-4 border-[#FF1493] rounded-3xl overflow-hidden shadow-xl">
              <img 
                src={item.img} 
                alt="Pop AI Ad" 
                className="w-full aspect-square object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 bg-white border-2 border-[#FF1493] px-3 py-1 rounded-full text-xs font-black">
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Feature Section */}
    <section className="bg-white py-32 border-y-8 border-[#FF1493]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1">
            <div className="w-full aspect-video bg-[#00CED1] rounded-[40px] border-8 border-[#FF1493] shadow-[20px_20px_0_0_#FF1493] flex items-center justify-center overflow-hidden">
              <img 
                src="https://picsum.photos/seed/pop-demo/800/450" 
                alt="Pop Demo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl font-black leading-tight">
              AI編集も、<br />
              <span className="text-[#00CED1]">お絵かき気分</span>で。
            </h2>
            <p className="text-xl font-bold text-slate-600">
              「ここをピンクにして！」「もっとキラキラさせて！」<br />
              AIに話しかけるだけで、あなたの画像がどんどん可愛くなるよ。
            </p>
            <ul className="space-y-4">
              {['スタンプ感覚で要素を追加', '一瞬で背景チェンジ', '文字入れもAIにおまかせ'].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-lg font-black">
                  <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center border-2 border-[#FF1493]">
                    <Sparkles size={16} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
);

// --- Main App ---

export default function App() {
  const [theme, setTheme] = useState<Theme>('modern');

  // Change title based on theme
  useEffect(() => {
    document.title = `広告画像AI | ${theme.charAt(0).toUpperCase() + theme.slice(1)} Preview`;
  }, [theme]);

  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar theme={theme} onThemeChange={setTheme} />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {theme === 'modern' && <ModernTheme />}
            {theme === 'brutal' && <BrutalTheme />}
            {theme === 'premium' && <PremiumTheme />}
            {theme === 'utility' && <UtilityTheme />}
            {theme === 'atmospheric' && <AtmosphericTheme />}
            {theme === 'organic' && <OrganicTheme />}
            {theme === 'pop' && <PopTheme />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Theme Switcher Floating UI */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-4 py-2 rounded-full flex items-center gap-4 shadow-2xl border border-white/50">
        <div className="flex gap-1">
          {(['modern', 'brutal', 'premium', 'utility', 'atmospheric', 'organic', 'pop'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                theme === t 
                  ? 'bg-slate-900 text-white scale-110 shadow-lg' 
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300'
              }`}
              title={t}
            >
              {t === 'modern' && <Layout size={16} />}
              {t === 'brutal' && <Palette size={16} />}
              {t === 'premium' && <Type size={16} />}
              {t === 'utility' && <Zap size={16} />}
              {t === 'atmospheric' && <Sparkles size={16} />}
              {t === 'organic' && <ImageIcon size={16} />}
              {t === 'pop' && <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Sparkles size={16} className="text-pink-500" /></motion.div>}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-20 px-6 ${theme === 'premium' ? 'bg-black text-white/40 border-t border-white/10' : 'bg-slate-900 text-slate-400'}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={24} className={theme === 'brutal' ? 'text-lime-400' : 'text-white'} />
              <span className={`text-2xl font-bold text-white ${theme === 'premium' ? 'font-serif' : 'font-display'}`}>広告画像AI</span>
            </div>
            <p className="max-w-sm mb-8">
              AIの力で、広告制作の常識を変える。より速く、より美しく、より効果的に。
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <ImageIcon size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <ImageIcon size={18} />
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">サービス</h5>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">画像生成</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI編集</a></li>
              <li><a href="#" className="hover:text-white transition-colors">テンプレート</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API連携</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">会社情報</h5>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">私たちについて</a></li>
              <li><a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
              <li><a href="#" className="hover:text-white transition-colors">利用規約</a></li>
              <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-xs">
          © 2026 広告画像AI Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
