import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const setupWarning = document.getElementById("setupWarning");
const loginPanel = document.getElementById("loginPanel");
const uploadPanel = document.getElementById("uploadPanel");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const uploadForm = document.getElementById("uploadForm");
const uploadMessage = document.getElementById("uploadMessage");
const uploadBtn = document.getElementById("uploadBtn");
const adminResources = document.getElementById("adminResources");
let auth, db, storage;

if (!isFirebaseConfigured) {
  setupWarning.classList.remove("hidden");
  loginMessage.textContent = "Firebase is not configured. Sign-in and uploads are disabled until setup is complete.";
  loginForm.querySelector("button").disabled = true;
  uploadBtn.disabled = true;
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app); db = getFirestore(app); storage = getStorage(app);
  onAuthStateChanged(auth, user => {
    loginPanel.classList.toggle("hidden", !!user);
    uploadPanel.classList.toggle("hidden", !user);
    if (user) loadAdminResources();
  });
}
function say(el, text, bad = false) {
  el.textContent = text;
  el.classList.toggle("error", bad);
}
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!auth) return;
  const button = loginForm.querySelector("button");
  button.disabled = true; say(loginMessage, "Signing in…");
  try {
    await signInWithEmailAndPassword(auth, document.getElementById("adminEmail").value.trim(), document.getElementById("adminPassword").value);
    say(loginMessage, "");
  } catch (error) {
    say(loginMessage, "Sign-in failed. Check your email/password and Firebase Authentication setup.", true);
  } finally { button.disabled = false; }
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (auth) await signOut(auth);
});
document.getElementById("refreshBtn").addEventListener("click", loadAdminResources);

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!auth?.currentUser || !db || !storage) return say(uploadMessage, "Sign in first.", true);
  const file = document.getElementById("fileInput").files[0];
  if (!file) return say(uploadMessage, "Choose a file first.", true);
  if (file.size > 15 * 1024 * 1024) return say(uploadMessage, "This file is over 15 MB. Choose a smaller file.", true);
  const allowed = /\.(pdf|docx?|pptx?|jpe?g|png)$/i.test(file.name);
  if (!allowed) return say(uploadMessage, "File type not allowed. Choose PDF, DOC/DOCX, PPT/PPTX, JPG, or PNG.", true);
  const title = document.getElementById("title").value.trim();
  const level = document.getElementById("level").value;
  const subject = document.getElementById("subject").value.trim();
  const yearGroup = document.getElementById("yearGroup").value.trim();
  const type = document.getElementById("resourceType").value;
  const description = document.getElementById("description").value.trim();
  const published = document.getElementById("publishNow").checked;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `resources/${auth.currentUser.uid}/${Date.now()}_${safeName}`;
  uploadBtn.disabled = true; say(uploadMessage, "Uploading file and saving resource…");
  try {
    await uploadBytes(ref(storage, storagePath), file, { contentType: file.type || "application/octet-stream" });
    await addDoc(collection(db, "resources"), {
      title, level, subject, yearGroup, type, description, published,
      fileName: file.name, storagePath, ownerUid: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    uploadForm.reset();
    say(uploadMessage, published ? "Uploaded and published successfully." : "Uploaded as unpublished. Publish it by changing the checkbox and uploading again, or update its record in Firestore.");
    await loadAdminResources();
  } catch (error) {
    console.error(error);
    say(uploadMessage, "Upload failed. Check that Firebase Storage, Firestore, and their security rules are configured. A file may have uploaded even if saving its details failed.", true);
  } finally { uploadBtn.disabled = false; }
});

async function loadAdminResources() {
  if (!auth?.currentUser || !db) return;
  adminResources.innerHTML = "<p class='muted'>Loading…</p>";
  try {
    const q = query(collection(db, "resources"), where("ownerUid", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.size) { adminResources.innerHTML = "<p class='muted'>No uploads yet. Your published resources will appear on the public library.</p>"; return; }
    const docs = snapshot.docs.sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
    adminResources.innerHTML = docs.map(doc => {
      const r = doc.data();
      return `<div class="admin-resource"><div><strong>${escapeHTML(r.title || "Untitled")}</strong><small>${escapeHTML(r.level || "")} · ${escapeHTML(r.subject || "")}</small></div><span class="state-pill ${r.published ? "published" : ""}">${r.published ? "Published" : "Unpublished"}</span></div>`;
    }).join("");
  } catch (e) {
    console.error(e);
    adminResources.innerHTML = "<p class='form-message error'>Could not load uploads. Check Firestore rules and the database index error in the browser console.</p>";
  }
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
