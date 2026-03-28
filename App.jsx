import React, { useState, useRef } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import DrugDashboard from './components/DrugDashboard';
import ChatBot from './components/ChatBot';

function App() {
  const [activeTab, setActiveTab] = useState('clinical');
  const [formData, setFormData] = useState({
    age: 30,
    health: 'good',
    riskTolerance: 'medium',
    problem: 'Fever',
    symptoms: '',
    duration: 'few_days'
  });

  const [result, setResult] = useState(null);
  const activeRequestId = useRef(0);

  const calculateOutcome = async (data) => {
    const requestId = Date.now();
    activeRequestId.current = requestId;
    try {
      const response = await axios.post('http://localhost:5001/api/calculate', data);
      if (activeRequestId.current === requestId) {
        setResult(response.data);
      }
    } catch (error) {
      console.error('Error calculating outcome:', error);
    }
  };

  const handleInputChange = (newData) => {
    setFormData(newData);
    calculateOutcome(newData);
  };

  // Initial calculation on mount
  React.useEffect(() => {
    calculateOutcome(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans p-6 overflow-x-hidden flex flex-col items-center">
      {/* Global Top Navbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8 max-w-[1600px] w-full mx-auto pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 pl-4">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          <h1 className="text-[16px] font-black text-white tracking-widest uppercase">OmniGen AI</h1>
          <span className="text-slate-700 px-2 text-xs">|</span>
          <h2 className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {activeTab === 'clinical' ? 'Diagnostic Profiler' : 'Discovery Dashboard'}
          </h2>
        </div>
        
        <div className="flex gap-2 rounded-xl overflow-hidden bg-[#0f1524] p-1.5 border border-slate-800">
          <button 
            onClick={() => setActiveTab('clinical')} 
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'clinical' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Diagnostic Profiler
          </button>
          <button 
            onClick={() => setActiveTab('discovery')} 
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'discovery' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Discovery Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto flex-grow flex flex-col justify-start">
        {activeTab === 'discovery' ? (
          <DrugDashboard />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full items-stretch">
            {/* Left Side: Input Form (Lower visual weight) */}
            <div className="w-full lg:w-1/2 p-8 md:p-10 bg-[#111827] rounded-3xl shadow-xl shadow-slate-900/50 border border-slate-800 flex flex-col opacity-90 transition-opacity hover:opacity-100">
              <div className="mb-8">
                <h1 className="text-[13px] font-black text-white uppercase tracking-[0.1em] mb-2 block">Diagnostic Assessment Pipeline</h1>
                <p className="text-slate-500 font-medium text-xs leading-relaxed tracking-wide">Adjust patient parameters to run diagnostic intelligence.</p>
              </div>
              <InputForm formData={formData} onChange={handleInputChange} />
              
              {/* Patient Context Summary */}
              <div className="mt-auto pt-8 flex flex-col justify-end">
                <div className="px-5 py-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 shadow-sm flex flex-wrap gap-4 justify-between items-center text-xs relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
                   
                   <div className="flex flex-col relative z-10">
                     <span className="text-[8px] sm:text-[9px] text-indigo-300/80 uppercase font-black tracking-widest mb-1 flex items-center gap-1">
                       <svg className="w-3 h-3 block sm:hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                       {formData?.name || 'Patient'}
                     </span>
                     <span className="text-white font-bold tracking-wide mt-0.5 text-[11px] sm:text-xs">Age {formData?.age || '?'}</span>
                   </div>
                   
                   <div className="w-px h-6 bg-slate-800/80 hidden sm:block relative z-10"></div>
                   
                   <div className="flex flex-col relative z-10">
                     <span className="text-[8px] sm:text-[9px] text-indigo-300/80 uppercase font-black tracking-widest mb-1">Health</span>
                     <span className="text-white font-bold capitalize tracking-wide mt-0.5 text-[11px] sm:text-xs">{formData?.health}</span>
                   </div>
                   
                   <div className="w-px h-6 bg-slate-800/80 hidden sm:block relative z-10"></div>
                   
                   <div className="flex flex-col relative z-10">
                     <span className="text-[8px] sm:text-[9px] text-indigo-300/80 uppercase font-black tracking-widest mb-1">Condition</span>
                      <span className="text-emerald-400 font-bold capitalize tracking-wide mt-0.5 text-[11px] sm:text-xs">{formData?.problem || 'None'}</span>
                    </div>
                 </div>
              </div>

              {/* Outcome Summary Card */}
              {result && (() => {
                const safeRec = result.risk >= 85 ? { label: 'EMERGENCY', color: 'text-rose-500', bg: 'bg-rose-500/10' } :
                                result.risk >= 60 ? { label: 'CRITICAL', color: 'text-rose-400', bg: 'bg-rose-500/10' } :
                                result.risk >= 30 ? { label: 'CAUTION', color: 'text-amber-400', bg: 'bg-amber-500/10' } :
                                                    { label: 'SAFE', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
                                                    
                const recProb = result.benefit >= 70 ? 'High' : result.benefit >= 40 ? 'Medium' : 'Low';
                const sevLevel = result.risk >= 75 ? 'Critical' : result.risk >= 40 ? 'Moderate' : 'Mild';
                const riskLevel = result.risk >= 80 ? 'High' : result.risk >= 50 ? 'Medium' : 'Low';
                
                const projectedSeverity = Math.min(100, Math.round(result.risk * 1.3) + 10);
                const projectionText = result.risk >= 95 
                  ? "Condition is already at peak severity; immediate action required."
                  : `If untreated, severity may increase to ${projectedSeverity}% in 3-5 days.`;
                
                const currentHealth = (formData?.health || 'average').toLowerCase();
                const currentAge = parseInt(formData?.age || 30);
                
                let cfHealth = null;
                if (currentHealth === 'poor' || currentHealth === 'average') {
                  cfHealth = { condition: "Health were Good", recBonus: currentHealth === 'poor' ? 24 : 12, riskDrop: currentHealth === 'poor' ? 18 : 8 };
                } else if (currentHealth === 'good') {
                  cfHealth = { condition: "Health were Excellent", recBonus: 7, riskDrop: 5 };
                }
                
                let cfAge = null;
                if (currentAge > 40) {
                  cfAge = { condition: `Age were ${currentAge - 15}`, recBonus: Math.round((currentAge - 25) * 0.4), riskDrop: Math.round((currentAge - 25) * 0.3) };
                } else if (currentAge >= 30) {
                  cfAge = { condition: "Age were 20", recBonus: 7, riskDrop: 4 };
                }
                
                return (
                  <>
                  <div className="mt-5 p-4 rounded-2xl border border-slate-700/60 bg-[#0f1524] shadow-md relative overflow-hidden transition-all hover:border-slate-600">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Outcome Summary
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${safeRec.color} ${safeRec.bg}`}>
                        {safeRec.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#111827] rounded-xl p-2.5 border border-slate-800 flex flex-col justify-center">
                        <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Recovery</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-white leading-none">{result.benefit}%</span>
                          <span className="text-[8px] font-bold text-slate-400 leading-none">{recProb}</span>
                        </div>
                      </div>
                      
                      <div className="bg-[#111827] rounded-xl p-2.5 border border-slate-800 flex flex-col justify-center">
                        <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Severity</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-rose-400 leading-none">{result.risk}%</span>
                          <span className="text-[8px] font-bold text-slate-400 leading-none">{sevLevel}</span>
                        </div>
                      </div>
                      
                      <div className="bg-[#111827] rounded-xl p-2.5 border border-slate-800 flex flex-col justify-center">
                        <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Risk Lvl</div>
                        <span className={`text-[11px] font-black leading-none mt-1 ${riskLevel === 'High' ? 'text-rose-400' : riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-start gap-2 opacity-90">
                      <svg className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      <span className="text-[10px] text-slate-300 font-medium leading-relaxed tracking-wide">
                        <span className="text-amber-500 font-bold uppercase tracking-widest mr-1.5">Projection:</span>
                        {projectionText}
                      </span>
                    </div>
                  </div>

                  {/* Counterfactual Engine */}
                  <div className="mt-4 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] shadow-md relative overflow-hidden transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm border border-indigo-500/20 rounded-lg p-1 bg-indigo-500/10">🧠</span>
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.15em] drop-shadow-sm">Counterfactual Engine</span>
                    </div>
                    
                    <div className="space-y-2">
                       {cfHealth && (
                         <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold tracking-wide text-slate-300 bg-[#0a0f1c] px-3 py-2.5 rounded-xl border border-indigo-500/10 shadow-inner group transition-colors hover:border-indigo-500/30">
                           <span className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                             If <span className="text-white">{(cfHealth.condition)}</span>
                           </span>
                           <span className="flex gap-2 sm:gap-3">
                             <span className="text-emerald-400">Recovery +{cfHealth.recBonus}%</span>
                             <span className="text-rose-400">Risk -{cfHealth.riskDrop}%</span>
                           </span>
                         </div>
                       )}
                       {cfAge && cfAge.recBonus > 0 && (
                         <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold tracking-wide text-slate-300 bg-[#0a0f1c] px-3 py-2.5 rounded-xl border border-indigo-500/10 shadow-inner group transition-colors hover:border-indigo-500/30">
                           <span className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                             If <span className="text-white">{(cfAge.condition)}</span>
                           </span>
                           <span className="flex gap-2 sm:gap-3">
                             <span className="text-emerald-400">Recovery +{cfAge.recBonus}%</span>
                             <span className="text-rose-400">Risk -{cfAge.riskDrop}%</span>
                           </span>
                         </div>
                       )}
                    </div>
                  </div>
                  </>
                );
              })()}
            </div>

            {/* Right Side: Results (Visually dominant) */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-transparent">
              <ResultDisplay result={result} formData={formData} />
            </div>
          </div>
        )}
      </div>
      <ChatBot />
    </div>
  );
}

export default App;
//End Here for now as of time is 19:46 and its time to the first check point 