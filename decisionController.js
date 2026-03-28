const decisionsDB = [
  { name: "Fever", tablet: "Paracetamol", baseBenefit: 90, baseRisk: 5, sideEffects: ["Nausea (rare)", "Liver stress (overdose)"], riskFactors: ["Liver disease", "Alcohol use"] },
  { name: "Headache", tablet: "Ibuprofen", baseBenefit: 85, baseRisk: 10, sideEffects: ["Stomach irritation", "Acidity"], riskFactors: ["Ulcers", "Kidney issues"] },
  { name: "Cold", tablet: "Antihistamine", baseBenefit: 75, baseRisk: 8, sideEffects: ["Drowsiness", "Dry mouth"], riskFactors: ["Driving", "Elderly"] },
  { name: "Acidity", tablet: "Antacid", baseBenefit: 80, baseRisk: 6, sideEffects: ["Constipation", "Calcium imbalance"], riskFactors: ["Kidney disease"] },
  { name: "Body Pain", tablet: "Diclofenac", baseBenefit: 88, baseRisk: 15, sideEffects: ["Stomach pain", "Heart risk"], riskFactors: ["Heart disease", "Long-term use"] },
  { name: "Allergy", tablet: "Cetirizine", baseBenefit: 82, baseRisk: 7, sideEffects: ["Sleepiness", "Fatigue"], riskFactors: ["Driving", "Sedentary lifestyle"] },
  { name: "Diarrhea", tablet: "ORS + Loperamide", baseBenefit: 78, baseRisk: 10, sideEffects: ["Constipation", "Dehydration risk"], riskFactors: ["Children", "Elderly"] },
  { name: "Cough", tablet: "Cough Syrup", baseBenefit: 70, baseRisk: 12, sideEffects: ["Drowsiness", "Dependency"], riskFactors: ["Asthma", "Smoking"] },
  { name: "Minor Scratch", tablet: "Antiseptic & Band-Aid", baseBenefit: 100, baseRisk: 0, sideEffects: ["None"], riskFactors: ["None"] },
  { name: "Heart Attack", tablet: "Aspirin & Immediate ER Transfer", baseBenefit: 40, baseRisk: 95, sideEffects: ["Bleeding risk"], riskFactors: ["High Blood Pressure", "Smoking", "Age", "Obesity"] },
  { name: "Severe Stroke", tablet: "Thrombolytics & ER Call", baseBenefit: 30, baseRisk: 100, sideEffects: ["Brain hemorrhage risk"], riskFactors: ["Hypertension", "Diabetes"] },
  { name: "Advanced Rabies", tablet: "Palliative Care", baseBenefit: 0, baseRisk: 100, sideEffects: ["N/A (Uniformly fatal once symptomatic)"], riskFactors: ["Animal bite", "No prompt vaccination"] },
  { name: "Late-Stage Terminal Illness", tablet: "Hospice Comfort Care", baseBenefit: 0, baseRisk: 100, sideEffects: ["Sedation", "Reduced consciousness"], riskFactors: ["Advanced age", "Late diagnosis"] },
  { name: "Severe Sepsis", tablet: "IV Antibiotics & ICU", baseBenefit: 20, baseRisk: 90, sideEffects: ["Organ damage", "Allergic reaction to IV"], riskFactors: ["Weak immune system", "Recent surgery", "Infection"] }
];

const calculateDecision = (req, res) => {
  const { age, health, riskTolerance, problem, symptoms, duration } = req.body;

  const condition = decisionsDB.find(d => d.name.toLowerCase() === (problem || '').toLowerCase()) || decisionsDB[0];

  let severity = condition.baseRisk;
  let recoveryProb = condition.baseBenefit;
  let reasons = [];

  if (condition.baseRisk >= 90) {
     reasons.push(`High baseline severity driven naturally by the diagnosis of ${condition.name}.`);
  }

  // Age factor
  const ageNum = parseInt(age, 10);
  if (!isNaN(ageNum)) {
    if (ageNum > 60) {
      severity += 15;
      recoveryProb -= 10;
      reasons.push("Severity increased and recovery slightly reduced due to advanced age limit.");
    } else if (ageNum < 25) {
      recoveryProb += 5;
      reasons.push("Youth factor provides slightly improved recovery probability.");
    }
  }

  // Database Age Risk Factors
  let ageRiskFlag = false;
  if (condition.riskFactors.includes("Elderly") && ageNum >= 60) {
     severity += 10;
     ageRiskFlag = true;
  }
  if (condition.riskFactors.includes("Children") && ageNum <= 12) {
     severity += 10;
     ageRiskFlag = true;
  }
  if (ageRiskFlag) {
    reasons.push(`Condition presents specific life-threatening risks for the patient's age bracket.`);
  }

  // Health factor
  if (health === 'poor') {
    severity += 25;
    recoveryProb -= 15;
    reasons.push("Risk significantly multiplied due to poor baseline health.");
  } else if (health === 'average') {
    severity += 10;
    recoveryProb -= 5;
    reasons.push("Average health provides minor resistance to rapid recovery.");
  }

  // Duration factor
  if (duration === 'just_started') {
    severity += 5;
    reasons.push("Early intervention actively keeps condition severity low.");
  } else if (duration === 'few_days') {
    severity += 10;
    recoveryProb -= 5;
    reasons.push("Condition has persisted for days, mildly raising severity.");
  } else if (duration === 'over_week') {
    severity += 20;
    recoveryProb -= 15;
    reasons.push("Prolonged duration escalates condition severity critically.");
  } else if (duration === 'chronic') {
    severity += 30;
    recoveryProb -= 25;
    reasons.push("Chronic duration substantially degrades internal recovery probability and pushes up risks.");
  }

  // Symptoms
  if (symptoms && symptoms.trim().length > 15) {
    severity += 10;
    reasons.push("Detailed reported symptoms indicate a concrete compounding problem.");
  }

  const symptomsLower = symptoms ? symptoms.toLowerCase() : '';
  if (symptomsLower.includes('severe') || symptomsLower.includes('pain') || symptomsLower.includes('fever')) {
    severity += 15;
    recoveryProb -= 5;
    reasons.push("Severe keyword pain points triggered an escalation in biological severity index.");
  }

  // Risk tolerance (how cautious they are)
  if (riskTolerance === 'low') {
    severity += 5; // They perceive more risk
    reasons.push("Patient's low risk tolerance slightly magnifies perceived condition severity.");
  } else if (riskTolerance === 'high') {
    severity -= 5; // They tolerate more risk
    reasons.push("Patient's high risk tolerance slightly dampens perceived condition severity.");
  }

  // Clamp values
  severity = Math.max(0, Math.min(100, severity));
  recoveryProb = Math.max(0, Math.min(100, recoveryProb));

  // Determine recommendation
  let recommendation = `Recommending: ${condition.tablet}`;

  const confidenceScore = Math.max(0, 100 - Math.abs(severity - recoveryProb) / 2);

  res.json({
    benefit: recoveryProb, // mapping benefit to recovery probability
    risk: severity,        // mapping risk to severity
    confidenceScore: Math.round(confidenceScore),
    recommendation,
    tablet: condition.tablet,
    sideEffects: condition.sideEffects,
    riskFactors: condition.riskFactors,
    reasons
  });
};

module.exports = {
  calculateDecision
};
