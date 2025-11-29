
import React, { useState, useEffect, useMemo } from 'react';
import TerminalButton from './components/TerminalButton';
import { CleanAction, ToastMessage } from './types';
import * as TextTools from './utils/textTools';
import * as AIService from './services/geminiService';

const StatsBar: React.FC<{ stats: TextTools.TextStats }> = ({ stats }) => (
  <div className="flex gap-4 text-[10px] md:text-xs text-gray-500 font-mono mt-1 border-t border-terminal-border/50 pt-1">
    <div className="flex gap-1">
      <span className="opacity-70">WORDS:</span>
      <span className="text-terminal-accent font-bold">{stats.words}</span>
    </div>
    <div className="flex gap-1">
      <span className="opacity-70">CHARS:</span>
      <span className="text-terminal-accent font-bold">{stats.chars}</span>
    </div>
    <div className="flex gap-1">
      <span className="opacity-70">PARAGRAPHS:</span>
      <span className="text-terminal-accent font-bold">{stats.paragraphs}</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Find & Replace State (Output)
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Find & Replace State (Input)
  const [inputFindText, setInputFindText] = useState('');
  const [inputReplaceText, setInputReplaceText] = useState('');

  const inputStats = useMemo(() => TextTools.getStats(inputText), [inputText]);
  const outputStats = useMemo(() => TextTools.getStats(outputText), [outputText]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleAction = async (action: CleanAction) => {
    if (!inputText && action !== CleanAction.AI_POLISH && action !== CleanAction.AI_SUMMARIZE) {
      addToast("Input buffer empty.", "error");
      return;
    }

    const sourceText = inputText;
    let result = '';

    try {
      switch (action) {
        case CleanAction.SMART_DEBREAK:
          result = TextTools.smartDeBreak(sourceText);
          addToast("Lines de-broken successfully.", "success");
          break;
        case CleanAction.STRIP_FORMATTING:
          result = TextTools.stripFormatting(sourceText);
          addToast("Formatting stripped.", "success");
          break;
        case CleanAction.FIX_SPACING:
          result = TextTools.fixSpacing(sourceText);
          addToast("Whitespace normalized.", "success");
          break;
        case CleanAction.SENTENCE_CASE:
          result = TextTools.toSentenceCase(sourceText);
          addToast("Converted to sentence case.", "success");
          break;
        case CleanAction.LAUNDER_ALL:
          result = TextTools.launderAll(sourceText);
          addToast("Full cycle complete.", "success");
          break;
        case CleanAction.AI_POLISH:
          if (!process.env.API_KEY) {
             addToast("API Key Missing. Cannot use AI.", "error");
             return;
          }
          setIsLoading(true);
          result = await AIService.polishTextAI(sourceText);
          addToast("AI Polish complete.", "success");
          break;
        case CleanAction.AI_SUMMARIZE:
           if (!process.env.API_KEY) {
             addToast("API Key Missing. Cannot use AI.", "error");
             return;
          }
          setIsLoading(true);
          result = await AIService.summarizeTextAI(sourceText);
          addToast("AI Summary complete.", "success");
          break;
      }
      setOutputText(result);
    } catch (err) {
      addToast("Operation failed.", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceOutput = () => {
    if (!outputText) {
      addToast("Output buffer is empty.", "error");
      return;
    }
    if (!findText) {
      addToast("Find term cannot be empty.", "error");
      return;
    }

    // Global replace
    const newText = outputText.split(findText).join(replaceText);
    
    if (newText === outputText) {
      addToast("No matches found in Output.", "info");
    } else {
      setOutputText(newText);
      addToast("Output replacements applied.", "success");
    }
  };

  const handleReplaceInput = () => {
    if (!inputText) {
      addToast("Input buffer is empty.", "error");
      return;
    }
    if (!inputFindText) {
      addToast("Find term cannot be empty.", "error");
      return;
    }

    // Global replace
    const newText = inputText.split(inputFindText).join(inputReplaceText);
    
    if (newText === inputText) {
      addToast("No matches found in Input.", "info");
    } else {
      setInputText(newText);
      addToast("Input replacements applied.", "success");
    }
  };

  const copyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      addToast("Output copied to clipboard.", "success");
    } catch (err) {
      addToast("Clipboard write failed.", "error");
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setFindText('');
    setReplaceText('');
    setInputFindText('');
    setInputReplaceText('');
    addToast("Buffers cleared.", "info");
  };

  const moveOutputToInput = () => {
    setInputText(outputText);
    setOutputText('');
    addToast("Output recycled to input.", "info");
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text font-mono flex flex-col p-4 md:p-8">
      
      {/* Header */}
      <header className="mb-8 border-b border-terminal-border pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-terminal-accent tracking-tighter">
            <span className="text-white">&lt;</span>
            PURE_TEXT_LAUNDROMAT
            <span className="text-white">/&gt;</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">v2.1.0 :: LIVE_STATS_ACTIVE :: F&R_FULL_DUPLEX</p>
        </div>
        <div className="hidden md:flex gap-4 text-xs text-gray-500">
           <span>STATUS: <span className="text-terminal-success">OPERATIONAL</span></span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-[1fr_260px_1fr] gap-6 relative">
        
        {/* Dirty Input Column */}
        <div className="flex flex-col h-[50vh] lg:h-auto">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase font-bold text-gray-500">Input Buffer (Dirty)</label>
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 hover:underline">CLEAR ALL</button>
          </div>
          
          <div className="relative flex-grow group flex flex-col">
             <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="PASTE_DIRTY_TEXT_HERE..."
              className="flex-grow w-full bg-terminal-surface border border-terminal-border p-4 text-sm resize-none focus:outline-none focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent transition-colors scrollbar-thin"
              spellCheck={false}
            />
            <StatsBar stats={inputStats} />

             {/* Find & Replace Toolbar (Input) */}
             <div className="mt-3 p-3 bg-terminal-surface/50 border border-terminal-border/50 rounded flex flex-col gap-2">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Find & Replace (Input)</div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input 
                  type="text" 
                  value={inputFindText}
                  onChange={(e) => setInputFindText(e.target.value)}
                  placeholder="Find..."
                  className="bg-terminal-bg border border-terminal-border px-2 py-1 text-xs text-terminal-text focus:outline-none focus:border-terminal-accent"
                />
                <input 
                  type="text" 
                  value={inputReplaceText}
                  onChange={(e) => setInputReplaceText(e.target.value)}
                  placeholder="Replace..."
                  className="bg-terminal-bg border border-terminal-border px-2 py-1 text-xs text-terminal-text focus:outline-none focus:border-terminal-accent"
                />
                <button 
                  onClick={handleReplaceInput}
                  className="bg-terminal-border text-xs px-3 hover:bg-terminal-text hover:text-terminal-bg transition-colors uppercase font-bold"
                >
                  GO
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel (Center) */}
        <div className="flex flex-col gap-3 justify-center z-10">
          <div className="text-xs text-center text-gray-500 mb-2 uppercase tracking-widest hidden lg:block">--- FILTERS ---</div>
          
          <TerminalButton onClick={() => handleAction(CleanAction.SMART_DEBREAK)}>
            SMART DE-BREAK
          </TerminalButton>
          
          <TerminalButton onClick={() => handleAction(CleanAction.STRIP_FORMATTING)}>
            STRIP TAGS
          </TerminalButton>
          
          <TerminalButton onClick={() => handleAction(CleanAction.FIX_SPACING)}>
            FIX SPACING
          </TerminalButton>
          
          <TerminalButton onClick={() => handleAction(CleanAction.SENTENCE_CASE)}>
            SENTENCE CASE
          </TerminalButton>

          <div className="h-px bg-terminal-border my-2 w-full"></div>

          <TerminalButton variant="primary" onClick={() => handleAction(CleanAction.AI_POLISH)} isLoading={isLoading}>
            ✨ AI POLISH
          </TerminalButton>

          <TerminalButton variant="primary" onClick={() => handleAction(CleanAction.AI_SUMMARIZE)} isLoading={isLoading}>
            📝 AI SUMMARY
          </TerminalButton>

          <div className="h-px bg-terminal-border my-2 w-full"></div>

          <TerminalButton variant="accent" onClick={() => handleAction(CleanAction.LAUNDER_ALL)}>
            LAUNDER ALL
          </TerminalButton>
        </div>

        {/* Clean Output Column */}
        <div className="flex flex-col h-[50vh] lg:h-auto">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase font-bold text-gray-500">Output Buffer (Clean)</label>
            {outputText && (
               <button onClick={moveOutputToInput} className="text-xs text-terminal-accent hover:underline">
                 &lt;&lt; RECYCLE
               </button>
            )}
          </div>
          
          <div className="relative flex-grow flex flex-col">
            <textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              placeholder="WAITING_FOR_PROCESS..."
              className="flex-grow w-full bg-terminal-surface border border-terminal-border p-4 text-sm resize-none focus:outline-none focus:border-terminal-success transition-colors text-terminal-text scrollbar-thin"
            />
            
            <StatsBar stats={outputStats} />

            {/* Find & Replace Toolbar (Output) */}
            <div className="mt-3 p-3 bg-terminal-surface/50 border border-terminal-border/50 rounded flex flex-col gap-2">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Find & Replace (Output)</div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input 
                  type="text" 
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Find..."
                  className="bg-terminal-bg border border-terminal-border px-2 py-1 text-xs text-terminal-text focus:outline-none focus:border-terminal-accent"
                />
                <input 
                  type="text" 
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Replace..."
                  className="bg-terminal-bg border border-terminal-border px-2 py-1 text-xs text-terminal-text focus:outline-none focus:border-terminal-accent"
                />
                <button 
                  onClick={handleReplaceOutput}
                  className="bg-terminal-border text-xs px-3 hover:bg-terminal-text hover:text-terminal-bg transition-colors uppercase font-bold"
                >
                  GO
                </button>
              </div>
            </div>

          </div>
          
          <div className="mt-4">
             <TerminalButton variant="accent" onClick={copyToClipboard} disabled={!outputText} className="w-full">
              COPY CLEAN TEXT
            </TerminalButton>
          </div>
        </div>

      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`
              px-4 py-2 border-l-4 shadow-lg text-sm font-mono bg-terminal-surface text-white
              ${toast.type === 'success' ? 'border-terminal-success' : ''}
              ${toast.type === 'error' ? 'border-red-500' : ''}
              ${toast.type === 'info' ? 'border-terminal-accent' : ''}
              animate-fade-in-up
            `}
          >
            <span className="font-bold mr-2">
              {toast.type === 'success' && '[OK]'}
              {toast.type === 'error' && '[ERR]'}
              {toast.type === 'info' && '[SYS]'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>

    </div>
  );
};

export default App;
