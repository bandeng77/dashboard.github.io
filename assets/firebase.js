/* Penghubung Firestore + Firebase Auth untuk mainmenu Genetek.
   Semua koleksi memakai awalan "mm_" supaya tidak bentrok dengan aplikasi lain (GA, RAB, dll.) di project Firebase yang sama. */
import { firebaseConfig } from "./firebase-config.js";

const PREFIX = "mm_";
const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

function ready(gt) { window.GT = gt; window.dispatchEvent(new Event("gt-ready")); }

if (!firebaseConfig || !firebaseConfig.apiKey || String(firebaseConfig.apiKey).startsWith("ISI_")) {
  console.warn("[mainmenu] firebase-config.js belum diisi — halaman berjalan dalam mode demo.");
  ready(null);
} else {
  try {
    const [{ initializeApp }, fs, au] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-firestore.js`),
      import(`${SDK}/firebase-auth.js`),
    ]);
    const app = initializeApp(firebaseConfig);
    const db = fs.getFirestore(app);
    const auth = au.getAuth(app);
    const col = name => fs.collection(db, PREFIX + name);
    const ref = (name, id) => fs.doc(db, PREFIX + name, id);
    const wrap = name => ({
      onSnapshot: (cb, err) => fs.onSnapshot(col(name), s => cb({ docs: s.docs.map(d => ({ id: d.id, data: () => d.data() })) }), err),
      add: async data => { const r = await fs.addDoc(col(name), data); return { id: r.id }; },
      doc: id => ({
        set: data => fs.setDoc(ref(name, id), data),
        update: data => fs.updateDoc(ref(name, id), data),
        delete: () => fs.deleteDoc(ref(name, id)),
      }),
    });
    ready({
      db: { collection: wrap },
      isAdmin: async email => !!email && (await fs.getDoc(ref("admins", String(email).toLowerCase()))).exists(),
      auth: {
        onChange: cb => au.onAuthStateChanged(auth, cb),
        signIn: (email, pass) => au.signInWithEmailAndPassword(auth, email, pass),
        signOut: () => au.signOut(auth),
        reset: email => au.sendPasswordResetEmail(auth, email),
      },
    });
  } catch (e) {
    console.error("[mainmenu] Firebase gagal dimuat:", e);
    ready(null);
  }
}
