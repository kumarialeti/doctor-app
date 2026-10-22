import Doctor from "../models/Doctor.js";
import Review from "../models/Review.js";

// Comprehensive Medical Knowledge Matrix for intelligent symptom diagnosis
const MEDICAL_KNOWLEDGE = [
  {
    category: "Cardiology",
    specialist: "Cardiologist",
    keywords: ["chest pain", "heart", "palpitation", "high blood pressure", "hypertension", "shortness of breath", "angina", "irregular heartbeat", "cholesterol"],
    urgency: "high",
    emergencyKeywords: ["crushing chest pain", "pain radiating to left arm", "severe breathlessness", "fainting with chest pain"],
    advice: "Chest discomfort and cardiovascular symptoms require prompt clinical attention. Avoid strenuous activity and caffeine until evaluated.",
    homeCare: ["Rest in an upright comfortable position", "Avoid sudden physical exertion", "Monitor blood pressure if monitor is available", "Stay calm and do not consume heavy meals"]
  },
  {
    category: "Dermatology",
    specialist: "Dermatologist",
    keywords: ["skin", "rash", "acne", "itching", "eczema", "psoriasis", "mole", "hives", "hair loss", "scalp", "dandruff", "pigmentation", "fungal", "pimples"],
    urgency: "low",
    emergencyKeywords: ["rapidly spreading purple rash", "difficulty breathing with rash", "facial swelling"],
    advice: "Skin conditions often benefit from accurate topical or oral therapy. Avoid scratching to prevent secondary bacterial infections.",
    homeCare: ["Keep the affected area clean and dry", "Use mild, fragrance-free moisturizers", "Avoid harsh chemical soaps", "Do not pop or scratch lesions"]
  },
  {
    category: "Orthopedics",
    specialist: "Orthopedic",
    keywords: ["joint pain", "knee pain", "back pain", "spine", "fracture", "bone", "arthritis", "shoulder pain", "sprain", "neck pain", "swollen ankle", "ligament"],
    urgency: "medium",
    emergencyKeywords: ["unable to bear any weight after trauma", "visible bone deformity", "sudden loss of bowel or bladder control with back pain"],
    advice: "Musculoskeletal strain or joint inflammation should be assessed by an orthopedic surgeon or physical specialist.",
    homeCare: ["Follow the R.I.C.E protocol (Rest, Ice, Compression, Elevation)", "Avoid high-impact exercises", "Apply warm compress for stiffness or cold pack for swelling", "Maintain good posture while sitting"]
  },
  {
    category: "Neurology",
    specialist: "Neurologist",
    keywords: ["headache", "migraine", "dizziness", "vertigo", "seizure", "numbness", "tingling", "tremor", "memory loss", "paralysis", "nerve pain"],
    urgency: "medium",
    emergencyKeywords: ["sudden worst headache of life (thunderclap)", "facial drooping", "arm weakness", "slurred speech"],
    advice: "Persistent or severe neurological symptoms require specialized evaluation to check cranial and sensory pathways.",
    homeCare: ["Rest in a quiet, dark room", "Stay adequately hydrated", "Avoid bright screens and loud sounds during headaches", "Track migraine triggers (food, sleep changes)"]
  },
  {
    category: "ENT (Ear, Nose & Throat)",
    specialist: "ENT Specialist",
    keywords: ["throat pain", "sore throat", "ear pain", "ear discharge", "sinus", "tonsils", "hearing loss", "ringing in ear", "tinnitus", "nasal congestion", "runny nose", "voice loss"],
    urgency: "low",
    emergencyKeywords: ["inability to swallow saliva", "stridor breathing sound", "severe neck swelling"],
    advice: "Upper respiratory and ear/throat infections respond best to targeted diagnosis and antihistamines or antibiotics when indicated.",
    homeCare: ["Perform warm salt-water gargles 3 times daily", "Inhale steam with warm water to relieve sinuses", "Drink warm soothing liquids (honey, ginger tea)", "Avoid cold or iced beverages"]
  },
  {
    category: "Pediatrics",
    specialist: "Pediatrician",
    keywords: ["child", "baby", "infant", "toddler", "kid", "vaccination", "pediatric", "colic", "newborn"],
    urgency: "medium",
    emergencyKeywords: ["infant under 3 months with fever > 100.4 F", "persistent inconsolable crying", "sunken eyes and dehydration"],
    advice: "Infants and young children have delicate immune systems and require pediatrician-guided dosing.",
    homeCare: ["Ensure frequent oral fluids or breast milk", "Dress child in light, breathable clothing", "Record fever patterns with a digital thermometer", "Consult a pediatrician before giving any medication"]
  },
  {
    category: "Gynecology",
    specialist: "Gynecologist",
    keywords: ["period", "menstrual", "pregnancy", "cramps", "pcos", "pcod", "vaginal", "pelvic pain", "ovary", "menopause", "hormone"],
    urgency: "medium",
    emergencyKeywords: ["severe acute pelvic pain with dizziness", "heavy bleeding with blood clots during pregnancy"],
    advice: "Menstrual irregularities, reproductive health, and pelvic discomfort are best diagnosed with an ultrasound and gynecologist review.",
    homeCare: ["Use a heating pad for lower abdominal cramps", "Maintain proper hydration and balanced nutrition", "Track cycle dates and symptom severity on a calendar", "Avoid intense abdominal strain during acute cramps"]
  },
  {
    category: "Gastroenterology",
    specialist: "Gastroenterologist",
    keywords: ["stomach pain", "acid reflux", "heartburn", "indigestion", "gastric", "bloating", "constipation", "diarrhea", "vomiting", "nausea", "ulcer", "ibs"],
    urgency: "medium",
    emergencyKeywords: ["vomiting blood or coffee-ground material", "black tarry stools", "rigid, board-like abdomen"],
    advice: "Digestive discomfort and chronic acid reflux may indicate gastritis, GERD, or dietary intolerances.",
    homeCare: ["Eat small, frequent, non-greasy meals", "Avoid spicy, fried foods and carbonated drinks", "Do not lie down immediately after eating (wait at least 2 hours)", "Drink plenty of electrolytes (ORS/coconut water) if experiencing loose stools"]
  },
  {
    category: "Ophthalmology",
    specialist: "Ophthalmologist",
    keywords: ["eye pain", "blurry vision", "red eye", "conjunctivitis", "dry eyes", "double vision", "eye strain", "watering eye", "floaters"],
    urgency: "medium",
    emergencyKeywords: ["sudden loss of vision", "chemical splash into eye", "severe eye pain with halo around lights"],
    advice: "Vision is delicate; sudden changes in sight or deep eye ache need a slit-lamp examination by an eye doctor.",
    homeCare: ["Do not rub the eyes", "Wash hands thoroughly before touching facial area", "Take frequent 20-20-20 screen breaks", "Use preservative-free lubricating eye drops if recommended"]
  },
  {
    category: "Psychiatry / Mental Health",
    specialist: "Psychiatrist",
    keywords: ["anxiety", "depression", "panic attack", "insomnia", "sleeplessness", "stress", "mood swing", "mental health", "adhd", "phobia"],
    urgency: "low",
    emergencyKeywords: ["thoughts of self-harm or suicide"],
    advice: "Mental wellness is an integral part of holistic health. Counseling, behavioral therapy, or medical support can provide great relief.",
    homeCare: ["Practice 4-7-8 deep breathing or mindfulness meditation", "Maintain a consistent sleep-wake schedule", "Limit screen time and caffeine before bedtime", "Reach out to trusted family, friends, or a counselor"]
  },
  {
    category: "General Medicine",
    specialist: "General Physician",
    keywords: ["fever", "cold", "body ache", "weakness", "fatigue", "chills", "infection", "cough", "flu", "tiredness", "weight loss", "diabetes"],
    urgency: "low",
    emergencyKeywords: ["fever above 104 F unresponsive to medicine", "stiff neck with high fever", "altered mental state"],
    advice: "General constitutional symptoms such as viral fever, fatigue, or seasonal infections are best diagnosed by a General Physician.",
    homeCare: ["Get plenty of restorative rest", "Hydrate well with warm water, soups, and fluids", "Monitor body temperature every 4-6 hours", "Eat light, easily digestible home-cooked meals"]
  }
];

