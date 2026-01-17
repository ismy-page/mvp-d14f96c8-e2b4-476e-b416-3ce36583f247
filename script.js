(() => {
  const byId = (id) => document.getElementById(id);
  const year = byId("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Elements
  const cName = byId("cName");
  const cAge = byId("cAge");
  const cSkin = byId("cSkin");
  const cConcerns = byId("cConcerns");
  const cPrefs = byId("cPrefs");
  const cOpening = byId("cOpening");
  const feed = byId("feed");
  const input = byId("advisorInput");
  const sendBtn = byId("sendBtn");
  const clearBtn = byId("clearBtn");
  const newBtn = byId("newScenarioBtn");

  const sEmpathy = byId("scoreEmpathy");
  const sDisc = byId("scoreDiscovery");
  const sFit = byId("scoreFit");
  const sSafety = byId("scoreSafety");
  const sClose = byId("scoreClose");
  const sEmpathyOut = byId("scoreEmpathyOut");
  const sDiscOut = byId("scoreDiscoveryOut");
  const sFitOut = byId("scoreFitOut");
  const sSafetyOut = byId("scoreSafetyOut");
  const sCloseOut = byId("scoreCloseOut");
  const coachList = byId("coachList");

  /** Simulation state **/
  let scenario = null;
  let transcript = [];

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const DATA = {
    names: ["Alex", "Sam", "Jordan", "Taylor", "Riley", "Casey", "Avery", "Drew"],
    ages: ["18–24", "25–34", "35–44", "45–54"],
    skin: ["oily", "dry", "combination", "sensitive"],
    prefs: ["fragrance‑free", "vegan", "lightweight textures", "rich textures", "budget‑friendly"],
    concerns: ["acne", "uneven tone", "lines & firmness", "redness", "dryness", "shine"],
  };

  const OPENERS = {
    acne: [
      "Hi, I’m breaking out along my T‑zone and feel oily by midday. Any tips?",
      "Struggling with small breakouts—what routine should I try?",
    ],
    "uneven tone": [
      "I want to brighten dark spots from old blemishes—where should I start?",
      "Looking for something for dullness and marks, but nothing too harsh.",
    ],
    "lines & firmness": [
      "I’d like to soften fine lines and keep my skin firm. What do you recommend?",
      "Curious about starting retinol but a bit nervous—advice?",
    ],
    redness: [
      "My skin gets red and sensitive, especially after cleansing. Help?",
      "I flush easily and want to calm my skin without irritation.",
    ],
    dryness: [
      "My skin feels tight and flaky—what can I use for lasting hydration?",
      "Need a hydrating routine that isn’t heavy under makeup.",
    ],
    shine: [
      "I’m shiny a couple hours after cleansing and want to look fresh longer.",
      "How can I control oil without drying out my skin?",
    ],
  };

  const KNOWLEDGE = {
    oily: ["gel cleanser", "oil‑free", "non‑comedogenic", "salicylic", "niacinamide", "clay mask"],
    acne: ["salicylic", "niacinamide", "spot treatment", "non‑comedogenic", "SPF 50"],
    dryness: ["ceramides", "hyaluronic", "cream cleanser", "rich moisturizer"],
    sensitive: ["fragrance‑free", "patch test", "gentle", "SPF 50"],
    "uneven tone": ["vitamin C", "niacinamide", "SPF 50"],
    "lines & firmness": ["retinol", "peptides", "SPF 50"],
    shine: ["mattifying", "niacinamide", "oil control"],
  };

  function newScenario() {
    const concern = rand(DATA.concerns);
    scenario = {
      name: rand(DATA.names),
      age: rand(DATA.ages),
      skin: rand(DATA.skin),
      prefs: rand(DATA.prefs),
      concern,
      opening: rand(OPENERS[concern] || ["I’m looking for a routine that fits me."]),
    };
    transcript = [];
    renderScenario();
    addMsg("customer", scenario.opening);
    input && (input.value = "");
    updateScores("");
    coach("New scenario loaded. Start with empathy, then ask an open‑ended question.");
  }

  function renderScenario() {
    if (!scenario) return;
    cName && (cName.textContent = scenario.name);
    cAge && (cAge.textContent = scenario.age);
    cSkin && (cSkin.textContent = scenario.skin);
    cConcerns && (cConcerns.textContent = scenario.concern);
    cPrefs && (cPrefs.textContent = scenario.prefs);
    cOpening && (cOpening.textContent = `Customer says: “${scenario.opening}”`);
    if (feed) feed.innerHTML = "";
    if (coachList) coachList.innerHTML = "";
  }

  function addMsg(who, text) {
    if (!feed || !text) return;
    const wrap = document.createElement("div");
    wrap.className = `msg ${who}`;
    const whoEl = document.createElement("div");
    whoEl.className = "who";
    whoEl.textContent = who === "customer" ? (scenario?.name || "Customer") : "You";
    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.textContent = text;
    wrap.appendChild(whoEl);
    wrap.appendChild(textEl);
    feed.appendChild(wrap);
    feed.scrollTop = feed.scrollHeight;
    transcript.push({ who, text });
  }

  function coach(message) {
    if (!coachList || !message) return;
    const li = document.createElement("li");
    li.textContent = message;
    coachList.appendChild(li);
  }

  // Simple NLP-ish scoring based on keywords and structure
  function evaluate(text) {
    const t = (text || "").toLowerCase();
    const words = (s) => s.split(/\s+/).filter(Boolean);

    let empathy = 0, discovery = 0, fit = 0, safety = 0, close = 0;

    // Empathy
    const empathyCues = ["thank", "thanks", "i understand", "i hear", "got it", "happy to help", "great question", "sorry to hear"];
    if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) empathy += 25;
    if (empathyCues.some(k => t.includes(k))) empathy += 35;
    if (t.length > 0) empathy += 10; // at least wrote something
    empathy = Math.min(100, empathy);

    // Discovery: open questions and follow-ups
    const openers = ["how", "what", "which", "tell me", "walk me", "when", "where"];
    if (t.includes("?")) discovery += 25;
    if (openers.some(k => t.includes(k + " "))) discovery += 45;
    if (/\b(usually|typically|daily|routine|goal|concern)\b/.test(t)) discovery += 15;
    discovery = Math.min(100, discovery);

    // Product fit based on concern/skin cues
    const concern = scenario?.concern;
    const skin = scenario?.skin;
    const must = new Set([...(KNOWLEDGE[concern] || []), ...(KNOWLEDGE[skin] || [])]);
    const hits = words(t).filter(w => Array.from(must).some(m => w.includes(m.replace(/\s+/g, ""))));
    if (hits.length) fit += Math.min(70, hits.length * 20);
    if (/\b(cleanser|serum|moisturizer|spf|sunscreen|toner|mask)\b/.test(t)) fit += 20;
    fit = Math.min(100, fit);

    // Safety/usage
    if (/\bspf\b|\bsunscreen\b|\bspf\s*(30|50)\b/.test(t)) safety += 35;
    if (/\bpatch test|introduce slowly|every other night|avoid eye area|am\b|pm\b/.test(t)) safety += 35;
    if (/\bapply\b|\buse\b|\bsteps?\b/.test(t)) safety += 15;
    safety = Math.min(100, safety);

    // Close/next step
    if (/would you like|can i|shall we|i can show|want me to|today/.test(t)) close += 45;
    if (/\bcheckout|basket|till|sample|trial|set\b/.test(t)) close += 25;
    close = Math.min(100, close);

    // Suggestions
    const suggestions = [];
    if (empathy < 60) suggestions.push("Open warmly and acknowledge their concern (e.g., ‘Thanks for sharing—happy to help.’).");
    if (discovery < 60) suggestions.push("Add an open‑ended question to learn more (how/what/which).");
    if (fit < 60) suggestions.push(`Mention 1–2 relevant cues like ${Array.from(must).slice(0,3).join(", ")}.`);
    if (safety < 60) suggestions.push("Include usage guidance and daily SPF when relevant.");
    if (close < 60) suggestions.push("Offer a next step (sample, demo, or add to basket).");

    return { empathy, discovery, fit, safety, close, suggestions };
  }

  function updateScores(text) {
    const r = evaluate(text || "");
    const set = (el, out, v) => { if (el) el.value = v; if (out) out.textContent = String(Math.round(v)); };
    set(sEmpathy, sEmpathyOut, r.empathy);
    set(sDisc, sDiscOut, r.discovery);
    set(sFit, sFitOut, r.fit);
    set(sSafety, sSafetyOut, r.safety);
    set(sClose, sCloseOut, r.close);

    if (coachList) coachList.innerHTML = "";
    if (r.suggestions.length === 0) {
      coach("Excellent! You’ve covered rapport, discovery, fit, safe use, and a clear next step.");
    } else {
      r.suggestions.forEach(coach);
    }
  }

  // Handlers
  input?.addEventListener("input", (e) => {
    updateScores(e.target.value);
  });

  sendBtn?.addEventListener("click", () => {
    const text = (input?.value || "").trim();
    if (!text) return;
    addMsg("advisor", text);
    // Trainer reacts once per send with a brief summary
    const r = evaluate(text);
    let summary = `Trainer: Empathy ${r.empathy}% · Discovery ${r.discovery}% · Fit ${r.fit}% · Safety ${r.safety}% · Close ${r.close}%.`;
    coach(summary);
    if (r.suggestions.length) coach("Focus next on: " + r.suggestions[0]);
    input.value = "";
    updateScores("");
  });

  clearBtn?.addEventListener("click", () => {
    if (input) input.value = "";
    updateScores("");
  });

  newBtn?.addEventListener("click", () => newScenario());

  // Init
  newScenario();
})();

