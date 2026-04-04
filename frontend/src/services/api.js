import { PATIENTS } from '../data/mockData';

const mockDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ===== Family Communication Data (Bilingual — English + Hindi) =====
const FAMILY_COMMS = {
  '1': {
    english: "Your loved one, Arjun, is currently in serious condition with a severe infection called septic shock. The medical team has started powerful antibiotics and medications to support his blood pressure. His kidney function is being closely watched. The entire ICU team is actively managing his care, and we will update you regularly.",
    regional: "आपके प्रियजन अर्जुन की स्थिति गंभीर है — उन्हें सेप्टिक शॉक नामक गंभीर संक्रमण है। मेडिकल टीम ने शक्तिशाली एंटीबायोटिक्स और रक्तचाप को सहारा देने वाली दवाएं शुरू कर दी हैं। उनकी किडनी की कार्यप्रणाली पर कड़ी नज़र रखी जा रही है। पूरी ICU टीम उनकी देखभाल में सक्रिय है।"
  },
  '2': {
    english: "Priya is being treated for a serious lung infection (pneumonia). She needs extra oxygen support right now, but the medical team expects improvement within 48 hours of starting antibiotics. We are monitoring her breathing closely and will keep you informed.",
    regional: "प्रिया का गंभीर फेफड़ों के संक्रमण (निमोनिया) का इलाज चल रहा है। उन्हें अभी अतिरिक्त ऑक्सीजन सहायता की आवश्यकता है, लेकिन एंटीबायोटिक्स शुरू होने के 48 घंटों में सुधार की उम्मीद है। हम उनकी सांस पर बारीकी से नज़र रख रहे हैं।"
  },
  '3': {
    english: "Rahul is recovering very well after his hip replacement surgery. All vital signs are stable and within normal ranges. He has started physical therapy and the team is planning discharge within the next day or two.",
    regional: "राहुल की हिप रिप्लेसमेंट सर्जरी के बाद रिकवरी बहुत अच्छी हो रही है। सभी वाइटल साइन स्थिर और सामान्य सीमा में हैं। फिजियोथेरेपी शुरू हो गई है और टीम अगले एक-दो दिन में डिस्चार्ज की योजना बना रही है।"
  },
  '4': {
    english: "Sunita is in critical condition with a severe breathing problem called ARDS. She is on a ventilator to help her breathe. The medical team is using specialized techniques including prone positioning. This is a very serious condition, and a physician will speak with you to discuss the care plan in detail.",
    regional: "सुनीता की स्थिति गंभीर है — उन्हें ARDS नामक गंभीर श्वास समस्या है। सांस लेने में मदद के लिए वेंटिलेटर पर हैं। मेडिकल टीम प्रोन पोजिशनिंग सहित विशेष तकनीकों का उपयोग कर रही है। यह बहुत गंभीर स्थिति है, डॉक्टर जल्द ही आपसे विस्तार से बात करेंगे।"
  },
  '5': {
    english: "Vikram has developed a kidney issue related to a recent CT scan contrast dye. The team is treating it with IV fluids and closely monitoring his kidney function. The condition is expected to improve with treatment over the next few days.",
    regional: "विक्रम को हाल ही में CT स्कैन के कॉन्ट्रास्ट डाई से संबंधित किडनी की समस्या हुई है। टीम IV फ्लूइड से इलाज कर रही है और किडनी की कार्यप्रणाली की बारीकी से निगरानी कर रही है। अगले कुछ दिनों में उपचार से सुधार की उम्मीद है।"
  },
  '6': {
    english: "Meena's heart condition is responding well to treatment. Her breathing has improved significantly and fluid buildup is reducing. The medical team is optimizing her medications and planning for discharge once she reaches her target weight.",
    regional: "मीना के हृदय की स्थिति उपचार से अच्छी प्रतिक्रिया दे रही है। उनकी सांस में काफी सुधार हुआ है और तरल पदार्थ का जमाव कम हो रहा है। टीम दवाओं को अनुकूलित कर रही है और लक्ष्य वजन पहुंचने पर डिस्चार्ज की योजना बना रही है।"
  },
};

// ===== Clinical Recommendations per Patient =====
const RECOMMENDATIONS = {
  '1': [
    "URGENT: Continue Surviving Sepsis Campaign Hour-1 Bundle",
    "Maintain broad-spectrum IV antibiotics — reassess cultures at 48h",
    "Titrate norepinephrine to MAP ≥ 65 mmHg",
    "Aggressive fluid resuscitation with crystalloid boluses",
    "Monitor lactate every 2–4 hours until normalizing",
    "Urgent nephrology consult for CRRT evaluation if oliguria persists > 6h",
    "Repeat STAT lactate — T+30h value flagged as probable lab error",
    "Correct hyperkalemia: calcium gluconate, insulin-dextrose, reassess K+ in 2h",
  ],
  '2': [
    "Continue IV antibiotics per CAP guidelines (IDSA/ATS)",
    "Titrate supplemental O2 to maintain SpO2 ≥ 92%",
    "Repeat CXR in 48h to assess treatment response",
    "Monitor respiratory rate and work of breathing every 2h",
    "Consider NIV if hypoxia worsens despite O2 escalation",
  ],
  '3': [
    "Continue DVT prophylaxis per NICE NG89",
    "Progress mobilisation with physiotherapy",
    "Assess readiness for step-down or discharge at 72h",
    "Pain management — titrate analgesia to VAS ≤ 3",
  ],
  '4': [
    "CRITICAL: Maintain lung-protective ventilation (Vt 6 mL/kg IBW)",
    "Continue prone positioning cycles (16h prone / 8h supine)",
    "Reassess P/F ratio every 6h",
    "Consider neuromuscular blockade for ventilator dyssynchrony",
    "Consult ECMO team if P/F ratio < 80 despite optimization",
    "Restrictive fluid strategy — target even to negative balance",
  ],
  '5': [
    "Aggressive IV hydration with isotonic saline",
    "Avoid all nephrotoxic agents (NSAIDs, aminoglycosides, contrast)",
    "Monitor serum creatinine and electrolytes every 12h",
    "Recheck renal function at 48h — if no improvement, nephrology consult",
    "Maintain urine output > 0.5 mL/kg/hr",
  ],
  '6': [
    "Continue IV loop diuretics — target 1–2 kg/day weight loss",
    "Daily weights and strict I/O monitoring",
    "Optimize GDMT: ACEi/ARB, beta-blocker, MRA as tolerated",
    "Restrict sodium < 2g/day and fluid < 1.5L/day",
    "BNP trending — reassess at discharge readiness",
  ],
};

