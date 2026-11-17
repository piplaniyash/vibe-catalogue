// Shared data and logic for the care navigator console and the family app.
// ALL PATIENTS AND DATA ARE FICTIONAL. Data is saved only in the visitor's browser.

  // ---------- Basics ----------
  const STORE = "buildlog-care-navigator-v1";
  const DAY = 86400000;
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const TODAY = iso(new Date());
  const off = n => iso(new Date(Date.now() + n * DAY));
  const toDate = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const diff = s => Math.round((toDate(s) - toDate(TODAY)) / DAY);
  const fmt = s => toDate(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const fmtLong = s => toDate(s).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const rel = s => { const n = diff(s); return n === 0 ? "today" : n === -1 ? "yesterday" : n === 1 ? "tomorrow" : n < 0 ? `${-n} days ago` : `in ${n} days`; };
  const stamp = () => { const t = new Date(); return iso(t) + "T" + pad(t.getHours()) + ":" + pad(t.getMinutes()); };
  const msgTime = at => fmt(at.slice(0, 10)) + (at.slice(0, 10) === TODAY ? " · " + at.slice(11, 16) : "");
  const uid = () => Math.random().toString(36).slice(2, 9);
  const rupees = n => "₹" + Number(n || 0).toLocaleString("en-IN");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  const TYPES = ["Diagnosis", "Consult", "Treatment", "Scan / lab", "Admission", "Call", "Alert", "Note"];
  const PAYERS = ["Family", "Insurance", "Scheme", "Grant"];
  const SCHEME_STATUS = ["Not started", "Checking", "Applied", "Approved", "Not eligible"];
  const OWNERS = ["Navigator", "Family", "Care team"];

  // ---------- Demo data (ALL FICTIONAL) ----------
  function seed() {
    const ev = (n, type, title, note = "") => ({ id: uid(), date: off(n), type, title, note });
    const ck = (n, pain, fatigue, appetite = "Good", fever = false, doses = true, note = "") => ({ date: off(n), pain, fatigue, appetite, fever, doses, note });
    const taken = (days, missed) => { const t = {}; for (let i = 1; i <= days; i++) if (!missed.includes(i)) t[off(-i)] = true; return t; };
    const cost = (n, item, amount, payer) => ({ id: uid(), date: off(n), item, amount, payer });
    const task = (text, owner, n, done = false) => ({ id: uid(), text, owner, due: off(n), done });
    const msg = (n, from, text) => ({ id: uid(), from, text, at: off(n) + "T10:00" });
    return {
      patients: [
        {
          id: "p1", name: "Meera Sharma", age: 52, city: "Gurgaon", language: "Hindi, English",
          diagnosis: "Breast cancer, stage II", hospital: "City Cancer Centre", oncologist: "Dr. Kapoor",
          caregiver: "Rohit Sharma", relation: "Husband", insurance: "Private insurance, ₹5L cover",
          phase: "Chemotherapy, cycle 3 of 6", nextAppt: { date: off(4), what: "Chemo cycle 4" },
          events: [
            ev(-80, "Diagnosis", "Biopsy report received", "Report explained to the family in plain language."),
            ev(-76, "Consult", "First oncology consult", "Six cycles of chemotherapy recommended."),
            ev(-70, "Consult", "Second opinion", "Plans matched. Family chose the closer hospital."),
            ev(-64, "Scan / lab", "Baseline scans and blood tests"),
            ev(-59, "Treatment", "Chemo cycle 1", "Tolerated well. Mild nausea on day 2."),
            ev(-38, "Treatment", "Chemo cycle 2", "Tired for four days afterwards."),
            ev(-30, "Call", "Navigator call with the family", "Shared tips on small, frequent meals."),
            ev(-17, "Treatment", "Chemo cycle 3"),
            ev(-10, "Note", "NGO grant application started", "Not eligible for PM-JAY. Applying for an NGO treatment grant.")
          ],
          checkins: [ck(-13, 2, 5, "Okay"), ck(-12, 2, 5, "Okay"), ck(-11, 3, 4), ck(-10, 2, 4), ck(-8, 2, 3), ck(-7, 2, 3), ck(-6, 1, 3), ck(-5, 2, 2), ck(-4, 2, 3), ck(-3, 1, 2), ck(-2, 2, 2), ck(-1, 1, 2, "Good", false, true, "Feeling stronger, went for a short walk.")],
          meds: [{ id: uid(), name: "Anti-nausea tablet", dose: "1 tablet", schedule: "Twice a day, as prescribed", perDay: 2, left: 24, since: off(-60), taken: taken(20, []) }],
          costs: [cost(-80, "Biopsy and pathology", 9000, "Family"), cost(-76, "Oncology consults", 3500, "Family"), cost(-64, "Baseline scans", 18000, "Family"), cost(-59, "Chemo cycle 1", 45000, "Insurance"), cost(-38, "Chemo cycle 2", 45000, "Insurance"), cost(-17, "Chemo cycle 3", 45000, "Family")],
          schemes: [{ name: "Ayushman Bharat PM-JAY", status: "Not eligible" }, { name: "NGO treatment grant", status: "Applied" }, { name: "State health scheme", status: "Checking" }],
          messages: [msg(-3, "nav", "Hi Rohit, it's Asha. Cycle 4 is on the 21st. I'll confirm the slot with the hospital by tomorrow."), msg(-2, "fam", "Thank you. Meera is feeling much better this week."), msg(-2, "nav", "That's lovely to hear. Please send the income certificate for the grant when you can.")],
          tasks: [task("Collect income certificate for the NGO grant", "Family", -2), task("Confirm cycle 4 slot with the hospital", "Navigator", 1), task("Blood test before cycle 4", "Family", 3), task("Submit NGO grant form", "Navigator", -8, true)]
        },
        {
          id: "p2", name: "Suresh Rao", age: 68, city: "Lucknow", language: "Hindi",
          diagnosis: "Colorectal cancer, stage III", hospital: "Lucknow Oncology Hospital", oncologist: "Dr. Iqbal",
          caregiver: "Lata Rao", relation: "Wife. Son Arjun in Toronto gets weekly updates.", insurance: "Senior citizen policy, ₹3L cover",
          phase: "Chemotherapy after surgery, cycle 5 of 8", nextAppt: { date: off(1), what: "Review with Dr. Iqbal (video link for Arjun)" },
          events: [
            ev(-90, "Diagnosis", "Colonoscopy and biopsy"),
            ev(-84, "Consult", "Family consult with Arjun on video", "Held at 7:30pm IST so Arjun could join from Toronto."),
            ev(-50, "Admission", "Surgery", "Five-day stay. Recovered well."),
            ev(-35, "Treatment", "Chemo cycles 1 and 2"),
            ev(-14, "Treatment", "Chemo cycles 3 and 4", "More tiredness than earlier cycles."),
            ev(-7, "Call", "Weekly update to Arjun", "Costs and next steps shared in the family group."),
            ev(-1, "Alert", "Fever reported in check-in", "38.4°C in the evening. Care team informed.")
          ],
          checkins: [ck(-12, 3, 4), ck(-10, 3, 4), ck(-9, 4, 5, "Okay"), ck(-7, 3, 5), ck(-6, 4, 5, "Okay"), ck(-4, 4, 6, "Okay"), ck(-3, 5, 6, "Poor"), ck(-2, 5, 6, "Poor"), ck(-1, 7, 7, "Poor", true, true, "Temperature 38.4°C in the evening. Mrs. Rao is worried.")],
          meds: [{ id: uid(), name: "Oral chemotherapy tablet", dose: "As prescribed", schedule: "Morning and evening, after food", perDay: 2, left: 36, since: off(-40), taken: taken(20, []) }],
          costs: [cost(-50, "Surgery and hospital stay", 280000, "Insurance"), cost(-35, "Chemo cycles 1 and 2", 60000, "Family"), cost(-14, "Chemo cycles 3 and 4", 60000, "Family"), cost(-14, "Oral chemo tablets", 22000, "Family"), cost(-7, "Home nurse visits", 6000, "Family")],
          schemes: [{ name: "State health scheme", status: "Applied" }, { name: "Ayushman Bharat PM-JAY", status: "Not eligible" }],
          messages: [msg(-7, "nav", "Weekly update for Arjun and Mrs. Rao: cycles 3 and 4 done, costs summary attached in the group."), msg(-1, "fam", "Papa has a temperature of 38.4 this evening. What should we do?")],
          tasks: [task("Call Mrs. Rao about the fever and arrange a review", "Navigator", 0), task("Book cab for the review visit", "Navigator", 0), task("Send weekly update to Arjun", "Navigator", 2), task("Home nurse visit", "Navigator", -3, true)]
        },
        {
          id: "p3", name: "Prakash Kumar", age: 61, city: "Pune", language: "Marathi, Hindi",
          diagnosis: "Chronic myeloid leukaemia", hospital: "Pune Blood Cancer Clinic", oncologist: "Dr. Iyer",
          caregiver: "Sunita Kumar", relation: "Daughter", insurance: "None",
          phase: "Daily tablets at home, month 7", nextAppt: { date: off(9), what: "Monthly review and blood count" },
          events: [
            ev(-215, "Diagnosis", "Blood tests and diagnosis"),
            ev(-210, "Treatment", "Started daily tablets", "Schedule turned into a simple daily chart."),
            ev(-120, "Scan / lab", "Blood count review", "Responding well."),
            ev(-30, "Consult", "Monthly review", "Stable. Continue the same dose."),
            ev(-28, "Note", "Patient assistance programme renewed"),
            ev(-6, "Note", "Missed dose flagged", "Reminder moved to 8pm.")
          ],
          checkins: [ck(-14, 1, 2), ck(-12, 1, 2), ck(-11, 1, 3), ck(-9, 2, 3), ck(-8, 1, 2), ck(-6, 1, 2, "Good", false, false, "Forgot the evening tablet."), ck(-5, 1, 2), ck(-4, 2, 3, "Okay")],
          meds: [{ id: uid(), name: "Oral targeted therapy tablet", dose: "1 tablet", schedule: "Once a day, same time each evening", perDay: 1, left: 5, since: off(-210), taken: taken(20, [2, 6]) }],
          costs: [cost(-60, "Monthly tablets", 14000, "Grant"), cost(-30, "Monthly tablets", 14000, "Grant"), cost(-30, "Review and blood tests", 2500, "Family")],
          schemes: [{ name: "Pharma patient assistance programme", status: "Approved" }, { name: "Ayushman Bharat PM-JAY", status: "Not eligible" }],
          messages: [msg(-6, "nav", "Hi Sunita, we noticed a missed tablet yesterday. I've moved the reminder to 8pm. Does that work better?"), msg(-6, "fam", "Yes, 8pm is better. Thank you.")],
          tasks: [task("Order next month's refill", "Navigator", 0), task("Send a check-in reminder", "Navigator", 0), task("Blood count test before the review", "Family", 7)]
        }
      ]
    };
  }

  // ---------- Storage (this browser only) ----------
  function migrate(d) { d.patients.forEach(p => { p.messages = p.messages || []; }); return d; }
  function load() { try { const s = localStorage.getItem(STORE); if (s) return migrate(JSON.parse(s)); } catch (e) {} return migrate(seed()); }
  // When another tab (the family app or the console) saves, pick up the change.
  function onSync(fn) { window.addEventListener("storage", e => { if (e.key === STORE) { db = load(); fn(); } }); }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(db)); } catch (e) {} }

  let db = load();

  // ---------- Patient logic ----------
  const P = id => db.patients.find(p => p.id === id);
  const sortedCheckins = p => [...p.checkins].sort((a, b) => a.date < b.date ? -1 : 1);
  const latest = p => sortedCheckins(p).pop();
  const daysLeft = m => Math.floor(m.left / (m.perDay || 1));
  function missedDays(m, n) { let c = 0; for (let i = 1; i <= n; i++) { const d = off(-i); if (d >= m.since && !m.taken[d]) c++; } return c; }
  function adherence(p) {
    let tot = 0, ok = 0;
    p.meds.forEach(m => { for (let i = 1; i <= 14; i++) { const d = off(-i); if (d < m.since) continue; tot++; if (m.taken[d]) ok++; } });
    return tot ? Math.round(ok * 100 / tot) : null;
  }

  // Alerts: level 3 = urgent, 2 = follow up, 1 = nudge
  function alerts(p) {
    const a = [], l = latest(p);
    if (l && diff(l.date) >= -2) {
      if (l.fever) a.push({ lvl: 3, text: "Fever reported", detail: `${rel(l.date)[0].toUpperCase() + rel(l.date).slice(1)}. Call the oncology team now.`, tab: "checkins" });
      if (l.pain >= 7) a.push({ lvl: 2, text: `High pain, ${l.pain}/10`, detail: `Reported ${rel(l.date)}. Escalate to the care team.`, tab: "checkins" });
    }
    const gap = l ? -diff(l.date) : null;
    if (gap === null) a.push({ lvl: 1, text: "No check-ins yet", detail: "Send the first check-in on WhatsApp.", tab: "checkins" });
    else if (gap >= 3) a.push({ lvl: 1, text: `No check-in for ${gap} days`, detail: "Send a check-in on WhatsApp.", tab: "checkins" });
    p.meds.forEach(m => {
      const d = daysLeft(m);
      if (d <= 7) a.push({ lvl: 2, text: `Refill due: ${m.name}`, detail: `About ${plural(d, "day")} of tablets left.`, tab: "meds" });
      const miss = missedDays(m, 7);
      if (miss) a.push({ lvl: 1, text: `${plural(miss, "missed dose day")} this week`, detail: m.name, tab: "meds" });
    });
    const lastMsg = (p.messages || [])[p.messages ? p.messages.length - 1 : 0];
    if (lastMsg && lastMsg.from === "fam") a.push({ lvl: 2, text: "New message from family", detail: lastMsg.text.length > 70 ? lastMsg.text.slice(0, 69) + "…" : lastMsg.text, tab: "messages" });
    p.tasks.filter(t => !t.done && t.due && diff(t.due) < 0).forEach(t => a.push({ lvl: 1, text: "Overdue task", detail: t.text, tab: "tasks" }));
    return a.sort((x, y) => y.lvl - x.lvl);
  }

  function summaryText(p) {
    const l = latest(p), a = adherence(p), open = p.tasks.filter(t => !t.done).length, al = alerts(p);
    let s = `${p.name}, ${p.age}, ${p.city}. ${p.diagnosis}, under ${p.oncologist} at ${p.hospital}. Currently: ${p.phase}.`;
    if (l) s += ` Last check-in ${rel(l.date)}: pain ${l.pain}/10, fatigue ${l.fatigue}/10, appetite ${String(l.appetite).toLowerCase()}${l.fever ? ", fever reported" : ""}.`;
    if (a !== null) s += ` Medicines taken on ${a}% of days in the last two weeks.`;
    if (p.nextAppt && p.nextAppt.date) s += ` Next: ${p.nextAppt.what} on ${fmt(p.nextAppt.date)} (${rel(p.nextAppt.date)}).`;
    s += ` ${plural(open, "open task")}, ${al.length ? plural(al.length, "alert") + " needing attention." : "no alerts."}`;
    return s;
  }

