import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDUtrDc2Nz_HXHxneCxUpU4_FG3ycRghwY",
  authDomain: "objectifs-skycell.firebaseapp.com",
  databaseURL: "https://objectifs-skycell-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "objectifs-skycell",
  storageBucket: "objectifs-skycell.firebasestorage.app",
  messagingSenderId: "131924024675",
  appId: "1:131924024675:web:7f91eb1950464efa524756",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ─── BADGES ─────────────────────────────────────────────────────────────────
const BADGES = [
  { id: "bg1",  icon: "🌱", name: "Premier Pas",       desc: "Cocher son 1er objectif",              check: (d,_,__) => Object.values(d).filter(Boolean).length >= 1 },
  { id: "bg2",  icon: "⚔️", name: "Aventurier",        desc: "10 objectifs complétés",               check: (d,_,__) => Object.values(d).filter(Boolean).length >= 10 },
  { id: "bg3",  icon: "🏰", name: "Vétéran",           desc: "25 objectifs complétés",               check: (d,_,__) => Object.values(d).filter(Boolean).length >= 25 },
  { id: "bg4",  icon: "👑", name: "Légende",           desc: "50 objectifs complétés",               check: (d,_,__) => Object.values(d).filter(Boolean).length >= 50 },
  { id: "bg5",  icon: "💰", name: "Marchand",          desc: "Kamas > 10 millions",                  check: (_,meta,__) => (meta?.kamas||0) >= 10000000 },
  { id: "bg6",  icon: "💎", name: "Fortuné",           desc: "Kamas > 50 millions",                  check: (_,meta,__) => (meta?.kamas||0) >= 50000000 },
  { id: "bg7",  icon: "🐉", name: "Dieu des Douze",   desc: "Kamas > 100 millions",                 check: (_,meta,__) => (meta?.kamas||0) >= 100000000 },
  { id: "bg8",  icon: "⭐", name: "Chasseur",          desc: "Succès > 1 000 pts",                   check: (_,meta,__) => (meta?.succes||0) >= 1000 },
  { id: "bg9",  icon: "🌟", name: "Expert",            desc: "Succès > 5 000 pts",                   check: (_,meta,__) => (meta?.succes||0) >= 5000 },
  { id: "bg10", icon: "✨", name: "Maître des Succès", desc: "Succès > 10 000 pts",                  check: (_,meta,__) => (meta?.succes||0) >= 10000 },
  { id: "bg11", icon: "🤝", name: "Inséparables",      desc: "20 objectifs duo complétés",           check: (_,__,duo) => Object.values(duo).filter(Boolean).length >= 20 },
  { id: "bg12", icon: "🎯", name: "Perfectionniste",   desc: "Tous les objectifs d'une catégorie",   check: (d,_,__) => Object.values(d).filter(Boolean).length >= 8 },
];

const KAMAS_PALIERS = [
  { label: "10M",  val: 10000000  },
  { label: "25M",  val: 25000000  },
  { label: "50M",  val: 50000000  },
  { label: "75M",  val: 75000000  },
  { label: "100M", val: 100000000 },
  { label: "200M", val: 200000000 },
];

