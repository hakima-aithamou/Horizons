'use strict';
/* =====================================================================
   COMPTE ÉLÈVE / ENSEIGNANTE — partagé avec le site « Mille et une pièces »
   Mêmes comptes, même base Supabase (projet Edu-Centre), même fonction
   serveur « edu-centre ». La session est gardée sur l’appareil (localStorage « ec-session »,
   la même que sur le site des puzzles) : l’élève reste connecté jusqu’au bouton « Me déconnecter ».
   Sur un ordinateur partagé, chaque élève doit donc se déconnecter avant de laisser sa place.
   ===================================================================== */
(function () {
const URL_SB = 'https://ynjwhkslgzbazhhalddh.supabase.co';
const KEY = 'sb_publishable_l_kGe9HX6OZ2uT9UOJ8-Nw_OvufmJJJ';
const TEACHER_EMAIL = 'hakima.ait-hamou@cepeo.on.ca';
const NET_MSG = 'Impossible de joindre le serveur. Attends quelques secondes et réessaie. Si ça continue, préviens ton enseignante.';
const script = document.currentScript;
const BASE = script ? script.src.slice(0, script.src.lastIndexOf('compte.js')) : './';

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || sessionStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k, v) {
    for (const zone of ['localStorage', 'sessionStorage']) {
      try { const m = window[zone]; v == null ? m.removeItem(k) : m.setItem(k, JSON.stringify(v)); } catch {}
    }
  }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function send(path, body, token) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
  try {
    return await fetch(URL_SB + path, {
      method: 'POST', cache: 'no-store', signal: ctl.signal, body: JSON.stringify(body),
      headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    });
  } finally { clearTimeout(timer); }
}
/* Réseau de l’école : certains filtres bloquent les envois « POST » vers le serveur.
   Dans ce cas, la même demande part en « GET » (données dans l’en-tête x-ec) vers la fonction edu-centre,
   et l’appareil s’en souvient pour les fois suivantes. */
const modeGet = { get() { try { return localStorage.getItem('ec-get') === '1'; } catch { return false; } }, set() { try { localStorage.setItem('ec-get', '1'); } catch {} } };
function versFonction(path, body) {
  if (path.startsWith('/functions/v1/')) return body;
  if (path.indexOf('grant_type=refresh_token') >= 0) return { action: 'refresh', refresh_token: body.refresh_token };
  if (path.indexOf('grant_type=password') >= 0) return { action: 'password_login', email: body.email, password: body.password };
  return null;
}
function enBase64(o) { const b = new TextEncoder().encode(JSON.stringify(o)); let s = ''; b.forEach(c => { s += String.fromCharCode(c); }); return btoa(s); }
async function sendGet(body, token) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
  try { return await fetch(URL_SB + '/functions/v1/edu-centre', { method: 'GET', cache: 'no-store', signal: ctl.signal, headers: { apikey: KEY, 'x-ec': enBase64(body), ...(token ? { Authorization: 'Bearer ' + token } : {}) } }); }
  finally { clearTimeout(timer); }
}
async function request(path, body, token, tries = 3) {
  let r, last; const g = versFonction(path, body);
  if (g && modeGet.get()) { try { r = await sendGet(g, token); } catch (e) { last = e; } }
  for (let i = 0; i < tries && !r; i++) {
    try { r = await send(path, body, token); } catch (e) { last = e; if (i < tries - 1) await sleep(700 * (i + 1)); }
  }
  if (!r && g) { try { r = await sendGet(g, token); modeGet.set(); } catch (e) { last = e; } }
  if (!r) { console.warn('Échec réseau', path, last); throw Error(NET_MSG); }
  let d; try { d = await r.json(); } catch { throw Error('Réponse inattendue du serveur. Réessaie.'); }
  if (!r.ok) { const e = Error(d.error_description || d.msg || d.error || 'Connexion impossible. Réessaie.'); e.status = r.status; throw e; }
  return d;
}

