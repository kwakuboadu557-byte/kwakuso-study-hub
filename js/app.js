import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
document.getElementById("year").textContent = new Date().getFullYear();

const grid = document.getElementById("resourceGrid");
const status = document.getElementById("statusMessage");
const empty = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const levelFilter = document.getElementById("levelFilter");
const subjectFilter = document.getElementById("subjectFilter");
let allResources = [];
let storage = null;

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function initials(level) { return level === "JHS" ? "J" : "S"; }
function populateSubjects(items) {
  const selected = subjectFilter.value;
  const subjects = [...new Set(items.map(r => r.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  subjectFilter.innerHTML = '<option value="all">All subjects</option>' + subjects.map(s=>`<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("");
  if (subjects.includes(selected)) subjectFilter.value = selected;
}
function render() {
  const term = searchInput.value.trim().toLowerCase();
  const level = levelFilter.value;
  const subject = subjectFilter.value;
  const filtered = allResources.filter(r => {
    const haystack = [r.title,r.subject,r.description,r.level,r.yearGroup,r.type].join(" ").toLowerCase();
    return (!term || haystack.includes(term)) && (level === "all" || r.level === level) && (subject === "all" || r.subject === subject);
  });
  grid.innerHTML = filtered.map(r => `<article class="resource-card">
    <div class="resource-card-top"><span class="resource-file-icon">▤</span><span class="level-pill ${r.level === "JHS" ? "jhs" : "shs"}">${escapeHTML(r.level === "JHS" ? "JHS / BECE" : "SHS / WASSCE")}</span></div>
    <div class="resource-type">${escapeHTML(r.type || "Study resource")} · ${escapeHTML(r.subject || "General")}</div>
    <h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description || "A study resource to support your revision.")}</p>
    <div class="resource-meta">${escapeHTML(r.yearGroup || "All classes")} <span>•</span> ${escapeHTML(r.fileName || "Download file")}</div>
    <button class="download-btn" data-id="${escapeHTML(r.id)}" type="button">Download resource <span>↧</span></button>
  </article>`).join("");
  empty.classList.toggle("hidden", filtered.length !== 0);
  if (allResources.length) status.textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"} found`;
  grid.querySelectorAll(".download-btn").forEach(btn => btn.addEventListener("click", () => downloadResource(btn.dataset.id, btn)));
}
async function downloadResource(id, button) {
  const item = allResources.find(r => r.id === id);
  if (!item || !storage) return;
  const original = button.innerHTML;
  button.disabled = true; button.textContent = "Preparing download…";
  try {
    const url = await getDownloadURL(ref(storage, item.storagePath));
    const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; a.download = item.fileName || "study-resource";
    document.body.appendChild(a); a.click(); a.remove();
  } catch (e) {
    alert("Sorry, this download could not be opened. Please try again later.");
    console.error(e);
  } finally { button.disabled = false; button.innerHTML = original; }
}
[searchInput, levelFilter, subjectFilter].forEach(el => el.addEventListener("input", render));

async function loadResources() {
  if (!isFirebaseConfigured) {
    status.innerHTML = 'The resource library is ready, but no live database is connected yet. Follow <strong>README.md</strong> to connect Firebase, then upload resources from Admin login.';
    empty.classList.remove("hidden");
    grid.innerHTML = "";
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    storage = getStorage(app);
    const q = query(collection(db, "resources"), where("published", "==", true));
    const snapshot = await getDocs(q);
    allResources = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    populateSubjects(allResources);
    render();
    if (!allResources.length) {
      status.textContent = "The library is connected. No resources have been published yet.";
      empty.classList.remove("hidden");
    }
  } catch (error) {
    console.error(error);
    status.textContent = "We couldn't load the resource library. The site owner may need to finish Firebase setup.";
  }
}
loadResources();
