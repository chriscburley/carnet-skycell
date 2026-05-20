import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDUtrDc2Nz_HXHxneCxUpU4_FG3ycRghwY',
  authDomain: 'objectifs-skycell.firebaseapp.com',
  databaseURL:
    'https://objectifs-skycell-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'objectifs-skycell',
  storageBucket: 'objectifs-skycell.firebasestorage.app',
  messagingSenderId: '131924024675',
  appId: '1:131924024675:web:7f91eb1950464efa524756',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ─── DONNÉES DUO ────────────────────────────────────────────────────────────
const DUO_DATA = [
  {
    id: 'd_4persos',
    icon: '👥',
    title: 'Objectifs 4 Persos',
    objectives: [
      {
        id: 'd_4p1',
        name: 'Les 4 persos atteignent le niveau 50',
        desc: 'Tout le monde sort des zones de départ',
        diff: 1,
      },
      {
        id: 'd_4p2',
        name: 'Les 4 persos atteignent le niveau 100',
        desc: "Mi-parcours pour toute l'équipe",
        diff: 2,
      },
      {
        id: 'd_4p3',
        name: 'Les 4 persos atteignent le niveau 200',
        desc: 'Le roster complet au cap — objectif ultime',
        diff: 5,
      },
      {
        id: 'd_4p4',
        name: 'Chacun des 4 persos a un Dofus équipé',
        desc: "Toute l'équipe est équipée de Dofus",
        diff: 5,
      },
      {
        id: 'd_4p5',
        name: 'Les 4 persos ont chacun une panoplie complète',
        desc: 'Full stuffé de la tête aux pieds',
        diff: 4,
      },
      {
        id: 'd_4p6',
        name: 'Chaque perso a un métier différent monté',
        desc: '4 persos = 4 métiers complémentaires',
        diff: 4,
      },
      {
        id: 'd_4p7',
        name: 'Faire tourner les 4 persos dans un donjon en même temps',
        desc: 'Le multi-compte dans toute sa splendeur',
        diff: 3,
      },
      {
        id: 'd_4p8',
        name: 'Les 4 persos ont chacun leur quête de classe terminée',
        desc: 'Chaque perso a son identité',
        diff: 4,
      },
    ],
  },
  {
    id: 'd_custom',
    icon: '🎯',
    title: 'Défis Communs Custom',
    objectives: [
      {
        id: 'd_c1',
        name: 'Farm une ressource à 9999 en stock à 4',
        desc: 'La puissance du multicompte au service du farm',
        diff: 3,
      },
      {
        id: 'd_c2',
        name: "Financer l'équipement d'un perso 200 entièrement en duo",
        desc: "Un seul perso stuffé grâce à l'effort commun",
        diff: 4,
      },
      {
        id: 'd_c3',
        name: 'Monter une guilde au rang 10',
        desc: 'Investissement long terme dans la guilde',
        diff: 4,
      },
      {
        id: 'd_c4',
        name: 'Avoir une alliance avec un territoire contrôlé',
        desc: 'Un prisme tenu pendant au moins 1 semaine',
        diff: 4,
      },
      {
        id: 'd_c5',
        name: 'Réussir un donjon difficile sans utiliser de heal',
        desc: 'Aucun soin en combat — adaptation tactique totale',
        diff: 4,
      },
      {
        id: 'd_c6',
        name: 'Accumuler 200M de kamas en commun',
        desc: 'La caisse commune pour les gros projets',
        diff: 5,
      },
      {
        id: 'd_c7',
        name: 'Faire un run donjon avec les classes les plus improbables',
        desc: 'La compo la plus absurde possible — et gagner',
        diff: 3,
      },
      {
        id: 'd_c8',
        name: 'Terminer une session de 6h sans wipe',
        desc: '6h de jeu, 0 défaite collective',
        diff: 4,
      },
      {
        id: 'd_c9',
        name: "Chacun craft un équipement pour le perso de l'autre",
        desc: "L'entraide comme philosophie de jeu",
        diff: 3,
      },
      {
        id: 'd_c10',
        name: 'Battre un boss de donjon en moins de 5 tours',
        desc: 'Optimisation maximum, damage race totale',
        diff: 4,
      },
    ],
  },
  {
    id: 'd_quetes',
    icon: '📜',
    title: 'Quêtes & Lore',
    objectives: [
      {
        id: 'd_q1',
        name: 'Terminer la quête principale ensemble',
        desc: "Du début à la fin, l'histoire complète",
        diff: 4,
      },
      {
        id: 'd_q2',
        name: "Compléter toutes les quêtes d'une même zone",
        desc: 'Choisir une zone et tout faire dedans',
        diff: 3,
      },
      {
        id: 'd_q3',
        name: "Lire le lore d'une zone entière sans zapper",
        desc: "On s'engage : pas de skip de dialogues",
        diff: 1,
      },
    ],
  },
  {
    id: 'd_defis',
    icon: '🎲',
    title: 'Défis Atypiques',
    objectives: [
      {
        id: 'd_d1',
        name: 'Ironman : 0 HDV pendant 1 mois',
        desc: "Uniquement ce qu'on drope ou craft ensemble",
        diff: 4,
      },
      {
        id: 'd_d2',
        name: "Jouer la classe que l'autre choisit pour vous",
        desc: 'Surprise garantie, tilts probables',
        diff: 2,
      },
      {
        id: 'd_d3',
        name: 'Finir une session sans mourir une seule fois',
        desc: '3h de jeu, 0 défaite — concentration totale',
        diff: 3,
      },
      {
        id: 'd_d4',
        name: 'Monter les 4 persos avec des synergies imposées',
        desc: "Compo pensée en amont, respectée jusqu'au bout",
        diff: 3,
      },
      {
        id: 'd_d5',
        name: "Finir un combat de zone sans sort d'attaque",
        desc: 'Uniquement sorts de soutien et déplacement',
        diff: 4,
      },
      {
        id: 'd_d6',
        name: 'Farmer 1 000 kills du même monstre à 4',
        desc: 'Le grind collectif dans toute sa gloire',
        diff: 2,
      },
      {
        id: 'd_d7',
        name: "Faire une session avec les persos de l'autre",
        desc: 'Skydro joue les persos de Cell et vice versa',
        diff: 2,
      },
    ],
  },
  {
    id: 'd_social',
    icon: '🌍',
    title: 'Social & Serveur',
    objectives: [
      {
        id: 'd_s1',
        name: 'Rejoindre ou créer une guilde active',
        desc: 'Et participer à un percepteur ensemble',
        diff: 1,
      },
      {
        id: 'd_s2',
        name: 'Participer à un évènement communautaire',
        desc: 'SpeedRush, Goultarminator, tournoi…',
        diff: 2,
      },
      {
        id: 'd_s3',
        name: 'Atteindre le rang Alliance Commandant',
        desc: 'Prismes, prises de territoires, politique de serveur',
        diff: 4,
      },
      {
        id: 'd_s4',
        name: 'Aider un duo de débutants à progresser',
        desc: 'Guider deux nouvelles recrues ensemble',
        diff: 1,
      },
    ],
  },
];

