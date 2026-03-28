import React from 'react';

const InputForm = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

      {/* Patient Details */}
      <div className="grid grid-cols-2 gap-4 pb-2">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-300">Patient Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full p-2.5 border border-slate-700 rounded-xl bg-[#0a0f1c] text-slate-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm placeholder:text-slate-600"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-300">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            placeholder="Type age..."
            min="1"
            max="120"
            className="w-full p-2.5 border border-slate-700 rounded-xl bg-[#0a0f1c] text-slate-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Health Condition */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-300">Health Condition</label>
        <div className="grid grid-cols-3 gap-2">
          {['good', 'average', 'poor'].map((level) => (
            <label 
              key={level} 
              className={`flex items-center justify-center p-2.5 border rounded-xl cursor-pointer transition-all duration-200 ${
                formData.health === level 
                  ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20' 
                  : 'bg-[#0a0f1c] border-slate-700 text-slate-400 font-medium hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="health"
                value={level}
                checked={formData.health === level}
                onChange={handleChange}
                className="hidden"
              />
              <span className="capitalize text-sm">{level}</span>
            </label>
          ))}
        </div>
      </div>



      {/* Clinical Assessment */}
      <div className="space-y-4 pt-4 border-t border-slate-800 mt-6">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          Clinical Assessment
        </h3>
        
        {/* Presenting Problem */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Main Problem</label>
          <div className="relative">
            <select
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              className="w-full p-3 pr-10 border border-slate-700 rounded-xl bg-[#0a0f1c] text-slate-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer appearance-none hover:bg-slate-800 text-sm"
            >
              <option value="Minor Scratch">Minor Scratch</option>
              <option value="Fever">Fever</option>
              <option value="Headache">Headache</option>
              <option value="Cold">Cold</option>
              <option value="Acidity">Acidity</option>
              <option value="Body Pain">Body Pain</option>
              <option value="Allergy">Allergy</option>
              <option value="Diarrhea">Diarrhea</option>
              <option value="Cough">Cough</option>
              <option disabled>────── Extreme ──────</option>
              <option value="Severe Sepsis">Severe Sepsis</option>
              <option value="Heart Attack">Heart Attack</option>
              <option value="Severe Stroke">Severe Stroke</option>
              <option value="Advanced Rabies">Advanced Rabies</option>
              <option value="Late-Stage Terminal Illness">Terminal Illness</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Symptoms</label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder="How are you feeling? Any fever, nausea, or fatigue?"
            rows={3}
            className="w-full p-3 border border-slate-700 rounded-xl bg-[#0a0f1c] text-slate-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm placeholder:text-slate-600"
          ></textarea>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Duration of symptoms</label>
          <div className="relative">
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-3 pr-10 border border-slate-700 rounded-xl bg-[#0a0f1c] text-slate-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer appearance-none hover:bg-slate-800 text-sm"
            >
              <option value="just_started">Just started (Under 24h)</option>
              <option value="few_days">A few days</option>
              <option value="over_week">Over a week</option>
              <option value="chronic">Chronic (Months/Years)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InputForm;
