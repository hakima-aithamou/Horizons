/* 🔬 Le laboratoire : flotte ou coule, aimants, vivant, états de la matière, lumière, cinq sens. */
(function () {
const A = Atelier.api, { node, hasard, pioche, melange } = A;
/* [emoji, nom, oui ?] */
const FLOTTE = [['🪵', 'un bout de bois', 1], ['🦆', 'un canard en plastique', 1], ['🍃', 'une feuille', 1], ['🧽', 'une éponge sèche', 1], ['🏐', 'un ballon', 1], ['🧊', 'un glaçon', 1], ['🍎', 'une pomme', 1],
  ['🪨', 'une roche', 0], ['🔑', 'une clé', 0], ['🔩', 'une vis', 0], ['🥄', 'une cuillère en métal', 0], ['⚓', 'une ancre', 0], ['🪙', 'une pièce de monnaie', 0], ['🧱', 'une brique', 0]];
const AIMANT = [['📎', 'un trombone', 1], ['🔩', 'une vis en fer', 1], ['🧷', 'une épingle de sûreté', 1], ['🥫', 'une boîte de conserve', 1], ['🪡', 'une aiguille', 1], ['⚙️', 'un engrenage en fer', 1],
  ['🪵', 'un bout de bois', 0], ['🧻', 'du papier', 0], ['🥤', 'un verre en plastique', 0], ['🧸', 'un ourson en peluche', 0], ['✏️', 'un crayon de bois', 0], ['🍎', 'une pomme', 0], ['🧦', 'une chaussette', 0]];
const VIVANT = [['🐶', 'un chien', 1], ['🌳', 'un arbre', 1], ['🍄', 'un champignon', 1], ['🐛', 'une chenille', 1], ['🌻', 'un tournesol', 1], ['🐟', 'un poisson', 1], ['🐦', 'un oiseau', 1],
  ['🪨', 'une roche', 0], ['🚗', 'une auto', 0], ['☁️', 'un nuage', 0], ['🤖', 'un robot', 0], ['💧', 'de l’eau', 0], ['🧸', 'un ourson en peluche', 0], ['☀️', 'le soleil', 0]];
const LUMIERE = [['☀️', 'le soleil', 1], ['🔦', 'une lampe de poche allumée', 1], ['🕯️', 'une chandelle allumée', 1], ['💡', 'une ampoule allumée', 1], ['⚡', 'un éclair', 1], ['🔥', 'un feu de camp', 1],
  ['🌙', 'la lune', 0], ['🪞', 'un miroir', 0], ['💎', 'un diamant', 0], ['🥄', 'une cuillère brillante', 0], ['🪟', 'une fenêtre', 0]];
const ETATS = [['🧊', 'un glaçon', 'solide'], ['🥛', 'du lait', 'liquide'], ['💨', 'la vapeur', 'gaz'], ['🪨', 'une roche', 'solide'], ['🧃', 'du jus', 'liquide'], ['🎈', 'l’air dans le ballon', 'gaz'], ['🍯', 'du miel', 'liquide'], ['🧱', 'une brique', 'solide'], ['💧', 'de l’eau', 'liquide'], ['🫧', 'l’air dans les bulles', 'gaz'], ['🥄', 'une cuillère', 'solide'], ['☕', 'du chocolat chaud', 'liquide']];
const SENS = [['🌸', 'Sentir le parfum d’une fleur.', 'l’odorat 👃'], ['🎵', 'Écouter de la musique.', 'l’ouïe 👂'], ['🍋', 'Goûter un citron.', 'le goût 👅'], ['🧸', 'Sentir la douceur d’un toutou avec tes mains.', 'le toucher ✋'], ['🌈', 'Regarder un arc-en-ciel.', 'la vue 👀'],
  ['🔔', 'Entendre la cloche de la récréation.', 'l’ouïe 👂'], ['🍪', 'Sentir l’odeur des biscuits qui cuisent.', 'l’odorat 👃'], ['🧊', 'Sentir le froid d’un glaçon dans ta main.', 'le toucher ✋'], ['🍦', 'Savourer une crème glacée.', 'le goût 👅'], ['📖', 'Lire les images d’un livre.', 'la vue 👀']];
const SENS5 = ['la vue 👀', 'l’ouïe 👂', 'l’odorat 👃', 'le goût 👅', 'le toucher ✋'];
const tirer = (L, n) => { let s; do { s = melange(L).slice(0, n); } while (s.filter(x => x[2]).length < 2 || s.filter(x => !x[2]).length < 2); return s; };
function trier(api, L, n, consigne, indice, raisonOui, raisonNon) {
  const items = tirer(L, n), m = api.multi(items.map(([e, t]) => ({ e, t }))), bons = items.map((x, i) => x[2] ? i : -1).filter(i => i >= 0);
  return { consigne, indice, explication: raisonOui + ' ' + items.filter(x => x[2]).map(x => x[1]).join(', ') + '. ' + raisonNon,
    verifier() { const v = m.valeur(); if (!v.length) return { manque: 'Touche les cartes de ton choix.' }; const oublis = bons.filter(i => !v.includes(i)).length, erreurs = v.filter(i => !bons.includes(i)).length;
      return !oublis && !erreurs ? true : { aide: (erreurs ? erreurs + ' carte' + (erreurs > 1 ? 's ne vont' : ' ne va') + ' pas. ' : '') + (oublis ? 'Il en manque ' + oublis + '.' : '') }; }, montrer: () => m.montrer(bons) };
}
const niveaux = [
  { titre: 'Flotte ou coule ?', description: 'L’expérience du bassin d’eau.', manche: api => { api.zone().append(node('p', 'image-mot', '🪣')); return trier(api, FLOTTE, 7, 'On met les objets dans un bassin d’eau. Touche tous les objets qui flottent.', 'Les objets légers pour leur grosseur, comme le bois, le plastique ou ce qui contient de l’air, flottent souvent. Le métal et la pierre coulent.', 'Flottent :', 'Les autres coulent au fond.'); } },
  { titre: 'L’aimant', description: 'Qu’est-ce que l’aimant attire ?', manche: api => { api.zone().append(node('p', 'image-mot', '🧲')); return trier(api, AIMANT, 7, 'Touche tous les objets que l’aimant attire.', 'L’aimant attire les objets en fer ou en acier. Il n’attire pas le bois, le papier, le plastique ni le tissu.', 'L’aimant attire :', 'Les autres ne sont pas en fer.'); } },
  { titre: 'Vivant ou non vivant ?', description: 'Ce qui grandit, se nourrit et se reproduit.', manche: api => trier(api, VIVANT, 8, 'Touche tous les êtres vivants.', 'Un être vivant naît, grandit, se nourrit, respire et se reproduit. Les plantes et les champignons aussi sont vivants !', 'Sont vivants :', 'Les autres ne grandissent pas et ne se nourrissent pas.') },
  { titre: 'Solide, liquide ou gaz ?', description: 'Les états de la matière.', manche(api) {
    const [e, t, bon] = pioche(ETATS), opts = ['solide', 'liquide', 'gaz']; api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t)); const f = api.choix(opts);
    return { consigne: 'Est-ce un solide, un liquide ou un gaz : ' + t + ' ?', indice: 'Un solide garde sa forme. Un liquide coule et prend la forme du contenant. Un gaz est souvent invisible et remplit tout l’espace.', explication: t[0].toUpperCase() + t.slice(1) + ' : ' + (bon === 'gaz' ? 'c’est un gaz.' : 'c’est un ' + bon + '.'),
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === bon, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; } },
  { titre: 'Les sources de lumière', description: 'Qui fait sa propre lumière ?', manche: api => trier(api, LUMIERE, 7, 'Touche tout ce qui produit sa propre lumière.', 'Une source de lumière fait de la lumière elle-même. La lune et le miroir ne font que renvoyer la lumière du soleil ou d’une lampe.', 'Produisent de la lumière :', 'Les autres renvoient seulement la lumière.') },
  { titre: 'Les cinq sens', description: 'Quel sens utilises-tu ?', manche(api) {
    const [e, t, bon] = pioche(SENS); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t)); const f = api.choix(SENS5);
    return { consigne: 'Quel sens utilises-tu pour faire cela ? ' + t, indice: 'Quelle partie du corps travaille ? Les yeux (la vue), les oreilles (l’ouïe), le nez (l’odorat), la langue (le goût) ou la peau (le toucher).', explication: 'On utilise ' + bon.replace(/ \S+$/, '') + '.',
      verifier: () => f() === null ? { manque: 'Choisis un sens.' } : SENS5[f()] === bon, montrer() { f.boutons()[SENS5.indexOf(bon)].classList.add('bonne'); } }; } }];
Atelier.definir({ id: 'laboratoire', titre: 'Le laboratoire', icone: '🔬', couleur: '#1f8a8a', intro: 'Mets ta blouse de scientifique ! Fais des expériences : ce qui flotte, ce que l’aimant attire, ce qui est vivant, les états de la matière, la lumière et les cinq sens.', niveaux });
})();