// ─── DONNÉES SOLO ────────────────────────────────────────────────────────────
const SOLO_CATS = [
  {
    id: 's_2persos',
    icon: '👤',
    title: 'Objectifs 2 Persos',
    objectives: [
      {
        id: 's_2p1',
        name: 'Tes 2 persos atteignent le niveau 50',
        desc: 'Tout le monde sort des zones de départ',
        diff: 1,
      },
      {
        id: 's_2p2',
        name: 'Tes 2 persos atteignent le niveau 100',
        desc: 'Mi-parcours pour les deux',
        diff: 2,
      },
      {
        id: 's_2p3',
        name: 'Tes 2 persos atteignent le niveau 200',
        desc: 'Le roster perso au complet au cap',
        diff: 4,
      },
      {
        id: 's_2p4',
        name: 'Tes 2 persos ont chacun un Dofus équipé',
        desc: 'Les deux stuffés avec un Dofus minimum',
        diff: 5,
      },
      {
        id: 's_2p5',
        name: 'Tes 2 persos ont une panoplie complète chacun',
        desc: 'Full stuffés tous les deux',
        diff: 4,
      },
      {
        id: 's_2p6',
        name: 'Tes 2 persos ont des métiers complémentaires',
        desc: 'Pas de doublon — on couvre plus de terrain',
        diff: 3,
      },
      {
        id: 's_2p7',
        name: 'Faire un donjon solo avec tes 2 persos seulement',
        desc: 'Tu gères tout seul avec ta propre compo',
        diff: 3,
      },
      {
        id: 's_2p8',
        name: 'Tes 2 persos ont leur quête de classe terminée',
        desc: 'Chaque perso a son identité propre',
        diff: 3,
      },
    ],
  },
  {
    id: 's_prog',
    icon: '⚔️',
    title: 'Progression & Stuff',
    objectives: [
      {
        id: 's1',
        name: 'Atteindre le niveau 50 sur ton main',
        desc: 'Première étape, on sort des zones de départ',
        diff: 1,
      },
      {
        id: 's2',
        name: 'Atteindre le niveau 100 sur ton main',
        desc: 'La moitié du chemin vers le cap',
        diff: 2,
      },
      {
        id: 's3',
        name: 'Atteindre le niveau 150 sur ton main',
        desc: "Les zones de haut niveau s'ouvrent",
        diff: 3,
      },
      {
        id: 's4',
        name: 'Atteindre le niveau 200 sur ton main',
        desc: 'Le cap — le vrai jeu commence ici',
        diff: 4,
      },
      {
        id: 's5',
        name: 'Obtenir un Dofus équipé sur ton main',
        desc: 'Au moins un Dofus en permanence',
        diff: 5,
      },
      {
        id: 's6',
        name: 'Être full stuff endgame optimisé',
        desc: 'Chaque slot au maximum de son potentiel',
        diff: 5,
      },
      {
        id: 's7',
        name: 'Faire un stuff entièrement thématique',
        desc: 'Full craft, full drop, ou full donjon unique',
        diff: 3,
      },
      {
        id: 's8',
        name: 'Avoir un stuff différent sur chaque perso',
        desc: 'Pas de copier-coller — chaque perso a son style',
        diff: 3,
      },
    ],
  },
  {
    id: 's_custom',
    icon: '🎯',
    title: 'Défis Custom Solo',
    objectives: [
      {
        id: 's_c1',
        name: 'Atteindre 50M de kamas en jouant uniquement à tes horaires',
        desc: 'Pas de rush, ton propre rythme',
        diff: 4,
      },
      {
        id: 's_c2',
        name: "Crafter l'intégralité du stuff d'un de tes persos",
        desc: "0 HDV pour l'équipement — tout craft maison",
        diff: 4,
      },
      {
        id: 's_c3',
        name: 'Monter un perso secondaire en support pur',
        desc: 'Un perso dédié à aider les autres, 0 dégâts',
        diff: 3,
      },
      {
        id: 's_c4',
        name: 'Finir un donjon difficile sans te faire soigner',
        desc: 'Self-suffisant — tu encaisses et tu gères',
        diff: 4,
      },
      {
        id: 's_c5',
        name: 'Farm 500 kills de 5 monstres différents',
        desc: "Diversifier les zones, diversifier l'XP",
        diff: 3,
      },
      {
        id: 's_c6',
        name: 'Avoir un perso spécialisé farm kamas et un farm XP',
        desc: 'Deux rôles bien définis sur tes deux persos',
        diff: 3,
      },
      {
        id: 's_c7',
        name: 'Terminer une quête longue sans aide extérieure',
        desc: 'Pas de coup de main — tu gères de A à Z',
        diff: 3,
      },
      {
        id: 's_c8',
        name: 'Obtenir un titre visible qui montre ton style de jeu',
        desc: 'Un titre qui raconte quelque chose sur toi',
        diff: 3,
      },
      {
        id: 's_c9',
        name: "Jouer 30 jours sans utiliser l'HDV pour vendre",
        desc: 'Tu écoules tout via guilde ou échanges directs',
        diff: 4,
      },
      {
        id: 's_c10',
        name: 'Avoir les 2 persos dans des nations différentes',
        desc: 'Bontarien ET Brakmarian — la dualité',
        diff: 2,
      },
    ],
  },
  {
    id: 's_metiers',
    icon: '🔨',
    title: 'Métiers & Économie',
    objectives: [
      {
        id: 's23',
        name: 'Monter un métier à 100',
        desc: 'Premier palier significatif',
        diff: 2,
      },
      {
        id: 's24',
        name: 'Monter un métier à 200',
        desc: "Maîtrise complète d'un métier",
        diff: 4,
      },
      {
        id: 's25',
        name: 'Crafter un set entier depuis les ressources brutes',
        desc: 'Récolter + crafter = fierté absolue',
        diff: 4,
      },
      {
        id: 's26',
        name: 'Atteindre 10 millions de kamas',
        desc: 'Premier grand cap économique',
        diff: 3,
      },
      {
        id: 's27',
        name: 'Atteindre 50 millions de kamas',
        desc: 'Les bonnes affaires portent leurs fruits',
        diff: 4,
      },
      {
        id: 's28',
        name: 'Atteindre 100 millions de kamas',
        desc: 'Ta fortune personnelle — le vrai cap',
        diff: 5,
      },
      {
        id: 's29',
        name: "Vendre un item rare à bon prix à l'HDV",
        desc: 'Le feeling de la bonne affaire',
        diff: 2,
      },
      {
        id: 's30',
        name: 'Monter un farm quotidien de ressources',
        desc: 'Une ressource ciblée, vendue chaque jour',
        diff: 3,
      },
    ],
  },
  {
    id: 's_succes',
    icon: '🏆',
    title: 'Succès',
    objectives: [
      {
        id: 's19',
        name: 'Atteindre 500 points de succès',
        desc: 'Premier palier pour se sentir progresser',
        diff: 1,
      },
      {
        id: 's20',
        name: 'Atteindre 2 000 points de succès',
        desc: 'On commence à couvrir sérieusement le contenu',
        diff: 2,
      },
      {
        id: 's21',
        name: 'Atteindre 5 000 points de succès',
        desc: 'Joueur accompli — pas mal du tout',
        diff: 3,
      },
      {
        id: 's22',
        name: 'Atteindre 10 000 points de succès',
        desc: 'Le graal des chasseurs de succès',
        diff: 5,
      },
    ],
  },
  {
    id: 's_quetes',
    icon: '📜',
    title: 'Quêtes & Lore',
    objectives: [
      {
        id: 's31',
        name: "Compléter toutes les quêtes d'une nation",
        desc: 'Bonta, Brâkmar ou Amakna — au choix',
        diff: 3,
      },
      {
        id: 's32',
        name: 'Finir la quête de classe de tes 2 persos',
        desc: "La quête de classe, c'est identitaire",
        diff: 3,
      },
      {
        id: 's33',
        name: 'Compléter 100 quêtes au total',
        desc: 'Un cap accessible pour tout type de joueur',
        diff: 2,
      },
      {
        id: 's34',
        name: 'Compléter 300 quêtes au total',
        desc: 'Tu connais les dialogues par cœur',
        diff: 4,
      },
    ],
  },
  {
    id: 's_defis',
    icon: '🎲',
    title: 'Défis Perso',
    objectives: [
      {
        id: 's35',
        name: 'Monter un perso en Hardcore Mode',
        desc: 'Si mort = tout recommencer',
        diff: 5,
      },
      {
        id: 's36',
        name: 'Un Défi quotidien pendant 30 jours de suite',
        desc: 'Discipline et régularité — sans exception',
        diff: 3,
      },
      {
        id: 's37',
        name: "Collectionner tous les familiers d'une famille",
        desc: 'Une obsession saine',
        diff: 3,
      },
      {
        id: 's38',
        name: 'Aider un joueur débutant à se stuff',
        desc: "Partager son savoir, c'est aussi du jeu",
        diff: 1,
      },
      {
        id: 's39',
        name: 'Finir un combat avec exactement 1 PV restant',
        desc: 'Pur hasard ou génie tactique — les deux comptent',
        diff: 3,
      },
      {
        id: 's40',
        name: "Jouer 7 jours de suite sans passer par l'HDV",
        desc: 'Survie en autarcie totale',
        diff: 3,
      },
      {
        id: 's41',
        name: 'Monter un perso uniquement via les quêtes',
        desc: '0 farm monstre — une autre façon de progresser',
        diff: 4,
      },
      {
        id: 's42',
        name: 'Obtenir un titre rare ou difficile',
        desc: 'Un titre qui en impose dans les zones communes',
        diff: 4,
      },
    ],
  },
];

