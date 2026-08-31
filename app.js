/**
 * Karma Yoga Anmeldung - Yoga Vidya Seminarhaus
 * Streamlined & Focused Karma Yogi Experience
 */

const STORAGE_DRAFT_KEY = "yv_karma_yogi_simple_draft";

const AREA_LABELS = {
  kitchen: "🥗 Küche & Kochen",
  housekeeping: "🧹 Zimmer & Housekeeping",
  garden: "🌿 Garten & Natur",
  crafts: "🔨 Handwerk & Reparaturen",
  reception: "💻 Rezeption & Gästebetreuung",
  music_tech: "🎵 Musik, Kirtan & Satsang"
};

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
  restoreDraft();
  
  // Set default sample dates (1 week from now to 3 weeks from now) if empty
  const arrivalInput = document.getElementById("arrivalDate");
  const departureInput = document.getElementById("departureDate");
  if (!arrivalInput.value) {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 21);
    
    arrivalInput.value = nextWeek.toISOString().split("T")[0];
    departureInput.value = twoWeeks.toISOString().split("T")[0];
  }

  // Setup auto-save listener
  const form = document.getElementById("karmaYogaForm");
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);
});

// Draft Auto-Save
function saveDraft() {
  const data = getFormData();
  localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(data));
}

function restoreDraft() {
  const json = localStorage.getItem(STORAGE_DRAFT_KEY);
  if (!json) return;
  try {
    const data = JSON.parse(json);
    const form = document.getElementById("karmaYogaForm");

    for (const [key, value] of Object.entries(data)) {
      if (key === "workAreas" && Array.isArray(value)) {
        document.querySelectorAll("input[name='workAreas']").forEach(cb => {
          cb.checked = value.includes(cb.value);
        });
      } else if (key === "karmaModel") {
        const radio = document.querySelector(`input[name='karmaModel'][value='${value}']`);
        if (radio) radio.checked = true;
      } else {
        const el = form.elements[key];
        if (el && el.type !== "checkbox" && el.type !== "radio") {
          el.value = value;
        }
      }
    }
  } catch (e) {
    console.warn("Could not restore draft", e);
  }
}

// Collect Data from Form
function getFormData() {
  const form = document.getElementById("karmaYogaForm");
  const formData = new FormData(form);

  const workAreas = [];
  document.querySelectorAll("input[name='workAreas']:checked").forEach(cb => workAreas.push(cb.value));

  return {
    fullName: formData.get("fullName") || "",
    spiritualName: formData.get("spiritualName") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    arrivalDate: formData.get("arrivalDate") || "",
    departureDate: formData.get("departureDate") || "",
    karmaModel: formData.get("karmaModel") || "3h",
    workAreas: workAreas,
    qualifications: formData.get("qualifications") || "",
    yogaExperience: formData.get("yogaExperience") || "",
    motivation: formData.get("motivation") || "",
    healthAndDiet: formData.get("healthAndDiet") || "",
    submittedAt: new Date().toISOString()
  };
}

// Validation & Form Submission
function handleFormSubmit(e) {
  e.preventDefault();

  const data = getFormData();

  // Validate Dates
  if (data.arrivalDate && data.departureDate && new Date(data.departureDate) <= new Date(data.arrivalDate)) {
    alert("Das Abreisedatum muss nach dem Anreisedatum liegen.");
    document.getElementById("departureDate").focus();
    return;
  }

  // Validate at least one area
  if (data.workAreas.length === 0) {
    alert("Bitte wähle mindestens einen Bereich aus, in dem du gerne mithelfen möchtest.");
    return;
  }

  // Render Confirmation
  showSuccess(data);

  // Clear draft
  localStorage.removeItem(STORAGE_DRAFT_KEY);
}

