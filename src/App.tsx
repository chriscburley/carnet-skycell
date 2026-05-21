import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import StuffTab from "./StuffTab";

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
  { id:"bg1",  icon:"🌱", name:"Premier Pas",        desc:"Cocher son 1er objectif",            check:(d)=>Object.values(d).filter(Boolean).length>=1 },
  { id:"bg2",  icon:"⚔️", name:"Aventurier",         desc:"10 objectifs complétés",             check:(d)=>Object.values(d).filter(Boolean).length>=10 },
  { id:"bg3",  icon:"🏰", name:"Vétéran",            desc:"25 objectifs complétés",             check:(d)=>Object.values(d).filter(Boolean).length>=25 },
  { id:"bg4",  icon:"👑", name:"Légende",            desc:"50 objectifs complétés",             check:(d)=>Object.values(d).filter(Boolean).length>=50 },
  { id:"bg5",  icon:"💰", name:"Bourse Bien Garnie", desc:"Kamas > 100 000",                    check:(_,m)=>(m?.kamas||0)>=100000 },
  { id:"bg6",  icon:"💵", name:"Marchand",           desc:"Kamas > 1 million",                  check:(_,m)=>(m?.kamas||0)>=1000000 },
  { id:"bg7",  icon:"💎", name:"Fortuné",            desc:"Kamas > 5 millions",                 check:(_,m)=>(m?.kamas||0)>=5000000 },
  { id:"bg8",  icon:"🏦", name:"Rentier",            desc:"Kamas > 50 millions",                check:(_,m)=>(m?.kamas||0)>=50000000 },
  { id:"bg9",  icon:"🐉", name:"Dieu des Douze",    desc:"Kamas > 100 millions",               check:(_,m)=>(m?.kamas||0)>=100000000 },
  { id:"bg10", icon:"⭐", name:"Chasseur",           desc:"Succès > 500 pts",                   check:(_,m)=>(m?.succes||0)>=500 },
  { id:"bg11", icon:"🌟", name:"Érudit",             desc:"Succès > 1 000 pts",                 check:(_,m)=>(m?.succes||0)>=1000 },
  { id:"bg12", icon:"💫", name:"Expert",             desc:"Succès > 2 000 pts",                 check:(_,m)=>(m?.succes||0)>=2000 },
  { id:"bg13", icon:"✨", name:"Maître",             desc:"Succès > 3 000 pts",                 check:(_,m)=>(m?.succes||0)>=3000 },
  { id:"bg14", icon:"🎖️", name:"Maître des Succès", desc:"Succès > 5 000 pts",                 check:(_,m)=>(m?.succes||0)>=5000 },
  { id:"bg15", icon:"🏆", name:"Transcendant",       desc:"Succès > 10 000 pts",                check:(_,m)=>(m?.succes||0)>=10000 },
  { id:"bg16", icon:"🤝", name:"Inséparables",       desc:"20 objectifs duo complétés",         check:(_,__,duo)=>Object.values(duo||{}).filter(Boolean).length>=20 },
  { id:"bg17", icon:"🎯", name:"Perfectionniste",    desc:"Tous les objectifs d'une catégorie", check:(d)=>Object.values(d).filter(Boolean).length>=8 },
  { id:"bg18", icon:"🗡️", name:"Bretteur",           desc:"Niveau 100 atteint",                 check:(_,m)=>(m?.persos||[]).some(p=>(p?.level||0)>=100) },
  { id:"bg19", icon:"🔱", name:"Héros",              desc:"Niveau 150 atteint",                 check:(_,m)=>(m?.persos||[]).some(p=>(p?.level||0)>=150) },
  { id:"bg20", icon:"🌠", name:"Transcendé",         desc:"Niveau 200 atteint",                 check:(_,m)=>(m?.persos||[]).some(p=>(p?.level||0)>=200) },
];

const KAMAS_PALIERS = [
  { label:"100k", val:100000 },
  { label:"1M",   val:1000000 },
  { label:"5M",   val:5000000 },
  { label:"10M",  val:10000000 },
  { label:"25M",  val:25000000 },
  { label:"50M",  val:50000000 },
  { label:"100M", val:100000000 },
  { label:"200M", val:200000000 },
];

// ─── BADGES FAMILIERS ────────────────────────────────────────────────────────
const FAMILIER_BADGES = [
  { id: "f1", icon: "🐣", name: "Apprivoiseur",     desc: "10 familiers obtenus",   threshold: 10  },
  { id: "f2", icon: "🐾", name: "Ami des Bêtes",    desc: "25 familiers obtenus",   threshold: 25  },
  { id: "f3", icon: "🦁", name: "Dompteur",         desc: "40 familiers obtenus",   threshold: 40  },
  { id: "f4", icon: "🌿", name: "Gardien du Monde", desc: "60 familiers obtenus",   threshold: 60  },
  { id: "f5", icon: "✨", name: "Collectionneur",   desc: "Les 75 familiers !",     threshold: 75  },
];