// ─── DONNÉES DUO ─────────────────────────────────────────────────────────────
const DUO_DATA = [
  { id: "d_4persos", icon: "👥", title: "Objectifs 4 Persos", objectives: [
    { id: "d_4p1", name: "Les 4 persos atteignent le niveau 50",           desc: "Tout le monde sort des zones de départ", diff: 1 },
    { id: "d_4p2", name: "Les 4 persos atteignent le niveau 100",          desc: "Mi-parcours pour toute l'équipe", diff: 2 },
    { id: "d_4p3", name: "Les 4 persos atteignent le niveau 200",          desc: "Le roster complet au cap — objectif ultime", diff: 5 },
    { id: "d_4p4", name: "Chacun des 4 persos a un Dofus équipé",          desc: "Toute l'équipe est équipée de Dofus", diff: 5 },
    { id: "d_4p5", name: "Les 4 persos ont chacun une panoplie complète",  desc: "Full stuffé de la tête aux pieds", diff: 4 },
    { id: "d_4p6", name: "Chaque perso a un métier différent monté",       desc: "4 persos = 4 métiers complémentaires", diff: 4 },
    { id: "d_4p7", name: "Faire tourner les 4 persos dans un donjon",      desc: "Le multi-compte dans toute sa splendeur", diff: 3 },
    { id: "d_4p8", name: "Les 4 persos ont leur quête de classe terminée", desc: "Chaque perso a son identité", diff: 4 },
  ]},
  { id: "d_songes", icon: "🌙", title: "Épreuves de Songes", objectives: [
    { id: "d_sg1", name: "Compléter une Épreuve de Songe à 4",              desc: "Premier run d'épreuve ensemble — tous les 4", diff: 2 },
    { id: "d_sg2", name: "Valider le palier 1 d'une Épreuve de Songe à 4", desc: "Premier succès d'épreuve débloqué en équipe", diff: 2 },
    { id: "d_sg3", name: "Valider le palier 2 d'une Épreuve de Songe à 4", desc: "La difficulté monte, la compo doit s'adapter", diff: 3 },
    { id: "d_sg4", name: "Valider le palier 3 d'une Épreuve de Songe à 4", desc: "Le dernier palier — jeton Pourpre à la clé", diff: 4 },
    { id: "d_sg5", name: "Compléter 5 épreuves différentes à 4",            desc: "Varier les modificateurs et les stratégies", diff: 4 },
    { id: "d_sg6", name: "Finir une épreuve sans aucune mort à 4",          desc: "Run parfait — 0 défaite sur tous les combats", diff: 4 },
    { id: "d_sg7", name: "Finir une épreuve en dessous du temps moyen",     desc: "On optimise la compo pour aller vite", diff: 3 },
    { id: "d_sg8", name: "Valider tous les paliers de la saison Pourpre",   desc: "L'épreuve DOFOUSSE complète à 4 — objectif saison", diff: 5 },
  ]},
  { id: "d_custom", icon: "🎯", title: "Défis Communs Custom", objectives: [
    { id: "d_c1",  name: "Farm une ressource à 9999 en stock à 4",           desc: "La puissance du multicompte au service du farm", diff: 3 },
    { id: "d_c2",  name: "Financer l'équipement d'un perso 200 en duo",      desc: "Un seul perso stuffé grâce à l'effort commun", diff: 4 },
    { id: "d_c3",  name: "Monter une guilde au rang 10",                     desc: "Investissement long terme dans la guilde", diff: 4 },
    { id: "d_c4",  name: "Tenir un territoire avec un prisme 1 semaine",     desc: "Alliance avec un territoire contrôlé", diff: 4 },
    { id: "d_c5",  name: "Finir un donjon difficile sans heal",               desc: "Aucun soin en combat — adaptation tactique totale", diff: 4 },
    { id: "d_c6",  name: "Accumuler 200M de kamas en commun",                desc: "La caisse commune pour les gros projets", diff: 5 },
    { id: "d_c7",  name: "Run donjon avec la compo la plus absurde",         desc: "La compo la plus improbable possible — et gagner", diff: 3 },
    { id: "d_c8",  name: "Session de 6h sans wipe",                          desc: "6h de jeu, 0 défaite collective", diff: 4 },
    { id: "d_c9",  name: "Chacun craft un équipement pour l'autre",          desc: "L'entraide comme philosophie de jeu", diff: 3 },
    { id: "d_c10", name: "Battre un boss de donjon en moins de 5 tours",     desc: "Optimisation maximum, damage race totale", diff: 4 },
  ]},
  { id: "d_quetes", icon: "📜", title: "Quêtes & Lore", objectives: [
    { id: "d_q1", name: "Terminer la quête principale ensemble",       desc: "Du début à la fin, l'histoire complète", diff: 4 },
    { id: "d_q2", name: "Compléter toutes les quêtes d'une même zone", desc: "Choisir une zone et tout faire dedans", diff: 3 },
    { id: "d_q3", name: "Lire le lore d'une zone entière sans zapper", desc: "On s'engage : pas de skip de dialogues", diff: 1 },
  ]},
  { id: "d_defis", icon: "🎲", title: "Défis Atypiques", objectives: [
    { id: "d_d1", name: "Ironman : 0 HDV pendant 1 mois",                desc: "Uniquement ce qu'on drope ou craft ensemble", diff: 4 },
    { id: "d_d2", name: "Jouer la classe que l'autre choisit",           desc: "Surprise garantie, tilts probables", diff: 2 },
    { id: "d_d3", name: "Session sans mourir une seule fois",            desc: "3h de jeu, 0 défaite — concentration totale", diff: 3 },
    { id: "d_d4", name: "4 persos avec synergies imposées",              desc: "Compo pensée en amont, respectée jusqu'au bout", diff: 3 },
    { id: "d_d5", name: "Combat de zone sans sort d'attaque",            desc: "Uniquement sorts de soutien et déplacement", diff: 4 },
    { id: "d_d6", name: "1 000 kills du même monstre à 4",              desc: "Le grind collectif dans toute sa gloire", diff: 2 },
    { id: "d_d7", name: "Session avec les persos de l'autre",           desc: "Sky joue les persos de Cell et vice versa", diff: 2 },
  ]},
  { id: "d_dofus", icon: "🥚", title: "Collection de Dofus (Duo)", objectives: [
    { id: "dd1",  name: "Double Naissance — Dofawa",                   desc: "Le premier œuf chacun. Inutile, mais c'est là que tout commence.", diff: 1 },
    { id: "dd2",  name: "Paire d'Argent — Dofus Argenté",              desc: "Le premier Dofus qui sert vraiment. On arrive dans la cour.", diff: 2 },
    { id: "dd3",  name: "Deux Lapins dans le Pré — Cawotte",           desc: "On s'entraide sur les quêtes de carottes.", diff: 2 },
    { id: "dd4",  name: "Bienvenue à Pandala I — Dokoko",              desc: "Premier passage dans la zone la plus iconique du jeu.", diff: 2 },
    { id: "dd5",  name: "Yeux Grand Ouverts — Veilleurs",              desc: "À caler dès le niveau 100 pour les deux. Ne pas attendre.", diff: 3 },
    { id: "dd6",  name: "La Mer nous Appelle — Turquoise",             desc: "Pandala encore — on enchaîne les deux pendant qu'on y est.", diff: 3 },
    { id: "dd7",  name: "Bienvenue à Pandala II — Domakuro",           desc: "On revient à Pandala. Le Dorigami attend derrière.", diff: 3 },
    { id: "dd8",  name: "Deux Origamis — Dorigami",                    desc: "Le Dofus de papier pour les deux. Domakuro requis.", diff: 3 },
    { id: "dd9",  name: "Le Dragon nous Appartient — Tacheté",         desc: "Imagirorukam vaincu par les deux. Domakuro + Dorigami requis chacun.", diff: 4 },
    { id: "dd10", name: "Plongée en Eaux Profondes — Abyssal",         desc: "L'abyssal ensemble, certains combats sont moins durs à deux.", diff: 3 },
    { id: "dd11", name: "Os Blancs, Cœurs Durs — Ivoire",             desc: "Avant l'Ébène. L'ordre compte. On le sait.", diff: 4 },
    { id: "dd12", name: "La Nuit Tombe sur le Duo — Ébène",            desc: "L'un des plus durs. On souffre ensemble, c'est mieux.", diff: 4 },
    { id: "dd13", name: "La Couleur de la Légende — Ocre",             desc: "Le Dofus du vrai Dofusien. On l'a. Enfin.", diff: 5 },
    { id: "dd14", name: "Deux Chanceux — Vulbis",                      desc: "Le drop rate nous a souri. À tous les deux. Respect.", diff: 5 },
    { id: "dd15", name: "Enfants de la Bête — Dofus d'Osavora",        desc: "La dimension Osamodas à deux. Plusieurs saisons de boulot.", diff: 5 },
    { id: "dd16", name: "La Forêt nous Réclame — Dofus Sylvestre",     desc: "Le plus hardcore du jeu. Valonia ensemble, farming intensif.", diff: 5 },
    { id: "dd17", name: "Six sur Six, Deux fois — Scintillant",        desc: "Six sur Six complet chacun. Le vrai end game. Légendaires.", diff: 5 },
  ]},
  { id: "d_social", icon: "🌍", title: "Social & Serveur", objectives: [
    { id: "d_s1", name: "Rejoindre ou créer une guilde active",     desc: "Et participer à un percepteur ensemble", diff: 1 },
    { id: "d_s2", name: "Participer à un évènement communautaire",  desc: "SpeedRush, Goultarminator, tournoi…", diff: 2 },
    { id: "d_s3", name: "Atteindre le rang Alliance Commandant",    desc: "Prismes, prises de territoires, politique de serveur", diff: 4 },
    { id: "d_s4", name: "Aider un duo de débutants à progresser",   desc: "Guider deux nouvelles recrues ensemble", diff: 1 },
  ]},
];