const EC = {
  base: BASE,
  session() { return store.get('ec-session'); },
  profil() { return store.get('ec-profil'); },
  connecte() { return !!store.get('ec-session'); },
  async api(body) {
    let s = store.get('ec-session');
    if (!s) throw Error('Connecte-toi pour continuer.');
    if (s.expires_at * 1000 < Date.now() + 60000) {
      try { s = await request('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.refresh_token }); store.set('ec-session', s); }
      catch (e) { if (e.message === NET_MSG) throw e; EC.oublier(); throw Error('Ta session a expiré. Reconnecte-toi.'); }
    }
    try { return await request('/functions/v1/edu-centre', body, s.access_token); }
    catch (e) { if (e.status === 401) EC.oublier(); throw e; }
  },
  async connexionEleve({ first, last, password }) {
    const d = await request('/functions/v1/edu-centre', { action: 'student_login', first, last, password });
    store.set('ec-session', d.session);
    return EC.chargerProfil();
  },
  async inscriptionEleve(f) {
    if (!f.password || f.password.length < 8) throw Error('Choisis un mot de passe de 8 caractères minimum.');
    await request('/functions/v1/edu-centre', { action: 'student_signup', first: f.first, last: f.last, password: f.password }, null, 1);
    return EC.connexionEleve(f);
  },
  async connexionEnseignante({ email, password }) {
    const s = await request('/auth/v1/token?grant_type=password', { email, password }, null, 2);
    store.set('ec-session', s);
    return EC.chargerProfil();
  },
  async chargerProfil() {
    const d = await EC.api({ action: 'math_dashboard' });
    const p = d.role === 'teacher' ? { role: 'teacher', nom: 'Mme Hakima' } : { role: 'student', nom: d.student.first_name, classes: (d.classes || []).map(c => c.name) };
    const s = store.get('ec-session'); p.uid = s && s.user ? s.user.id : null;
    store.set('ec-profil', p);
    EC.majBadges();
    return d;
  },
  oublier() { store.set('ec-session', null); store.set('ec-profil', null); EC.majBadges(); },
  async deconnexion() {
    const s = store.get('ec-session');
    try { if (s) await request('/auth/v1/logout', {}, s.access_token, 1); } catch {}
    EC.oublier();
  },
  /* Enregistre un niveau terminé. Retourne {ok:true} ou {ok:false, raison}. */
  async enregistrerNiveau(r) {
    const p = store.get('ec-profil');
    if (!store.get('ec-session')) return { ok: false, raison: 'invite' };
    if (p && p.role === 'teacher') return { ok: false, raison: 'enseignante' };
    try { await EC.api({ action: 'save_math_result', ...r }); return { ok: true }; }
    catch (e) { return { ok: false, raison: 'erreur', message: e.message }; }
  },
  /* Résultats de l’élève connecté (pour afficher ✓ sur les niveaux). */
  async mesResultats() {
    const p = store.get('ec-profil');
    if (!store.get('ec-session') || (p && p.role !== 'student')) return null;
    try { const d = await EC.api({ action: 'math_dashboard' }); return d.role === 'student' ? d.results : null; } catch { return null; }
  },
  lienConnexion(role) { return BASE + 'connexion.html?role=' + (role === 'teacher' ? 'teacher' : 'eleve') + '&retour=' + encodeURIComponent(location.href); },
  /* Petit bouton « Se connecter » / « 👤 Prénom » dans les menus. */
  majBadges() {
    /* Profil absent, ou d’un autre compte (connexion changée sur le site des puzzles) : on le recharge. */
    const sess = store.get('ec-session'), pr = store.get('ec-profil');
    if (sess && pr && sess.user && pr.uid !== sess.user.id) store.set('ec-profil', null);
    if (store.get('ec-session') && !store.get('ec-profil') && !EC._profilEnCours) {
      EC._profilEnCours = true; // connecté depuis le site des puzzles : on récupère le prénom
      EC.chargerProfil().catch(() => {}).finally(() => { EC._profilEnCours = false; });
    }
    /* Deux liens dans les menus : data-compte="eleve" et data-compte="prof".
       Déconnecté : « Connexion élève » et « Connexion enseignante ».
       Connecté : le premier devient « 👤 Prénom » (ou « Suivi des élèves »), le second « Se déconnecter ». */
    const p = store.get('ec-profil'), on = !!(store.get('ec-session') && p);
    document.querySelectorAll('[data-compte]').forEach(a => {
      const prof = a.dataset.compte === 'prof';
      a.classList.add('lien-compte'); a.classList.toggle('lien-compte-prof', prof);
      a.onclick = null;
      if (on && !prof) {
        a.textContent = p.role === 'teacher' ? '👤 Suivi des élèves' : '👤 ' + p.nom;
        a.href = BASE + 'mon-espace.html';
      } else if (on && prof) {
        a.textContent = 'Se déconnecter'; a.href = BASE + 'index.html';
        a.onclick = e => { e.preventDefault(); EC.deconnexion().then(() => { location.href = BASE + 'index.html'; }); };
      } else {
        a.textContent = prof ? '🍎 Connexion enseignante' : '🎒 Connexion élève';
        a.href = EC.lienConnexion(prof ? 'teacher' : 'eleve');
      }
    });
  }
};
EC.TEACHER_EMAIL = TEACHER_EMAIL;
window.EC = EC;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', EC.majBadges); else EC.majBadges();
})();
/* Menu de la langue (Français / English) : chargé sur toutes les pages, à côté de compte.js. */
(function () {
  var en = false; try { en = localStorage.getItem('ec-langue') === 'en'; } catch (e) {}
  if (en) { document.documentElement.style.visibility = 'hidden'; setTimeout(function () { document.documentElement.style.visibility = ''; }, 2500); }
  var moi = document.currentScript && document.currentScript.src;
  var s = document.createElement('script');
  s.src = moi ? moi.replace(/compte\.js(\?.*)?$/, 'langue.js') : 'langue.js';
  (document.head || document.documentElement).appendChild(s);
})();
