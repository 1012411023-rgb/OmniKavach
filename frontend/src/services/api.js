import { PATIENTS } from '../data/mockData';

const mockDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ===== Family Communication Data (Bilingual — English + Hindi) =====
// Each patient has a structured 12-hour timeline with compassionate, jargon-free updates
const FAMILY_COMMS = {
  '1': {
    patientName: 'Arjun',
    severity: 'critical',
    english: {
      summary: "Dear family, we want to keep you informed about Arjun's care over the last 12 hours. He is in serious condition with a severe infection that is affecting his whole body. Our entire ICU team is working around the clock to help him get better. We understand this is a very difficult time, and we are here for you.",
      careTeamMessage: "Our team of specialists — including an infectious disease doctor, a kidney specialist, and our ICU nurses — are all working together. A doctor will come to speak with you in person to answer your questions and discuss the next steps.",
      timeline: [
        { time: '8:00 PM', event: 'Arjun was brought to the ICU. The team immediately began evaluating his condition and started him on strong medicines to fight the infection.', eventHindi: 'अर्जुन को ICU में लाया गया। टीम ने तुरंत उनकी स्थिति का मूल्यांकन शुरू किया और संक्रमण से लड़ने के लिए मजबूत दवाइयां शुरू कीं।' },
        { time: '9:30 PM', event: 'Blood tests were collected to identify the exact infection. Antibiotics were started right away — we didn\'t wait for results because time is critical.', eventHindi: 'सटीक संक्रमण की पहचान के लिए रक्त जांच की गई। एंटीबायोटिक्स तुरंत शुरू कर दी गईं — हमने नतीजों का इंतज़ार नहीं किया क्योंकि समय बहुत महत्वपूर्ण है।' },
        { time: '11:00 PM', event: 'His blood pressure dropped, so the team added a special medicine through his IV to support his heart and blood flow. This is a normal step for this condition.', eventHindi: 'उनका रक्तचाप गिर गया, इसलिए टीम ने IV के ज़रिए हृदय और रक्त प्रवाह को सहारा देने के लिए विशेष दवा दी। यह इस स्थिति के लिए सामान्य कदम है।' },
        { time: '1:00 AM', event: 'A kidney specialist was called because his kidneys are working slower than normal. They are being closely monitored and treated.', eventHindi: 'किडनी विशेषज्ञ को बुलाया गया क्योंकि उनकी किडनी सामान्य से धीमी काम कर रही हैं। उन पर बारीकी से नज़र रखी जा रही है।' },
        { time: '4:00 AM', event: 'Overnight, Arjun rested with the help of mild sedation. The nurses checked on him every 15 minutes. His vital signs remained stable through the night.', eventHindi: 'रात भर, अर्जुन हल्की बेहोशी की दवा की मदद से आराम करते रहे। नर्सों ने हर 15 मिनट में उनकी जांच की। उनके वाइटल साइन रात भर स्थिर रहे।' },
        { time: '7:00 AM', event: 'Morning rounds: The full medical team reviewed his case. The infection medicines seem to be helping. His temperature is coming down slightly, which is encouraging.', eventHindi: 'सुबह का राउंड: पूरी मेडिकल टीम ने उनके केस की समीक्षा की। संक्रमण की दवाइयां काम करती दिख रही हैं। उनका तापमान थोड़ा कम हो रहा है, जो एक अच्छा संकेत है।' },
      ],
    },
    regional: {
      summary: "प्रिय परिवार, हम आपको पिछले 12 घंटों में अर्जुन की देखभाल के बारे में जानकारी देना चाहते हैं। उनकी स्थिति गंभीर है — एक गंभीर संक्रमण ने उनके पूरे शरीर को प्रभावित किया है। हमारी पूरी ICU टीम दिन-रात उनकी रिकवरी के लिए काम कर रही है। हम समझते हैं कि यह बहुत कठिन समय है, और हम आपके साथ हैं।",
      careTeamMessage: "हमारे विशेषज्ञों की टीम — जिसमें संक्रामक रोग विशेषज्ञ, किडनी विशेषज्ञ, और हमारी ICU नर्सें शामिल हैं — सब मिलकर काम कर रहे हैं। एक डॉक्टर जल्द ही आपसे मिलने आएंगे।",
    },
  },
  '2': {
    patientName: 'Priya',
    severity: 'warning',
    english: {
      summary: "Dear family, here is an update on Priya's care over the past 12 hours. She has a serious lung infection called pneumonia. She needs extra breathing support right now, but the medicines have been started and the team expects to see improvement soon. She is in good hands.",
      careTeamMessage: "Our respiratory therapist and ICU nursing team are closely watching her breathing. We expect noticeable improvement within 24–48 hours of starting antibiotics.",
      timeline: [
        { time: '10:00 PM', event: 'Priya was admitted with difficulty breathing. The team started oxygen support and took X-rays of her lungs.', eventHindi: 'प्रिया को सांस लेने में कठिनाई के साथ भर्ती किया गया। टीम ने ऑक्सीजन सहायता शुरू की और फेफड़ों का एक्स-रे लिया।' },
        { time: '11:30 PM', event: 'X-rays showed an infection in the left lung. Strong antibiotics were started immediately through IV.', eventHindi: 'एक्स-रे में बाएं फेफड़े में संक्रमण दिखा। IV के ज़रिए तुरंत मज़बूत एंटीबायोटिक्स शुरू की गईं।' },
        { time: '2:00 AM', event: 'She needed a little more oxygen. A special mask was placed to help her breathe more comfortably. She was able to rest.', eventHindi: 'उन्हें थोड़ी और ऑक्सीजन की ज़रूरत पड़ी। आराम से सांस लेने के लिए एक विशेष मास्क लगाया गया। वे आराम कर पाईं।' },
        { time: '6:00 AM', event: 'Morning blood tests show the antibiotics are beginning to work. Her oxygen levels are holding steady. She ate a light breakfast.', eventHindi: 'सुबह की रक्त जांच से पता चलता है कि एंटीबायोटिक्स काम करना शुरू कर रही हैं। उनका ऑक्सीजन स्तर स्थिर है। उन्होंने हल्का नाश्ता किया।' },
        { time: '8:00 AM', event: 'The doctor reviewed her case during morning rounds. They are optimistic about her recovery and will continue current treatment.', eventHindi: 'डॉक्टर ने सुबह के राउंड में उनके केस की समीक्षा की। वे उनकी रिकवरी को लेकर आशावादी हैं।' },
      ],
    },
    regional: {
      summary: "प्रिय परिवार, पिछले 12 घंटों में प्रिया की देखभाल की जानकारी यहां है। उन्हें निमोनिया नामक गंभीर फेफड़ों का संक्रमण है। अभी उन्हें अतिरिक्त सांस की सहायता चाहिए, लेकिन दवाइयां शुरू हो चुकी हैं और टीम को जल्दी सुधार की उम्मीद है।",
      careTeamMessage: "हमारी रेस्पिरेटरी थेरेपिस्ट और ICU नर्सिंग टीम उनकी सांस पर बारीकी से नज़र रख रही है। एंटीबायोटिक्स शुरू होने के 24-48 घंटों में सुधार दिखने की उम्मीद है।",
    },
  },
  '3': {
    patientName: 'Rahul',
    severity: 'stable',
    english: {
      summary: "Great news! Rahul is recovering very well after his surgery. All his vital signs are normal and stable. He has started physical therapy and is already walking short distances. The team is planning to send him home within a day or two.",
      careTeamMessage: "His surgical team and physiotherapist are very pleased with his progress. He is eating well and managing pain comfortably with oral medication.",
      timeline: [
        { time: '9:00 PM', event: 'Rahul had a comfortable evening. He watched TV and spoke with family on the phone before resting for the night.', eventHindi: 'राहुल की शाम आरामदायक रही। उन्होंने TV देखा और रात के आराम से पहले फोन पर परिवार से बात की।' },
        { time: '6:00 AM', event: 'Morning vitals all normal. He slept well through the night. Surgical wound looks clean and is healing normally.', eventHindi: 'सुबह के सभी वाइटल सामान्य। रात भर अच्छी नींद आई। सर्जिकल घाव साफ़ दिख रहा है और सामान्य रूप से ठीक हो रहा है।' },
        { time: '8:00 AM', event: 'Physical therapy session — he walked 50 feet with a walker. The team is very happy with his progress!', eventHindi: 'फिजियोथेरेपी सत्र — उन्होंने वॉकर के साथ 50 फीट चलकर दिखाया। टीम उनकी प्रगति से बहुत खुश है!' },
      ],
    },
    regional: {
      summary: "बहुत अच्छी खबर! राहुल सर्जरी के बाद बहुत अच्छी तरह ठीक हो रहे हैं। सभी वाइटल साइन सामान्य और स्थिर हैं। फिजियोथेरेपी शुरू हो गई है और वे पहले से ही थोड़ी दूर तक चल रहे हैं। टीम एक-दो दिन में डिस्चार्ज की योजना बना रही है।",
      careTeamMessage: "उनकी सर्जिकल टीम और फिजियोथेरेपिस्ट उनकी प्रगति से बहुत खुश हैं। वे अच्छा खा रहे हैं और मुंह से दवा लेकर दर्द को आराम से संभाल रहे हैं।",
    },
  },
  '4': {
    patientName: 'Sunita',
    severity: 'critical',
    english: {
      summary: "Dear family, we want to be honest and transparent with you. Sunita is in very serious condition with a severe breathing problem. A machine is helping her breathe right now. The medical team is using every available treatment. We know this is very frightening, and a senior doctor will come to speak with you very soon.",
      careTeamMessage: "Our most experienced ICU team is at her bedside. A senior physician will meet with you to explain the treatment plan and answer all your questions in person.",
      timeline: [
        { time: '7:00 PM', event: 'Sunita\'s breathing became very difficult. The team placed her on a breathing machine (ventilator) to give her lungs rest.', eventHindi: 'सुनीता की सांस बहुत मुश्किल हो गई। टीम ने फेफड़ों को आराम देने के लिए उन्हें सांस की मशीन (वेंटिलेटर) पर रखा।' },
        { time: '9:00 PM', event: 'The team positioned her face-down (a proven technique) to help her lungs work better. This is a standard treatment for her condition.', eventHindi: 'टीम ने फेफड़ों को बेहतर काम करने में मदद करने के लिए उन्हें पेट के बल लिटाया (एक सिद्ध तकनीक)। यह उनकी स्थिति के लिए मानक उपचार है।' },
        { time: '12:00 AM', event: 'Her oxygen levels improved slightly with the positioning. The team is encouraged. She is resting comfortably with sedation.', eventHindi: 'पोजिशनिंग से उनका ऑक्सीजन स्तर थोड़ा सुधरा। टीम उत्साहित है। वे बेहोशी की दवा के साथ आराम से हैं।' },
        { time: '3:00 AM', event: 'Stable overnight. Nurses monitored her continuously. No new concerns developed during the night hours.', eventHindi: 'रात भर स्थिर। नर्सों ने लगातार निगरानी की। रात के दौरान कोई नई चिंता नहीं हुई।' },
        { time: '7:00 AM', event: 'Morning assessment shows her lungs are responding to treatment. The team will continue current approach. A doctor will update you after rounds.', eventHindi: 'सुबह के आकलन में पता चला कि फेफड़े उपचार पर प्रतिक्रिया दे रहे हैं। टीम मौजूदा दृष्टिकोण जारी रखेगी। राउंड के बाद डॉक्टर आपको अपडेट देंगे।' },
      ],
    },
    regional: {
      summary: "प्रिय परिवार, हम आपके साथ ईमानदार और पारदर्शी रहना चाहते हैं। सुनीता की स्थिति बहुत गंभीर है — गंभीर श्वास समस्या है। एक मशीन अभी उन्हें सांस लेने में मदद कर रही है। मेडिकल टीम हर उपलब्ध उपचार का उपयोग कर रही है। एक वरिष्ठ डॉक्टर जल्द ही आपसे मिलने आएंगे।",
      careTeamMessage: "हमारी सबसे अनुभवी ICU टीम उनके बेडसाइड पर है। एक वरिष्ठ चिकित्सक उपचार योजना समझाने और आपके सभी सवालों के जवाब देने के लिए आपसे मिलेंगे।",
    },
  },
  '5': {
    patientName: 'Vikram',
    severity: 'warning',
    english: {
      summary: "Dear family, Vikram developed a temporary kidney issue after a recent medical test. This is a known and treatable side effect. The team is treating it with fluids and monitoring closely. We expect his kidneys to recover over the next few days.",
      careTeamMessage: "A kidney specialist has been consulted and is part of the care team. They are confident that with proper treatment, his kidney function will return to normal.",
      timeline: [
        { time: '11:00 PM', event: 'Blood tests showed Vikram\'s kidneys are working slower than expected after his CT scan. The team started giving him extra fluids through his IV.', eventHindi: 'रक्त जांच में पता चला कि CT स्कैन के बाद विक्रम की किडनी उम्मीद से धीमी काम कर रही है। टीम ने IV के ज़रिए उन्हें अतिरिक्त तरल पदार्थ देना शुरू किया।' },
        { time: '2:00 AM', event: 'A kidney specialist reviewed his case and recommended continuing the fluid treatment. All harmful medications were stopped.', eventHindi: 'किडनी विशेषज्ञ ने उनके केस की समीक्षा की और फ्लूइड उपचार जारी रखने की सिफारिश की। सभी हानिकारक दवाइयां बंद कर दी गईं।' },
        { time: '6:00 AM', event: 'Morning tests show his kidney numbers are stabilizing. This is a positive sign. He is urinating normally which means the treatment is working.', eventHindi: 'सुबह की जांच से पता चलता है कि उनकी किडनी के आंकड़े स्थिर हो रहे हैं। यह सकारात्मक संकेत है। सामान्य रूप से पेशाब हो रही है जो दर्शाता है कि उपचार काम कर रहा है।' },
      ],
    },
    regional: {
      summary: "प्रिय परिवार, विक्रम को हाल की मेडिकल जांच के बाद अस्थायी किडनी समस्या हुई है। यह एक ज्ञात और उपचार योग्य दुष्प्रभाव है। टीम तरल पदार्थों से इलाज कर रही है और बारीकी से निगरानी कर रही है। हम उम्मीद करते हैं कि अगले कुछ दिनों में किडनी ठीक हो जाएगी।",
      careTeamMessage: "किडनी विशेषज्ञ से परामर्श किया गया है और वे देखभाल टीम का हिस्सा हैं। उन्हें विश्वास है कि उचित उपचार से किडनी की कार्यप्रणाली सामान्य हो जाएगी।",
    },
  },
  '6': {
    patientName: 'Meena',
    severity: 'warning',
    english: {
      summary: "Dear family, Meena's heart condition is responding well to treatment over the past 12 hours. Her breathing has improved noticeably and she is more comfortable. The team is adjusting her medications to help her heart work more efficiently.",
      careTeamMessage: "Her cardiologist reviewed her case this morning and is pleased with the response to treatment. We are working toward getting her ready to go home soon.",
      timeline: [
        { time: '8:00 PM', event: 'Meena received her evening heart medications and a medicine to help remove excess fluid from her body. She rested comfortably.', eventHindi: 'मीना को शाम की हृदय दवाइयां और शरीर से अतिरिक्त तरल निकालने की दवा दी गई। वे आराम से रहीं।' },
        { time: '12:00 AM', event: 'Overnight monitoring showed her heart rhythm is steady. Breathing is easier than yesterday. No concerns during the night.', eventHindi: 'रात भर की निगरानी में उनकी हृदय गति स्थिर दिखी। सांस कल से आसान है। रात में कोई चिंता नहीं।' },
        { time: '6:00 AM', event: 'Morning weigh-in shows she lost 1.5 kg of extra fluid — exactly what the team was hoping for. Her breathing is much better.', eventHindi: 'सुबह के वज़न में 1.5 किलो अतिरिक्त तरल कम हुआ — ठीक वही जो टीम चाहती थी। उनकी सांस बहुत बेहतर है।' },
        { time: '8:00 AM', event: 'The cardiologist visited and is very encouraged. They are planning to switch some medicines to tablet form — a step toward going home!', eventHindi: 'हृदय रोग विशेषज्ञ ने दौरा किया और बहुत उत्साहित हैं। वे कुछ दवाइयां टैबलेट में बदलने की योजना बना रहे हैं — घर जाने की दिशा में एक कदम!' },
      ],
    },
    regional: {
      summary: "प्रिय परिवार, पिछले 12 घंटों में मीना के हृदय की स्थिति उपचार पर अच्छी प्रतिक्रिया दे रही है। उनकी सांस में काफ़ी सुधार हुआ है और वे अधिक आरामदायक हैं। टीम उनकी दवाइयां एडजस्ट कर रही है ताकि हृदय बेहतर काम करे।",
      careTeamMessage: "उनके हृदय रोग विशेषज्ञ ने आज सुबह केस की समीक्षा की और उपचार की प्रतिक्रिया से खुश हैं। हम उन्हें जल्द ही घर भेजने की तैयारी कर रहे हैं।",
    },
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
    agentSummary['LabOutlierAgent'] = {
      status: isOutlier ? 'flagged' : 'complete',
      labsAnalyzed: patient.timeline?.lactate?.length || 0,
      processingTime: '0.8s',
      ...(isOutlier && { outlierDetected: true, diagnosisBlocked: true }),
    };
  } else {
    agentSummary['LabOutlierAgent'].labsAnalyzed = patient.timeline?.lactate?.length || 0;
    if (isOutlier) {
      agentSummary['LabOutlierAgent'].outlierDetected = true;
      agentSummary['LabOutlierAgent'].diagnosisBlocked = true;
    }
  }
  if (!agentSummary['ChiefSynthesisAgent']) {
    agentSummary['ChiefSynthesisAgent'] = {
      status: isOutlier ? 'blocked' : 'complete',
      riskScore: riskScore / 100,
      recommendationsGenerated: recommendations.length,
      processingTime: '2.1s',
      ...(isOutlier && { blockedReason: 'Outlier lab value detected — refusing to revise diagnosis until confirmed redraw received' }),
    };
  } else {
    agentSummary['ChiefSynthesisAgent'].riskScore = riskScore / 100;
    agentSummary['ChiefSynthesisAgent'].recommendationsGenerated = recommendations.length;
    if (isOutlier) {
      agentSummary['ChiefSynthesisAgent'].status = 'blocked';
      agentSummary['ChiefSynthesisAgent'].blockedReason = 'Outlier lab value detected — refusing to revise diagnosis until confirmed redraw received';
    }
  }

  // Build detected anomalies from risk factors
  const detected_anomalies = (aiSynthesis.riskFactors || []).map((r) => r.label);
  if (isOutlier) {
    detected_anomalies.push('PROBABLE MISLABELED RESULT: Lactate 15.0 mmol/L at T+30h — verify sample integrity');
    detected_anomalies.push('SENSOR ERROR: Value contradicts 72h baseline (mean 3.2 ± 0.4 mmol/L) by +29.5 SD');
  }

  // RAG citations from guidelines referenced
  const ragCitations = (aiSynthesis.guidelinesReferenced || []).map(
    (g) => `${g.name} — ${g.source}`
  );

  // ── Twist 2: Outlier problematic values with 3-day baseline contradiction ──
  const outlierData = isOutlier ? {
    is_outlier: true,
    severity: 'critical',
    reason: 'PROBABLE MISLABELED RESULT / SENSOR ERROR',
    details: 'A new Lactate result of 15.0 mmol/L arrived at T+30h that directly contradicts 3 days of consistent data (range 2.8–3.6 mmol/L). This is a 29.5σ deviation — statistically impossible without sample contamination or mislabeling.',
    recommendation: 'WAITING FOR REDRAW',
    diagnosisBlocked: true,
    chiefAgentResponse: 'The Chief Synthesis Agent has REFUSED to incorporate this value into the risk assessment. The current diagnosis remains unchanged and is based on the last verified dataset. A confirmed redraw is required before any diagnostic revision.',
    baseline: {
      label: 'Lactate (72h Baseline)',
      values: [
        { time: 'T+0h (Day 1)', value: 2.8, unit: 'mmol/L' },
        { time: 'T+6h', value: 3.1, unit: 'mmol/L' },
        { time: 'T+12h', value: 3.4, unit: 'mmol/L' },
        { time: 'T+18h (Day 2)', value: 3.2, unit: 'mmol/L' },
        { time: 'T+24h', value: 3.0, unit: 'mmol/L' },
        { time: 'T+28h', value: 3.6, unit: 'mmol/L' },
      ],
      mean: 3.18,
      stdDev: 0.28,
    },
    problematic_values: [
      {
        time: 'T+30h (NEW)',
        value: 15.0,
        unit: 'mmol/L',
        z_score: 29.5,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        verdict: 'REJECTED — exceeds 2.5 SD threshold by 27.0σ',
      },
    ],
  } : null;

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
    outlierData,
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
