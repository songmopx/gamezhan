
import React, { useState } from 'react';
import { SelectionMode, HistoryItem, RandomConfig } from './types';
import { generateNumericResult, generateOptionResult, generateDivinationSeed } from './utils/randomLogic';
import { getFateInsight, getDivinationInterpretation } from './services/geminiService';
import { TRIGRAMS, HEXAGRAMS, getLineName } from './data/ichingData';
import MillisecondTicker from './components/MillisecondTicker';

// Icons
const DiceIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h.01M15 15h.01M9 15h.01M15 9h.01M12 12h.01" />
  </svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4M4 19h4m9-15v4m-2-2h4m-5 14l-.623 2.489a2 2 0 01-1.921 1.511H5.731a2 2 0 01-1.921-1.512L3.187 19m14.532-4.5a2 2 0 01-1.921-1.512L15.187 10.5a2 2 0 011.921-1.512L18.72 10.5a2 2 0 011.921 1.512L22.253 14.5a2 2 0 01-1.921 1.512L18.72 16a2 2 0 01-1.011-.274L16.5 15z" />
  </svg>
);

const HexagramLine: React.FC<{ type: '1' | '0', isActive: boolean }> = ({ type, isActive }) => (
  <div className={`w-32 h-3 my-2 flex justify-between items-center transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'opacity-60'}`}>
    {type === '1' ? (
      <div className={`w-full h-full rounded-sm ${isActive ? 'bg-cyan-400' : 'bg-slate-400'}`} />
    ) : (
      <>
        <div className={`w-[45%] h-full rounded-sm ${isActive ? 'bg-cyan-400' : 'bg-slate-400'}`} />
        <div className={`w-[45%] h-full rounded-sm ${isActive ? 'bg-cyan-400' : 'bg-slate-400'}`} />
      </>
    )}
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<SelectionMode>(SelectionMode.NUMERIC);
  const [config, setConfig] = useState<RandomConfig>({
    min: 1, max: 100, options: ['喝奶茶', '吃火锅', '写代码', '睡觉', '打游戏']
  });
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [newOption, setNewOption] = useState('');
  const [userThought, setUserThought] = useState('');
  const [currentResult, setCurrentResult] = useState<HistoryItem | null>(null);

  const handleRandomize = async () => {
    if (isRolling) return;
    if (mode === SelectionMode.DIVINATION && !userThought.trim()) {
      alert("起卦需诚心，请输入您心中所问之事。");
      return;
    }

    setIsRolling(true);
    const msSeed = new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, 1000));

    let newItem: HistoryItem;

    if (mode === SelectionMode.DIVINATION) {
      const { seed1, seed2, seed3 } = generateDivinationSeed(msSeed);
      const binaryCode = seed2 + seed1; // Upper + Lower
      const guaName = HEXAGRAMS[binaryCode] || '未知之卦';
      const bitValue = parseInt(binaryCode[6 - seed3]);
      const lineName = getLineName(bitValue, seed3);

      newItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        mode,
        result: `${guaName} ${lineName}`,
        millisecondSeed: msSeed,
        thought: userThought,
        guaName,
        binaryCode,
        activeLine: seed3
      };

      setCurrentResult(newItem);
      setIsRolling(false);

      const insight = await getDivinationInterpretation(userThought, guaName, lineName, binaryCode);
      const itemWithInsight = { ...newItem, insight };
      setCurrentResult(itemWithInsight);
      setHistory(prev => [itemWithInsight, ...prev]);
      setUserThought(''); // Reset thought after divination
    } else {
      let resultValue: string | number;
      if (mode === SelectionMode.NUMERIC) {
        resultValue = generateNumericResult(config.min, config.max, msSeed);
      } else {
        resultValue = generateOptionResult(config.options, msSeed);
      }

      newItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        mode,
        result: resultValue,
        millisecondSeed: msSeed,
      };

      setCurrentResult(newItem);
      setIsRolling(false);

      const insight = await getFateInsight(resultValue, mode.toString(), msSeed);
      const itemWithInsight = { ...newItem, insight };
      setCurrentResult(itemWithInsight);
      setHistory(prev => [itemWithInsight, ...prev]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-100 p-4 md:p-8 selection:bg-cyan-500/30">
      <header className="w-full max-w-4xl flex flex-col items-center mb-10 text-center animate-in fade-in duration-1000">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-white to-indigo-400 bg-clip-text text-transparent mb-2">
          CHRONOS ORACLE
        </h1>
        <p className="text-slate-500 tracking-widest text-xs uppercase font-bold">Precision Entropy & Ancient Wisdom</p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span> 运算维度
            </h2>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: SelectionMode.NUMERIC, icon: <DiceIcon />, label: '数字' },
                { id: SelectionMode.OPTIONS, icon: <ListIcon />, label: '选择' },
                { id: SelectionMode.DIVINATION, icon: <SparklesIcon />, label: '卜卦' }
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                    mode === m.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}>
                  {m.icon}
                  <span className="mt-1 text-[10px] font-bold tracking-tighter">{m.label}</span>
                </button>
              ))}
            </div>

            {mode === SelectionMode.NUMERIC && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                <input type="number" value={config.min} onChange={e => setConfig(p => ({...p, min: parseInt(e.target.value)}))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none" placeholder="Min" />
                <input type="number" value={config.max} onChange={e => setConfig(p => ({...p, max: parseInt(e.target.value)}))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none" placeholder="Max" />
              </div>
            )}

            {mode === SelectionMode.OPTIONS && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                <div className="flex gap-2">
                  <input type="text" value={newOption} onChange={e => setNewOption(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setConfig(p => ({...p, options: [...p.options, newOption]})), setNewOption(''))} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none" placeholder="输入选项..." />
                  <button onClick={() => (setConfig(p => ({...p, options: [...p.options, newOption]})), setNewOption(''))} className="px-4 bg-slate-800 rounded-xl text-xs hover:bg-slate-700 transition-colors">添加</button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {config.options.map((o, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-slate-800/20 p-2 rounded-lg border border-slate-800/50">
                      <span className="truncate">{o}</span>
                      <button onClick={() => setConfig(p => ({...p, options: p.options.filter((_, idx) => idx !== i)}))} className="text-slate-600 hover:text-red-400">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === SelectionMode.DIVINATION && (
              <div className="animate-in fade-in slide-in-from-left-2">
                <textarea 
                  value={userThought}
                  onChange={e => setUserThought(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-cyan-500 transition-colors"
                  placeholder="诚心合掌，输入您心中所问之事... (例如：明天的面试结果如何？)"
                />
              </div>
            )}
          </div>
          <MillisecondTicker />
        </div>

        {/* Center: Result Display */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-8 min-h-[480px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-2xl">
            {isRolling ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]"></div>
                <p className="text-cyan-400 font-bold tracking-widest animate-pulse">正在捕捉时空熵...</p>
              </div>
            ) : currentResult ? (
              <div className="w-full text-center animate-in zoom-in duration-500">
                {currentResult.mode === SelectionMode.DIVINATION ? (
                  <div className="flex flex-col items-center">
                    <div className="mb-8 flex flex-col-reverse">
                      {currentResult.binaryCode?.split('').map((bit, idx) => (
                        <HexagramLine key={idx} type={bit as '1' | '0'} isActive={(6 - idx) === currentResult.activeLine} />
                      ))}
                    </div>
                    <h3 className="text-4xl font-black text-white mb-2">{currentResult.guaName}</h3>
                    <p className="text-cyan-400 font-bold mb-6">{getLineName(parseInt(currentResult.binaryCode![6 - currentResult.activeLine!]), currentResult.activeLine!)}</p>
                  </div>
                ) : (
                  <div className="mb-10">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest">捕捉结果</p>
                    <div className="text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{currentResult.result}</div>
                  </div>
                )}

                {currentResult.insight ? (
                  <div className="max-w-md mx-auto bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-[10px] text-cyan-500 font-black">ORACLE INSIGHT</div>
                    <p className="text-slate-300 text-sm italic leading-relaxed">“{currentResult.insight}”</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 text-xs animate-pulse">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div> 正在推演天机...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center opacity-40">
                <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon />
                </div>
                <p className="text-sm font-bold tracking-widest uppercase">等待启动</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleRandomize}
            disabled={isRolling}
            className={`w-full py-6 rounded-3xl font-black text-xl tracking-[0.2em] transition-all transform active:scale-95 shadow-xl ${
              isRolling ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-br from-cyan-400 to-indigo-600 hover:brightness-110 text-white'
            }`}>
            {mode === SelectionMode.DIVINATION ? '虔诚起卦' : '生成随机'}
          </button>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 h-[600px] flex flex-col backdrop-blur-xl">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">时光轴录</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {history.map(item => (
                <div key={item.id} className="p-4 bg-slate-800/20 border border-slate-800/50 rounded-2xl hover:bg-slate-800/40 transition-colors cursor-default group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold text-slate-600">.{item.millisecondSeed}MS</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${item.mode === SelectionMode.DIVINATION ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-700 text-slate-500'}`}>
                      {item.mode}
                    </span>
                  </div>
                  <div className="font-bold text-slate-200 text-sm mb-1">{item.result}</div>
                  {item.thought && <p className="text-[10px] text-slate-500 italic truncate mb-1">“{item.thought}”</p>}
                  <div className="text-[9px] text-slate-700">{new Date(item.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center py-20 text-[10px] text-slate-700 uppercase tracking-tighter">Empty Timeline</p>}
            </div>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="mt-4 text-[10px] text-slate-700 hover:text-red-400 font-bold transition-colors">CLEAR LOGS</button>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 text-slate-700 text-[10px] font-bold tracking-widest uppercase">
        Built with Precision Millisecond Entropy & Zhou Yi Wisdom
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