const FAMILIERS = [
  // ─ A ─
  { id:"fm001", name:"Abra Kadabra",       how:"Échange",  fun:"Le Sorcier du Sous-Bois",          where:"[-10,-12] — 5x Ambre du Chêne Mou + 5x Racine d'Abraknyde Ancestral",                        req:"Succès : Vieilles branches" },
  { id:"fm002", name:"Atouin",             how:"Échange",  fun:"La Carapace Ambitieuse",            where:"[7,-10] Cloaque d'Amakna — 10x Étoffe de Sphincter Cell",                                    req:"Succès : Rats Maknéens" },
  // ─ B ─
  { id:"fm003", name:"Balafreux",          how:"Jetons",   fun:"Le Champion des Arènes",            where:"[-13,-29] Kolizéum — 50 000x Kolizéton",                                                     req:"Cote > 3500 (solo/équipe/duel)" },
  { id:"fm004", name:"Bébé Pandawa",       how:"Échange",  fun:"Le Tonneau en Couches",             where:"[22,-31] — 20x de chaque Artefact Pandawushu (Bois/Eau/Feu/Roc/Vent)",                       req:"Succès : Massacre élémentaire" },
  { id:"fm005", name:"Bilby",             how:"Échange",  fun:"La Gelée de Poche",                  where:"[9,28] — 2x Gelée Citron + 2x Bleuet + 2x Menthe + 2x Fraise (Royales)",                    req:"Succès : Gelées" },
  { id:"fm006", name:"Bisouglours",       how:"Échange",  fun:"L'Ours Polaire Câlin",               where:"[-77,-45] Épicerie Frigost — 50x Kama de Glace",                                             req:"Niveau > 79" },
  { id:"fm007", name:"Black Tiwabbit",    how:"Échange",  fun:"Le Lapin des Ténèbres",              where:"[28,-12] à côté du Terrier du Wa Wabbit — 100x Bandeau du Black Tiwabbit",                   req:"Succès : Wabbits" },
  { id:"fm008", name:"Blérodoudou",       how:"Échange",  fun:"Le Doudou Givré",                    where:"[-77,-45] Épicerie Frigost — 50x Kama de Glace",                                             req:"Niveau > 79" },
  { id:"fm009", name:"Bloalak",           how:"Échange",  fun:"Le Passionné de Kaliptus",           where:"[-16,3] — 200x Fleur de Kaliptus",                                                           req:"Succès : Amateur de Kaliptus" },
  { id:"fm010", name:"Blokus",            how:"Échange",  fun:"Le Cube Philosophique",              where:"[1,6] Xélorium — 500x Orichor",                                                              req:"Aucun" },
  { id:"fm011", name:"Bontique",          how:"Alliance", fun:"La Mascotte Bontarienne",            where:"[-33,-56] — 20x Aliton",                                                                     req:"Ordre 1+" },
  { id:"fm012", name:"Boskito",           how:"Échange",  fun:"L'Insecte des Champs",               where:"[8,-22] dans la grange — 50x Pétale Tournesol Sauvage + 50x Pétale Rose Démoniaque",         req:"Succès : Plantes des champs" },
  { id:"fm013", name:"Bouflux",           how:"Alliance", fun:"Le Mouton Électrique",               where:"[-26,36] — 200x Aliton",                                                                     req:"Ordre 5" },
  { id:"fm014", name:"Bouftor",           how:"Alliance", fun:"Le Bouclier Laineux",                where:"[-33,-56] — 200x Aliton",                                                                    req:"Ordre 5" },
  { id:"fm015", name:"Bouloute",          how:"Échange",  fun:"Le Mouton des Neiges",               where:"[-83,-48] — 100x Laine de Boufmouth",                                                        req:"Succès : Boufmouths" },
  { id:"fm016", name:"Bouloute du Parrain",how:"Échange", fun:"Le Mouton de la Mafia",              where:"[5,-19] au fond de la milice — 100x Cuir de Bouftou Noir",                                   req:"Succès : Bouftous" },
  { id:"fm017", name:"Brâkarien",         how:"Alliance", fun:"La Mascotte Brakmariènne",           where:"[-26,36] — 20x Aliton",                                                                      req:"Ordre 1+" },
  { id:"fm018", name:"Brûlih",            how:"Jetons",   fun:"La Flamme Vivante",                  where:"[13,35] Temple des Alliances — 10 000x Pépite",                                              req:"Aucun" },
  { id:"fm019", name:"Bulbisou",          how:"Échange",  fun:"L'Escargot Glacé",                   where:"[-77,-45] Épicerie Frigost — 50x Kama de Glace",                                             req:"Niveau > 79" },
  { id:"fm020", name:"Bulbouture",        how:"Échange",  fun:"La Plante Carnivore",                where:"[27,-31] — 10x Bourgeon explosif de Damadrya",                                               req:"Succès : Plantalas" },
  { id:"fm021", name:"Bwak d'Air",        how:"Échange",  fun:"Le Poulet du Vent",                  where:"[-5,-7] — 10x Ver d'Air + 50x Plume du Kwak de Vent",                                        req:"Succès : En plein vol" },
  { id:"fm022", name:"Bwak d'Eau",        how:"Échange",  fun:"Le Poulet des Profondeurs",          where:"[-5,-9] — 10x Ver d'Eau + 50x Plume du Kwak de Glace",                                       req:"Succès : En plein vol" },
  { id:"fm023", name:"Bwak de Feu",       how:"Échange",  fun:"Le Poulet Enflammé",                 where:"[-6,-9] — 10x Ver de Feu + 50x Plume du Kwak de Flamme",                                     req:"Succès : En plein vol" },
  { id:"fm024", name:"Bwak de Terre",     how:"Échange",  fun:"Le Poulet Terrien",                  where:"[-1,-8] — 10x Ver de Terre + 50x Plume du Kwak de Terre",                                    req:"Succès : En plein vol" },
  { id:"fm025", name:"Bworky",            how:"Échange",  fun:"Le Barbare Miniature",               where:"[-6,9] Village des Bworks — 500x Bière de Bwork",                                            req:"Succès : Bworks" },
  // ─ C ─
  { id:"fm026", name:"Chacha",            how:"Échange",  fun:"Le Mouton de Poche",                 where:"[2,-34] fin de la Cour du Bouftou Royal — 5x Laine de Bouftou",                              req:"Aucun" },
  { id:"fm027", name:"Chacha Angora",     how:"Échange",  fun:"Le Chat de Casino",                  where:"[-9,-21] Ecaflipus — 100x Biscuit de chance",                                                req:"Succès : Ecaflipuces" },
  { id:"fm028", name:"Chacha des Glaces", how:"Échange",  fun:"Le Chat Givré",                      where:"[-66,-75] vers le Comte — 10x Scapula du Comte + 1x Bandelette du Comte Harebourg",          req:"Succès : Givrefoux" },
  { id:"fm029", name:"Chacha Tigré",      how:"Échange",  fun:"Le Chat Rayé",                       where:"[-1,-6] Ecaflipus — 500x Orichor",                                                           req:"Aucun" },
  { id:"fm030", name:"Chachyène",         how:"Quête",    fun:"Le Loup-Chat Mystique",              where:"Quête : Chachyène de vie",                                                                    req:"Quête disponible en jeu" },
  { id:"fm031", name:"Chaperlipopette",   how:"Échange",  fun:"L'Acrobate de Poche",                where:"[-1,-6] Ecaflipus — 500x Orichor",                                                           req:"Aucun" },
  { id:"fm032", name:"Chauffe-souris",    how:"Échange",  fun:"La Chauve-souris Rôtie",             where:"[9,15] Crypte — 50x Paille Vampiresque",                                                     req:"Aucun" },
  { id:"fm033", name:"Chauffe-souris Délavée",how:"Échange",fun:"La Chauve-souris Pâlichonne",     where:"[-4,-24] — 150x Almaton OU 50x Rouflaquettes d'Halouine + 5x Chicots d'Halouine",             req:"Aucun" },
  { id:"fm034", name:"Chercheur d'Ogrines",how:"Échange", fun:"Le Chercheur d'Or",                  where:"[-55,15] chez Otomaï (étage) — 50x Petite pierre d'âme parfaite",                            req:"Succès : Zoths" },
  { id:"fm035", name:"Chienchien Tigré",  how:"Échange",  fun:"Le Chien Rayé",                      where:"[-27,-5] — 50x Fragment d'Os",                                                               req:"Succès : Mulous" },
  { id:"fm036", name:"Crocodaille",       how:"Échange",  fun:"Le Croco de Poche",                  where:"[-7,11] — 50x Dent de Crocodaille + 1x Crâne de Chef Crocodaille",                           req:"Succès : Gadouilleux" },
  { id:"fm037", name:"Cromeugnon",        how:"Échange",  fun:"L'Homme des Cavernes Givré",         where:"[-80,-81] — 100x Larme de Givrefoux",                                                        req:"Succès : Givrefoux" },
  { id:"fm038", name:"Croum",             how:"Échange",  fun:"Le Bandit Miniature",                where:"[16,21] — 10x Émeraude + 10x Cristal",                                                       req:"Succès : Bandits d'Amakna" },
  // ─ D ─
  { id:"fm039", name:"Dauge",             how:"Quête",    fun:"Le Chien du Dieu Ouginak",           where:"[-24,24] devant le Dieu Ouginak — 50x Baballe",                                              req:"Succès : La Fratrie des Oubliés" },
  { id:"fm040", name:"Dehluge",           how:"Jetons",   fun:"Le Déluge en Miniature",             where:"[13,35] Temple des Alliances — 10 000x Pépite",                                              req:"Aucun" },
  { id:"fm041", name:"Dragouf",           how:"Échange",  fun:"Le Dragon du Désert",                where:"[-46,44] — 20x Jeton du Dragouf",                                                            req:"Aucun" },
  { id:"fm042", name:"Dragoune Noire",    how:"Échange",  fun:"La Dragonne des Ombres",             where:"[-4,26] maison — 10x Dent du Kharnozor + 1x Œil du Kharnozor",                              req:"Succès : Dragoss" },
  { id:"fm043", name:"Dragoune Rose",     how:"Échange",  fun:"La Princesse du Donjon",             where:"[-2,24] — 10x Corne brisée de Crocabulia",                                                   req:"Succès : Dragoeufs Protecteurs" },
  { id:"fm044", name:"Drakopin",          how:"Échange",  fun:"Le Dragon du Fond",                  where:"[23,24] — 50x Perle des profondeurs",                                                        req:"Succès : J'tape dans l'fond" },
  // ─ E ─
  { id:"fm045", name:"Ecumouth",          how:"Échange",  fun:"L'Écureuil des Pins",                where:"[-64,-50] — 50x Gland de l'Écumouth",                                                        req:"Succès : Faune des Pins Perdus" },
  { id:"fm046", name:"Ecureuil Chenapan", how:"Échange",  fun:"Le Petit Voleur de Noisettes",       where:"[-1,-7] Île de Pwâk — 200x Coupon praliné",                                                  req:"Succès : Chauuuuud Cacao !" },
  { id:"fm047", name:"Eliôme",            how:"Échange",  fun:"La Flamme Abyssale",                 where:"[24,33] Abysses — 100x Pierre Angulaire",                                                    req:"Succès : Serviteurs de l'indicible" },
  { id:"fm048", name:"El Scarador",       how:"Échange",  fun:"Le Scarabée de l'Arène",             where:"[4,28] 3ème map de la mine — 10x Ailes du Scarabosse Doré + 100x Viscères de Scarafeuille",  req:"Succès : Scarafeuilles" },
  // ─ F ─
  { id:"fm049", name:"Fëanor",            how:"Échange",  fun:"Le Scarabée Mystique",               where:"[12,-76] Pyramide — 100x Scarabée Chrysonéfritin",                                           req:"Succès : Maudits" },
  { id:"fm050", name:"Fosfo",             how:"Échange",  fun:"Le Lapin Radioactif",                where:"[28,-13] devant les laboratoires — 100x Cawotte Transgénique",                               req:"Succès : Wabbits mutants" },
  { id:"fm051", name:"Fotome",            how:"Échange",  fun:"Le Fantôme de Poche",                where:"[-13,-41] — 10x Boostoplasme",                                                               req:"Succès : Bêtes de la nuit" },
  // ─ G ─
  { id:"fm052", name:"Gelutin",           how:"Échange",  fun:"La Gelée Colorée",                   where:"[-7,-43] — 5x Feuille de Blop Multicolore Royal + 5x Feuille de Blop Royal",                req:"Succès : Blops" },
  { id:"fm053", name:"Givrefoux",         how:"Échange",  fun:"Le Renard de Glace",                 where:"[-81,-75] — 5x Cuir de Fuji Givrefoux + 10x Laine de Tengu Givrefoux",                       req:"Succès : Givrefoux" },
  { id:"fm054", name:"Grossepioche",      how:"Échange",  fun:"Le Mineur de Fond",                  where:"[13,21] Donjon des Forgerons — 5x Croc du Coffre des Forgerons",                             req:"Succès : Forgerons" },
  // ─ K/L/M/N/O/P ─
  { id:"fm055", name:"Kanigrou",          how:"Échange",  fun:"Le Kangourou Boxeur",                where:"[-3,0] Cania — 20x Pince de Kanigrou",                                                       req:"Succès : Kanigrous" },
  { id:"fm056", name:"Léopardo",          how:"Échange",  fun:"Le Fauve des Neiges",                where:"Pont de Grobe Frigost — 50x Os Fantôme Nukoui San + 50x Os Fantôme Pandore",                req:"Succès Dofus Émeraude" },
  { id:"fm057", name:"Mékrabe",           how:"Échange",  fun:"Le Crabe Métallique",                where:"[-3,-53] Frigost — 20x Pince de Mékrabe",                                                    req:"Succès : Se Jeter à l'Eau (Merkator)" },
  { id:"fm058", name:"Minoskour",         how:"Échange",  fun:"Le Taureau Miniature",               where:"[-74,-38] Frigost — 20x Corne de Minoskour",                                                 req:"Succès : Minotoror" },
  { id:"fm059", name:"Nomoon",            how:"Échange",  fun:"L'Araignée de Poche",                where:"[-3,-16] Donjon Abraknydes — 5x Toile d'Abraknyde Ancestral",                               req:"Succès : Abraknydes" },
  { id:"fm060", name:"Ouassingue",        how:"Échange",  fun:"Le Mouton Enragé",                   where:"[-26,36] — 5x Laine de Bouftou Royal",                                                       req:"Succès : Bouftous" },
  { id:"fm061", name:"Phortiche",         how:"Échange",  fun:"Le Costaud de Poche",                where:"[1,6] Xélorium/Enutrosor — 500x Orichor",                                                    req:"Aucun" },
  { id:"fm062", name:"Pioute Jaune",      how:"Échange",  fun:"Le Poussin Solaire",                 where:"[4,-22] Poulailler d'Astrub — 50x Plume Piou Jaune + 100x Graine de Sésame",                req:"Aucun" },
  { id:"fm063", name:"Pioute Rose",       how:"Échange",  fun:"Le Poussin Romantique",              where:"[5,-17] Maison secrète d'Astrub — 50x Plume Piou Rose + 100x Graine de Sésame",             req:"Aucun" },
  { id:"fm064", name:"Pioute Rouge",      how:"Échange",  fun:"Le Poussin Enragé",                  where:"[4,-22] Poulailler d'Astrub — 50x Plume Piou Rouge + 100x Graine de Sésame",                req:"Aucun" },
  { id:"fm065", name:"Pioute Bleu",       how:"Échange",  fun:"Le Poussin Mélancolique",            where:"[4,-22] Poulailler d'Astrub — 50x Plume Piou Bleu + 100x Graine de Sésame",                 req:"Aucun" },
  { id:"fm066", name:"Pioute Vert",       how:"Échange",  fun:"Le Poussin Écolo",                   where:"[4,-22] Poulailler d'Astrub — 50x Plume Piou Vert + 100x Graine de Sésame",                 req:"Aucun" },
  { id:"fm067", name:"Pioute Violet",     how:"Échange",  fun:"Le Poussin Mystique",                where:"[4,-22] Poulailler d'Astrub — 50x Plume Piou Violet + 100x Graine de Sésame",               req:"Aucun" },
  { id:"fm068", name:"Pioute Blanc",      how:"Échange",  fun:"La Boule de Plumes",                 where:"[4,-22] Poulailler d'Astrub — 50x Plume Piou Blanc + 100x Graine de Sésame",                req:"Aucun" },
  // ─ S/T ─
  { id:"fm069", name:"Scarapiaf",         how:"Échange",  fun:"L'Insecte de Compagnie",             where:"Zone Scarafeuilles — 5x Carapace de Scarafeuille Royal",                                     req:"Succès : Scarafeuilles" },
  { id:"fm070", name:"Tofurby",           how:"Échange",  fun:"La Peluche Électrisée",              where:"[2,-8] Donjon des Tofus — 5x Plume de Tofu Royal",                                          req:"Succès : Tofus" },
  { id:"fm071", name:"Tofuldi",           how:"Échange",  fun:"Le Tofu qui Brille",                 where:"[2,-8] Donjon des Tofus — 10x Plume de Tofu Royal",                                         req:"Succès : Tofus" },
  { id:"fm072", name:"Tofoudre",          how:"Quête",    fun:"Le Tofu Foudroyant",                 where:"[11,8] Zone Feudala — PNJ visible en zone",                                                  req:"Succès Tofus en zone Feudala" },
  { id:"fm073", name:"Tifoux",            how:"Quête",    fun:"Le Renardeau Elfique",               where:"Zone Sufokia — Quête : Le Petit Renard des Bois",                                            req:"Quête Sufokia" },
  { id:"fm074", name:"Walk",              how:"Quête",    fun:"Le Marcheur Silencieux",             where:"Zone Lac Gelé — PNJ apparaît après succès",                                                  req:"Succès 'La Marche de l'Empereur' + 'Forage à tous vents'" },
  { id:"fm075", name:"Bwak Noir",         how:"Quête",    fun:"Le Poulet de la Jungle",             where:"Île Otomaï — échange contre ressources Bwak",                                               req:"Accès Île Otomaï (abonné)" },
];