export const checkSymptoms = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Please describe your symptoms."
      });
    }

    const lowerInput = message.toLowerCase();

    // Check for emergency keywords first
    let isEmergency = false;
    let emergencyAlert = "";

    for (const entry of MEDICAL_KNOWLEDGE) {
      for (const eKey of entry.emergencyKeywords) {
        if (lowerInput.includes(eKey)) {
          isEmergency = true;
          emergencyAlert = `⚠️ CRITICAL ATTENTION REQUIRED: Your symptoms indicate potentially urgent medical criteria ("${eKey}"). Please immediately contact local emergency services (112 or your nearest hospital ER). Do not delay in seeking urgent care.`;
          break;
        }
      }
      if (isEmergency) break;
    }

    // Match best specialist category using weighted score
    let bestMatch = null;
    let highestScore = 0;

    for (const entry of MEDICAL_KNOWLEDGE) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (lowerInput.includes(kw)) {
          score += 2;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    // Fallback if no specific keyword matched
    if (!bestMatch || highestScore === 0) {
      bestMatch = MEDICAL_KNOWLEDGE.find(k => k.category === "General Medicine");
    }

    // Find real approved doctors from MongoDB matching this specialization
    // Search with regex on specialization field
    const regex = new RegExp(bestMatch.specialist.split(" ")[0], "i");
    let matchedDoctors = await Doctor.find({
      status: "approved",
      specialization: { $regex: regex }
    }).limit(3).lean();

    // If no exact match, fetch any approved doctors
    if (matchedDoctors.length === 0) {
      matchedDoctors = await Doctor.find({ status: "approved" }).limit(3).lean();
    }

    // Attach ratings to recommended doctors
    const doctorsWithRating = await Promise.all(
      matchedDoctors.map(async (doc) => {
        const reviews = await Review.find({ doctorId: doc._id });
        const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "5.0";
        return {
          _id: doc._id,
          fullname: doc.fullname,
          specialization: doc.specialization,
          fees: doc.fees,
          experience: doc.experience,
          timings: doc.timings,
          avgRating,
          totalReviews: reviews.length
        };
      })
    );

    // Build personalized clinical explanation
    let clinicalAnalysis = "";
    if (isEmergency) {
      clinicalAnalysis = emergencyAlert;
    } else {
      clinicalAnalysis = `Based on your description, your symptoms correlate with **${bestMatch.category}** care. The primary specialist recommended for your condition is a **${bestMatch.specialist}**.\n\n${bestMatch.advice}`;
    }

    return res.status(200).send({
      success: true,
      analysis: clinicalAnalysis,
      category: bestMatch.category,
      specialist: bestMatch.specialist,
      urgency: isEmergency ? "emergency" : bestMatch.urgency,
      homeCare: bestMatch.homeCare,
      recommendedDoctors: doctorsWithRating,
      disclaimer: "MediCare AI Assistant provides preliminary guidance based on medical protocol matrices and is not a substitute for professional clinical diagnosis. In case of severe discomfort, please consult a verified physician immediately."
    });

  } catch (error) {
    console.error("Error in checkSymptoms:", error);
    res.status(500).send({
      success: false,
      message: "Internal server error during symptom analysis.",
      error: error.message
    });
  }
};