function makeSoloData(prefix) {
  return SOLO_CATS.map((cat) => ({
    ...cat,
    id: prefix + cat.id,
    objectives: cat.objectives.map((o) => ({ ...o, id: prefix + o.id })),
  }));
}

const PLAYERS = [
  {
    key: 'skydro',
    label: 'Skydro',
    color: '#4a9eff',
    colorDark: '#1a5a9a',
    colorGlow: 'rgba(74,158,255,0.3)',
  },
  {
    key: 'cell',
    label: 'Cell',
    color: '#ff6b4a',
    colorDark: '#9a2a1a',
    colorGlow: 'rgba(255,107,74,0.3)',
  },
];

const C = {
  bgDeep: '#0a0c12',
  bgPanel: '#12161f',
  bgCard: '#181d28',
  bgCardHov: '#1e2535',
  bgDone: '#0d1a10',
  gold: '#c8922a',
  goldLight: '#e8b84b',
  goldDim: '#7a5518',
  border: '#2a3042',
  borderGold: '#3d2a0a',
  text: '#d4c5a0',
  textDim: '#7a6e58',
  textBright: '#f0e6c8',
  green: '#4aaa5a',
  greenDark: '#1a3a20',
  greenBorder: '#2a5a30',
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bgDeep}; }
  .dofus-app {
    font-family: 'Crimson Pro', Georgia, serif;
    background: ${C.bgDeep};
    min-height: 100vh;
    color: ${C.text};
    background-image:
      radial-gradient(ellipse at 50% 0%, rgba(200,146,42,0.06) 0%, transparent 60%),
      url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c8922a' fill-opacity='0.02'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z'/%3E%3C/g%3E%3C/svg%3E");
  }
  .panel { background: ${C.bgPanel}; border: 1px solid ${C.border}; border-radius: 6px; position: relative; }
  .panel::before { content: ''; position: absolute; inset: 0; border-radius: 6px; background: linear-gradient(135deg, rgba(200,146,42,0.06) 0%, transparent 50%); pointer-events: none; }
  .panel-gold { background: linear-gradient(180deg, #1a1408 0%, #120e06 100%); border: 1px solid ${C.goldDim}; border-radius: 6px; position: relative; overflow: hidden; }
  .panel-gold::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, ${C.goldLight}, transparent); }
  .obj-row { display: grid; grid-template-columns: 28px 1fr auto; align-items: start; gap: 10px; padding: 10px 14px; border-radius: 5px; background: ${C.bgCard}; border: 1px solid ${C.border}; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
  .obj-row:hover { background: ${C.bgCardHov}; border-color: ${C.goldDim}; }
  .obj-row.done { background: ${C.bgDone}; border-color: ${C.greenBorder}; opacity: 0.65; }
  .tab-btn { padding: 10px 24px; border-radius: 5px 5px 0 0; font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; border: 1px solid transparent; border-bottom: none; cursor: pointer; transition: all 0.15s; letter-spacing: 0.5px; position: relative; z-index: 1; }
  .tab-btn.inactive { background: rgba(200,146,42,0.05); border-color: ${C.border}; color: ${C.textDim}; }
  .tab-btn.inactive:hover { color: ${C.gold}; border-color: ${C.goldDim}; }
  .filter-btn { padding: 5px 14px; border-radius: 3px; font-size: 12px; font-family: 'Crimson Pro', serif; font-weight: 600; border: 1px solid ${C.border}; background: transparent; color: ${C.textDim}; cursor: pointer; transition: all 0.12s; letter-spacing: 0.3px; }
  .filter-btn:hover { border-color: ${C.goldDim}; color: ${C.gold}; }
  .filter-btn.active { background: rgba(200,146,42,0.15); border-color: ${C.gold}; color: ${C.goldLight}; }
  .cat-title { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; color: ${C.goldLight}; letter-spacing: 1px; text-transform: uppercase; }
  .obj-name { font-size: 14px; font-weight: 600; color: ${C.textBright}; line-height: 1.3; }
  .obj-name.done { text-decoration: line-through; color: ${C.textDim}; }
  .obj-desc { font-size: 12px; color: ${C.textDim}; font-style: italic; margin-top: 2px; line-height: 1.3; }
  .check-box { width: 20px; height: 20px; border: 1px solid ${C.goldDim}; border-radius: 3px; display: flex; align-items: center; justify-content: center; background: rgba(200,146,42,0.05); flex-shrink: 0; margin-top: 2px; font-size: 12px; transition: all 0.15s; }
  .check-box.done { background: ${C.green}; border-color: ${C.green}; }
  .prog-track { flex: 1; height: 8px; background: rgba(200,146,42,0.1); border-radius: 2px; border: 1px solid ${C.border}; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, ${C.goldDim}, transparent); margin: 4px 0; }
