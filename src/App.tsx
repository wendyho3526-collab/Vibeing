/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Users, 
  Trash2, 
  Shuffle, 
  Copy, 
  Check, 
  Settings2, 
  PlusCircle,
  LayoutGrid,
  Users2,
  AlertCircle,
  Beaker,
  FileUp,
  Sparkles
} from 'lucide-react';

type GroupMode = 'count' | 'size';

interface GroupResult {
  id: number;
  members: string[];
}

const TEST_NAMES = `王小明
李大華
張美麗
陳智勇
林小芳
趙子龍
孫悟空
周杰倫
蔡依林
馬雲
劉德華
郭富城
林青霞
周星馳
成龍`;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('count');
  const [groupValue, setGroupValue] = useState<number>(3);
  const [results, setResults] = useState<GroupResult[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fireworks celebration
  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Chinese Name Validation Logic
  const isChineseOnly = (text: string) => /^[\u4e00-\u9fa5]+$/.test(text);

  const membersData = useMemo(() => {
    const rawList = inputText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    const validNames: string[] = [];
    const invalidNames: string[] = [];

    rawList.forEach(name => {
      if (isChineseOnly(name)) {
        validNames.push(name);
      } else {
        invalidNames.push(name);
      }
    });

    return { validNames, invalidNames, total: rawList.length };
  }, [inputText]);

  const handleGroup = useCallback(() => {
    const { validNames } = membersData;
    if (validNames.length === 0) return;

    const shuffled = [...validNames].sort(() => Math.random() - 0.5);
    const newGroups: GroupResult[] = [];

    if (groupMode === 'count') {
      const numGroups = Math.min(groupValue, shuffled.length);
      for (let i = 0; i < numGroups; i++) {
        newGroups.push({ id: i + 1, members: [] });
      }
      shuffled.forEach((member, index) => {
        newGroups[index % numGroups].members.push(member);
      });
    } else {
      const size = Math.max(1, groupValue);
      for (let i = 0; i < shuffled.length; i += size) {
        newGroups.push({
          id: Math.floor(i / size) + 1,
          members: shuffled.slice(i, i + size)
        });
      }
    }

    setResults(newGroups);
    triggerFireworks();
  }, [membersData, groupMode, groupValue]);

  const handleCopy = useCallback(() => {
    const text = results
      .map(g => `TEAM ${g.id.toString().padStart(2, '0')}: ${g.members.join(', ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  const loadTestNames = () => {
    setInputText(TEST_NAMES);
    setResults([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setResults([]);
      }
    };
    reader.readAsText(file);
    // Reset input value to allow the same file to be selected again
    e.target.value = '';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1c2c] via-[#4a1942] to-[#1a1c2c] flex items-center justify-center p-4 md:p-8 font-sans text-white overflow-x-hidden">
      <div className="w-full max-w-6xl h-auto lg:h-[720px] bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar: Input Section */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">智能分組</h1>
          </div>

          <div className="space-y-6 flex-1">
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                  成員名單 (僅限中文)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".txt,.csv" 
                    className="hidden" 
                  />
                  <button 
                    onClick={triggerFileSelect}
                    className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 transition-all"
                    title="載入 .txt 或 .csv"
                  >
                    <FileUp size={10} /> 載入文件
                  </button>
                  <button 
                    onClick={loadTestNames}
                    className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 transition-all"
                  >
                    <Beaker size={10} /> 測試名單
                  </button>
                  <button 
                    onClick={() => setInputText('')}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="王小明&#10;李大華&#10;張美麗..."
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder-indigo-300/30" 
              />
              
              {/* Validation Alert */}
              <AnimatePresence>
                {membersData.invalidNames.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-amber-200/80 leading-tight">
                      檢測到 {membersData.invalidNames.length} 個非中文名稱，分組時將自動忽略。
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider">分組模式</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setGroupMode('count')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    groupMode === 'count' ? 'bg-indigo-500 text-white shadow-lg' : 'text-indigo-200/50 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} /> 組數
                </button>
                <button
                  onClick={() => setGroupMode('size')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    groupMode === 'size' ? 'bg-indigo-500 text-white shadow-lg' : 'text-indigo-200/50 hover:text-white'
                  }`}
                >
                  <Users2 size={14} /> 人數
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-indigo-200/60">{groupMode === 'count' ? '預計分成幾組？' : '每組預計幾人？'}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setGroupValue(Math.max(1, groupValue - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10"
                    >-</button>
                    <input 
                      type="number"
                      value={groupValue}
                      onChange={(e) => setGroupValue(parseInt(e.target.value) || 1)}
                      className="w-8 text-center bg-transparent border-none focus:ring-0 text-sm font-bold"
                    />
                    <button 
                      onClick={() => setGroupValue(groupValue + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            disabled={membersData.validNames.length === 0}
            onClick={handleGroup}
            className="w-full mt-8 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/20 active:scale-[0.98] transition-all rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Shuffle size={20} />
            立即隨機分組
          </button>
        </div>

        {/* Main Content: Group Results */}
        <div className="flex-1 p-6 md:p-10 bg-black/10 flex flex-col overflow-hidden relative">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h2 className="text-xl font-semibold">分組結果預覽</h2>
              <p className="text-sm text-indigo-200/60">
                {results.length > 0 
                  ? `已生成 ${results.length} 個小組，總計 ${results.reduce((acc, curr) => acc + curr.members.length, 0)} 位成員`
                  : membersData.validNames.length > 0 
                    ? `等待中... 目前有 ${membersData.validNames.length} 位合規成員`
                    : "尚未輸入成員"}
              </p>
            </div>
            {results.length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={triggerFireworks}
                  className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-amber-400"
                  title="慶祝一下！"
                >
                  <Sparkles size={18} />
                  <span className="text-xs hidden md:inline">慶祝</span>
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                  title="複製文字"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                  <span className="text-xs hidden md:inline">{copied ? '已複製' : '複製'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((group, idx) => (
                    <motion.div
                      key={`group-${group.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col group hover:border-indigo-400/50 hover:bg-white/10 transition-all"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getThemeColor(idx)}`}>
                          TEAM {group.id.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono italic">
                          {group.members.length} MEMBERS
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {group.members.map((member, mIdx) => (
                          <li key={mIdx} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getGradient(idx)} flex items-center justify-center text-[10px] font-bold shadow-inner`}>
                              {member[0]}
                            </div>
                            <span className="text-sm font-medium">{member}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-white/10 py-20">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Shuffle size={64} className="mb-4 opacity-10" />
                  </motion.div>
                  <p className="text-lg italic font-light">點擊左側「立即隨機分組」來生成小組...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Subtle Decorative Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// Helper functions for dynamic styling
function getThemeColor(index: number) {
  const colors = [
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ];
  return colors[index % colors.length];
}

function getGradient(index: number) {
  const gradients = [
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
    'from-amber-400 to-amber-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
  ];
  return gradients[index % gradients.length];
}