const HOW_COLORS = {
  "Échange":   { color:"#1a5a8a", bg:"#e8f0f8", border:"#4a8ab8" },
  "Jetons":    { color:"#6a1a8a", bg:"#f0e8f8", border:"#9a4ab8" },
  "Quête":     { color:"#7a5a10", bg:"#f8f0d8", border:"#b88a20" },
  "Alliance":  { color:"#8a3a1a", bg:"#f8ece8", border:"#b86040" },
};


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
  headerBg:"#3a2408", headerBg2:"#5a3a14",
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
function PersonnagesSection({ skydroMeta, cellMeta, onUpdateSkydro, onUpdateCell, singlePlayer }) {
  const allPlayers = [
    { label:"Sky",  color:"#2a4a8a", border:"#4a6a9a", colorLight:"#e8f0f8", meta:skydroMeta, onUpdate:onUpdateSkydro, key:"skydro" },
    { label:"Cell", color:"#7a2a1a", border:"#9a4a2a", colorLight:"#f8ede8", meta:cellMeta,   onUpdate:onUpdateCell,   key:"cell"   },
  ];
  const players = singlePlayer ? allPlayers.filter(p => p.key === singlePlayer) : allPlayers;
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
  const famCount = Object.values(meta?.familiers || {}).filter(Boolean).length;
  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>🏅 Badges</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8, marginBottom:20 }}>
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
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>🐾 Badges Familiers ({famCount}/{FAMILIERS.length})</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8 }}>
        {FAMILIER_BADGES.map(b => {
          const isUnlocked = famCount >= b.threshold;
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
        <div style={{ fontSize: 52, marginBottom: 16, marginTop: -20, filter: "drop-shadow(0 0 20px rgba(245,208,96,0.8))", lineHeight:1 }}>{icon}</div>
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
    { key:"objectifs",  label:"Objectifs" },
    { key:"stats",      label:"Stats & Persos" },
    { key:"badges",     label:"Badges" },
    { key:"notes",      label:"Notes" },
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
                singlePlayer={player.key}
              />
              <KamasSection player={player.label} kamas={meta?.kamas} onUpdate={v => onMetaUpdate({...meta, kamas:v})} />
              <SuccesSection player={player.label} succes={meta?.succes} onUpdate={v => onMetaUpdate({...meta, succes:v})} />
            </>
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

// ─── BADGES QUÊTES JOURNALIÈRES ──────────────────────────────────────────────
const DAILY_BADGES = [
  { id: "dq1",  icon: "🌅", name: "Premier Lever",     desc: "1 quête journalière complétée",    threshold: 1   },
  { id: "dq2",  icon: "📅", name: "Habitué",           desc: "10 quêtes journalières complétées", threshold: 10  },
  { id: "dq3",  icon: "🔥", name: "En Feu",            desc: "25 quêtes journalières complétées", threshold: 25  },
  { id: "dq4",  icon: "💪", name: "Acharné",           desc: "50 quêtes journalières complétées", threshold: 50  },
  { id: "dq5",  icon: "🏅", name: "Centurion",         desc: "100 quêtes journalières complétées",threshold: 100 },
  { id: "dq6",  icon: "👑", name: "Légende du Quotidien", desc: "200 quêtes journalières complétées", threshold: 200 },
];

// ─── BASE DE DONJONS PAR NIVEAU ───────────────────────────────────────────────
const DUNGEONS_BY_LEVEL = [
  { min:1,   max:30,  name:"Crypte de Kardorim",           boss:"Kardorim" },
  { min:1,   max:30,  name:"Grange du Tournesol Affamé",   boss:"Tournesol Affamé" },
  { min:15,  max:40,  name:"Château Ensablé",              boss:"Mob l\'Éponge" },
  { min:20,  max:45,  name:"Cour du Bouftou Royal",        boss:"Bouftou Royal" },
  { min:25,  max:50,  name:"Donjon des Bworks",            boss:"Bworkette" },
  { min:30,  max:55,  name:"Donjon des Tofus",             boss:"Batofu" },
  { min:35,  max:60,  name:"Cache de Kankreblath",         boss:"Kankreblath" },
  { min:40,  max:65,  name:"Donjon des Forgerons",         boss:"Coffre des Forgerons" },
  { min:50,  max:75,  name:"Château du Wa Wabbit",         boss:"Wa Wabbit" },
  { min:55,  max:80,  name:"Donjon Abraknydes",            boss:"Abraknyde Ancestral" },
  { min:60,  max:85,  name:"Cale de l\'Arche d\'Otomaï",   boss:"Gourlo le Terrible" },
  { min:65,  max:90,  name:"Antre de la Reine Nyée",       boss:"Reine Nyée" },
  { min:70,  max:95,  name:"Bateau du Chouque",            boss:"Chouque" },
  { min:75,  max:100, name:"Donjon des Gelées",            boss:"Blop Multicolore Royal" },
  { min:80,  max:110, name:"Antre du Dragon Cochon",       boss:"Dragon Cochon" },
  { min:85,  max:115, name:"Caverne du Koulosse",          boss:"Koulosse" },
  { min:90,  max:120, name:"Bibliothèque du Maître Corbac",boss:"Maître Corbac" },
  { min:95,  max:125, name:"Tanière du Meulou",            boss:"Meulou" },
  { min:100, max:130, name:"Clairière du Chêne Mou",       boss:"Chêne Mou" },
  { min:110, max:140, name:"Épave du Grolandais Violent",  boss:"Ben le Ripate" },
  { min:120, max:150, name:"Antre du Blop Multicolore",    boss:"Blop Multicolore" },
  { min:140, max:165, name:"Canopée du Kimbo",             boss:"Kimbo" },
  { min:150, max:180, name:"Antre du Korriandre",          boss:"Korriandre" },
  { min:160, max:190, name:"Grotte du Bworker",            boss:"Bworker" },
  { min:165, max:195, name:"Antre du Kralamoure Géant",    boss:"Kralamoure Géant" },
  { min:175, max:200, name:"Cavernes du Kolosso",          boss:"Kolosso" },
  { min:180, max:200, name:"Antichambre des Gloursons",    boss:"Glourséleste" },
  { min:190, max:200, name:"Aquadôme de Merkator",         boss:"Merkator" },
  { min:190, max:200, name:"Donjon du Comte Harebourg",    boss:"Comte Harebourg" },
  { min:195, max:200, name:"Tréfonds de Frigost",          boss:"Klime" },
];

const DAILY_QUESTS = {
  easy: [
    { id:"e1",  template:(d)=>`Faire ${d.name} sans utiliser de soin pendant les 2 premières salles`, emoji:"🧪" },
    { id:"e2",  template:(d)=>`Tuer ${d.boss} en moins de 6 tours`, emoji:"⚡" },
    { id:"e3",  template:(d)=>`Finir ${d.name} sans jamais reculer d\'une case`, emoji:"🔒" },
    { id:"e4",  template:(d)=>`Faire ${d.name} en commençant chaque combat avec un défi actif`, emoji:"🏆" },
    { id:"e5",  template:(d)=>`Finir ${d.name} avec plus de 80% de ses PV`, emoji:"💚" },
    { id:"e6",  template:(d)=>`Tuer ${d.boss} en dernier dans le combat final`, emoji:"🎯" },
    { id:"e7",  template:(_d)=>`Réaliser 3 chasses au trésor aujourd\'hui`, emoji:"🗺️" },
    { id:"e8",  template:(_d)=>`Ramasser 50 ressources en zone ouverte`, emoji:"🌿" },
    { id:"e9",  template:(_d)=>`Faire l\'Almanax du jour`, emoji:"☀️" },
    { id:"e10", template:(_d)=>`Vendre 10 objets à l\'Hôtel de Vente`, emoji:"💰" },
    { id:"e11", template:(_d)=>`Réaliser un succès de combat aujourd\'hui`, emoji:"⭐" },
    { id:"e12", template:(d)=>`Faire ${d.name} sans jamais utiliser plus de 3 PA par tour`, emoji:"🐢" },
  ],
  normal: [
    { id:"n1",  template:(d)=>`Faire ${d.name} en solo`, emoji:"🧍" },
    { id:"n2",  template:(d)=>`Finir ${d.name} sans jamais être en dessous de 50% de PV`, emoji:"❤️" },
    { id:"n3",  template:(d)=>`Battre ${d.boss} sans utiliser de sort offensif au dernier tour`, emoji:"✋" },
    { id:"n4",  template:(d)=>`Faire ${d.name} sans utiliser de sort de déplacement`, emoji:"🧱" },
    { id:"n5",  template:(d)=>`Finir ${d.name} en ne tuant que le boss — épargner tous les autres monstres`, emoji:"🕊️" },
    { id:"n6",  template:(d)=>`Battre ${d.boss} en moins de 4 tours`, emoji:"💥" },
    { id:"n7",  template:(_d)=>`Réaliser 2 chasses au trésor de la même zone`, emoji:"🗺️" },
    { id:"n8",  template:(_d)=>`Farmer 100 ressources d\'un même type`, emoji:"⛏️" },
    { id:"n9",  template:(_d)=>`Gagner 50 000 kamas en vendant à l\'HDV`, emoji:"💵" },
    { id:"n10", template:(_d)=>`Compléter 3 combats d\'affilée avec un défi "Sans dommages"`, emoji:"🛡️" },
    { id:"n11", template:(_d)=>`Réaliser un succès de donjon jamais complété`, emoji:"🆕" },
    { id:"n12", template:(d)=>`Faire ${d.name} sans jamais passer son tour`, emoji:"⏩" },
  ],
  hard: [
    { id:"h1",  template:(d)=>`Faire ${d.name} en hardcore : si tu meurs, tu recommences`, emoji:"💀" },
    { id:"h2",  template:(d)=>`Battre ${d.boss} sans équipement dans les slots accessoires`, emoji:"🪦" },
    { id:"h3",  template:(d)=>`Faire ${d.name} entier sans utiliser plus de 2 sorts différents`, emoji:"🔂" },
    { id:"h4",  template:(d)=>`Terminer ${d.name} avec le succès "Mains propres" (0 mort)`, emoji:"🧤" },
    { id:"h5",  template:(d)=>`Battre ${d.boss} sans jamais infliger plus de 200 dégâts par sort`, emoji:"🪶" },
    { id:"h6",  template:(d)=>`Faire ${d.name} en utilisant uniquement des sorts d\'un seul élément`, emoji:"🧊" },
    { id:"h7",  template:(_d)=>`Réaliser 5 chasses au trésor d\'affilée sans échouer`, emoji:"🏅" },
    { id:"h8",  template:(_d)=>`Gagner 200 000 kamas en une session de jeu`, emoji:"💎" },
    { id:"h9",  template:(_d)=>`Compléter 3 combats d\'affilée sans utiliser de sort de soin`, emoji:"🩸" },
    { id:"h10", template:(d)=>`Faire ${d.name} sans jamais utiliser une case adjacente au boss`, emoji:"🚫" },
  ],
};

function getDungeonsForLevel(level) {
  if (!level || level < 1) return DUNGEONS_BY_LEVEL.slice(0, 5);
  const min = Math.max(1, level - 50);
  return DUNGEONS_BY_LEVEL.filter(d => d.max <= level && d.max >= min);
}

function getDailyQuests(levelSnapshot, dateKey) {
  // Seed basé UNIQUEMENT sur la date — fixe toute la journée
  const dateSeed = dateKey.split("-").reduce((a,b,i) => a + parseInt(b) * (i+1) * 97, 0);
  const rng = (n) => Math.abs((dateSeed * 1664525 + 1013904223 * (n+1)) & 0x7fffffff) % 1000 / 1000;

  const dungeons = getDungeonsForLevel(levelSnapshot);
  const pool = dungeons.length > 0 ? dungeons : DUNGEONS_BY_LEVEL.slice(0, 5);

  const pickD = (n) => pool[Math.floor(rng(n) * pool.length)];
  const pickQ = (arr, n) => arr[Math.floor(rng(n+50) * arr.length)];

  const easyQ  = pickQ(DAILY_QUESTS.easy, 0);
  const normalQ = pickQ(DAILY_QUESTS.normal, 1);
  const hardQ   = pickQ(DAILY_QUESTS.hard, 2);

  const needsDungeon = (q) => !q.template.toString().includes("_d");

  return [
    { difficulty:"easy",   color:"#2a7a2a", bg:"#eaf4ea", border:"#4a8a4a", label:"Facile",
      dungeon: needsDungeon(easyQ)  ? pickD(0) : null, quest: easyQ  },
    { difficulty:"normal", color:"#7a5a10", bg:"#f8f0d8", border:"#b88a20", label:"Normal",
      dungeon: needsDungeon(normalQ) ? pickD(1) : null, quest: normalQ },
    { difficulty:"hard",   color:"#8a1a1a", bg:"#f8e8e8", border:"#b84040", label:"Difficile",
      dungeon: needsDungeon(hardQ)  ? pickD(2) : null, quest: hardQ  },
  ];
}

// ─── ANIMATION QUÊTE JOURNALIÈRE ─────────────────────────────────────────────
function DailyCompleteOverlay({ quest, onDone }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("out"), 2400);
    const t3 = setTimeout(onDone, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;

    // Spirale de petites étoiles qui convergent vers le centre
    const stars = Array.from({ length: 80 }, (_, i) => {
      const angle = (i / 80) * Math.PI * 2 * 3;
      const startR = 300 + Math.random() * 200;
      const colors = ["#f5d060","#ffffff","#a8d8ff","#ffb8a0","#c8f8c8"];
      return {
        angle, r: startR,
        targetR: 0,
        x: W/2 + Math.cos(angle) * startR,
        y: H/2 + Math.sin(angle) * startR,
        size: 1.5 + Math.random() * 3,
        color: colors[i % colors.length],
        alpha: 0,
        delay: Math.random() * 20,
        speed: 4 + Math.random() * 6,
      };
    });

    let frame = 0;
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        if (frame < s.delay) return;
        s.alpha = Math.min(1, (frame - s.delay) / 15);
        s.r = Math.max(0, s.r - s.speed);
        s.x = W/2 + Math.cos(s.angle) * s.r;
        s.y = H/2 + Math.sin(s.angle) * s.r;
        if (s.r <= 0) { s.alpha = Math.max(0, s.alpha - 0.05); return; }
        ctx.save();
        ctx.globalAlpha = s.alpha * 0.9;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });
      frame++;
      if (frame < 120) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const diffColors = { easy:"#2a7a2a", normal:"#7a5a10", hard:"#8a1a1a" };
  const diffLabels = { easy:"Facile", normal:"Normal", hard:"Difficile" };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10001, pointerEvents:"none",
      display:"flex", alignItems:"center", justifyContent:"center",
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.5s ease" : "opacity 0.25s ease",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(20,12,4,0.75)", backdropFilter:"blur(3px)" }} />
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
      <div style={{
        position:"relative", zIndex:1, textAlign:"center",
        transform: phase === "in" ? "scale(0.8) translateY(20px)" : "scale(1) translateY(0)",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ fontSize:60, marginBottom:12, filter:"drop-shadow(0 0 16px rgba(255,255,255,0.5))" }}>{quest.emoji}</div>
        <div style={{
          display:"inline-block", padding:"3px 14px", borderRadius:20, marginBottom:10,
          background: diffColors[quest.difficulty] + "33",
          border: `1px solid ${diffColors[quest.difficulty]}`,
          color: quest.difficulty === "easy" ? "#8aca8a" : quest.difficulty === "normal" ? "#e8c870" : "#f89090",
          fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:1,
        }}>
          {diffLabels[quest.difficulty].toUpperCase()}
        </div>
        <div style={{
          fontFamily:"'Cinzel',serif", fontSize:"clamp(16px,3vw,24px)", fontWeight:700,
          color:"#f5d060", letterSpacing:1, marginBottom:8,
          textShadow:"0 0 20px rgba(245,208,96,0.8), 0 2px 6px rgba(0,0,0,0.8)",
          maxWidth:500, lineHeight:1.4,
        }}>
          Quête accomplie !
        </div>
        <div style={{
          fontFamily:"'Crimson Pro',serif", fontSize:15, fontStyle:"italic",
          color:"#f5edd8", opacity:0.85, maxWidth:420, lineHeight:1.5,
          textShadow:"0 1px 4px rgba(0,0,0,0.6)",
        }}>
          {quest.text}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION QUÊTES JOURNALIÈRES ─────────────────────────────────────────────