`;

const DIFF_COLORS = ['#4aaa5a', '#8ab84a', '#e8b84b', '#e87a2a', '#e84a2a'];
const DIFF_LABELS = ['Facile', 'Aisé', 'Moyen', 'Difficile', 'Légendaire'];

function Diff({ n }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i < n ? DIFF_COLORS[n - 1] : 'rgba(200,146,42,0.15)',
            boxShadow: i < n ? `0 0 4px ${DIFF_COLORS[n - 1]}88` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function ProgBar({ label, done, total, color, height = 8 }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: C.textDim,
          width: 130,
          flexShrink: 0,
          fontFamily: "'Cinzel', serif",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
      <div className="prog-track" style={{ height }}>
        <div
          className="prog-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color,
          width: 36,
          textAlign: 'right',
          fontFamily: "'Cinzel', serif",
        }}
      >
        {done}/{total}
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'done', label: '✓ Complétés' },
  { key: 'todo', label: 'À faire' },
];

function ObjList({ data, done, toggle }) {
  const [filter, setFilter] = useState('all');
  return (
    <div>
      <div
        style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {data.map((cat) => {
        const objs = cat.objectives.filter((o) => {
          if (filter === 'done') return done[o.id];
          if (filter === 'todo') return !done[o.id];
          return true;
        });
        if (!objs.length) return null;
        const catDone = cat.objectives.filter((o) => done[o.id]).length;
        const catPct = Math.round((catDone / cat.objectives.length) * 100);
        return (
          <div key={cat.id} style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span className="cat-title" style={{ flex: 1 }}>
                {cat.title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 60,
                    height: 4,
                    background: 'rgba(200,146,42,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${catPct}%`,
                      background: C.gold,
                      borderRadius: 2,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: C.textDim,
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  {catDone}/{cat.objectives.length}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {objs.map((o) => {
                const isDone = done[o.id];
                return (
                  <div
                    key={o.id}
                    className={`obj-row${isDone ? ' done' : ''}`}
                    onClick={() => toggle(o.id)}
                  >
                    <div className={`check-box${isDone ? ' done' : ''}`}>
                      {isDone && <span style={{ color: 'white' }}>✓</span>}
                    </div>
                    <div>
                      <div className={`obj-name${isDone ? ' done' : ''}`}>
                        {o.name}
                      </div>
                      <div className="obj-desc">{o.desc}</div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 4,
                      }}
                    >
                      <Diff n={o.diff} />
                      <span
                        style={{
                          fontSize: 9,
                          color: DIFF_COLORS[o.diff - 1],
                          fontFamily: "'Cinzel',serif",
                          letterSpacing: 0.3,
                          opacity: 0.8,
                        }}
                      >
                        {DIFF_LABELS[o.diff - 1]}
                      </span>
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

function TabContent({ data, done, toggle, player }) {
  const allObjs = data.flatMap((c) => c.objectives);
  const totalDone = allObjs.filter((o) => done[o.id]).length;
  const color = player ? player.color : C.gold;
  const label = player
    ? `Progression de ${player.label}`
    : 'Progression du Duo';
  const pct = Math.round((totalDone / allObjs.length) * 100);
  return (
    <div>
      <div
        className="panel-gold"
        style={{ padding: '18px 22px', marginBottom: 24 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              color: C.gold,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 20,
              fontWeight: 700,
              color: pct === 100 ? C.goldLight : color,
              textShadow: `0 0 12px ${color}66`,
            }}
          >
            {pct}%
          </div>
        </div>
        <ProgBar
          label="Global"
          done={totalDone}
          total={allObjs.length}
          color={color}
          height={10}
        />
        <div className="divider" style={{ margin: '10px 0' }} />
        {data.map((cat) => (
          <ProgBar
            key={cat.id}
            label={
              cat.title.length > 18 ? cat.title.slice(0, 18) + '…' : cat.title
            }
            done={cat.objectives.filter((o) => done[o.id]).length}
            total={cat.objectives.length}
            color={C.goldDim + 'ff'}
            height={5}
          />
        ))}
      </div>
      <ObjList data={data} done={done} toggle={toggle} />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('duo');
  const [duoDone, setDuoDone] = useState({});
  const [skydroDone, setSkydroDone] = useState({});
  const [cellDone, setCellDone] = useState({});
  const [synced, setSynced] = useState(false);

  const skydroData = makeSoloData('sky_');
  const cellData = makeSoloData('cel_');

  useEffect(() => {
    const u1 = onValue(ref(db, 'duo'), (s) => {
      if (s.exists()) setDuoDone(s.val());
      setSynced(true);
    });
    const u2 = onValue(ref(db, 'skydro'), (s) => {
      if (s.exists()) setSkydroDone(s.val());
      setSynced(true);
    });
    const u3 = onValue(ref(db, 'cell'), (s) => {
      if (s.exists()) setCellDone(s.val());
      setSynced(true);
    });
    setTimeout(() => setSynced(true), 2000);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const toggleDuo = (id) => {
    const n = { ...duoDone, [id]: !duoDone[id] };
    setDuoDone(n);
    set(ref(db, 'duo'), n);
  };
  const toggleSkydro = (id) => {
    const n = { ...skydroDone, [id]: !skydroDone[id] };
    setSkydroDone(n);
    set(ref(db, 'skydro'), n);
  };
  const toggleCell = (id) => {
    const n = { ...cellDone, [id]: !cellDone[id] };
    setCellDone(n);
    set(ref(db, 'cell'), n);
  };

  const TABS = [
    {
      key: 'duo',
      label: '⚔  Duo',
      active: {
        bg: 'rgba(200,146,42,0.12)',
        border: C.goldDim,
        color: C.goldLight,
      },
    },
    {
      key: 'skydro',
      label: '◈  Skydro',
      active: {
        bg: 'rgba(74,158,255,0.1)',
        border: '#1a5a9a',
        color: '#4a9eff',
      },
    },
    {
      key: 'cell',
      label: '◈  Cell',
      active: {
        bg: 'rgba(255,107,74,0.1)',
        border: '#9a2a1a',
        color: '#ff6b4a',
      },
    },
  ];

  const duoAll = DUO_DATA.flatMap((c) => c.objectives);
  const skydroAll = skydroData.flatMap((c) => c.objectives);
  const cellAll = cellData.flatMap((c) => c.objectives);

  return (
    <div className="dofus-app">
      <style>{styles}</style>
      <div
        style={{
          textAlign: 'center',
          padding: '32px 20px 0',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.goldDim,
            letterSpacing: 4,
            fontFamily: "'Cinzel',serif",
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          Monde des Douze
        </div>
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(22px,4vw,36px)',
            fontWeight: 700,
            color: C.goldLight,
            letterSpacing: 2,
            textShadow: `0 0 30px ${C.gold}44, 0 2px 4px rgba(0,0,0,0.8)`,
          }}
        >
          Carnet d'Aventure
        </h1>
        <div
          style={{
            color: C.textDim,
            fontSize: 14,
            fontStyle: 'italic',
            margin: '6px 0 4px',
          }}
        >
          Skydro & Cell — Objectifs long terme
        </div>
        <div
          style={{
            fontSize: 11,
            color: synced ? '#4aaa5a' : C.gold,
            letterSpacing: 1,
            marginBottom: 20,
          }}
        >
          {synced ? '✦ Synchronisé' : '⟳ Connexion…'}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {[
            {
              label: 'Duo',
              done: duoAll.filter((o) => duoDone[o.id]).length,
              total: duoAll.length,
              color: C.gold,
            },
            {
              label: 'Skydro',
              done: skydroAll.filter((o) => skydroDone[o.id]).length,
              total: skydroAll.length,
              color: '#4a9eff',
            },
            {
              label: 'Cell',
              done: cellAll.filter((o) => cellDone[o.id]).length,
              total: cellAll.length,
              color: '#ff6b4a',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="panel-gold"
              style={{
                padding: '10px 20px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: s.color,
                  textShadow: `0 0 8px ${s.color}66`,
                }}
              >
                {Math.round((s.done / s.total) * 100)}%
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.textDim,
                  fontFamily: "'Cinzel',serif",
                  letterSpacing: 1,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {TABS.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                className={`tab-btn${isActive ? '' : ' inactive'}`}
                onClick={() => setTab(t.key)}
                style={
                  isActive
                    ? {
                        background: t.active.bg,
                        borderColor: t.active.border,
                        color: t.active.color,
                        borderBottom: `1px solid ${t.active.bg}`,
                      }
                    : {}
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.goldDim}, transparent)`,
          }}
        />
      </div>
      <div
        style={{ maxWidth: 820, margin: '0 auto', padding: '24px 20px 48px' }}
      >
        <div className="panel" style={{ padding: '24px 24px' }}>
          {tab === 'duo' && (
            <TabContent
              data={DUO_DATA}
              done={duoDone}
              toggle={toggleDuo}
              player={null}
            />
          )}
          {tab === 'skydro' && (
            <TabContent
              data={skydroData}
              done={skydroDone}
              toggle={toggleSkydro}
              player={PLAYERS[0]}
            />
          )}
          {tab === 'cell' && (
            <TabContent
              data={cellData}
              done={cellDone}
              toggle={toggleCell}
              player={PLAYERS[1]}
            />
          )}
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 12,
            color: C.goldDim,
            fontStyle: 'italic',
            fontFamily: "'Crimson Pro', serif",
          }}
        >
          ✦ &nbsp;« Le vrai trésor, c'est les monstres qu'on a éliminés en
          chemin. »&nbsp; ✦
        </div>
      </div>
    </div>
  );
}