function showSuccess(data) {
  const form = document.getElementById("karmaYogaForm");
  const successScreen = document.getElementById("successScreen");
  const summaryBox = document.getElementById("summaryPreviewBox");

  const areaNames = (data.workAreas || []).map(a => AREA_LABELS[a] || a).join(", ");
  const modelText = data.karmaModel === "6h" ? "6-Stunden Karma Yoga (Vollzeit Seva & Kost/Logis)" : "3-Stunden Karma Yoga (Freiraum für Praxis & Seminare)";

  summaryBox.innerHTML = `
    <h4 style="color: var(--yv-saffron-deep); font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.8rem; border-bottom: 1px solid var(--yv-border); padding-bottom: 0.4rem;">
      🙏 Deine Anmeldedaten im Überblick
    </h4>
    <div class="summary-row">
      <span class="summary-label">Name:</span>
      <span class="summary-val">${escapeHtml(data.fullName)} ${data.spiritualName ? `(${escapeHtml(data.spiritualName)})` : ""}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Gewähltes Modell:</span>
      <span class="summary-val" style="color: var(--yv-saffron-deep); font-weight: 700;">${modelText}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Geplanter Zeitraum:</span>
      <span class="summary-val">${formatDate(data.arrivalDate)} bis ${formatDate(data.departureDate)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Kontakt:</span>
      <span class="summary-val">${escapeHtml(data.email)} | ${escapeHtml(data.phone)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Gewünschte Bereiche:</span>
      <span class="summary-val">${escapeHtml(areaNames || "Keine ausgewählt")}</span>
    </div>
    ${data.qualifications ? `
      <div class="summary-row">
        <span class="summary-label">Qualifikationen:</span>
        <span class="summary-val">${escapeHtml(data.qualifications)}</span>
      </div>
    ` : ""}
    <div class="summary-row">
      <span class="summary-label">Yoga-Erfahrung:</span>
      <span class="summary-val" style="max-width: 350px; text-align: right;">${escapeHtml(data.yogaExperience)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Deine Motivation:</span>
      <span class="summary-val" style="max-width: 350px; text-align: right; font-style: italic;">"${escapeHtml(data.motivation)}"</span>
    </div>
    ${data.healthAndDiet ? `
      <div class="summary-row">
        <span class="summary-label">Ernährung &amp; Gesundheit:</span>
        <span class="summary-val">${escapeHtml(data.healthAndDiet)}</span>
      </div>
    ` : ""}
  `;

  form.style.display = "none";
  successScreen.style.display = "block";
  window.scrollTo({ top: 120, behavior: "smooth" });
}

function sendViaEmail() {
  const data = getFormData();
  const subject = encodeURIComponent(`Karma Yoga Anmeldung: ${data.fullName} (${data.karmaModel === "6h" ? "6h Modell" : "3h Modell"})`);
  const body = encodeURIComponent(
    `Om Namo Narayanaya liebe Seminarhaus-Leitung,\n\n` +
    `ich möchte mich gerne für Karma Yoga im Seminarhaus anmelden:\n\n` +
    `• Name: ${data.fullName} ${data.spiritualName ? `(${data.spiritualName})` : ""}\n` +
    `• Zeitraum: ${formatDate(data.arrivalDate)} bis ${formatDate(data.departureDate)}\n` +
    `• Zeitmodell: ${data.karmaModel === "6h" ? "6-Stunden Modell (Vollzeit Seva)" : "3-Stunden Modell"}\n` +
    `• E-Mail: ${data.email}\n` +
    `• Telefon: ${data.phone}\n` +
    `• Einsatzbereiche: ${(data.workAreas || []).map(a => AREA_LABELS[a] || a).join(", ")}\n` +
    (data.qualifications ? `• Besondere Fähigkeiten/Beruf: ${data.qualifications}\n` : "") +
    `• Yoga-Erfahrung: ${data.yogaExperience}\n` +
    `• Motivation: ${data.motivation}\n` +
    (data.healthAndDiet ? `• Ernährung/Gesundheit: ${data.healthAndDiet}\n` : "") +
    `\nIch freue mich sehr auf eure Rückmeldung!\n\nHerzliche Grüße & Om Shanti,\n${data.fullName}`
  );
  window.location.href = `mailto:karmayoga@yoga-vidya-seminarhaus.de?subject=${subject}&body=${body}`;
}

function startNewForm() {
  const form = document.getElementById("karmaYogaForm");
  const successScreen = document.getElementById("successScreen");
  form.reset();
  localStorage.removeItem(STORAGE_DRAFT_KEY);
  form.style.display = "block";
  successScreen.style.display = "none";
  window.scrollTo({ top: 120, behavior: "smooth" });
}

// Helpers
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}