// ===== API Exports =====

export const getAllPatients = async () => {
  await mockDelay(500);
  return {
    data: PATIENTS.map(({ id, bed, name, age, status, condition, riskScore }) => ({
      id, bed, name, age, status, condition, riskScore,
    })),
  };
};

export const getPatientData = async (id) => {
  await mockDelay(800);
  const patient = PATIENTS.find((p) => p.id === id);
  if (!patient) throw new Error(`Patient ${id} not found`);
  return { data: patient };
};

export const runAgentAnalysis = async (id, options = {}) => {
  await mockDelay(2500); // Simulate multi-agent processing time
  const patient = PATIENTS.find((p) => p.id === id);
  if (!patient) throw new Error(`Patient ${id} not found`);

  const { aiSynthesis, riskScore } = patient;
  const familyComm = FAMILY_COMMS[id] || FAMILY_COMMS['3'];
  const recommendations = RECOMMENDATIONS[id] || ["Continue current care plan"];
  const isOutlier = id === '1'; // Patient 1 has the lactate outlier at T+30h

  // Transform agentTrace → agentSummary object keyed by agent name
  const agentSummary = {};
  (aiSynthesis.agentTrace || []).forEach((trace) => {
    agentSummary[trace.agent] = {
      status: trace.status,
      output: trace.output,
      processingTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
    };
  });
  // Ensure at least the 3 core agents exist
  if (!agentSummary['NoteParserAgent']) {
    agentSummary['NoteParserAgent'] = { status: 'complete', symptomsExtracted: patient.highlightedWords?.length || 0, processingTime: '1.2s' };
  } else {
    agentSummary['NoteParserAgent'].symptomsExtracted = patient.highlightedWords?.length || 0;
  }
  if (!agentSummary['LabOutlierAgent']) {
    agentSummary['LabOutlierAgent'] = { status: isOutlier ? 'flagged' : 'complete', labsAnalyzed: patient.timeline?.lactate?.length || 0, processingTime: '0.8s' };
  } else {
    agentSummary['LabOutlierAgent'].labsAnalyzed = patient.timeline?.lactate?.length || 0;
  }
  if (!agentSummary['ChiefSynthesisAgent']) {
    agentSummary['ChiefSynthesisAgent'] = { status: 'complete', riskScore: riskScore / 100, recommendationsGenerated: recommendations.length, processingTime: '2.1s' };
  } else {
    agentSummary['ChiefSynthesisAgent'].riskScore = riskScore / 100;
    agentSummary['ChiefSynthesisAgent'].recommendationsGenerated = recommendations.length;
  }

  // Build detected anomalies from risk factors
  const detected_anomalies = (aiSynthesis.riskFactors || []).map((r) => r.label);
  if (isOutlier) {
    detected_anomalies.push('PROBABLE MISLABELED RESULT: Lactate 15.0 mmol/L at T+30h — verify sample integrity');
  }

  // RAG citations from guidelines referenced
  const ragCitations = (aiSynthesis.guidelinesReferenced || []).map(
    (g) => `${g.name} — ${g.source}`
  );

  return {
    status: isOutlier ? 'WAITING FOR REDRAW' : 'complete',
    patientId: id,
    analysisReport: {
      riskScore: riskScore / 100,
      detected_anomalies,
      recommendations,
      safety_disclaimer: "This is a decision-support tool only. Clinical judgment and direct patient assessment take priority.",
      family_communication: familyComm,
      status: isOutlier ? 'WAITING FOR REDRAW' : 'complete',
      chiefSummary: aiSynthesis.chiefSummary,
    },
    agentSummary,
    ragCitations,
    family_communication: familyComm,
    processingTime: 2.5,
    timestamp: Date.now() / 1000,
    detected_anomalies,
  };
};

export const formatAnalysisForUI = (result) => {
  return {
    ...result,
    processingTimeFormatted: `${result.processingTime.toFixed(1)}s`,
    timestampFormatted: new Date(result.timestamp * 1000).toLocaleString(),
  };
};

export const getRAGStatus = async () => {
  return { ragEnabled: true, documentCount: 5, collection: 'sepsis_guidelines', status: 'healthy' };
};

export default {};
