/* 🌱 Le jardin des saisons : besoins des plantes, parties, cycle de vie, saisons. */
(function () {
const A = Atelier.api, { node, hasard, pioche, melange } = A;
const BESOINS = [['☀️', 'la lumière', 1], ['💧', 'de l’eau', 1], ['🌬️', 'de l’air', 1], ['🟫', 'de la terre (des nutriments)', 1], ['🍬', 'des bonbons', 0], ['📺', 'la télévision', 0], ['🧸', 'un jouet', 0], ['🥤', 'de la boisson gazeuse', 0], ['🎵', 'de la musique', 0]];
const PARTIES = [['les racines', 'Elles boivent l’eau dans la terre et tiennent la plante.'], ['la tige', 'Elle tient la plante debout et transporte l’eau.'], ['les feuilles', 'Elles captent la lumière du soleil pour fabriquer la nourriture.'], ['la fleur', 'Elle attire les abeilles et donne les graines.']];
const CYCLES = [
  { nom: 'le haricot', etapes: [['🫘', 'la graine'], ['🌱', 'la pousse'], ['🌿', 'la plante'], ['🌼', 'la fleur'], ['🫛', 'les haricots']] },
  { nom: 'la citrouille', etapes: [['🟤', 'la graine'], ['🌱', 'la pousse'], ['🌿', 'la plante'], ['🌼', 'la fleur'], ['🎃', 'la citrouille']] },
  { nom: 'la pomme', etapes: [['🟤', 'le pépin'], ['🌱', 'la pousse'], ['🌳', 'le pommier'], ['🌸', 'les fleurs'], ['🍎', 'la pomme']] },
  { nom: 'le papillon', etapes: [['🥚', 'l’œuf'], ['🐛', 'la chenille'], ['🟫', 'la chrysalide'], ['🦋', 'le papillon']] },
  { nom: 'la grenouille', etapes: [['🫧', 'les œufs'], ['〰️', 'le têtard'], ['🦵', 'le têtard avec des pattes'], ['🐸', 'la grenouille']] }];
const SAISONS = ['le printemps 🌷', 'l’été ☀️', 'l’automne 🍂', 'l’hiver ❄️'];
const INDICES_S = [['🌷', 'Les bourgeons sortent et on sème les graines.', 0], ['🍓', 'On cueille les fraises du jardin, il fait chaud.', 1], ['🍂', 'Les feuilles deviennent orange et tombent.', 2], ['🎃', 'On récolte les citrouilles.', 2], ['☃️', 'Le jardin dort sous la neige.', 3], ['🏖️', 'Les journées sont les plus longues et il fait chaud.', 1], ['🐦', 'Les oiseaux reviennent du sud et la neige fond.', 0], ['🧤', 'On met des mitaines, l’eau du bassin est gelée.', 3], ['🍁', 'On ramasse les feuilles mortes avec un râteau.', 2], ['🌱', 'Les premières pousses sortent de la terre.', 0]];
function dessinPlante(parent, cible) {
  const { svg } = A, sv = svg('svg', { viewBox: '0 0 300 320', class: 'grille-svg', role: 'img', 'aria-label': 'Une plante avec ses parties' }); sv.style.maxWidth = '300px';
  sv.append(svg('rect', { x: 0, y: 220, width: 300, height: 100, fill: '#a77b52' }));
  [[150, 220, 110, 300], [150, 220, 150, 310], [150, 220, 190, 295], [130, 260, 105, 280], [170, 255, 200, 270]].forEach(([a, b, c, d]) => sv.append(svg('line', { x1: a, y1: b, x2: c, y2: d, stroke: '#f2e2c4', 'stroke-width': 5, 'stroke-linecap': 'round' })));
  sv.append(svg('line', { x1: 150, y1: 220, x2: 150, y2: 80, stroke: '#3f9a4a', 'stroke-width': 9 }));
  sv.append(svg('ellipse', { cx: 110, cy: 160, rx: 38, ry: 16, fill: '#55b85f', transform: 'rotate(-25 110 160)' }), svg('ellipse', { cx: 190, cy: 135, rx: 38, ry: 16, fill: '#55b85f', transform: 'rotate(25 190 135)' }));
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; sv.append(svg('circle', { cx: 150 + 24 * Math.cos(a), cy: 62 + 24 * Math.sin(a), r: 17, fill: '#f28cb1' })); } sv.append(svg('circle', { cx: 150, cy: 62, r: 14, fill: '#f6c945' }));
  const pos = { 'les racines': [150, 285], 'la tige': [150, 195], 'les feuilles': [190, 135], 'la fleur': [150, 62] }[cible];
  sv.append(svg('circle', { cx: pos[0], cy: pos[1], r: 34, fill: 'none', stroke: '#e0573f', 'stroke-width': 5, 'stroke-dasharray': '8 5' }));
  const fl = svg('text', { x: pos[0] + 48, y: pos[1] + 8, 'font-size': 30 }); fl.textContent = '⬅️'; sv.append(fl); parent.append(sv);
}
const niveaux = [
  { titre: 'Ce dont la plante a besoin', description: 'Pour pousser en santé.', manche(api) {
    const items = melange(BESOINS).slice(0, 7); if (items.filter(x => x[2]).length < 2) items[0] = BESOINS[0], items[1] = BESOINS[1];
    const m = api.multi(items.map(([e, t]) => ({ e, t }))), bons = items.map((x, i) => x[2] ? i : -1).filter(i => i >= 0);
    return { consigne: 'Touche tout ce dont une plante a besoin pour pousser.', indice: 'Une plante a besoin de quatre choses : la lumière, l’eau, l’air et la terre.', explication: 'La plante a besoin de lumière, d’eau, d’air et de terre.',
      verifier() { const v = m.valeur(); if (!v.length) return { manque: 'Touche les cartes de ton choix.' }; return v.length === bons.length && v.every(i => bons.includes(i)) ? true : { aide: v.some(i => !bons.includes(i)) ? 'Une plante n’a pas besoin de tout ça !' : 'Il en manque.' }; }, montrer: () => m.montrer(bons) }; } },
  { titre: 'Les parties de la plante', description: 'Racines, tige, feuilles, fleur.', manche(api) {
    const [p] = pioche(PARTIES), opts = PARTIES.map(x => x[0]); const z = node('div', 'zone'); api.zone().append(z); dessinPlante(z, p); const f = api.choix(opts);
    return { consigne: 'Comment s’appelle la partie de la plante montrée par la flèche ?', indice: 'Regarde où elle se trouve : sous la terre, au milieu, sur les côtés ou tout en haut ?', explication: 'C’est ' + p + '. ' + PARTIES.find(x => x[0] === p)[1],
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === p, montrer() { f.boutons()[opts.indexOf(p)].classList.add('bonne'); } }; } },
  { titre: 'À quoi ça sert ?', description: 'Le rôle de chaque partie.', manche(api) {
    const [p, role] = pioche(PARTIES), opts = PARTIES.map(x => x[0]); api.zone().append(node('p', 'grand-texte', role)); const f = api.choix(opts);
    return { consigne: 'Quelle partie de la plante fait ce travail ?', oral: 'Quelle partie de la plante fait ce travail ? ' + role, indice: 'Pense à l’endroit où se trouve chaque partie et à ce qu’elle touche.', explication: 'C’est ' + p + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === p, montrer() { f.boutons()[opts.indexOf(p)].classList.add('bonne'); } }; } },
  { titre: 'Le cycle de vie', description: 'Remets les étapes en ordre.', manche(api) {
    const c = pioche(CYCLES), items = melange(c.etapes.map(([e, t]) => ({ e, t }))), o = api.ordre(items), bon = c.etapes.map(([, t]) => items.findIndex(x => x.t === t));
    return { consigne: 'Remets dans l’ordre le cycle de vie : ' + c.nom + '.', indice: 'Commence par ce qui est le plus petit, au tout début de la vie : ' + c.etapes[0][1] + '.', explication: c.etapes.map(x => x[1]).join(' → ') + '.',
      verifier() { if (!o.complet()) return { manque: 'Place toutes les cartes.' }; return o.valeur().every((v, i) => v === bon[i]); }, montrer: () => o.montrer(bon) }; } },
  { titre: 'Les saisons au jardin', description: 'Quelle saison est-ce ?', manche(api) {
    const [e, t, s] = pioche(INDICES_S); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t)); const f = api.choix(SAISONS);
    return { consigne: 'De quelle saison parle-t-on ?', oral: 'De quelle saison parle-t-on ? ' + t, indice: 'Pense à la température et à ce qui arrive aux plantes : elles se réveillent, poussent, perdent leurs feuilles ou dorment ?', explication: 'C’est ' + SAISONS[s].replace(/ \S+$/, '') + '.',
      verifier: () => f() === null ? { manque: 'Choisis une saison.' } : f() === s, montrer() { f.boutons()[s].classList.add('bonne'); } }; } },
  { titre: 'Le tour de l’année', description: 'L’ordre des saisons.', manche(api) {
    const d = hasard(0, 3), ordreS = [0, 1, 2, 3].map(i => SAISONS[(d + i) % 4]), items = melange(ordreS.map(s => ({ e: s.split(' ').pop(), t: s.replace(/ \S+$/, '') }))), o = api.ordre(items), bon = ordreS.map(s => items.findIndex(x => x.t === s.replace(/ \S+$/, '')));
    return { consigne: 'Remets les saisons dans l’ordre en commençant par ' + ordreS[0].replace(/ \S+$/, '') + '.', indice: 'Après le printemps vient l’été, puis l’automne, puis l’hiver, et on recommence.', explication: ordreS.map(s => s.replace(/ \S+$/, '')).join(' → ') + '.',
      verifier() { if (!o.complet()) return { manque: 'Place toutes les saisons.' }; return o.valeur().every((v, i) => v === bon[i]); }, montrer: () => o.montrer(bon) }; } }];
Atelier.definir({ id: 'jardin', titre: 'Le jardin des saisons', icone: '🌱', couleur: '#3f9a4a', intro: 'Prends soin du jardin ! Découvre ce dont les plantes ont besoin, leurs parties, leur cycle de vie et ce qui se passe à chaque saison.', niveaux });
})();