// ─── DONNÉES SOLO ─────────────────────────────────────────────────────────────
const SOLO_CATS = [
  { id: "s_2persos", icon: "👤", title: "Objectifs 2 Persos", objectives: [
    { id: "s_2p1", name: "Tes 2 persos atteignent le niveau 50",           desc: "Tout le monde sort des zones de départ", diff: 1 },
    { id: "s_2p2", name: "Tes 2 persos atteignent le niveau 100",          desc: "Mi-parcours pour les deux", diff: 2 },
    { id: "s_2p3", name: "Tes 2 persos atteignent le niveau 200",          desc: "Le roster perso au complet au cap", diff: 4 },
    { id: "s_2p4", name: "Tes 2 persos ont chacun un Dofus équipé",        desc: "Les deux stuffés avec un Dofus minimum", diff: 5 },
    { id: "s_2p5", name: "Tes 2 persos ont une panoplie complète chacun",  desc: "Full stuffés tous les deux", diff: 4 },
    { id: "s_2p6", name: "Tes 2 persos ont des métiers complémentaires",   desc: "Pas de doublon — on couvre plus de terrain", diff: 3 },
    { id: "s_2p7", name: "Donjon solo avec tes 2 persos seulement",        desc: "Tu gères tout seul avec ta propre compo", diff: 3 },
    { id: "s_2p8", name: "Tes 2 persos ont leur quête de classe terminée", desc: "Chaque perso a son identité propre", diff: 3 },
  ]},
  { id: "s_prog", icon: "⚔️", title: "Progression & Stuff", objectives: [
    { id: "s1",  name: "Atteindre le niveau 50 sur ton main",    desc: "Première étape, on sort des zones de départ", diff: 1 },
    { id: "s2",  name: "Atteindre le niveau 100 sur ton main",   desc: "La moitié du chemin vers le cap", diff: 2 },
    { id: "s3",  name: "Atteindre le niveau 150 sur ton main",   desc: "Les zones de haut niveau s'ouvrent", diff: 3 },
    { id: "s4",  name: "Atteindre le niveau 200 sur ton main",   desc: "Le cap — le vrai jeu commence ici", diff: 4 },
    { id: "s5",  name: "Obtenir un Dofus équipé sur ton main",   desc: "Au moins un Dofus en permanence", diff: 5 },
    { id: "s6",  name: "Être full stuff endgame optimisé",        desc: "Chaque slot au maximum de son potentiel", diff: 5 },
    { id: "s7",  name: "Faire un stuff entièrement thématique",  desc: "Full craft, full drop, ou full donjon unique", diff: 3 },
    { id: "s8",  name: "Stuff différent sur chaque perso",       desc: "Pas de copier-coller — chaque perso a son style", diff: 3 },
  ]},
  { id: "s_custom", icon: "🎯", title: "Défis Custom Solo", objectives: [
    { id: "s_c1",  name: "50M de kamas à ton propre rythme",            desc: "Pas de rush, ton propre rythme", diff: 4 },
    { id: "s_c2",  name: "Crafter l'intégralité du stuff d'un perso",   desc: "0 HDV pour l'équipement — tout craft maison", diff: 4 },
    { id: "s_c3",  name: "Monter un perso secondaire support pur",       desc: "Un perso dédié à aider, 0 dégâts", diff: 3 },
    { id: "s_c4",  name: "Donjon difficile sans te faire soigner",       desc: "Self-suffisant — tu encaisses et tu gères", diff: 4 },
    { id: "s_c5",  name: "500 kills de 5 monstres différents",          desc: "Diversifier les zones, diversifier l'XP", diff: 3 },
    { id: "s_c6",  name: "Un perso farm kamas, un perso farm XP",       desc: "Deux rôles bien définis sur tes deux persos", diff: 3 },
    { id: "s_c7",  name: "Terminer une quête longue sans aide",          desc: "Pas de coup de main — tu gères de A à Z", diff: 3 },
    { id: "s_c8",  name: "Obtenir un titre visible qui te représente",  desc: "Un titre qui raconte quelque chose sur toi", diff: 3 },
    { id: "s_c9",  name: "30 jours sans utiliser l'HDV pour vendre",    desc: "Tu écoules tout via guilde ou échanges directs", diff: 4 },
    { id: "s_c10", name: "2 persos dans des nations différentes",        desc: "Bontarien ET Brakmarian — la dualité", diff: 2 },
  ]},
  { id: "s_metiers", icon: "🔨", title: "Métiers & Économie", objectives: [
    { id: "s23", name: "Monter un métier à 100",                            desc: "Premier palier significatif", diff: 2 },
    { id: "s24", name: "Monter un métier à 200",                            desc: "Maîtrise complète d'un métier", diff: 4 },
    { id: "s25", name: "Crafter un set entier depuis les ressources brutes", desc: "Récolter + crafter = fierté absolue", diff: 4 },
    { id: "s26", name: "Atteindre 10 millions de kamas",                    desc: "Premier grand cap économique", diff: 3 },
    { id: "s27", name: "Atteindre 50 millions de kamas",                    desc: "Les bonnes affaires portent leurs fruits", diff: 4 },
    { id: "s28", name: "Atteindre 100 millions de kamas",                   desc: "Ta fortune personnelle — le vrai cap", diff: 5 },
    { id: "s29", name: "Vendre un item rare à bon prix à l'HDV",            desc: "Le feeling de la bonne affaire", diff: 2 },
    { id: "s30", name: "Monter un farm quotidien de ressources",            desc: "Une ressource ciblée, vendue chaque jour", diff: 3 },
  ]},
  { id: "s_succes", icon: "🏆", title: "Succès", objectives: [
    { id: "s19", name: "Atteindre 500 points de succès",    desc: "Premier palier pour se sentir progresser", diff: 1 },
    { id: "s20", name: "Atteindre 2 000 points de succès",  desc: "On commence à couvrir sérieusement le contenu", diff: 2 },
    { id: "s21", name: "Atteindre 5 000 points de succès",  desc: "Joueur accompli — pas mal du tout", diff: 3 },
    { id: "s22", name: "Atteindre 10 000 points de succès", desc: "Le graal des chasseurs de succès", diff: 5 },
  ]},
  { id: "s_quetes", icon: "📜", title: "Quêtes & Lore", objectives: [
    { id: "s31", name: "Compléter toutes les quêtes d'une nation", desc: "Bonta, Brâkmar ou Amakna — au choix", diff: 3 },
    { id: "s32", name: "Finir la quête de classe de tes 2 persos", desc: "La quête de classe, c'est identitaire", diff: 3 },
    { id: "s33", name: "Compléter 100 quêtes au total",             desc: "Un cap accessible pour tout type de joueur", diff: 2 },
    { id: "s34", name: "Compléter 300 quêtes au total",             desc: "Tu connais les dialogues par cœur", diff: 4 },
  ]},
  { id: "s_dofus", icon: "🥚", title: "Collection de Dofus", objectives: [
    { id: "sd1",  name: "L'Œuf de la Honte — Dofawa",               desc: "Inutile, mais on le fait quand même. C'est la tradition.", diff: 1 },
    { id: "sd2",  name: "Premiers Reflets — Dofus Argenté",          desc: "Le premier qui sert vraiment. Bienvenue dans la progression.", diff: 2 },
    { id: "sd3",  name: "La Saison des Carottes — Cawotte",          desc: "Quelques quêtes et un peu de patience. Ça se mérite.", diff: 2 },
    { id: "sd4",  name: "Fils de Pandala I — Dokoko",                desc: "Premier Dofus de la zone la plus iconique du jeu.", diff: 2 },
    { id: "sd5",  name: "L'Œil qui ne Dort Jamais — Veilleurs",      desc: "À faire dès le niveau 100. Ne pas attendre.", diff: 3 },
    { id: "sd6",  name: "La Voie de la Lumière — Émeraude",          desc: "Pour les Bontariens. La quête d'alignement récompensée.", diff: 3 },
    { id: "sd7",  name: "Enfant des Ténèbres — Pourpre",             desc: "Pour les Brakmarians. L'obscurité a ses avantages.", diff: 3 },
    { id: "sd8",  name: "Couleur Océan — Turquoise",                 desc: "Pandala encore. Tant qu'on y est, autant enchaîner.", diff: 3 },
    { id: "sd9",  name: "Fils de Pandala II — Domakuro",             desc: "On revient à Pandala. Le Dorigami attend derrière.", diff: 3 },
    { id: "sd10", name: "L'Art du Pliage — Dorigami",               desc: "Le Dofus de papier. Nécessite le Domakuro.", diff: 3 },
    { id: "sd11", name: "Le Dragon et ses Secrets — Tacheté",        desc: "Le Dofus d'Imagirorukam. Domakuro + Dorigami requis tous les deux.", diff: 4 },
    { id: "sd12", name: "Blizzard Intérieur — Dofus des Glaces",     desc: "Les zones froides ont leurs secrets. Et leurs quêtes longues.", diff: 3 },
    { id: "sd13", name: "Dans les Abysses — Abyssal",                desc: "Utile en mêlée et à distance. Les quêtes valent le coup.", diff: 3 },
    { id: "sd14", name: "Forgé dans la Lave — Forgelave",            desc: "Plutôt pour la collection. Les combats sont costauds.", diff: 4 },
    { id: "sd15", name: "Rêve Éveillé — Nébuleux",                   desc: "Long. Très long. Mais les quêtes sont bien foutues.", diff: 4 },
    { id: "sd16", name: "L'Os sous la Dent — Ivoire",                desc: "Avant l'Ébène. C'est pas négociable. L'ordre compte.", diff: 4 },
    { id: "sd17", name: "Cœur de Charbon — Ébène",                  desc: "Rapide mais brutal. Die & retry garanti. Tu vas souffrir.", diff: 4 },
    { id: "sd18", name: "L'Or des Légendes — Ocre",                  desc: "Le Dofus des vrais. Commence les quêtes le plus tôt possible.", diff: 5 },
    { id: "sd19", name: "Né sous une Bonne Étoile — Vulbis",         desc: "Le drop décide. Tout ce qu'on peut faire c'est farmer.", diff: 5 },
    { id: "sd20", name: "Enfant de la Bête — Dofus d'Osavora",       desc: "La dimension du Dieu Osamodas. Plusieurs saisons pour tout débloquer.", diff: 5 },
    { id: "sd21", name: "La Forêt te Réclame — Dofus Sylvestre",     desc: "Farming intensif, prérequis délirants, donjons à Valonia. Le plus hardcore.", diff: 5 },
    { id: "sd22", name: "Six sur Six — Argenté Scintillant",          desc: "Six sur Six complet. Le vrai end game. Tu l'as mérité.", diff: 5 },
    { id: "sd23", name: "La Longue Marche — Dolmanax",               desc: "À faire en parallèle de tout le reste. Almanax quotidien.", diff: 3 },
  ]},
  { id: "s_defis", icon: "🎲", title: "Défis Perso", objectives: [
    { id: "s35", name: "Monter un perso en Hardcore Mode",               desc: "Si mort = tout recommencer", diff: 5 },
    { id: "s36", name: "Défi quotidien pendant 30 jours de suite",       desc: "Discipline et régularité — sans exception", diff: 3 },
    { id: "s37", name: "Collectionner tous les familiers d'une famille", desc: "Une obsession saine", diff: 3 },
    { id: "s38", name: "Aider un joueur débutant à se stuff",            desc: "Partager son savoir, c'est aussi du jeu", diff: 1 },
    { id: "s39", name: "Finir un combat avec exactement 1 PV restant",  desc: "Pur hasard ou génie tactique", diff: 3 },
    { id: "s40", name: "7 jours de suite sans passer par l'HDV",        desc: "Survie en autarcie totale", diff: 3 },
    { id: "s41", name: "Monter un perso uniquement via les quêtes",      desc: "0 farm monstre — une autre façon de progresser", diff: 4 },
    { id: "s42", name: "Obtenir un titre rare ou difficile",             desc: "Un titre qui en impose dans les zones communes", diff: 4 },
  ]},
];

