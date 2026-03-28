import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const ResultDisplay = ({ result, formData }) => {
  if (!result || !formData) return (
    <div className="h-full flex flex-col justify-center items-center text-slate-500 space-y-4">
      <div className="animate-pulse bg-slate-800 h-32 w-32 rounded-full mb-4"></div>
      <p className="font-bold tracking-widest uppercase text-[10px]">Awaiting Patient Data...</p>
    </div>
  );

  const { benefit, risk, confidenceScore, recommendation, tablet, sideEffects, riskFactors, reasons } = result;

  const getRecommendationStyle = () => {
    if (risk > 65) return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    if (risk > 35) return 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
  };

  const handleExport = () => {
    const reportText = `
OmniGen AI - Diagnostic Simulation Report
Generated: ${new Date().toLocaleString()}

--- PATIENT INPUT SUMMARY ---
Patient Name: ${formData.name || 'Anonymous'}
Age: ${formData.age}
Health Status: ${formData.health}
Reported Problem: ${formData.problem || 'None'}
Duration: ${formData.duration}
Symptoms: ${formData.symptoms || 'None detailed'}

--- KEY OUTCOMES ---
Recommended Action: ${tablet || recommendation}
Recovery Probability: ${benefit}%
Condition Severity (Risk): ${risk}%
Model Confidence Score: ${confidenceScore}/100

--- SIDE EFFECTS ---
${sideEffects ? sideEffects.join(', ') : 'None'}

--- CONTRAINDICATIONS / RISK FACTORS ---
${riskFactors ? riskFactors.join(', ') : 'None'}

--- JUSTIFICATION ---
${reasons ? reasons.map(r => '- ' + r).join('\n') : 'N/A'}

=============================================
* Disclaimer: This is an AI simulation tool. Do not use for real medical advice. *
`;

    const blob = new Blob([reportText.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnigen-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pieData = [
    { name: 'Recovery', value: benefit, color: '#34d399' },
    { name: 'Severity', value: risk, color: '#fb7185' },
    { name: 'Confidence', value: confidenceScore, color: '#818cf8' }
  ];

  return (
    <div className="flex flex-col h-full space-y-7 animate-fade-in">
      {/* Smart Warning System */}
      {(risk >= 75 || confidenceScore < 60) && (
        <div className="space-y-3 mb-2">
           {risk >= 90 && (
             <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-3xl flex items-center gap-3 shadow-[0_0_15px_rgba(244,63,94,0.15)] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-500/5 animate-pulse pointer-events-none"></div>
               <svg className="w-5 h-5 shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               <span className="text-[11px] font-black uppercase tracking-widest relative z-10">Extreme severity scenario</span>
             </div>
           )}
           {risk >= 75 && risk < 90 && (
             <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-3xl flex items-center gap-3 shadow-[0_0_15px_rgba(251,191,36,0.1)] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent to-amber-500/5 pointer-events-none"></div>
               <svg className="w-5 h-5 shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               <span className="text-[11px] font-black uppercase tracking-widest relative z-10">High risk detected</span>
             </div>
           )}
           {confidenceScore < 60 && (
             <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 p-4 rounded-3xl flex items-center gap-3 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-indigo-500/5 pointer-events-none"></div>
                <svg className="w-5 h-5 shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span className="text-[11px] font-black uppercase tracking-widest relative z-10">Low confidence prediction</span>
             </div>
           )}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 mt-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Diagnosis & Recommended Action
        </h2>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold tracking-wide transition-all active:scale-95"
          title="Download Report"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export
        </button>
      </div>
        
        {/* Progress Bars */}
        <div className="space-y-6 bg-[#0a0f1c] p-6 rounded-3xl border border-slate-800 shadow-inner">
          {/* Benefit Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Probability of Recovery</span>
              <span className="text-sm font-black text-emerald-400">{benefit}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out relative" 
                style={{ width: `${benefit}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/20"></div>
              </div>
            </div>
          </div>

          {/* Risk Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition Severity</span>
              <span className="text-sm font-black text-rose-400">{risk}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-rose-500 h-2.5 rounded-full transition-all duration-1000 ease-out relative" 
                style={{ width: `${risk}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/20"></div>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recommendation Box */}
        <div className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-center transition-colors ${getRecommendationStyle()}`}>
          <span className="text-[10px] uppercase font-black tracking-widest mb-1 opacity-60">Suggested Medicine</span>
          <span className="text-xl font-black leading-tight tracking-tight">{tablet || recommendation}</span>
        </div>

        {/* Confidence Box */}
        <div className="p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-lg flex flex-col justify-center">
          <span className="text-[10px] uppercase font-black tracking-widest mb-1 opacity-60">Model Confidence</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tight">{confidenceScore}</span>
            <span className="text-[10px] font-black tracking-widest opacity-50 uppercase">/ 100</span>
          </div>
        </div>
      </div>

      {/* Why This Result Box */}
      {reasons && reasons.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-700/50 bg-[#0a0f1c] shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
          <span className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-4 flex items-center gap-2 relative z-10">
            ⚡ Why this result?
          </span>
          <ul className="space-y-4 relative z-10">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-xs leading-relaxed text-slate-300 font-bold tracking-wide">
                <svg className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Radar Chart Section */}
      <div className="flex-grow flex flex-col items-center justify-center min-h-[280px] bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/20 border border-slate-800 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
        
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] absolute top-5 left-5 opacity-80">
          Diagnostic Balance
        </h3>
        
        <div className="w-full flex-grow relative z-10 h-[280px] mt-4 flex items-center justify-center">
          <ResponsiveContainer width={260} height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f1524', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-indigo-200 font-medium italic mt-2 w-full text-center z-10 opacity-90 tracking-wide">
          "This split chart shows trade-offs between outcome factors"
        </p>
        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-2 mb-1 w-full text-center z-10 opacity-80 drop-shadow-md">
          * Higher recovery comes with increased risk in certain conditions
        </p>
      </div>

      {/* Side Effects & Risk Factors Box */}
      {sideEffects && riskFactors && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-[#0a0f1c] border border-slate-800 rounded-3xl shadow-lg">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Possible Side Effects
            </span>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300 font-bold">
              {sideEffects.map((se, i) => <li key={i}>{se}</li>)}
            </ul>
          </div>
          <div className="p-6 bg-[#0a0f1c] border border-slate-800 rounded-3xl shadow-lg">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Contraindications & Risk Factors
            </span>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300 font-bold">
              {riskFactors.map((rf, i) => <li key={i}>{rf}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
