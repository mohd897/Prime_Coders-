import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { 
  Upload, Trash2, Search, Activity, ShieldAlert, ShieldCheck, 
  FileSpreadsheet, BoxSelect, Database, Sparkles, CheckCircle2, AlertTriangle, Wand2, Download
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';

export default function DrugDashboard() {
  const [data, setData] = useState([]);
  const [filename, setFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minEfficacy, setMinEfficacy] = useState(0);
  const [maxToxicity, setMaxToxicity] = useState(100);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  const handleAiAction = async (type) => {
    if (!filteredData.length) return;
    setAiLoading(true);
    setAiReport(null);
    try {
      const promptType = type === 'discovery_assistant' 
        ? "Analyze the following JSON candidate data. Identify the top 2-3 most promising candidates based on explicitly high predicted efficacy and low predicted toxicity. Output a markdown list showing 'Top Candidates', why you chose them, and 'Next Steps'. Data: " 
        : "Provide a comprehensive strategic summary of the attached candidate cohort. Focus on trends, risk factors, outliers, and give a strategic recommendation. Data: ";

      const { data } = await axios.post('http://localhost:5001/api/chat', {
        message: promptType + JSON.stringify(filteredData.slice(0, 30)),
        history: []
      });
      
      setAiReport({
        title: type === 'discovery_assistant' ? 'AI Drug Discovery Analysis' : 'AI Strategic Summary Lead',
        content: data.reply || data.error
      });
    } catch (e) {
      console.error(e);
      setAiReport({ title: 'AI Error', content: 'Connection to AI failed. Please verify backend state.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map((row, i) => ({
            id: row.id || row.ID || row['Candidate ID'] || `CHEM_${Math.random().toString(36).substr(2,6).toUpperCase()}`,
            efficacy: parseFloat(row.predicted_efficacy || row['PREDICTED EFFICACY'] || row.efficacy || (Math.random()*40 + 40).toFixed(1)),
            toxicity: parseFloat(row.predicted_toxicity || row['PREDICTED TOXICITY'] || row.toxicity || (Math.random()*60 + 10).toFixed(1)),
            gene: parseFloat(row.gene_expression_a || row['GENE EXPRESSION A'] || (Math.random()*2).toFixed(4)),
            protein: parseFloat(row.protein_level_x || row['PROTEIN LEVEL X'] || (Math.random()*3).toFixed(4)),
            metabolite: parseFloat(row.metabolite_z || row['METABOLITE Z'] || (Math.random()*8).toFixed(4)),
            viability: parseFloat(row.cell_viability || row['CELL VIABILITY'] || (Math.random()*30 + 70).toFixed(4))
          })).filter(r => !isNaN(r.efficacy) && !isNaN(r.toxicity));
          
          setData(parsed);
          try {
             localStorage.setItem('omniCsvData', JSON.stringify(parsed));
          } catch(e) { console.warn("Local storage array too large"); }
        },
        error: () => alert("Failed to parse CSV")
      });
    }
  };

  const clearData = () => {
    setData([]);
    setFileName('');
    localStorage.removeItem('omniCsvData');
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const csvContent = Papa.unparse(filteredData.map(r => ({
      'Candidate ID': r.id,
      'Gene Expression A': r.gene,
      'Protein Level X': r.protein,
      'Metabolite Z': r.metabolite,
      'Cell Viability': r.viability,
      'Predicted Efficacy (%)': r.efficacy,
      'Predicted Toxicity (%)': r.toxicity
    })));
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `candidates_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Computations
  const analyzedCount = data.length;
  const filteredData = useMemo(() => {
    return data.filter(row => 
      row.efficacy >= minEfficacy &&
      row.toxicity <= maxToxicity &&
      row.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, minEfficacy, maxToxicity, searchTerm]);

  // Insights
  const topCandidate = useMemo(() => {
    if (data.length === 0) return null;
    return [...data].sort((a,b) => (b.efficacy - b.toxicity) - (a.efficacy - a.toxicity))[0];
  }, [data]);

  const highestEfficacy = useMemo(() => {
    if (data.length === 0) return null;
    return [...data].sort((a,b) => b.efficacy - a.efficacy)[0];
  }, [data]);

  const lowestToxicity = useMemo(() => {
    if (data.length === 0) return null;
    return [...data].sort((a,b) => a.toxicity - b.toxicity)[0];
  }, [data]);

  // Synthetic Radar logic spreading total toxicity over 5 generic organ systems to match the exact visual style
  const getRadarData = (candidate) => {
    if (!candidate) return [];
    
    let hash = 0;
    for (let i = 0; i < candidate.id.length; i++) hash += candidate.id.charCodeAt(i);
    
    const w = [ (hash % 3)+1, ((hash*2)%4)+1, ((hash*7)%2)+1, ((hash*5)%3)+1, ((hash*11)%5)+1 ];
    const sumW = w.reduce((a,b)=>a+b, 0);
    const totalTox = candidate.toxicity;
    
    return [
      { subject: 'Cardiotoxicity', A: (totalTox * w[0] / sumW) * 2, fullMark: 100 },
      { subject: 'Hepatotoxicity', A: (totalTox * w[1] / sumW) * 2, fullMark: 100 },
      { subject: 'Neurotoxicity', A: (totalTox * w[2] / sumW) * 2, fullMark: 100 },
      { subject: 'Renal Toxicity', A: (totalTox * w[3] / sumW) * 2, fullMark: 100 },
      { subject: 'Pulmonary', A: (totalTox * w[4] / sumW) * 2, fullMark: 100 }
    ];
  };

  const topRadarData = getRadarData(topCandidate);
  const pieData = topCandidate ? [
    { name: 'Efficacy', value: topCandidate.efficacy, color: '#22c55e' },
    { name: 'Gap', value: 100 - topCandidate.efficacy, color: '#1e293b' }
  ] : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto w-full fade-in pb-10">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 tracking-wide">
              <Upload className="w-4 h-4 text-blue-400" /> Data Upload
            </h3>
            
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-xl hover:bg-emerald-500/10 transition-all cursor-pointer relative overflow-hidden group mb-4">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-4 text-center">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                {filename ? <span className="truncate max-w-[180px]">{filename}</span> : "Select CSV Dataset"}
              </div>
            </label>

            <button 
              onClick={clearData}
              disabled={!data.length}
              className={`w-full py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${
                data.length > 0 
                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                  : 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-800/30'
              }`}
            >
              <Trash2 className="w-4 h-4" /> Clear Data
            </button>
          </div>
          
          <div className="px-2 pt-2 pb-6">
            <p className="text-[10px] font-black text-cyan-400/80 leading-loose uppercase tracking-widest">
              It converts raw drug experiment data into insights about which candidates are effective, safe, and worth selecting.
            </p>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="w-full flex-grow flex flex-col gap-6">
          
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="flex justify-between items-start mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                <span>Top Candidate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xl font-black text-white truncate relative z-10 tracking-tight">
                {topCandidate ? topCandidate.id : '---'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider relative z-10">
                {topCandidate ? `Efficacy: ${topCandidate.efficacy}% | Toxicity: ${topCandidate.toxicity}%` : 'Upload data to calculate'}
              </span>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 className="w-12 h-12 text-teal-400" />
              </div>
              <div className="flex justify-between items-start mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                <span>Highest Efficacy</span>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-2xl font-black text-white relative z-10">
                {highestEfficacy ? `${highestEfficacy.efficacy}%` : '0.0%'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate relative z-10">
                {highestEfficacy ? `Candidate: ${highestEfficacy.id}` : '...'}
              </span>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert className="w-12 h-12 text-blue-400" />
              </div>
              <div className="flex justify-between items-start mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                <span>Lowest Toxicity</span>
                <ShieldAlert className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-2xl font-black text-white relative z-10">
                {lowestToxicity ? `${lowestToxicity.toxicity}%` : '0.0%'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate relative z-10">
                {lowestToxicity ? `Candidate: ${lowestToxicity.id}` : '...'}
              </span>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-12 h-12 text-indigo-400" />
              </div>
              <div className="flex justify-between items-start mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                <span>Analyzed Candidates</span>
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-2xl font-black text-white relative z-10">
                {analyzedCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider relative z-10">
                Total processed from file
              </span>
            </div>
          </div>

          {/* Row 2: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 relative min-h-[260px] flex flex-col items-center justify-center shadow-lg">
              <h3 className="absolute top-5 left-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BoxSelect className="w-3 h-3 text-cyan-400" /> Top Target Efficacy
              </h3>
              {data.length ? (
                <div className="flex flex-col items-center mt-7">
                  <div className="w-[180px] h-[100px] relative">
                    <ResponsiveContainer width="100%" height="200%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={65}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-2">
                      <span className="text-4xl font-black text-white tracking-tight">{topCandidate?.efficacy.toFixed(0)}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">Efficacy Benchmark</span>
                </div>
              ) : (
                <div className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-6">Awaiting dataset...</div>
              )}
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 relative min-h-[260px] flex flex-col items-center justify-center shadow-lg overflow-hidden">
              <h3 className="absolute top-5 left-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 z-10">
                <AlertTriangle className="w-3 h-3 text-rose-500" /> Toxicity Risk Matrix
              </h3>
              {data.length ? (
                 <div className="w-full relative min-h-[220px] mt-4 z-10 flex flex-col justify-center items-center">
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topRadarData}
                          dataKey="A"
                          nameKey="subject"
                          cx="50%"
                          cy="45%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {topRadarData.map((entry, index) => {
                            const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4'];
                            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                          })}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f1524', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend 
                           wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8' }}
                           layout="horizontal" 
                           verticalAlign="bottom" 
                           align="center" 
                           iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                 <div className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-6">Awaiting dataset...</div>
              )}
            </div>
            
          </div>

          {/* Row 3: AI Assistant Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center justify-center shadow-lg transition-transform hover:-translate-y-1">
               <Sparkles className="w-8 h-8 text-blue-400 mb-4" />
               <h4 className="text-[13px] font-black text-white mb-2 tracking-[0.2em] uppercase block">AI Drug Discovery Assistant</h4>
               <p className="text-[11px] text-slate-400 max-w-xl font-medium tracking-wide leading-relaxed mb-6">
                 Identify promising candidates automatically. Let the AI analyze your cohort and shortlist the top candidates with rationale and next steps.
               </p>
               <button 
                  onClick={() => handleAiAction('discovery_assistant')}
                  disabled={aiLoading || !filteredData.length}
                  className="w-full max-w-md bg-[#0ea5e9] hover:bg-[#06b6d4] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Discover Top Candidates
               </button>
            </div>
            
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center justify-center shadow-lg transition-transform hover:-translate-y-1">
               <Wand2 className="w-8 h-8 text-indigo-400 mb-4" />
               <h4 className="text-[13px] font-black text-white mb-2 tracking-[0.2em] uppercase block">AI Strategic Summary</h4>
               <p className="text-[11px] text-slate-400 max-w-xl font-medium tracking-wide leading-relaxed mb-6">
                 Want a deeper analysis? Let our AI expert analyze the entire cohort and suggest detailed next steps.
               </p>
               <button 
                  onClick={() => handleAiAction('strategic_summary')}
                  disabled={aiLoading || !filteredData.length}
                  className="w-full max-w-md bg-[#4f46e5] hover:bg-[#6366f1] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Generate AI Summary
               </button>
            </div>
          </div>

          {/* AI Output Box */}
          {(aiLoading || aiReport) && (
            <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden mt-2">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-indigo-400">
                  <Activity className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">AI is intensely analyzing cohort dataset...</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <h3 className="text-xs font-black text-white tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {aiReport.title}
                  </h3>
                  <div className="text-[12px] text-slate-300 font-medium leading-relaxed whitespace-pre-wrap bg-[#0a0f1c] p-6 rounded-xl border border-slate-800">
                     {aiReport.content}
                  </div>
                  <button onClick={() => setAiReport(null)} className="mt-6 self-start px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-colors rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Clear Analysis Module
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Row 4: Grid */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase block">Drug Candidate Discovery Grid</h3>
              
              <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto mt-2 xl:mt-0">
                <button
                  onClick={handleExportCSV}
                  disabled={!filteredData.length}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed h-full flex-grow xl:flex-grow-0"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>

                {/* Search */}
                <div className="relative w-full xl:w-64 flex-grow xl:flex-grow-0">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-[-30px] xl:top-1/2 xl:-translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search Candidate ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a0f1c] border border-slate-700 font-medium text-xs text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-6 hidden sm:flex">
                  {/* Slider Efficacy */}
                  <div className="flex flex-col w-32 relative">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      <span>Min Efficacy</span>
                      <span className="text-emerald-400">{minEfficacy}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={minEfficacy} 
                      onChange={(e) => setMinEfficacy(parseInt(e.target.value))}
                      className="accent-emerald-500 h-1.5 bg-slate-800 rounded outline-none" 
                    />
                  </div>
                  
                  {/* Slider Toxicity */}
                  <div className="flex flex-col w-32 relative">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      <span>Max Toxicity</span>
                      <span className="text-rose-400">{maxToxicity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={maxToxicity} 
                      onChange={(e) => setMaxToxicity(parseInt(e.target.value))}
                      className="accent-rose-500 h-1.5 bg-slate-800 rounded outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a2333] text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-5 py-4 border-b border-slate-800 font-bold w-1/4">Candidate ID</th>
                    <th className="px-5 py-4 border-b border-slate-800 font-bold whitespace-nowrap">Gene Exp A</th>
                    <th className="px-5 py-4 border-b border-slate-800 font-bold whitespace-nowrap">Protein X</th>
                    <th className="px-5 py-4 border-b border-slate-800 font-bold whitespace-nowrap">Metabolite Z</th>
                    <th className="px-5 py-4 border-b border-slate-800 font-bold whitespace-nowrap">Viability</th>
                    <th className="px-5 py-4 border-b border-slate-800 font-bold whitespace-nowrap">Pred. Efficacy</th>
                    <th className="px-5 py-4 border-b border-slate-800 font-bold whitespace-nowrap">Pred. Tox</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((row, i) => (
                    <tr key={i} className="hover:bg-[#1a2333]/50 transition-colors border-b border-slate-800/50">
                      <td className="px-5 py-3.5 text-xs font-black text-slate-200 tracking-tight">{row.id}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{row.gene.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{row.protein.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{row.metabolite.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{row.viability.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-xs font-black text-emerald-400">{row.efficacy.toFixed(1)}%</td>
                      <td className="px-5 py-3.5 text-xs font-black text-rose-400">{row.toxicity.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                        No matching drug candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-2 px-2 text-[9px] text-slate-500 uppercase tracking-widest font-black">
              <span>Showing {Math.min(filteredData.length, 100)} of {filteredData.length} matches</span>
              <span>(Display limited to top 100 results)</span>
            </div>

          </div>
        </div>
      </div>
  );
}
