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
    { id: "d_d7", name: "Session avec les persos de l'autre",           desc: "Skydro joue les persos de Cell et vice versa", diff: 2 },
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
  bgDeep:"#0a0c12", bgPanel:"#12161f", bgCard:"#181d28", bgCardHov:"#1e2535", bgDone:"#0d1a10",
  gold:"#c8922a", goldLight:"#e8b84b", goldDim:"#7a5518",
  border:"#2a3042", text:"#d4c5a0", textDim:"#7a6e58", textBright:"#f0e6c8",
  green:"#4aaa5a", greenBorder:"#2a5a30",
};
const DIFF_COLORS = ["#4aaa5a","#8ab84a","#e8b84b","#e87a2a","#e84a2a"];
const DIFF_LABELS = ["Facile","Aisé","Moyen","Difficile","Légendaire"];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bgDeep};}
.dofus-app{font-family:'Crimson Pro',Georgia,serif;background:${C.bgDeep};min-height:100vh;color:${C.text};background-image:radial-gradient(ellipse at 50% 0%,rgba(200,146,42,0.06) 0%,transparent 60%);}
.panel{background:${C.bgPanel};border:1px solid ${C.border};border-radius:6px;position:relative;}
.panel::before{content:'';position:absolute;inset:0;border-radius:6px;background:linear-gradient(135deg,rgba(200,146,42,0.06) 0%,transparent 50%);pointer-events:none;}
.panel-gold{background:linear-gradient(180deg,#1a1408 0%,#120e06 100%);border:1px solid ${C.goldDim};border-radius:6px;position:relative;overflow:hidden;}
.panel-gold::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${C.goldLight},transparent);}
.obj-row{display:grid;grid-template-columns:28px 1fr auto;align-items:start;gap:10px;padding:10px 14px;border-radius:5px;background:${C.bgCard};border:1px solid ${C.border};cursor:pointer;transition:background 0.15s,border-color 0.15s;}
.obj-row:hover{background:${C.bgCardHov};border-color:${C.goldDim};}
.obj-row.done{background:${C.bgDone};border-color:${C.greenBorder};opacity:0.65;}
.tab-btn{padding:10px 20px;border-radius:5px 5px 0 0;font-family:'Cinzel',serif;font-size:12px;font-weight:600;border:1px solid transparent;border-bottom:none;cursor:pointer;transition:all 0.15s;letter-spacing:0.5px;}
.tab-btn.inactive{background:rgba(200,146,42,0.05);border-color:${C.border};color:${C.textDim};}
.tab-btn.inactive:hover{color:${C.gold};border-color:${C.goldDim};}
.filter-btn{padding:5px 12px;border-radius:3px;font-size:12px;font-family:'Crimson Pro',serif;font-weight:600;border:1px solid ${C.border};background:transparent;color:${C.textDim};cursor:pointer;transition:all 0.12s;}
.filter-btn:hover{border-color:${C.goldDim};color:${C.gold};}
.filter-btn.active{background:rgba(200,146,42,0.15);border-color:${C.gold};color:${C.goldLight};}
.cat-title{font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:${C.goldLight};letter-spacing:1px;text-transform:uppercase;}
.obj-name{font-size:14px;font-weight:600;color:${C.textBright};line-height:1.3;}
.obj-name.done{text-decoration:line-through;color:${C.textDim};}
.obj-desc{font-size:12px;color:${C.textDim};font-style:italic;margin-top:2px;line-height:1.3;}
.check-box{width:20px;height:20px;border:1px solid ${C.goldDim};border-radius:3px;display:flex;align-items:center;justify-content:center;background:rgba(200,146,42,0.05);flex-shrink:0;margin-top:2px;transition:all 0.15s;}
.check-box.done{background:${C.green};border-color:${C.green};}
.prog-track{flex:1;height:8px;background:rgba(200,146,42,0.1);border-radius:2px;border:1px solid ${C.border};overflow:hidden;}
.prog-fill{height:100%;border-radius:2px;transition:width 0.5s ease;}
.divider{height:1px;background:linear-gradient(90deg,transparent,${C.goldDim},transparent);margin:6px 0;}
.note-input{width:100%;background:rgba(200,146,42,0.05);border:1px solid ${C.border};border-radius:4px;padding:8px 12px;color:${C.textBright};font-family:'Crimson Pro',serif;font-size:14px;resize:none;outline:none;}
.note-input:focus{border-color:${C.goldDim};}
.send-btn{padding:8px 18px;background:rgba(200,146,42,0.15);border:1px solid ${C.goldDim};border-radius:4px;color:${C.goldLight};font-family:'Cinzel',serif;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;letter-spacing:0.5px;}
.send-btn:hover{background:rgba(200,146,42,0.25);}
.meta-input{background:rgba(200,146,42,0.05);border:1px solid ${C.border};border-radius:4px;padding:6px 10px;color:${C.textBright};font-family:'Crimson Pro',serif;font-size:14px;outline:none;width:100%;}
.meta-input:focus{border-color:${C.goldDim};}
.badge-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:6px;text-align:center;transition:all 0.2s;}
.badge-card.unlocked{background:linear-gradient(180deg,#1a1408,#120e06);border:1px solid ${C.goldDim};}
.badge-card.locked{background:rgba(255,255,255,0.02);border:1px solid ${C.border};opacity:0.4;filter:grayscale(1);}
@keyframes popIn{0%{transform:scale(0.5);opacity:0;}60%{transform:scale(1.2);}100%{transform:scale(1);opacity:1;}}
@keyframes sparkle{0%,100%{opacity:0;transform:scale(0);}50%{opacity:1;transform:scale(1);}}
@keyframes catComplete{0%{opacity:0;transform:translateY(-10px);}100%{opacity:1;transform:translateY(0);}}
.pop-anim{animation:popIn 0.4s ease forwards;}
.cat-complete-banner{animation:catComplete 0.5s ease forwards;background:linear-gradient(135deg,rgba(200,146,42,0.2),rgba(232,184,75,0.1));border:1px solid ${C.gold};border-radius:6px;padding:12px 20px;text-align:center;margin-bottom:12px;}
`;

// ─── PARTICULES ──────────────────────────────────────────────────────────────
function Particles({ x, y, onDone }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => { setVisible(false); onDone(); }, 900); return () => clearTimeout(t); }, []);
  if (!visible) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, color: i % 3 === 0 ? "#e8b84b" : i % 3 === 1 ? "#4aaa5a" : "#c8922a", size: 4 + Math.random() * 4 };
  });
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", width: p.size, height: p.size, borderRadius: "50%",
          background: p.color, left: 0, top: 0,
          animation: `sparkle 0.8s ease-out forwards`,
          animationDelay: `${i * 0.04}s`,
          transform: `translate(${p.dx}px, ${p.dy}px)`,
          boxShadow: `0 0 6px ${p.color}`,
        }} />
      ))}
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9998, background:"linear-gradient(135deg,#1a1408,#120e06)", border:`1px solid ${C.gold}`, borderRadius:8, padding:"12px 20px", color:C.goldLight, fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:0.5, boxShadow:`0 0 24px ${C.gold}44`, maxWidth:300 }}>
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
function PersonnagesSection({ persos, onUpdate }) {
  const defaults = [
    {name:"Perso 1 (Skydro)",level:1},{name:"Perso 2 (Skydro)",level:1},
    {name:"Perso 1 (Cell)",level:1},{name:"Perso 2 (Cell)",level:1},
  ];
  const data = persos || defaults;
  return (
    <div className="panel-gold" style={{ padding:"16px 20px", marginBottom:20 }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>⚔ Personnages</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:8 }}>
        {data.map((p,i) => (
          <div key={i} style={{ background:"rgba(200,146,42,0.05)", border:`1px solid ${C.border}`, borderRadius:5, padding:"8px 12px" }}>
            <input className="meta-input" placeholder="Nom du perso" value={p.name} onChange={e => { const d=[...data]; d[i]={...d[i],name:e.target.value}; onUpdate(d); }} style={{ marginBottom:6, fontSize:13 }} />
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:C.textDim, fontFamily:"'Cinzel',serif", flexShrink:0 }}>Niv.</span>
              <input className="meta-input" type="number" min={1} max={200} placeholder="1" value={p.level} onChange={e => { const d=[...data]; d[i]={...d[i],level:parseInt(e.target.value)||1}; onUpdate(d); }} style={{ fontSize:13 }} />
              <div style={{ flex:1, height:4, background:"rgba(200,146,42,0.1)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(100,Math.round(p.level/200*100))}%`, background:p.level>=200?C.goldLight:C.gold, borderRadius:2 }} />
              </div>
            </div>
          </div>
        ))}
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
          <div key={i} style={{ background:n.author==="Skydro"?"rgba(74,158,255,0.07)":"rgba(255,107,74,0.07)", border:`1px solid ${n.author==="Skydro"?"rgba(74,158,255,0.2)":"rgba(255,107,74,0.2)"}`, borderRadius:5, padding:"8px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:11, fontFamily:"'Cinzel',serif", fontWeight:600, color:n.author==="Skydro"?"#4a9eff":"#ff6b4a" }}>{n.author}</span>
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

// ─── LISTE OBJECTIFS ─────────────────────────────────────────────────────────
function ObjList({ data, done, toggle }) {
  const [filter, setFilter] = useState("all");
  const [particles, setParticles] = useState([]);
  const [completedCats, setCompletedCats] = useState([]);

  const handleToggle = (id, e) => {
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
    }).map(c => c.id);
    if (newlyDone.length > 0) setCompletedCats(p => [...p, ...newlyDone]);
  }, [done]);

  return (
    <div>
      {particles.map(p => <Particles key={p.id} x={p.x} y={p.y} onDone={() => setParticles(prev => prev.filter(x => x.id !== p.id))} />)}
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
        return (
          <div key={cat.id} style={{ marginBottom:24 }}>
            {catComplete && completedCats.includes(cat.id) && (
              <div className="cat-complete-banner">
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:C.goldLight }}>✦ {cat.title} — Catégorie complétée ! ✦</span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:16 }}>{cat.icon}</span>
              <span className="cat-title" style={{ flex:1 }}>{cat.title}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:60, height:4, background:"rgba(200,146,42,0.1)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${catPct}%`, background:catComplete?C.goldLight:C.gold, borderRadius:2 }} />
                </div>
                <span style={{ fontSize:11, color:catComplete?C.goldLight:C.textDim, fontFamily:"'Cinzel',serif" }}>{catDone}/{cat.objectives.length}</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
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
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB CONTENT ────────────────────────────────────────────────────────────
function TabContent({ data, done, toggle, player, meta, onMetaUpdate, notes, onNote, duoDone }) {
  const allObjs = data.flatMap(c => c.objectives);
  const totalDone = allObjs.filter(o => done[o.id]).length;
  const color = player ? player.color : C.gold;
  const label = player ? `Progression de ${player.label}` : "Progression du Duo";
  const pct = Math.round(totalDone/allObjs.length*100);
  const [section, setSection] = useState("objectifs");

  const SECTIONS = [
    { key:"objectifs", label:"Objectifs" },
    { key:"stats",     label:"Stats & Persos" },
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
              <KamasSection player={player.label} kamas={meta?.kamas} onUpdate={v => onMetaUpdate({...meta, kamas:v})} />
              <SuccesSection player={player.label} succes={meta?.succes} onUpdate={v => onMetaUpdate({...meta, succes:v})} />
            </>
          )}
          {!player && <PersonnagesSection persos={meta?.persos} onUpdate={p => onMetaUpdate({...meta, persos:p})} />}
        </div>
      )}

      {section === "badges" && <BadgesSection soloDone={done} meta={meta} duoDone={duoDone} />}

      {section === "notes" && (
        <NotesSection notes={notes} author={player ? player.label : "Duo"} onSend={text => onNote(text, player ? player.label : "Duo")} />
      )}
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
    { key:"duo",    label:"⚔  Duo",    active:{ bg:"rgba(200,146,42,0.12)", border:C.goldDim, color:C.goldLight } },
    { key:"skydro", label:"◈  Skydro", active:{ bg:"rgba(74,158,255,0.1)",  border:"#1a5a9a",  color:"#4a9eff"  } },
    { key:"cell",   label:"◈  Cell",   active:{ bg:"rgba(255,107,74,0.1)",  border:"#9a2a1a",  color:"#ff6b4a"  } },
  ];

  const duoAll    = DUO_DATA.flatMap(c=>c.objectives);
  const skydroAll = skydroData.flatMap(c=>c.objectives);
  const cellAll   = cellData.flatMap(c=>c.objectives);
  const PLAYERS = [
    { key:"skydro", label:"Skydro", color:"#4a9eff" },
    { key:"cell",   label:"Cell",   color:"#ff6b4a" },
  ];

  return (
    <div className="dofus-app">
      <style>{styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div style={{ textAlign:"center", padding:"28px 20px 0" }}>
        <div style={{ fontSize:11,color:C.goldDim,letterSpacing:4,fontFamily:"'Cinzel',serif",marginBottom:4,textTransform:"uppercase" }}>Monde des Douze</div>
        <h1 style={{ fontFamily:"'Cinzel',serif",fontSize:"clamp(20px,4vw,34px)",fontWeight:700,color:C.goldLight,letterSpacing:2,textShadow:`0 0 30px ${C.gold}44,0 2px 4px rgba(0,0,0,0.8)` }}>
          Carnet d'Aventure
        </h1>
        <div style={{ color:C.textDim,fontSize:13,fontStyle:"italic",margin:"4px 0" }}>Skydro & Cell — Objectifs long terme</div>
        <div style={{ fontSize:11,color:synced?"#4aaa5a":C.gold,marginBottom:16 }}>{synced?"✦ Synchronisé":"⟳ Connexion…"}</div>

        <div style={{ display:"flex",justifyContent:"center",gap:16,marginBottom:20,flexWrap:"wrap" }}>
          {[
            {label:"Duo",done:duoAll.filter(o=>duoDone[o.id]).length,total:duoAll.length,color:C.gold},
            {label:"Skydro",done:skydroAll.filter(o=>skydroDone[o.id]).length,total:skydroAll.length,color:"#4a9eff"},
            {label:"Cell",done:cellAll.filter(o=>cellDone[o.id]).length,total:cellAll.length,color:"#ff6b4a"},
          ].map(s => (
            <div key={s.label} className="panel-gold" style={{ padding:"8px 18px",textAlign:"center",minWidth:80 }}>
              <div style={{ fontFamily:"'Cinzel',serif",fontSize:17,fontWeight:700,color:s.color,textShadow:`0 0 8px ${s.color}66` }}>
                {Math.round(s.done/s.total*100)}%
              </div>
              <div style={{ fontSize:10,color:C.textDim,fontFamily:"'Cinzel',serif",letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex",justifyContent:"center",gap:4 }}>
          {TABS.map(t => {
            const isActive = tab===t.key;
            return (
              <button key={t.key} className={`tab-btn${isActive?"":" inactive"}`} onClick={()=>setTab(t.key)}
                style={isActive?{background:t.active.bg,borderColor:t.active.border,color:t.active.color,borderBottom:`1px solid ${t.active.bg}`}:{}}>
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ height:1,background:`linear-gradient(90deg,transparent,${C.goldDim},transparent)` }} />
      </div>

      <div style={{ maxWidth:820,margin:"0 auto",padding:"20px 20px 48px" }}>
        <div className="panel" style={{ padding:"22px 22px" }}>
          {tab==="duo" && <TabContent data={DUO_DATA} done={duoDone} toggle={toggleDuo} player={null}
            meta={duoMeta} onMetaUpdate={updateDuoMeta} notes={notes} onNote={sendNote} duoDone={duoDone} />}
          {tab==="skydro" && <TabContent data={skydroData} done={skydroDone} toggle={toggleSkydro} player={PLAYERS[0]}
            meta={skydroMeta} onMetaUpdate={updateSkydroMeta} notes={notes} onNote={sendNote} duoDone={duoDone} />}
          {tab==="cell" && <TabContent data={cellData} done={cellDone} toggle={toggleCell} player={PLAYERS[1]}
            meta={cellMeta} onMetaUpdate={updateCellMeta} notes={notes} onNote={sendNote} duoDone={duoDone} />}
        </div>
        <div style={{ textAlign:"center",marginTop:20,fontSize:12,color:C.goldDim,fontStyle:"italic",fontFamily:"'Crimson Pro',serif" }}>
          ✦ &nbsp;« Le vrai trésor, c'est les monstres qu'on a éliminés en chemin. »&nbsp; ✦
        </div>
      </div>
    </div>
  );
}