function DailyQuestsSection({ playerLabel, playerColor, playerBorder, playerBg, level, dailyDone, onToggle, totalDone }) {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

  // Snapshot du niveau : on stocke le niveau utilisé pour la journée
  const [levelSnapshot, setLevelSnapshot] = useState(() => {
    const stored = localStorage.getItem ? localStorage.getItem(`dailyLevel_${playerLabel}_${dateKey}`) : null;
    return stored ? parseInt(stored) : (level || null);
  });

  useEffect(() => {
    if (level && !levelSnapshot) {
      setLevelSnapshot(level);
      try { localStorage.setItem(`dailyLevel_${playerLabel}_${dateKey}`, String(level)); } catch(e) {}
    }
  }, [level]);

  const quests = getDailyQuests(levelSnapshot, dateKey);
  const [overlay, setOverlay] = useState(null);

  const handleCheck = (q, idx) => {
    const key = `${dateKey}_${idx}`;
    const wasDone = dailyDone[key];
    onToggle(key, !wasDone);
    if (!wasDone) {
      const text = q.dungeon ? q.quest.template(q.dungeon) : q.quest.template(null);
      setOverlay({ ...q, text, emoji: q.quest.emoji });
    }
  };

  const unlockedBadges = DAILY_BADGES.filter(b => totalDone >= b.threshold);

  return (
    <div style={{ marginTop:16 }}>
      {overlay && <DailyCompleteOverlay quest={overlay} onDone={() => setOverlay(null)} />}

      <div className="panel-gold" style={{ padding:"14px 18px", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:playerColor, letterSpacing:2, textTransform:"uppercase" }}>
            ☀ Quêtes du Jour — {playerLabel}
          </div>
          <div style={{ fontSize:11, color:C.textDim, fontFamily:"'Cinzel',serif" }}>
            {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
          </div>
        </div>

        {!level ? (
          <div style={{ fontSize:13, color:C.textDim, fontStyle:"italic", textAlign:"center", padding:"8px 0" }}>
            Renseigne le niveau de ton perso 1 dans Stats & Persos pour voir tes quêtes !
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {quests.map((q, idx) => {
              const key = `${dateKey}_${idx}`;
              const isDone = dailyDone[key];
              const text = q.dungeon ? q.quest.template(q.dungeon) : q.quest.template(null);
              return (
                <div key={idx} onClick={() => handleCheck(q, idx)} style={{
                  display:"grid", gridTemplateColumns:"28px 1fr auto",
                  alignItems:"start", gap:10, padding:"10px 14px",
                  borderRadius:6, cursor:"pointer",
                  background: isDone ? "#eef4ee" : q.bg,
                  border:`1px solid ${isDone ? "#4a8a4a" : q.border}`,
                  opacity: isDone ? 0.7 : 1,
                  transition:"all 0.15s",
                }}>
                  <div style={{
                    width:22, height:22, borderRadius:4, flexShrink:0, marginTop:1,
                    border:`2px solid ${isDone ? "#2a6a2a" : q.border}`,
                    background: isDone ? "#2a6a2a" : "white",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, transition:"all 0.2s",
                  }}>
                    {isDone && <span style={{ color:"white" }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:14 }}>{q.quest.emoji}</span>
                      <span style={{
                        fontSize:10, padding:"1px 8px", borderRadius:10,
                        background:`${q.color}22`, color:q.color,
                        border:`1px solid ${q.border}`, fontFamily:"'Cinzel',serif",
                        fontWeight:600, letterSpacing:0.5,
                      }}>{q.label}</span>
                      {q.dungeon && <span style={{ fontSize:11, color:C.textDim, fontStyle:"italic" }}>
                        {q.dungeon.name}
                      </span>}
                    </div>
                    <div style={{
                      fontSize:13, color: isDone ? C.textDim : C.text,
                      textDecoration: isDone ? "line-through" : "none",
                      lineHeight:1.4,
                    }}>{text}</div>
                  </div>
                  <div style={{ fontSize:11, color:C.textDim, fontFamily:"'Cinzel',serif", flexShrink:0, marginTop:2 }}>
                    {isDone ? "✦" : "○"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compteur total */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:11, color:C.textDim, fontFamily:"'Cinzel',serif" }}>Total complétées</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, color:playerColor }}>{totalDone}</div>
        </div>
      </div>

      {/* Badges journaliers */}
      {unlockedBadges.length > 0 && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {DAILY_BADGES.map(b => {
            const unlocked = totalDone >= b.threshold;
            return (
              <div key={b.id} title={`${b.name} — ${b.desc}`} style={{
                display:"flex", alignItems:"center", gap:5, padding:"4px 10px",
                borderRadius:20, fontSize:11,
                background: unlocked ? `${playerColor}18` : "rgba(0,0,0,0.04)",
                border: `1px solid ${unlocked ? playerBorder : C.borderLight}`,
                color: unlocked ? playerColor : C.textDim,
                fontFamily:"'Cinzel',serif", letterSpacing:0.3,
                filter: unlocked ? "none" : "grayscale(1)",
                opacity: unlocked ? 1 : 0.4,
              }}>
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SECTION FAMILIERS ───────────────────────────────────────────────────────
function FamiliersSection({ done, toggle, totalDone }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const HOW_FILTERS = ["all", "Drop boss", "Échange", "Quête", "Drop zone"];

  const filtered = FAMILIERS.filter(f => {
    const matchFilter = filter === "all" || f.how === filter;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.fun.toLowerCase().includes(search.toLowerCase());
    const matchDone = filter === "done" ? done[f.id] : filter === "todo" ? !done[f.id] : true;
    return matchFilter && matchSearch && matchDone;
  });

  const totalFamiliers = FAMILIERS.length;
  const doneFamiliers = FAMILIERS.filter(f => done[f.id]).length;

  return (
    <div>
      {/* Barre de progression globale */}
      <div className="panel-gold" style={{ padding:"12px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:1, textTransform:"uppercase" }}>
            🐾 Collection de Familiers
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, color:C.gold }}>
            {doneFamiliers}/{totalFamiliers}
          </div>
        </div>
        <div className="prog-track" style={{ height:10, marginBottom:8 }}>
          <div className="prog-fill" style={{ width:`${Math.round(doneFamiliers/totalFamiliers*100)}%`, background:`linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
        </div>
        {/* Badges familiers */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FAMILIER_BADGES.map(b => {
            const unlocked = doneFamiliers >= b.threshold;
            return (
              <div key={b.id} title={b.desc} style={{
                display:"flex", alignItems:"center", gap:4, padding:"3px 9px",
                borderRadius:20, fontSize:11,
                background: unlocked ? "rgba(139,94,26,0.15)" : "rgba(0,0,0,0.04)",
                border:`1px solid ${unlocked ? C.panelBorder : C.borderLight}`,
                color: unlocked ? C.gold : C.textDim,
                fontFamily:"'Cinzel',serif", letterSpacing:0.3,
                filter: unlocked ? "none" : "grayscale(1)", opacity: unlocked ? 1 : 0.45,
              }}>
                <span>{b.icon}</span><span>{b.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        {[{key:"all",label:"Tous"},{key:"done",label:"✓ Obtenus"},{key:"todo",label:"À trouver"},
          ...HOW_FILTERS.filter(f=>f!=="all").map(f=>({key:f,label:f}))
        ].map(f => (
          <button key={f.key} className={`filter-btn${filter===f.key?" active":""}`} onClick={()=>setFilter(f.key)} style={{ fontSize:11 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <input className="meta-input" placeholder="🔍 Rechercher un familier…" value={search} onChange={e=>setSearch(e.target.value)}
        style={{ marginBottom:12, fontSize:13 }} />

      {/* Liste */}
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {filtered.map(f => {
          const isDone = done[f.id];
          const cfg = HOW_COLORS[f.how] || HOW_COLORS["Drop zone"];
          return (
            <div key={f.id} onClick={() => toggle(f.id)} style={{
              display:"grid", gridTemplateColumns:"26px 1fr auto",
              alignItems:"start", gap:10, padding:"9px 13px",
              borderRadius:6, cursor:"pointer",
              background: isDone ? "#eef4ee" : C.bgCard,
              border:`1px solid ${isDone ? "#4a8a4a" : C.borderLight}`,
              opacity: isDone ? 0.7 : 1, transition:"all 0.12s",
            }}>
              <div style={{
                width:20, height:20, borderRadius:4, flexShrink:0, marginTop:1,
                border:`2px solid ${isDone ? "#2a6a2a" : C.goldDim}`,
                background: isDone ? "#2a6a2a" : "white",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, transition:"all 0.2s",
              }}>
                {isDone && <span style={{ color:"white" }}>✓</span>}
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:13, fontWeight:700, color: isDone ? C.textDim : C.textBright, textDecoration: isDone?"line-through":"none" }}>
                    {f.fun}
                  </span>
                  <span style={{ fontSize:10, padding:"1px 7px", borderRadius:10, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:0.3 }}>
                    {f.how}
                  </span>
                </div>
                <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic" }}>
                  {f.name} — {f.where}
                </div>
              </div>
              <div style={{ fontSize:13 }}>🐾</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ fontSize:13, color:C.textDim, fontStyle:"italic", textAlign:"center", padding:16 }}>Aucun familier trouvé.</div>
        )}
      </div>
    </div>
  );
}


// ─── ANIMATION BADGE DÉBLOQUÉ ────────────────────────────────────────────────
function BadgeUnlockOverlay({ badge, onDone }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 2800);
    const t3 = setTimeout(onDone, 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;

    // Feu d'artifice — plusieurs explosions depuis le centre
    const bursts = Array.from({ length: 6 }, (_, b) => ({
      delay: b * 8,
      x: cx + (Math.random()-0.5)*200,
      y: cy + (Math.random()-0.5)*150,
      particles: Array.from({ length: 40 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const colors = ["#f5d060","#ffffff","#e8b84b","#ffa040","#ff6060","#60a0ff","#80ff80"];
        return {
          vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 1,
          x: 0, y: 0, size: 2+Math.random()*4,
          color: colors[Math.floor(Math.random()*colors.length)],
          alpha: 1, decay: 0.015+Math.random()*0.015, gravity: 0.1,
        };
      }),
    }));

    let frame = 0, raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      bursts.forEach(burst => {
        if (frame < burst.delay) return;
        const f = frame - burst.delay;
        burst.particles.forEach(p => {
          if (p.alpha <= 0) return;
          p.x += p.vx; p.y += p.vy;
          p.vy += p.gravity; p.vx *= 0.97;
          p.alpha -= p.decay;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(burst.x+p.x, burst.y+p.y, p.size*p.alpha, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });
      });
      frame++;
      if (frame < 150) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10002, pointerEvents:"none",
      display:"flex", alignItems:"center", justifyContent:"center",
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.5s ease" : "opacity 0.3s ease",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,8,4,0.82)", backdropFilter:"blur(4px)" }} />
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
      <div style={{
        position:"relative", zIndex:1, textAlign:"center",
        transform: phase==="in" ? "scale(0.6) translateY(30px)" : "scale(1) translateY(0)",
        transition:"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ fontSize:80, marginBottom:12, filter:"drop-shadow(0 0 24px rgba(245,208,96,0.9))" }}>{badge.icon}</div>
        <div style={{ fontSize:11, color:"#a8c8a8", fontFamily:"'Cinzel',serif", letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>
          Badge Débloqué
        </div>
        <div style={{
          fontFamily:"'Cinzel',serif", fontSize:"clamp(20px,4vw,34px)", fontWeight:700,
          color:"#f5d060", letterSpacing:2, textTransform:"uppercase",
          textShadow:"0 0 30px rgba(245,208,96,0.9), 0 2px 8px rgba(0,0,0,0.8)",
          marginBottom:8,
        }}>{badge.name}</div>
        <div style={{
          fontFamily:"'Crimson Pro',serif", fontSize:15, fontStyle:"italic",
          color:"#f5edd8", opacity:0.85,
          textShadow:"0 1px 4px rgba(0,0,0,0.6)",
        }}>{badge.desc}</div>
      </div>
    </div>
  );
}


// ─── FAMILIERS LISTE DUO ─────────────────────────────────────────────────────
function FamiliersDualList({ skyFams, cellFams, onToggleSky, onToggleCell }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [overlay, setOverlay] = useState(null);

  const filtered = FAMILIERS.filter(f => {
    const skyDone = skyFams[f.id], cellDone = cellFams[f.id];
    if (filter === "done") return skyDone || cellDone;
    if (filter === "todo") return !skyDone || !cellDone;
    if (["Drop boss","Échange","Quête","Drop zone"].includes(filter)) return f.how === filter;
    if (search) return f.name.toLowerCase().includes(search.toLowerCase()) || f.fun.toLowerCase().includes(search.toLowerCase()) || f.where.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const handleToggle = (f, player) => {
    if (player === "sky") { const was = skyFams[f.id]; onToggleSky(f.id); if (!was) setOverlay(f); }
    else { const was = cellFams[f.id]; onToggleCell(f.id); if (!was) setOverlay(f); }
  };

  return (
    <div>
      {overlay && <FamilierCatchOverlay familier={overlay} onDone={() => setOverlay(null)} />}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        {[{key:"all",label:"Tous"},{key:"done",label:"✓ Obtenus"},{key:"todo",label:"À trouver"},
          {key:"Échange",label:"Échange"},{key:"Jetons",label:"Jetons Koli"},{key:"Quête",label:"Quête"},{key:"Alliance",label:"Alliance"},
        ].map(f => (
          <button key={f.key} className={`filter-btn${filter===f.key?" active":""}`} onClick={()=>setFilter(f.key)} style={{fontSize:11}}>{f.label}</button>
        ))}
      </div>
      <input className="meta-input" placeholder="🔍 Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12,fontSize:13}} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px", gap:8, padding:"6px 12px", marginBottom:4, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:11, color:C.textDim, fontFamily:"'Cinzel',serif" }}>Familier</div>
        <div style={{ fontSize:11, color:"#2a4a8a", fontFamily:"'Cinzel',serif", textAlign:"center", fontWeight:700 }}>Sky</div>
        <div style={{ fontSize:11, color:"#7a2a1a", fontFamily:"'Cinzel',serif", textAlign:"center", fontWeight:700 }}>Cell</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {filtered.map(f => {
          const sd = skyFams[f.id], cd = cellFams[f.id];
          const cfg = HOW_COLORS[f.how] || HOW_COLORS["Drop zone"];
          const both = sd && cd;
          return (
            <div key={f.id} style={{ display:"grid", gridTemplateColumns:"1fr 52px 52px", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:6, background:both?"#eef4ee":C.bgCard, border:`1px solid ${both?"#4a8a4a":C.borderLight}`, transition:"all 0.12s" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:both?C.textDim:C.textBright, textDecoration:both?"line-through":"none" }}>{f.fun}</span>
                  <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontFamily:"'Cinzel',serif", fontWeight:600 }}>{f.how}</span>
                </div>
                <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic" }}>{f.name} — {f.where}</div>
                {f.req && f.req !== "Aucun" && (
                  <div style={{ fontSize:10, color:"#8a6a30", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                    <span title={`Prérequis pour obtenir ${f.name} :\n${f.req}`} style={{ cursor:"help", borderBottom:"1px dashed #8a6a30" }}>
                      ⚠ {f.req}
                    </span>
                  </div>
                )}
              </div>
              {[{done:sd,color:"#2a4a8a",border:"#4a6a9a",player:"sky"},{done:cd,color:"#7a2a1a",border:"#9a4a2a",player:"cell"}].map(p => (
                <div key={p.player} onClick={() => handleToggle(f,p.player)} style={{ display:"flex", justifyContent:"center", cursor:"pointer" }}>
                  <div style={{ width:26, height:26, borderRadius:5, border:`2px solid ${p.done?p.color:p.border}`, background:p.done?p.color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, transition:"all 0.15s", boxShadow:p.done?`0 0 8px ${p.color}66`:"none" }}>
                    {p.done && <span style={{color:"white"}}>✓</span>}
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

// ─── ANIMATION OBTENTION FAMILIER ────────────────────────────────────────────
function FamilierCatchOverlay({ familier, onDone }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 350);
    const t2 = setTimeout(() => setPhase("out"), 2300);
    const t3 = setTimeout(onDone, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
    const rings = Array.from({ length: 8 }, (_, i) => ({ delay:i*5, r:0, alpha:0.8, color:i%2===0?"#4aaa5a":"#a0d060" }));
    let frame = 0, raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      rings.forEach(ring => {
        if (frame < ring.delay) return;
        ring.r += 5; ring.alpha = Math.max(0, 0.8 - ring.r/300);
        if (ring.alpha <= 0) return;
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI*2);
        ctx.strokeStyle = ring.color; ctx.lineWidth = 2.5; ctx.globalAlpha = ring.alpha; ctx.stroke(); ctx.globalAlpha = 1;
      });
      frame++; if (frame < 100) raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10001, pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"center", opacity:phase==="out"?0:1, transition:phase==="out"?"opacity 0.5s":"opacity 0.25s" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(5,20,5,0.8)", backdropFilter:"blur(3px)" }} />
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
      <div style={{ position:"relative", zIndex:1, textAlign:"center", transform:phase==="in"?"scale(0.7)":"scale(1)", transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ fontSize:64, marginBottom:10, filter:"drop-shadow(0 0 20px rgba(80,200,80,0.7))" }}>🐾</div>
        <div style={{ fontSize:11, color:"#80c880", fontFamily:"'Cinzel',serif", letterSpacing:3, marginBottom:8 }}>FAMILIER OBTENU</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(18px,3.5vw,28px)", fontWeight:700, color:"#c0f0a0", letterSpacing:2, textShadow:"0 0 20px rgba(100,220,80,0.8), 0 2px 6px rgba(0,0,0,0.8)", marginBottom:6 }}>{familier.fun}</div>
        <div style={{ fontSize:14, color:"#a0d080", fontStyle:"italic" }}>{familier.name}</div>
      </div>
    </div>
  );
}

// ─── ENCYCLOPÉDIE ────────────────────────────────────────────────────────────
const BASE = "https://api.dofusdu.de/dofus3/v1/fr";

// ─── BASE DE DONNÉES BOSS (mécaniques vérifiées) ────────────────────────────
const BOSS_DB = [
  { name:"Bouftou Royal",      level:30,  pos:"[2,-34]",    donjon:"Cour du Bouftou Royal",       guide:"https://www.dofuspourlesnoobs.com/cour-du-bouftou-royal.html",
    strat:"Invoque des Bouftous qui le soignent. Tuez les invocations en priorité absolue avant d'attaquer le boss. Ses dégâts augmentent avec ses alliés en vie." },
  { name:"Kankreblath",        level:40,  pos:"[3,-17]",    donjon:"Cache de Kankreblath",        guide:"https://www.dofuspourlesnoobs.com/cache-de-kankreblath.html",
    strat:"Vole des PA aux joueurs adjacents. Gardez vos soigneurs et personnages à PA critiques loin de lui. Ses alliés Kanniboul le soignent — éliminez-les d'abord." },
  { name:"Reine Nyée",         level:90,  pos:"[-6,-15]",   donjon:"Antre de la Reine Nyée",      guide:"https://www.dofuspourlesnoobs.com/antre-de-la-reine-nyeacutee.html",
    strat:"Invulnérable tant que ses larves sont en vie. Tuez TOUTES les larves avant de pouvoir la toucher. Elle pose des pièges au sol — déplacez-vous prudemment." },
  { name:"Dragon Cochon",      level:100, pos:"[-1,33]",    donjon:"Antre du Dragon Cochon",      guide:"https://www.dofuspourlesnoobs.com/antre-du-dragon-cochon.html",
    strat:"Change d'élément dominant à chaque seuil de PV (75%, 50%, 25%). Adaptez votre élément d'attaque à chaque transition. Gardez un soin pour les phases de changement." },
  { name:"Blop Multicolore",   level:120, pos:"[-25,-17]",  donjon:"Antre du Blop Multicolore",   guide:"https://www.dofuspourlesnoobs.com/antre-du-blop-multicolore-royal.html",
    strat:"Possède 100% de résistance dans un élément par tour — l'élément change à chaque tour dans un ordre fixe (Feu → Eau → Terre → Air). Attaquez avec l'élément non résisté." },
  { name:"Chêne Mou",          level:140, pos:"[-14,-13]",  donjon:"Clairière du Chêne Mou",      guide:"https://www.dofuspourlesnoobs.com/clairiegravere-du-checircne-mou.html",
    strat:"Invulnérable à tout sauf au feu. Équipez-vous exclusivement en sorts de feu. Ses racines sur la map soignent le boss si vous marchez dessus — évitez-les." },
  { name:"Kimbo",              level:160, pos:"[-54,16]",   donjon:"Canopée du Kimbo",            guide:"https://www.dofuspourlesnoobs.com/canopeacutee-du-kimbo.html",
    strat:"Se téléporte sur la case d'un joueur à chaque début de tour. Le joueur ciblé reçoit ensuite ses attaques au corps-à-corps. Désignez un tank comme cible permanente et gardez les autres loin." },
  { name:"Bworker",            level:180, pos:"[-15,14]",   donjon:"Grotte du Bworker",           guide:"https://www.dofuspourlesnoobs.com/grotte-du-bworker.html",
    strat:"Immunisé aux dégâts directs. Pour le rendre vulnérable, il faut le faire boire les bières présentes sur la map (le pousser dessus). Plus il boit, plus il est vulnérable mais aussi dangereux." },
  { name:"Korriandre",         level:180, pos:"[-73,-69]",  donjon:"Antre du Korriandre",         guide:"https://www.dofuspourlesnoobs.com/antre-du-korriandre.html",
    strat:"Tous les monstres de la salle partagent leurs PV. Les dégâts infligés à n'importe quel monstre se répartissent sur tous. Ciblez toujours le même monstre pour maximiser l'efficacité." },
  { name:"Merkator",           level:200, pos:"[21,18]",    donjon:"Aquadôme de Merkator",        guide:"https://www.dofuspourlesnoobs.com/aquadocircme-de-merkator.html",
    strat:"Boss ultime. Il est immunisé au début. Des Mékrabes sur la map drainent son énergie — poussez-les ou attirez-les vers lui pour le rendre vulnérable. Plusieurs phases avec recharge d'immunité." },
  { name:"Comte Harebourg",    level:200, pos:"[-61,-79]",  donjon:"Donjon du Comte Harebourg",   guide:"https://www.dofuspourlesnoobs.com/donjon-du-comte-harebourg.html",
    strat:"Boss ultime. Gèle les cases autour de lui. Ses alliés le soignent et le buffent. Éliminez ses gardes rapidement. Résistances très élevées — compo multi-éléments recommandée." },
  { name:"Klime",              level:200, pos:"[-67,-75]",  donjon:"Tréfonds de Frigost",         guide:"https://www.dofuspourlesnoobs.com/les-trefonds-de-frigost.html",
    strat:"Boss ultime. Immunisé aux dégâts directs jusqu'à ce que ses cristaux soient détruits. Il faut détruire les 4 cristaux simultanément en un seul tour pour déclencher sa vulnérabilité, puis burster immédiatement." },
  { name:"Sylargh",            level:200, pos:"[-67,-75]",  donjon:"Tour de Sylargh",             guide:"https://www.dofuspourlesnoobs.com/tour-de-sylargh.html",
    strat:"Boss ultime. Absorbe un élément différent chaque tour (ordre cyclique). Variez absolument vos éléments. Ses tentacules drainent des PA — gardez des sorts de contre-attaque." },
  { name:"Nileza",             level:200, pos:"[-67,-75]",  donjon:"Palais de Nileza",            guide:"https://www.dofuspourlesnoobs.com/palais-de-nileza.html",
    strat:"Boss ultime. Téléporte les joueurs aléatoirement à chaque tour. Impossible de rester groupé — coordonnez les attaques à distance. Ses alliés Nilezins amplifient ses dégâts." },
  { name:"Bethel",             level:200, pos:"[20,18]",    donjon:"Donjon de Bethel",            guide:"https://www.dofuspourlesnoobs.com/donjon-de-bethel.html",
    strat:"Boss ultime. Mécaniques complexes basées sur les cases lumineuses. Positionner les joueurs sur les bonnes cases pour amplifier les dégâts. Ne jamais être en ligne directe avec lui sous peine de subir sa charge." },
];



function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const panelRef = useRef(null);

  // Ferme au clic extérieur
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = async (q) => {
    if (!q || q.trim().length < 2) { setResults(null); return; }
    setLoading(true); setSelected(null); setDetail(null);
    const ql = q.trim().toLowerCase();
    try {
      // Recherche locale boss
      const bosses = BOSS_DB.filter(b =>
        b.name.toLowerCase().includes(ql) || b.donjon.toLowerCase().includes(ql)
      ).map(b => ({ ...b, _kind:"boss" }));

      // Recherche API équipements
      const res = await fetch(`${BASE}/items/equipment/search?query=${encodeURIComponent(q.trim())}&limit=15`);
      const eqData = res.ok ? await res.json() : [];
      const items = (Array.isArray(eqData) ? eqData : eqData.data || []).map(i => ({ ...i, _kind:"equipment" }));

      setResults({ items, bosses, all: [...bosses, ...items] });
    } catch(e) {
      const ql2 = q.trim().toLowerCase();
      const bosses = BOSS_DB.filter(b => b.name.toLowerCase().includes(ql2) || b.donjon.toLowerCase().includes(ql2)).map(b => ({ ...b, _kind:"boss" }));
      setResults({ items:[], bosses, all:bosses, error: bosses.length === 0 });
    }
    setLoading(false);
  };

  const loadDetail = async (item) => {
    setSelected(item);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const id = item.ankama_id;
      const isMonster = item.type?.name_id === "monsters" || item.type?.id === undefined && item._kind === "monster";
      let res = isMonster
        ? await fetch(`https://api.dofusdu.de/dofus3/v1/fr/monsters/${id}`)
        : await fetch(`https://api.dofusdu.de/dofus3/v1/fr/items/equipment/${id}`);
      if (!res.ok && !isMonster) res = await fetch(`https://api.dofusdu.de/dofus3/v1/fr/items/weapons/${id}`);
      if (!res.ok) throw new Error();
      const d = await res.json();

      // Charger les noms des ressources de la recette en parallèle
      if (d.recipe?.length > 0) {
        const names = await Promise.all(
          d.recipe.map(r =>
            fetch(`https://api.dofusdu.de/dofus3/v1/fr/items/resources/${r.item_ankama_id}`)
              .then(res => res.ok ? res.json() : null)
              .then(data => ({ id: r.item_ankama_id, name: data?.name || `#${r.item_ankama_id}`, img: data?.image_urls?.icon || null }))
              .catch(() => ({ id: r.item_ankama_id, name: `#${r.item_ankama_id}`, img: null }))
          )
        );
        d.recipe = d.recipe.map((r, i) => ({ ...r, _name: names[i]?.name, _img: names[i]?.img }));
      }

      setDetail(d);
    } catch(e) { setDetail({ error:true }); }
    setLoadingDetail(false);
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const getName = (r) => typeof r.name === "object" ? r.name?.fr || "" : r.name || "";
  const getTypeName = (r) => r.type?.name_id === "monsters" ? "Monstre" : (r.type?.name_id || "").replace("items-","").replace("-","  ").replace(/^\w/,c=>c.toUpperCase());

  return (
    <div ref={panelRef} style={{ position:"relative", maxWidth:600, margin:"0 auto", padding:"0 20px 12px" }}>
      {/* Barre */}
      <div style={{ position:"relative" }}>
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => results && setOpen(true)}
          placeholder="🔍 Rechercher un item, monstre, boss…"
          style={{
            width:"100%", background:"rgba(255,255,255,0.12)", border:`1px solid rgba(200,160,80,0.4)`,
            borderRadius:6, padding:"8px 36px 8px 14px", color:"#f5edd8",
            fontFamily:"'Crimson Pro',serif", fontSize:14, outline:"none",
          }}
        />
        {loading && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#d4b070", fontSize:13 }}>⟳</span>}
        {query && !loading && <span onClick={()=>{setQuery(""); setResults(null); setOpen(false);}} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#d4b070", cursor:"pointer", fontSize:13 }}>✕</span>}
      </div>

      {/* Panel résultats */}
      {open && results && (
        <div style={{
          position:"absolute", top:"100%", left:20, right:20, zIndex:2000,
          background:C.bgPanel, border:`2px solid ${C.panelBorder}`,
          borderRadius:8, boxShadow:"0 8px 32px rgba(42,26,8,0.4)",
          maxHeight:480, overflow:"auto",
        }}>
          {results.all.length === 0 && !results.error && (
            <div style={{ padding:"16px", textAlign:"center", color:C.textDim, fontStyle:"italic", fontSize:13 }}>Aucun résultat</div>
          )}
          {results.error && (
            <div style={{ padding:"16px", textAlign:"center", color:"#8a2a2a", fontSize:13 }}>Erreur de connexion</div>
          )}

          {/* Liste */}
          {!detail && results.all.map((r, i) => {
            const isBoss = r._kind === "boss";
            const isEquip = r._kind === "equipment";
            const name = isBoss ? r.name : (typeof r.name === "object" ? r.name?.fr || "" : r.name || "");
            return (
              <div key={i} onClick={() => isBoss ? setDetail({ _isBoss:true, ...r }) : loadDetail(r)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
                cursor:"pointer", borderBottom:`1px solid ${C.border}`,
                background: selected?.name === r.name ? "rgba(139,94,26,0.1)" : "transparent",
                transition:"background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(139,94,26,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                <div style={{ width:28, height:28, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isBoss ? <span style={{ fontSize:18 }}>💀</span>
                  : r.image_urls?.icon ? <img src={r.image_urls.icon} alt="" style={{ width:28, height:28, objectFit:"contain", imageRendering:"pixelated" }} onError={e=>e.target.style.display="none"} />
                  : <span style={{ fontSize:16 }}>🗡️</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.textBright, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</div>
                  <div style={{ display:"flex", gap:5, alignItems:"center", marginTop:1 }}>
                    <span style={{ fontSize:9, padding:"1px 5px", borderRadius:8, fontFamily:"'Cinzel',serif", fontWeight:600,
                      background: isBoss ? "rgba(138,26,26,0.15)" : "rgba(42,74,138,0.12)",
                      color: isBoss ? "#8a1a1a" : "#2a4a8a",
                    }}>
                      {isBoss ? "Boss" : "Équipement"}
                    </span>
                    {isBoss && <span style={{ fontSize:10, color:C.textDim }}>Niv. {r.level} — {r.donjon}</span>}
                    {!isBoss && r.level && <span style={{ fontSize:10, color:C.textDim }}>Niv. {r.level}</span>}
                  </div>
                </div>
                <span style={{ fontSize:11, color:C.textDim }}>›</span>
              </div>
            );
          })}

          {/* Fiche boss local */}
          {detail?._isBoss && (
            <div style={{ padding:"16px" }}>
              <button onClick={() => { setDetail(null); setSelected(null); }} style={{ background:"none", border:"none", color:C.gold, cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:11, marginBottom:12 }}>← Retour</button>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                <span style={{ fontSize:40 }}>💀</span>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, color:C.gold }}>{detail.name}</div>
                  <div style={{ display:"flex", gap:6, marginTop:4 }}>
                    <span style={{ fontSize:10, padding:"1px 7px", borderRadius:10, background:"rgba(138,26,26,0.15)", color:"#8a1a1a", fontFamily:"'Cinzel',serif" }}>Boss</span>
                    <span style={{ fontSize:10, color:C.textDim }}>Niv. {detail.level}</span>
                    <span style={{ fontSize:10, color:C.textDim }}>{detail.pos}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize:12, color:C.textDim, marginBottom:10, padding:"4px 8px", background:"rgba(139,94,26,0.05)", borderRadius:4, fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:0.5 }}>
                📍 {detail.donjon}
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Stratégie</div>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.6, padding:"8px 10px", background:"rgba(139,94,26,0.05)", borderRadius:5, borderLeft:`3px solid ${C.goldDim}` }}>
                {detail.strat}
              </div>
              <a href={detail.guide || `https://www.dofuspourlesnoobs.com/donjons.html`} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-block", marginTop:10, fontSize:11, color:C.gold, fontFamily:"'Cinzel',serif", textDecoration:"none", borderBottom:`1px solid ${C.goldDim}` }}>
                Guide complet sur DofusPourLesNoobs →
              </a>
            </div>
          )}

          {/* Fiche item API */}
          {detail && !detail.error && !detail._isBoss && (
            <div style={{ padding:"16px" }}>
              <button onClick={() => { setDetail(null); setSelected(null); }} style={{ background:"none", border:"none", color:C.gold, cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:11, marginBottom:12 }}>← Retour</button>
              <div style={{ display:"flex", gap:12, marginBottom:12 }}>
                {(detail.image_urls?.sd || detail.image_urls?.icon) && <img src={detail.image_urls?.sd || detail.image_urls?.icon} style={{ width:52, height:52, objectFit:"contain", imageRendering:"pixelated" }} onError={e=>e.target.style.display="none"} alt="" />}
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, color:C.gold }}>
                    {typeof detail.name === "object" ? detail.name?.fr || "" : detail.name || ""}
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                    {detail.type && <span style={{ fontSize:10, padding:"1px 7px", borderRadius:10, background:"rgba(139,94,26,0.15)", color:C.gold, fontFamily:"'Cinzel',serif" }}>
                      {typeof detail.type === "object" ? detail.type?.name_fr || detail.type?.name?.fr || "Item" : detail.type}
                    </span>}
                    {detail.level && <span style={{ fontSize:10, color:C.textDim }}>Niv. {detail.level}</span>}
                  </div>
                </div>
              </div>
              {detail.description && <div style={{ fontSize:12, color:C.textDim, fontStyle:"italic", marginBottom:10, lineHeight:1.5, padding:"6px 10px", background:"rgba(139,94,26,0.05)", borderRadius:5, borderLeft:`3px solid ${C.goldDim}` }}>{typeof detail.description==="object"?detail.description?.fr||"":detail.description}</div>}
              {detail.effects?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Effets</div>
                  {detail.effects.map((e,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"3px 8px", background:"rgba(139,94,26,0.05)", borderRadius:3, fontSize:12, marginBottom:2 }}>
                      <span style={{ color:C.text }}>{typeof e.type==="object"?e.type?.name||e.type?.name_fr||"Effet":e.type||"Effet"}</span>
                      <span style={{ color:e.int_minimum>=0?"#2a6a2a":"#8a2a2a", fontWeight:700 }}>
                        {e.int_minimum===e.int_maximum ? (e.int_minimum>0?`+${e.int_minimum}`:e.int_minimum) : `${e.int_minimum>0?"+":""}${e.int_minimum} à ${e.int_maximum>0?"+":""}${e.int_maximum}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {detail.resistances && Object.keys(detail.resistances).length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Résistances</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:3 }}>
                    {Object.entries(detail.resistances).map(([k,v]) => (
                      <div key={k} style={{ textAlign:"center", padding:"4px 2px", background:"rgba(139,94,26,0.05)", borderRadius:3 }}>
                        <div style={{ fontSize:9, color:C.textDim, textTransform:"capitalize" }}>{k}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:v>0?"#2a6a2a":v<0?"#8a2a2a":C.textDim }}>{v>0?`+${v}`:v}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detail.drops?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Drops</div>
                  {detail.drops.slice(0,6).map((d,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"3px 8px", background:"rgba(139,94,26,0.05)", borderRadius:3, fontSize:11, marginBottom:2 }}>
                      <span style={{ color:C.text }}>{typeof d.item?.name==="object"?d.item.name?.fr||"":d.item?.name||"Item"}</span>
                      <span style={{ color:C.textDim }}>{d.drop_chances?`${d.drop_chances}%`:"?"}</span>
                    </div>
                  ))}
                </div>
              )}
              {detail.recipe?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Recette</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {detail.recipe.map((r,i) => (
                        <a key={i} href={`https://dofusdb.fr/fr/database/item/${r.item_ankama_id}`} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 8px", background:"rgba(139,94,26,0.05)", borderRadius:3, fontSize:11, textDecoration:"none", border:`1px solid ${C.borderLight}`, transition:"border-color 0.12s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.goldDim}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderLight}
                      >
                        {r._img && <img src={r._img} style={{ width:18, height:18, imageRendering:"pixelated", flexShrink:0 }} alt="" onError={e=>e.target.style.display="none"} />}
                        <span style={{ color:C.text }}>{r.quantity}× {r._name || `#${r.item_ankama_id}`}</span>
                        <span style={{ color:C.goldDim, marginLeft:"auto", fontSize:10 }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <a href={`https://dofusdb.fr/fr/database/${selected?.type?.name_id==="monsters"?"monster":"item"}/${selected?.ankama_id}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize:11, color:C.gold, fontFamily:"'Cinzel',serif", textDecoration:"none", borderBottom:`1px solid ${C.goldDim}` }}>
                Voir sur DofusDB →
              </a>
            </div>
          )}
          {loadingDetail && <div style={{ padding:"20px", textAlign:"center", color:C.textDim, fontSize:13 }}>Chargement…</div>}
          {detail?.error && <div style={{ padding:"16px", textAlign:"center", color:"#8a2a2a", fontSize:13 }}>Impossible de charger les détails.</div>}
        </div>
      )}
    </div>
  );
}

function AlmanaxWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    fetch(`https://api.dofusdu.de/dofus3/v1/fr/almanax/${dateStr}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding:"8px 16px", textAlign:"center", color:"rgba(245,237,216,0.5)", fontSize:12, fontStyle:"italic" }}>
      Chargement de l'Almanax…
    </div>
  );
  if (!data) return null;

  const bonus = data.bonus?.description || data.bonus?.type?.description || "—";
  const offrande = data.tribute?.item?.name || "—";
  const qty = data.tribute?.quantity || 1;
  const kamas = data.reward_kamas ? `${data.reward_kamas.toLocaleString()} kamas` : "";

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:20, flexWrap:"wrap",
      background:"rgba(0,0,0,0.2)", borderTop:"1px solid rgba(200,146,42,0.2)",
      padding:"8px 20px",
    }}>
      <span style={{ color:"#d4b070", fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, textTransform:"uppercase" }}>☀ Almanax</span>
      <span style={{ fontSize:12, color:"#f5edd8" }}>
        <span style={{ color:"#a8c8a8" }}>Offrande : </span>
        <strong>{qty}× {offrande}</strong>
      </span>
      <span style={{ fontSize:12, color:"#f5edd8" }}>
        <span style={{ color:"#a8c8a8" }}>Bonus : </span>
        <span style={{ fontStyle:"italic" }}>{bonus}</span>
      </span>
      {kamas && <span style={{ fontSize:12, color:"#e8c870" }}>💰 {kamas}</span>}
    </div>
  );
}

function RecapCard({ label, meta, color, colorLight, border }) {
  const persos = meta?.persos || [];
  const kamas = meta?.kamas || 0;
  const succes = meta?.succes || 0;
  const fmt = v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v);
  const displayed = persos.length > 0 ? persos.slice(0,2) : [{name:"Perso 1"},{name:"Perso 2"}];
  return (
    <div style={{
      width:140, flexShrink:0, position:"sticky", top:20,
      background:colorLight, border:`2px solid ${border}`, borderRadius:8,
      padding:"10px 12px", boxShadow:"0 2px 8px rgba(90,58,16,0.15)", fontSize:12,
    }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color, marginBottom:8, letterSpacing:1, borderBottom:`1px solid ${border}55`, paddingBottom:5, textAlign:"center" }}>
        ◈ {label}
      </div>
      {displayed.map((perso, i) => (
        <div key={i} style={{ fontSize:11, color:C.text, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:4 }}>
          ⚔ {perso.name || `Perso ${i+1}`}
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
  const [skyDailyDone, setSkyDailyDone] = useState({});
  const [cellDailyDone, setCellDailyDone] = useState({});
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
      onValue(ref(db,"notes"),      s => { if(s.exists()) setNotes(s.val()); }),
      onValue(ref(db,"skyDaily"),   s => { if(s.exists()) setSkyDailyDone(s.val()); }),
      onValue(ref(db,"cellDaily"),  s => { if(s.exists()) setCellDailyDone(s.val()); }),
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

  const toggleSkyDaily  = (key, val) => { const n={...skyDailyDone, [key]:val};  setSkyDailyDone(n);  set(ref(db,"skyDaily"),n); };
  const toggleCellDaily = (key, val) => { const n={...cellDailyDone,[key]:val};  setCellDailyDone(n); set(ref(db,"cellDaily"),n); };

  const skyDailyTotal  = Object.values(skyDailyDone).filter(Boolean).length;
  const cellDailyTotal = Object.values(cellDailyDone).filter(Boolean).length;

  const sendNote = (text, author) => {
    push(ref(db,"notes"), { text, author, ts: Date.now() });
    showToast(`✦ Note de ${author} envoyée`);
  };

  const NAV_TABS = [
    { key:"familiers", label:"🐾 Familiers", active:{ bg:"#eaf4ea", border:"#4a8a4a", color:"#2a6a2a" } },
    { key:"chasse",    label:"🗺 Chasse",    active:{ bg:"#f8f4e8", border:"#a08020",  color:"#6a4a10" } },
    { key:"stuff",     label:"⚔ Stuff",     active:{ bg:"#f0eaf8", border:"#6a4a8a",  color:"#4a2a6a" } },
  ];

  const duoAll    = DUO_DATA.flatMap(c=>c.objectives);
  const skydroAll = skydroData.flatMap(c=>c.objectives);
  const cellAll   = cellData.flatMap(c=>c.objectives);
  const PLAYERS = [
    { key:"skydro", label:"Sky",  color:"#2a4a8a" },
    { key:"cell",   label:"Cell", color:"#7a2a1a" },
  ];

  // ── Badge unlock detection ──
  const [badgeOverlay, setBadgeOverlay] = useState(null);
  const [catOverlay, setCatOverlay] = useState(null);
  const [shownBadges, setShownBadges] = useState(new Set());

  useEffect(() => {
    const allBadges = [
      ...BADGES.map(b => ({ ...b, unlocked: b.check(skydroDone, skydroMeta, duoDone) || b.check(cellDone, cellMeta, duoDone) })),
      ...DAILY_BADGES.map(b => ({ ...b, unlocked: skyDailyTotal >= b.threshold || cellDailyTotal >= b.threshold })),
      ...FAMILIER_BADGES.map(b => ({
        ...b,
        unlocked: Object.values(skydroMeta?.familiers||{}).filter(Boolean).length >= b.threshold ||
                  Object.values(cellMeta?.familiers||{}).filter(Boolean).length >= b.threshold,
      })),
    ];
    allBadges.forEach(b => {
      if (b.unlocked && !shownBadges.has(b.id)) {
        setShownBadges(prev => new Set([...prev, b.id]));
        // Décale légèrement les badges pour éviter le chevauchement
        setTimeout(() => setBadgeOverlay(b), shownBadges.size * 200);
      }
    });
  }, [skydroDone, cellDone, skydroMeta, cellMeta, duoDone, skyDailyTotal, cellDailyTotal]);

  // Stats cliquables pour naviguer
  const NAV_STATS = [
    { key:"duo",    label:"Duo",  done:duoAll.filter(o=>duoDone[o.id]).length,       total:duoAll.length,    color:"#f5e8a0", bg:"rgba(255,240,100,0.15)", border:"rgba(255,220,80,0.4)" },
    { key:"skydro", label:"Sky",  done:skydroAll.filter(o=>skydroDone[o.id]).length, total:skydroAll.length, color:"#a8c8f8", bg:"rgba(74,120,200,0.2)",  border:"rgba(100,160,255,0.4)" },
    { key:"cell",   label:"Cell", done:cellAll.filter(o=>cellDone[o.id]).length,     total:cellAll.length,   color:"#f8b8a0", bg:"rgba(200,80,50,0.2)",   border:"rgba(255,120,80,0.4)" },
  ];

  return (
    <div className="dofus-app">
      <style>{styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      {badgeOverlay && <BadgeUnlockOverlay badge={badgeOverlay} onDone={() => setBadgeOverlay(null)} />}

      {/* HEADER */}
      <div style={{ background:`linear-gradient(180deg, ${C.headerBg} 0%, ${C.headerBg2} 100%)`, padding:"16px 20px 0", textAlign:"center", boxShadow:"0 3px 10px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize:9, color:"#e8c870", letterSpacing:5, fontFamily:"'Cinzel',serif", marginBottom:2, textTransform:"uppercase" }}>Monde des Douze</div>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(18px,3vw,26px)", fontWeight:700, color:"#fff8e8", letterSpacing:2, textShadow:"0 2px 6px rgba(0,0,0,0.7)", margin:"0 0 2px" }}>
          Carnet d'Aventure
        </h1>
        <div style={{ color:"#f0d090", fontSize:12, fontStyle:"italic", marginBottom:4 }}>Sky & Cell</div>
        <div style={{ fontSize:10, color:synced?"#90e090":"#e8d060", marginBottom:10, letterSpacing:1 }}>{synced?"✦ Synchronisé":"⟳ Connexion…"}</div>

        {/* Stats cliquables Duo / Sky / Cell */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          {NAV_STATS.map(s => (
            <div key={s.key} onClick={() => setTab(s.key)} style={{
              padding:"6px 16px", textAlign:"center", minWidth:70,
              background: tab===s.key ? s.bg : "rgba(255,255,255,0.06)",
              border:`1px solid ${tab===s.key ? s.border : "rgba(255,255,255,0.15)"}`,
              borderRadius:6, cursor:"pointer", transition:"all 0.15s",
            }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:700, color:s.color, textShadow:"0 1px 3px rgba(0,0,0,0.5)" }}>
                {Math.round(s.done/s.total*100)}%
              </div>
              <div style={{ fontSize:9, color:"rgba(255,240,200,0.85)", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Onglets Familiers / Chasse / Stuff */}
        <div style={{ display:"flex", justifyContent:"center", gap:4 }}>
          {NAV_TABS.map(t => {
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
        <AlmanaxWidget />
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
            {tab==="familiers" && (
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:16, textAlign:"center" }}>
                  🐾 Collection de Familiers
                </div>
                {/* Barres de progression des deux joueurs */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    { label:"Sky",  fams:skydroMeta?.familiers||{}, color:"#2a4a8a", border:"#4a6a9a", bg:"#e8f0f8" },
                    { label:"Cell", fams:cellMeta?.familiers||{},   color:"#7a2a1a", border:"#9a4a2a", bg:"#f8ede8" },
                  ].map(p => {
                    const cnt = Object.values(p.fams).filter(Boolean).length;
                    const pct = Math.round(cnt/FAMILIERS.length*100);
                    return (
                      <div key={p.label} style={{ background:p.bg, border:`1px solid ${p.border}`, borderRadius:6, padding:"10px 14px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:p.color, fontWeight:700 }}>◈ {p.label}</span>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:p.color }}>{cnt}/{FAMILIERS.length}</span>
                        </div>
                        <div className="prog-track" style={{ height:6 }}>
                          <div className="prog-fill" style={{ width:`${pct}%`, background:p.color }} />
                        </div>
                        {/* Badges familiers */}
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:8 }}>
                          {FAMILIER_BADGES.map(b => {
                            const unlocked = cnt >= b.threshold;
                            return (
                              <div key={b.id} title={b.desc} style={{
                                fontSize:10, padding:"2px 7px", borderRadius:10,
                                background: unlocked ? `${p.color}18` : "transparent",
                                border:`1px solid ${unlocked ? p.border : C.borderLight}`,
                                color: unlocked ? p.color : C.textDim,
                                fontFamily:"'Cinzel',serif",
                                filter: unlocked ? "none" : "grayscale(1)", opacity: unlocked ? 1 : 0.4,
                              }}>
                                {b.icon} {b.name}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Liste des familiers avec 2 colonnes de coches */}
                <FamiliersDualList
                  skyFams={skydroMeta?.familiers||{}}
                  cellFams={cellMeta?.familiers||{}}
                  onToggleSky={id => {
                    const cur = skydroMeta?.familiers||{};
                    updateSkydroMeta({...skydroMeta, familiers:{...cur,[id]:!cur[id]}});
                  }}
                  onToggleCell={id => {
                    const cur = cellMeta?.familiers||{};
                    updateCellMeta({...cellMeta, familiers:{...cur,[id]:!cur[id]}});
                  }}
                />
              </div>
            )}
            {tab==="chasse" && (
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12, textAlign:"center" }}>
                  🗺 Résolveur de Chasse aux Trésors
                </div>
                <div style={{ fontSize:13, color:C.textDim, fontStyle:"italic", textAlign:"center", marginBottom:16 }}>
                  Outil DofusDB — sélectionne ton indice sur la carte pour trouver la prochaine étape
                </div>
                <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${C.border}`, background:"#fff" }}>
                  <iframe
                    src="https://dofusdb.fr/fr/tools/treasure-hunt"
                    style={{ width:"100%", height:"75vh", border:"none", display:"block" }}
                    title="Résolveur de chasse aux trésors DofusDB"
                    loading="lazy"
                  />
                </div>
                <div style={{ fontSize:11, color:C.textDim, textAlign:"center", marginTop:8, fontStyle:"italic" }}>
                  Si l'outil ne charge pas, ouvre-le directement sur{" "}
                  <a href="https://dofusdb.fr/fr/tools/treasure-hunt" target="_blank" rel="noopener noreferrer" style={{ color:C.gold }}>dofusdb.fr</a>
                </div>
              </div>
            )}
            {tab==="stuff" && <StuffTab db={db} skydroMeta={skydroMeta} cellMeta={cellMeta} />}
          </div>
          {tab==="skydro" && (
            <DailyQuestsSection
              playerLabel="Sky" playerColor="#2a4a8a" playerBorder="#4a6a9a" playerBg="#e8f0f8"
              level={skydroMeta?.persos?.[0]?.level}
              dailyDone={skyDailyDone} onToggle={toggleSkyDaily}
              totalDone={skyDailyTotal}
            />
          )}
          {tab==="cell" && (
            <DailyQuestsSection
              playerLabel="Cell" playerColor="#7a2a1a" playerBorder="#9a4a2a" playerBg="#f8ede8"
              level={cellMeta?.persos?.[0]?.level}
              dailyDone={cellDailyDone} onToggle={toggleCellDaily}
              totalDone={cellDailyTotal}
            />
          )}
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