function makeSoloData(prefix) {
  return SOLO_CATS.map(cat => ({ ...cat, id: prefix+cat.id, objectives: cat.objectives.map(o => ({ ...o, id: prefix+o.id })) }));
}

// ─── COULEURS ────────────────────────────────────────────────────────────────
const C = {
  bgDeep:"#e8dcc8", bgPanel:"#f5edd8", bgCard:"#fdf6e8", bgCardHov:"#fff8f0", bgDone:"#eaf2ea",
  gold:"#8b5e1a", goldLight:"#a0721f", goldDim:"#c8a060",
  border:"#d4b87a", borderLight:"#e8d4a0",
  text:"#2a1a08", textDim:"#6b4e28", textBright:"#1a0e04",
  green:"#2a6a2a", greenBorder:"#4a8a4a",
  headerBg:"#5a3a10", headerBg2:"#7a5018",
  panelBorder:"#b8924a",
};
const DIFF_COLORS = ["#2a7a2a","#6a8a1a","#b87a10","#c85a10","#a01010"];
const DIFF_LABELS = ["Facile","Aisé","Moyen","Difficile","Légendaire"];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bgDeep};}
.dofus-app{font-family:'Crimson Pro',Georgia,serif;background:${C.bgDeep};min-height:100vh;color:${C.text};background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23b8924a' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
.panel{background:${C.bgPanel};border:2px solid ${C.panelBorder};border-radius:6px;position:relative;box-shadow:0 2px 8px rgba(90,58,16,0.15);}
.panel::before{content:'';position:absolute;inset:0;border-radius:4px;background:linear-gradient(135deg,rgba(200,160,80,0.08) 0%,transparent 50%);pointer-events:none;}
.panel-gold{background:linear-gradient(180deg,#f0e0b0 0%,#e8d49a 100%);border:2px solid ${C.panelBorder};border-radius:6px;position:relative;overflow:hidden;box-shadow:0 2px 6px rgba(90,58,16,0.2);}
.panel-gold::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${C.goldDim},transparent);}
.obj-row{display:grid;grid-template-columns:28px 1fr auto;align-items:start;gap:10px;padding:10px 14px;border-radius:5px;background:${C.bgCard};border:1px solid ${C.borderLight};cursor:pointer;transition:background 0.15s,border-color 0.15s;box-shadow:0 1px 3px rgba(90,58,16,0.08);}
.obj-row:hover{background:${C.bgCardHov};border-color:${C.goldDim};}
.obj-row.done{background:#eef4ee;border-color:${C.greenBorder};opacity:0.7;}
.tab-btn{padding:10px 20px;border-radius:5px 5px 0 0;font-family:'Cinzel',serif;font-size:12px;font-weight:600;border:2px solid transparent;border-bottom:none;cursor:pointer;transition:all 0.15s;letter-spacing:0.5px;}
.tab-btn.inactive{background:rgba(90,58,16,0.12);border-color:${C.border};color:${C.headerBg};}
.tab-btn.inactive:hover{color:${C.gold};border-color:${C.goldDim};}
.filter-btn{padding:5px 12px;border-radius:3px;font-size:12px;font-family:'Crimson Pro',serif;font-weight:600;border:1px solid ${C.border};background:transparent;color:${C.textDim};cursor:pointer;transition:all 0.12s;}
.filter-btn:hover{border-color:${C.gold};color:${C.gold};}
.filter-btn.active{background:rgba(139,94,26,0.15);border-color:${C.gold};color:${C.gold};}
.cat-title{font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:${C.gold};letter-spacing:1px;text-transform:uppercase;}
.obj-name{font-size:14px;font-weight:600;color:${C.textBright};line-height:1.3;}
.obj-name.done{text-decoration:line-through;color:${C.textDim};}
.obj-desc{font-size:12px;color:${C.textDim};font-style:italic;margin-top:2px;line-height:1.3;}
.check-box{width:20px;height:20px;border:2px solid ${C.goldDim};border-radius:3px;display:flex;align-items:center;justify-content:center;background:white;flex-shrink:0;margin-top:2px;transition:all 0.15s;}
.check-box.done{background:${C.green};border-color:${C.green};}
.prog-track{flex:1;height:8px;background:rgba(139,94,26,0.12);border-radius:2px;border:1px solid ${C.border};overflow:hidden;}
.prog-fill{height:100%;border-radius:2px;transition:width 0.5s ease;}
.divider{height:1px;background:linear-gradient(90deg,transparent,${C.panelBorder},transparent);margin:6px 0;}
.note-input{width:100%;background:white;border:1px solid ${C.border};border-radius:4px;padding:8px 12px;color:${C.text};font-family:'Crimson Pro',serif;font-size:14px;resize:none;outline:none;}
.note-input:focus{border-color:${C.gold};}
.send-btn{padding:8px 18px;background:${C.headerBg};border:none;border-radius:4px;color:#f5edd8;font-family:'Cinzel',serif;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;letter-spacing:0.5px;}
.send-btn:hover{background:${C.headerBg2};}
.meta-input{background:white;border:1px solid ${C.border};border-radius:4px;padding:6px 10px;color:${C.text};font-family:'Crimson Pro',serif;font-size:14px;outline:none;width:100%;}
.meta-input:focus{border-color:${C.gold};}
.badge-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:6px;text-align:center;transition:all 0.2s;}
.badge-card.unlocked{background:linear-gradient(180deg,#f0e0b0,#e8d49a);border:2px solid ${C.panelBorder};box-shadow:0 2px 6px rgba(90,58,16,0.15);}
.badge-card.locked{background:rgba(139,94,26,0.05);border:1px solid ${C.borderLight};opacity:0.4;filter:grayscale(1);}
@keyframes popIn{0%{transform:scale(0.5);opacity:0;}60%{transform:scale(1.2);}100%{transform:scale(1);opacity:1;}}
@keyframes goldBurst{0%{transform:scale(0.3);opacity:1;}100%{transform:scale(4);opacity:0;}}
@keyframes goldRay{0%{transform:scaleY(0);opacity:0.9;}60%{opacity:0.7;}100%{transform:scaleY(1);opacity:0;}}
@keyframes goldGlow{0%{opacity:0.9;transform:scale(1);}100%{opacity:0;transform:scale(2.5);}}
@keyframes catComplete{0%{opacity:0;transform:translateY(-10px);}100%{opacity:1;transform:translateY(0);}}
@keyframes catGoldFlood{0%{opacity:0;}20%{opacity:0.4;}100%{opacity:0;}}
.pop-anim{animation:popIn 0.35s ease forwards;}
.cat-complete-banner{animation:catComplete 0.5s ease forwards;background:linear-gradient(135deg,rgba(139,94,26,0.15),rgba(200,160,80,0.1));border:1px solid ${C.gold};border-radius:6px;padding:12px 20px;text-align:center;margin-bottom:12px;}
`;

// ─── EFFET LUMIÈRE DORÉE (canvas) ────────────────────────────────────────────
function GoldBurst({ x, y, onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 200, H = 200, cx = W/2, cy = H/2;

    // Particules
    const particles = Array.from({ length: 48 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      const size = 1.5 + Math.random() * 3;
      const colors = ["#f5d060","#e8b84b","#c8922a","#fff8d0","#f0c040"];
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.022 + Math.random() * 0.018,
        gravity: 0.06 + Math.random() * 0.04,
      };
    });

    // Anneaux
    const rings = [
      { r: 0, maxR: 55, alpha: 0.9, width: 2.5, color: "#f5d060" },
      { r: 0, maxR: 38, alpha: 0.6, width: 1.5, color: "#fff8d0" },
    ];

    // Lueur centrale
    let glowAlpha = 1;

    let frame = 0;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Lueur centrale
      if (glowAlpha > 0) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + frame * 0.5);
        grad.addColorStop(0, `rgba(255,240,160,${glowAlpha * 0.9})`);
        grad.addColorStop(0.3, `rgba(232,184,75,${glowAlpha * 0.6})`);
        grad.addColorStop(1, `rgba(200,146,42,0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + frame * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        glowAlpha -= 0.03;
      }

      // Anneaux
      rings.forEach(ring => {
        if (ring.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color.replace(")", `,${ring.alpha})`).replace("rgb", "rgba").replace("#f5d060", `rgba(245,208,96,${ring.alpha})`).replace("#fff8d0", `rgba(255,248,208,${ring.alpha})`);
        ctx.lineWidth = ring.width;
        ctx.stroke();
        ring.r += (ring.maxR - ring.r) * 0.18;
        ring.alpha -= 0.028;
      });

      // Particules
      particles.forEach(p => {
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#f5d060";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.alpha -= p.decay;
        p.size *= 0.985;
      });

      frame++;
      const allDead = particles.every(p => p.alpha <= 0) && glowAlpha <= 0 && rings.every(r => r.alpha <= 0);
      if (!allDead && frame < 80) {
        raf = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200} height={200}
      style={{
        position: "fixed",
        left: x - 100,
        top: y - 100,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9998, background:`linear-gradient(135deg,${C.headerBg},${C.headerBg2})`, border:`1px solid ${C.panelBorder}`, borderRadius:8, padding:"12px 20px", color:"#f5edd8", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:0.5, boxShadow:`0 4px 16px rgba(90,58,16,0.3)`, maxWidth:300 }}>
      {msg}
    </div>
  );
}

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────
function Diff({ n }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      {Array.from({length:5},(_,i)=>(
        <div key={i} style={{ width:6,height:6,borderRadius:"50%", background:i<n?DIFF_COLORS[n-1]:"rgba(200,146,42,0.15)", boxShadow:i<n?`0 0 4px ${DIFF_COLORS[n-1]}88`:"none" }} />
      ))}
    </div>
  );
}

function ProgBar({ label, done, total, color, height=8 }) {
  const pct = total ? Math.round(done/total*100) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
      <div style={{ fontSize:11,color:C.textDim,width:130,flexShrink:0,fontFamily:"'Cinzel',serif",letterSpacing:0.3 }}>{label}</div>
      <div className="prog-track" style={{height}}>
        <div className="prog-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}cc)` }} />
      </div>
      <div style={{ fontSize:11,color,width:36,textAlign:"right",fontFamily:"'Cinzel',serif" }}>{done}/{total}</div>
    </div>
  );
}

// ─── SECTION PERSONNAGES ─────────────────────────────────────────────────────
function PersonnagesSection({ skydroMeta, cellMeta, onUpdateSkydro, onUpdateCell }) {
  const players = [
    { label:"Sky",  color:"#2a4a8a", border:"#4a6a9a", colorLight:"#e8f0f8", meta:skydroMeta, onUpdate:onUpdateSkydro },
    { label:"Cell", color:"#7a2a1a", border:"#9a4a2a", colorLight:"#f8ede8", meta:cellMeta,   onUpdate:onUpdateCell   },
  ];
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>⚔ Personnages</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {players.map(p => {
          const persos = p.meta?.persos || [{name:"", level:1},{name:"", level:1}];
          return (
            <div key={p.label} className="panel-gold" style={{ padding:"12px 14px" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:p.color, marginBottom:8, letterSpacing:1 }}>◈ {p.label}</div>
              {persos.slice(0,2).map((perso, i) => (
                <div key={i} style={{ marginBottom:8 }}>
                  <input className="meta-input" placeholder={`Perso ${i+1}`} value={perso.name||""} onChange={e => {
                    const d=[...persos]; d[i]={...d[i],name:e.target.value};
                    p.onUpdate({...p.meta, persos:d});
                  }} style={{ marginBottom:4, fontSize:13 }} />
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, color:C.textDim, fontFamily:"'Cinzel',serif", flexShrink:0 }}>Niv.</span>
                    <input className="meta-input" type="number" min={1} max={200} placeholder="—" value={perso.level||""} onChange={e => {
                      const val = e.target.value === "" ? null : parseInt(e.target.value);
                      const d=[...persos]; d[i]={...d[i],level:val};
                      p.onUpdate({...p.meta, persos:d});
                    }} style={{ fontSize:13, width:60 }} />
                    <div style={{ flex:1, height:4, background:`${p.border}22`, borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${perso.level ? Math.min(100,Math.round(perso.level/200*100)) : 0}%`, background:p.color, borderRadius:2 }} />
                    </div>
                    <span style={{ fontSize:10, color:p.color, fontFamily:"'Cinzel',serif", fontWeight:700 }}>
                      {perso.level >= 200 ? "✦200" : perso.level ? `${perso.level}` : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SECTION KAMAS ───────────────────────────────────────────────────────────
function KamasSection({ player, kamas, onUpdate }) {
  const fmt = v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v;
  const next = KAMAS_PALIERS.find(p => p.val > (kamas||0)) || KAMAS_PALIERS[KAMAS_PALIERS.length-1];
  const prev = KAMAS_PALIERS.filter(p => p.val <= (kamas||0)).pop() || { val:0, label:"0" };
  const pct = Math.min(100, Math.round(((kamas||0)-prev.val)/(next.val-prev.val)*100));
  return (
    <div className="panel-gold" style={{ padding:"14px 18px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:1, textTransform:"uppercase" }}>💰 Kamas de {player}</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:C.goldLight }}>{fmt(kamas||0)}</div>
      </div>
      <input className="meta-input" type="number" min={0} placeholder="0" value={kamas||""} onChange={e => onUpdate(parseInt(e.target.value)||0)} style={{ marginBottom:10, fontSize:13 }} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <span style={{ fontSize:11, color:C.textDim }}>{fmt(prev.val)}</span>
        <div className="prog-track" style={{ flex:1, height:10 }}>
          <div className="prog-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
        </div>
        <span style={{ fontSize:11, color:C.goldLight, fontFamily:"'Cinzel',serif" }}>{next.label}</span>
      </div>
      <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic", textAlign:"center" }}>
        {kamas >= 100000000 ? "🎉 Cap des 100M atteint !" : `Prochain palier : ${next.label} (${fmt(Math.max(0,next.val-(kamas||0)))} restants)`}
      </div>
    </div>
  );
}

// ─── SECTION SUCCÈS PTS ──────────────────────────────────────────────────────
function SuccesSection({ player, succes, onUpdate }) {
  const PALIERS = [500,2000,5000,10000];
  const next = PALIERS.find(p => p > (succes||0)) || 10000;
  const prev = PALIERS.filter(p => p <= (succes||0)).pop() || 0;
  const pct = Math.min(100, Math.round(((succes||0)-prev)/(next-prev)*100));
  return (
    <div className="panel-gold" style={{ padding:"14px 18px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:1, textTransform:"uppercase" }}>⭐ Succès de {player}</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:C.goldLight }}>{(succes||0).toLocaleString()} pts</div>
      </div>
      <input className="meta-input" type="number" min={0} placeholder="0" value={succes||""} onChange={e => onUpdate(parseInt(e.target.value)||0)} style={{ marginBottom:10, fontSize:13 }} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <span style={{ fontSize:11, color:C.textDim }}>{prev.toLocaleString()}</span>
        <div className="prog-track" style={{ flex:1, height:10 }}>
          <div className="prog-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,#e8b84b,#fff)` }} />
        </div>
        <span style={{ fontSize:11, color:C.goldLight, fontFamily:"'Cinzel',serif" }}>{next.toLocaleString()}</span>
      </div>
      <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic", textAlign:"center" }}>
        {succes >= 10000 ? "🏆 Maître des succès !" : `Prochain palier : ${next.toLocaleString()} pts (${Math.max(0,next-(succes||0)).toLocaleString()} restants)`}
      </div>
    </div>
  );
}

// ─── SECTION BADGES ──────────────────────────────────────────────────────────
function BadgesSection({ soloDone, meta, duoDone }) {
  const unlocked = BADGES.filter(b => b.check(soloDone, meta, duoDone));
  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>🏅 Badges</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
        {BADGES.map(b => {
          const isUnlocked = unlocked.some(u => u.id === b.id);
          return (
            <div key={b.id} className={`badge-card ${isUnlocked?"unlocked":"locked"}`} title={b.desc}>
              <div style={{ fontSize:26 }}>{b.icon}</div>
              <div style={{ fontSize:11, fontFamily:"'Cinzel',serif", color:isUnlocked?C.goldLight:C.textDim, letterSpacing:0.3, lineHeight:1.2, textAlign:"center" }}>{b.name}</div>
              <div style={{ fontSize:10, color:C.textDim, fontStyle:"italic", textAlign:"center", lineHeight:1.2 }}>{b.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FIL DE NOTES ────────────────────────────────────────────────────────────
function NotesSection({ notes, author, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [notes]);
  const send = () => { if (!text.trim()) return; onSend(text.trim()); setText(""); };
  const noteList = notes ? Object.values(notes).sort((a,b) => a.ts-b.ts) : [];
  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>💬 Fil de Notes Partagées</div>
      <div style={{ maxHeight:240, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, marginBottom:12, paddingRight:4 }}>
        {noteList.length === 0 && <div style={{ fontSize:13, color:C.textDim, fontStyle:"italic", textAlign:"center", padding:16 }}>Aucune note pour l'instant…</div>}
        {noteList.map((n,i) => (
          <div key={i} style={{ background:n.author==="Sky"?"rgba(74,100,200,0.08)":"rgba(180,80,50,0.08)", border:`1px solid ${n.author==="Sky"?"rgba(74,100,200,0.2)":"rgba(180,80,50,0.2)"}`, borderRadius:5, padding:"8px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:11, fontFamily:"'Cinzel',serif", fontWeight:600, color:n.author==="Sky"?"#2a4a8a":"#7a2a1a" }}>{n.author}</span>
              <span style={{ fontSize:10, color:C.textDim }}>{new Date(n.ts).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
            </div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.4 }}>{n.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
        <textarea className="note-input" rows={2} placeholder={`Écrire une note en tant que ${author}…`} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }} />
        <button className="send-btn" onClick={send}>Envoyer</button>
      </div>
    </div>
  );
}

// ─── ANIMATION CATÉGORIE COMPLÈTE ────────────────────────────────────────────
function CatCompleteOverlay({ title, icon, onDone }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("in"); // in → hold → out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 2200);
    const t3 = setTimeout(onDone, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;

    const particles = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const colors = ["#f5d060","#e8b84b","#c8922a","#fff8d0","#f0c040","#ffffff"];
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.01,
        gravity: 0.08,
      };
    });

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#f5d060";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
        p.x += p.vx; p.y += p.vy;
        p.vy += p.gravity; p.vx *= 0.98;
        p.alpha -= p.decay;
      });
      if (particles.some(p => p.alpha > 0)) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const opacity = phase === "in" ? 1 : phase === "hold" ? 1 : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: phase === "out" ? "opacity 0.6s ease" : "opacity 0.3s ease",
      opacity,
    }}>
      {/* Fond semi-transparent */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(200,146,42,0.25) 0%, rgba(90,58,16,0.55) 100%)",
      }} />
      {/* Canvas particules */}
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
      {/* Texte central */}
      <div style={{
        position: "relative", zIndex: 1, textAlign: "center",
        transform: phase === "in" ? "scale(0.7)" : "scale(1)",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ fontSize: 52, marginBottom: 8, filter: "drop-shadow(0 0 20px rgba(245,208,96,0.8))" }}>{icon}</div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: "clamp(18px,4vw,32px)", fontWeight: 700,
          color: "#f5d060", letterSpacing: 3, textTransform: "uppercase",
          textShadow: "0 0 30px rgba(245,208,96,0.9), 0 2px 8px rgba(0,0,0,0.8)",
          marginBottom: 10,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: "'Crimson Pro', serif", fontSize: 16, fontStyle: "italic",
          color: "#f5edd8", opacity: 0.9,
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}>
          ✦ Catégorie complétée ! ✦
        </div>
      </div>
    </div>
  );
}


function ObjList({ data, done, toggle }) {
  const [filter, setFilter] = useState("all");
  const [particles, setParticles] = useState([]);
  const [completedCats, setCompletedCats] = useState([]);
  const [overlay, setOverlay] = useState(null);
  const initialCollapsed = data.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {});
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggleCollapse = id => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const handleToggle = (id, e) => {
    e.stopPropagation();
    const wasDone = done[id];
    toggle(id);
    if (!wasDone) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pid = Date.now();
      setParticles(p => [...p, { id:pid, x:rect.left+rect.width/2, y:rect.top+rect.height/2 }]);
    }
  };

  useEffect(() => {
    const newlyDone = data.filter(cat => {
      const allDone = cat.objectives.every(o => done[o.id]);
      return allDone && !completedCats.includes(cat.id);
    });
    if (newlyDone.length > 0) {
      setCompletedCats(p => [...p, ...newlyDone.map(c => c.id)]);
      setOverlay({ title: newlyDone[0].title, icon: newlyDone[0].icon });
    }
  }, [done]);

  return (
    <div>
      {overlay && <CatCompleteOverlay title={overlay.title} icon={overlay.icon} onDone={() => setOverlay(null)} />}
      {particles.map(p => <GoldBurst key={p.id} x={p.x} y={p.y} onDone={() => setParticles(prev => prev.filter(x => x.id !== p.id))} />)}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[{key:"all",label:"Tout"},{key:"done",label:"✓ Complétés"},{key:"todo",label:"À faire"}].map(f => (
          <button key={f.key} className={`filter-btn${filter===f.key?" active":""}`} onClick={()=>setFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      {data.map(cat => {
        const objs = cat.objectives.filter(o => filter==="done"?done[o.id]:filter==="todo"?!done[o.id]:true);
        if (!objs.length) return null;
        const catDone = cat.objectives.filter(o => done[o.id]).length;
        const catComplete = catDone === cat.objectives.length;
        const catPct = Math.round(catDone/cat.objectives.length*100);
        const isCollapsed = collapsed[cat.id];
        return (
          <div key={cat.id} style={{ marginBottom:10 }}>
            {/* En-tête cliquable */}
            <div onClick={() => toggleCollapse(cat.id)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", borderRadius: isCollapsed ? 6 : "6px 6px 0 0",
              background: catComplete ? "rgba(200,146,42,0.1)" : "rgba(200,146,42,0.05)",
              border:`1px solid ${catComplete ? C.goldDim : C.border}`,
              borderBottom: isCollapsed ? undefined : `1px solid ${C.border}`,
              cursor:"pointer", userSelect:"none",
              transition:"background 0.15s",
            }}>
              <span style={{ fontSize:16 }}>{cat.icon}</span>
              <span className="cat-title" style={{ flex:1, color: catComplete ? C.goldLight : undefined, textDecoration: catComplete ? "line-through" : "none", opacity: catComplete ? 0.7 : 1 }}>{cat.title}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:50, height:4, background:"rgba(200,146,42,0.1)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${catPct}%`, background:catComplete?C.goldLight:C.gold, borderRadius:2 }} />
                </div>
                <span style={{ fontSize:11, color:catComplete?C.goldLight:C.textDim, fontFamily:"'Cinzel',serif", width:28, textAlign:"right" }}>{catDone}/{cat.objectives.length}</span>
                <span style={{ fontSize:12, color:C.textDim, marginLeft:4, transition:"transform 0.2s", display:"inline-block", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▾</span>
              </div>
            </div>
            {/* Contenu déroulant */}
            {!isCollapsed && (
              <div style={{ border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 6px 6px", padding:"8px 8px", display:"flex", flexDirection:"column", gap:5, background:"rgba(0,0,0,0.15)" }}>
              {objs.map(o => {
                const isDone = done[o.id];
                return (
                  <div key={o.id} className={`obj-row${isDone?" done":""}`} onClick={e=>handleToggle(o.id,e)}>
                    <div className={`check-box${isDone?" done":""} ${isDone?"pop-anim":""}`}>{isDone&&<span style={{color:"white",fontSize:11}}>✓</span>}</div>
                    <div>
                      <div className={`obj-name${isDone?" done":""}`}>{o.name}</div>
                      <div className="obj-desc">{o.desc}</div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                      <Diff n={o.diff} />
                      <span style={{ fontSize:9, color:DIFF_COLORS[o.diff-1], fontFamily:"'Cinzel',serif", opacity:0.8 }}>{DIFF_LABELS[o.diff-1]}</span>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB CONTENT ────────────────────────────────────────────────────────────
function TabContent({ data, done, toggle, player, meta, onMetaUpdate, notes, onNote, duoDone, skydroMeta, cellMeta, onUpdateSkydro, onUpdateCell }) {
  const allObjs = data.flatMap(c => c.objectives);
  const totalDone = allObjs.filter(o => done[o.id]).length;
  const color = player ? player.color : C.gold;
  const label = player ? `Progression de ${player.label}` : "Progression du Duo";
  const pct = Math.round(totalDone/allObjs.length*100);
  const [section, setSection] = useState("objectifs");

  const SECTIONS = player ? [
    { key:"objectifs", label:"Objectifs" },
    { key:"stats",     label:"Stats & Persos" },
    { key:"badges",    label:"Badges" },
    { key:"notes",     label:"Notes" },
  ] : [
    { key:"objectifs", label:"Objectifs" },
    { key:"badges",    label:"Badges" },
    { key:"notes",     label:"Notes" },
  ];

  return (
    <div>
      <div className="panel-gold" style={{ padding:"16px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase" }}>{label}</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color:pct===100?C.goldLight:color, textShadow:`0 0 12px ${color}66` }}>{pct}%</div>
        </div>
        <ProgBar label="Global" done={totalDone} total={allObjs.length} color={color} height={10} />
        <div className="divider" />
        {data.map(cat => (
          <ProgBar key={cat.id} label={cat.title.length>16?cat.title.slice(0,16)+"…":cat.title}
            done={cat.objectives.filter(o=>done[o.id]).length} total={cat.objectives.length} color={C.goldDim+"ff"} height={5} />
        ))}
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {SECTIONS.map(s => (
          <button key={s.key} className={`filter-btn${section===s.key?" active":""}`} onClick={()=>setSection(s.key)} style={{ fontSize:12 }}>{s.label}</button>
        ))}
      </div>

      {section === "objectifs" && <ObjList data={data} done={done} toggle={toggle} />}

      {section === "stats" && (
        <div>
          {player && (
            <>
              <PersonnagesSection
                skydroMeta={player.key==="skydro" ? meta : null}
                cellMeta={player.key==="cell" ? meta : null}
                onUpdateSkydro={player.key==="skydro" ? onMetaUpdate : ()=>{}}
                onUpdateCell={player.key==="cell" ? onMetaUpdate : ()=>{}}
              />
              <KamasSection player={player.label} kamas={meta?.kamas} onUpdate={v => onMetaUpdate({...meta, kamas:v})} />
              <SuccesSection player={player.label} succes={meta?.succes} onUpdate={v => onMetaUpdate({...meta, succes:v})} />
            </>
          )}
          {!player && (
            <PersonnagesSection
              skydroMeta={skydroMeta} cellMeta={cellMeta}
              onUpdateSkydro={onUpdateSkydro} onUpdateCell={onUpdateCell}
            />
          )}
        </div>
      )}

      {section === "badges" && <BadgesSection soloDone={done} meta={meta} duoDone={duoDone} />}

      {section === "notes" && (
        <NotesSection notes={notes} author={player ? player.label : "Duo"} onSend={text => onNote(text, player ? player.label : "Duo")} />
      )}
    </div>
  );
}

// ─── RECAP CARD (sidebar) ────────────────────────────────────────────────────
function RecapCard({ label, meta, color, colorLight, border }) {
  const persos = meta?.persos || [];
  const kamas = meta?.kamas || 0;
  const succes = meta?.succes || 0;
  const fmt = v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v);
  const defaultPersos = [{name:"Perso 1", level:1},{name:"Perso 2", level:1}];
  const displayed = persos.length > 0 ? persos.slice(0,2) : defaultPersos;
  return (
    <div style={{
      width: 150, flexShrink: 0,
      position: "sticky", top: 20,
      background: colorLight,
      border: `2px solid ${border}`,
      borderRadius: 8,
      padding: "10px 12px",
      boxShadow: "0 2px 8px rgba(90,58,16,0.15)",
      fontSize: 12,
    }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color, marginBottom:8, letterSpacing:1, borderBottom:`1px solid ${border}55`, paddingBottom:5, textAlign:"center" }}>
        ◈ {label}
      </div>
      {displayed.map((perso, i) => (
        <div key={i} style={{ marginBottom:5 }}>
          <div style={{ fontSize:11, color:C.text, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {perso.name || `Perso ${i+1}`}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
            <div style={{ flex:1, height:4, background:`${border}22`, borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${perso.level ? Math.min(100, Math.round(perso.level/200*100)) : 0}%`, background:(perso.level||0)>=200?color:`${color}99`, borderRadius:2 }} />
            </div>
            <span style={{ fontSize:10, color, fontFamily:"'Cinzel',serif", fontWeight:700, flexShrink:0 }}>
              {perso.level >= 200 ? "✦200" : perso.level ? `${perso.level}` : "—"}
            </span>
          </div>
        </div>
      ))}
      <div style={{ height:1, background:`${border}33`, margin:"7px 0" }} />
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ background:"white", border:`1px solid ${border}33`, borderRadius:4, padding:"4px 6px", textAlign:"center" }}>
          <div style={{ fontSize:9, color:C.textDim, fontFamily:"'Cinzel',serif", marginBottom:1 }}>💰 KAMAS</div>
          <div style={{ fontSize:12, fontWeight:700, color, fontFamily:"'Cinzel',serif" }}>{fmt(kamas)}</div>
        </div>
        <div style={{ background:"white", border:`1px solid ${border}33`, borderRadius:4, padding:"4px 6px", textAlign:"center" }}>
          <div style={{ fontSize:9, color:C.textDim, fontFamily:"'Cinzel',serif", marginBottom:1 }}>⭐ SUCCÈS</div>
          <div style={{ fontSize:12, fontWeight:700, color, fontFamily:"'Cinzel',serif" }}>{succes.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("duo");
  const [duoDone, setDuoDone] = useState({});
  const [skydroDone, setSkydroDone] = useState({});
  const [cellDone, setCellDone] = useState({});
  const [duoMeta, setDuoMeta] = useState({});
  const [skydroMeta, setSkydroMeta] = useState({});
  const [cellMeta, setCellMeta] = useState({});
  const [notes, setNotes] = useState({});
  const [synced, setSynced] = useState(false);
  const [toast, setToast] = useState(null);

  const skydroData = makeSoloData("sky_");
  const cellData   = makeSoloData("cel_");

  const showToast = msg => { setToast(msg); };

  useEffect(() => {
    const unsubs = [
      onValue(ref(db,"duo"),      s => { if(s.exists()) setDuoDone(s.val());    setSynced(true); }),
      onValue(ref(db,"skydro"),   s => { if(s.exists()) setSkydroDone(s.val()); setSynced(true); }),
      onValue(ref(db,"cell"),     s => { if(s.exists()) setCellDone(s.val());   setSynced(true); }),
      onValue(ref(db,"duoMeta"),    s => { if(s.exists()) setDuoMeta(s.val()); }),
      onValue(ref(db,"skydroMeta"), s => { if(s.exists()) setSkydroMeta(s.val()); }),
      onValue(ref(db,"cellMeta"),   s => { if(s.exists()) setCellMeta(s.val()); }),
      onValue(ref(db,"notes"),    s => { if(s.exists()) setNotes(s.val()); }),
    ];
    setTimeout(() => setSynced(true), 2000);
    return () => unsubs.forEach(u => u());
  }, []);

  const toggleDuo    = id => { const n={...duoDone,[id]:!duoDone[id]};       setDuoDone(n);    set(ref(db,"duo"),n); };
  const toggleSkydro = id => { const n={...skydroDone,[id]:!skydroDone[id]}; setSkydroDone(n); set(ref(db,"skydro"),n); };
  const toggleCell   = id => { const n={...cellDone,[id]:!cellDone[id]};     setCellDone(n);   set(ref(db,"cell"),n); };

  const updateDuoMeta    = v => { setDuoMeta(v);    set(ref(db,"duoMeta"),v); };
  const updateSkydroMeta = v => { setSkydroMeta(v); set(ref(db,"skydroMeta"),v); };
  const updateCellMeta   = v => { setCellMeta(v);   set(ref(db,"cellMeta"),v); };

  const sendNote = (text, author) => {
    push(ref(db,"notes"), { text, author, ts: Date.now() });
    showToast(`✦ Note de ${author} envoyée`);
  };

  const TABS = [
    { key:"duo",    label:"⚔  Duo", active:{ bg:C.bgPanel, border:C.panelBorder, color:C.gold } },
    { key:"skydro", label:"◈  Sky",  active:{ bg:"#e8f0f8", border:"#4a6a9a",     color:"#2a4a8a" } },
    { key:"cell",   label:"◈  Cell", active:{ bg:"#f8ede8", border:"#9a4a2a",     color:"#7a2a1a" } },
  ];

  const duoAll    = DUO_DATA.flatMap(c=>c.objectives);
  const skydroAll = skydroData.flatMap(c=>c.objectives);
  const cellAll   = cellData.flatMap(c=>c.objectives);
  const PLAYERS = [
    { key:"skydro", label:"Sky",  color:"#2a4a8a" },
    { key:"cell",   label:"Cell", color:"#7a2a1a" },
  ];

  return (
    <div className="dofus-app">
      <style>{styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* HEADER style forum Dofus */}
      <div style={{ background:`linear-gradient(180deg, ${C.headerBg} 0%, ${C.headerBg2} 100%)`, padding:"24px 20px 0", textAlign:"center", boxShadow:"0 3px 10px rgba(42,26,8,0.3)" }}>
        <div style={{ fontSize:10, color:"#d4b070", letterSpacing:5, fontFamily:"'Cinzel',serif", marginBottom:4, textTransform:"uppercase" }}>Monde des Douze</div>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(20px,4vw,32px)", fontWeight:700, color:"#f5edd8", letterSpacing:2, textShadow:"0 2px 4px rgba(0,0,0,0.4)" }}>
          Carnet d'Aventure
        </h1>
        <div style={{ color:"#c8a060", fontSize:13, fontStyle:"italic", margin:"4px 0" }}>Sky & Cell — Objectifs long terme</div>
        <div style={{ fontSize:11, color:synced?"#8aca8a":"#e8c870", marginBottom:16, letterSpacing:1 }}>{synced?"✦ Synchronisé":"⟳ Connexion…"}</div>

        <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { label:"Duo",    done:duoAll.filter(o=>duoDone[o.id]).length,    total:duoAll.length,    color:"#f5edd8",  bg:"rgba(255,255,255,0.1)" },
            { label:"Sky",   done:skydroAll.filter(o=>skydroDone[o.id]).length, total:skydroAll.length, color:"#a8c8f8", bg:"rgba(74,120,200,0.2)" },
            { label:"Cell",   done:cellAll.filter(o=>cellDone[o.id]).length,   total:cellAll.length,   color:"#f8b8a0", bg:"rgba(200,80,50,0.2)" },
          ].map(s => (
            <div key={s.label} style={{ padding:"8px 18px", textAlign:"center", minWidth:80, background:s.bg, border:"1px solid rgba(255,255,255,0.2)", borderRadius:6 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:700, color:s.color }}>
                {Math.round(s.done/s.total*100)}%
              </div>
              <div style={{ fontSize:10, color:"rgba(245,237,216,0.7)", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:4 }}>
          {TABS.map(t => {
            const isActive = tab===t.key;
            return (
              <button key={t.key} className={`tab-btn${isActive?"":" inactive"}`} onClick={()=>setTab(t.key)}
                style={isActive ? { background:t.active.bg, borderColor:t.active.border, color:t.active.color, borderBottom:`2px solid ${t.active.bg}` } : {}}>
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${C.panelBorder},transparent)` }} />
      </div>

      {/* ── LAYOUT 3 COLONNES ── */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, maxWidth:1200, margin:"0 auto", padding:"20px 12px 48px" }}>

        {/* COLONNE SKY — gauche */}
        <RecapCard label="Sky" meta={skydroMeta} color="#2a4a8a" colorLight="#e8f0f8" border="#4a6a9a" />

        {/* COLONNE CENTRE — objectifs */}
        <div style={{ flex:1, minWidth:0 }}>
          <div className="panel" style={{ padding:"22px 20px" }}>
            {tab==="duo" && <TabContent data={DUO_DATA} done={duoDone} toggle={toggleDuo} player={null}
              meta={duoMeta} onMetaUpdate={updateDuoMeta} notes={notes} onNote={sendNote} duoDone={duoDone}
              skydroMeta={skydroMeta} cellMeta={cellMeta} onUpdateSkydro={updateSkydroMeta} onUpdateCell={updateCellMeta} />}
            {tab==="skydro" && <TabContent data={skydroData} done={skydroDone} toggle={toggleSkydro} player={PLAYERS[0]}
              meta={skydroMeta} onMetaUpdate={updateSkydroMeta} notes={notes} onNote={sendNote} duoDone={duoDone}
              skydroMeta={skydroMeta} cellMeta={cellMeta} onUpdateSkydro={updateSkydroMeta} onUpdateCell={updateCellMeta} />}
            {tab==="cell" && <TabContent data={cellData} done={cellDone} toggle={toggleCell} player={PLAYERS[1]}
              meta={cellMeta} onMetaUpdate={updateCellMeta} notes={notes} onNote={sendNote} duoDone={duoDone}
              skydroMeta={skydroMeta} cellMeta={cellMeta} onUpdateSkydro={updateSkydroMeta} onUpdateCell={updateCellMeta} />}
          </div>
          <div style={{ textAlign:"center",marginTop:16,fontSize:12,color:C.goldDim,fontStyle:"italic",fontFamily:"'Crimson Pro',serif" }}>
            ✦ &nbsp;« Le vrai trésor, c'est les monstres qu'on a éliminés en chemin. »&nbsp; ✦
          </div>
        </div>

        {/* COLONNE CELL — droite */}
        <RecapCard label="Cell" meta={cellMeta} color="#7a2a1a" colorLight="#f8ede8" border="#9a4a2a" />

      </div>
    </div>
  );
}