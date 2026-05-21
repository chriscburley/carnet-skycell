import { useState, useEffect, useRef } from "react";
import { ref, onValue, set } from "firebase/database";

const BASE = "https://api.dofusdu.de/dofus3/v1/fr";

const SLOTS = [
  { id:"hat",    label:"Chapeau",       types:["Chapeau"],                                                    emoji:"🎩" },
  { id:"amulet", label:"Amulette",      types:["Amulette"],                                                   emoji:"📿" },
  { id:"ring1",  label:"Anneau 1",      types:["Anneau"],                                                     emoji:"💍" },
  { id:"ring2",  label:"Anneau 2",      types:["Anneau"],                                                     emoji:"💍" },
  { id:"cloak",  label:"Cape",          types:["Cape"],                                                       emoji:"🧣" },
  { id:"belt",   label:"Ceinture",      types:["Ceinture"],                                                   emoji:"👑" },
  { id:"boots",  label:"Bottes",        types:["Bottes"],                                                     emoji:"👢" },
  { id:"weapon", label:"Arme",          types:["Épée","Baguette","Arc","Dague","Bâton","Marteau","Hache","Pelle","Faux","Masse","Outil","Lance","Pioche"], emoji:"⚔️" },
  { id:"shield", label:"Bouclier",      types:["Bouclier"],                                                   emoji:"🛡️" },
  { id:"slot1",  label:"Dofus/Trophée", types:["Dofus","Dofawa","Trophée"],                                   emoji:"🥚" },
  { id:"slot2",  label:"Dofus/Trophée", types:["Dofus","Dofawa","Trophée"],                                   emoji:"🥚" },
  { id:"slot3",  label:"Dofus/Trophée", types:["Dofus","Dofawa","Trophée"],                                   emoji:"🥚" },
  { id:"slot4",  label:"Dofus/Trophée", types:["Dofus","Dofawa","Trophée"],                                   emoji:"🥚" },
  { id:"slot5",  label:"Dofus/Trophée", types:["Dofus","Dofawa","Trophée"],                                   emoji:"🥚" },
  { id:"slot6",  label:"Dofus/Trophée", types:["Dofus","Dofawa","Trophée"],                                   emoji:"🥚" },
];

const SLOT_LAYOUT = [
  ["hat"],
  ["amulet","ring1","ring2"],
  ["cloak","weapon","shield"],
  ["belt"],
  ["boots"],
  ["slot1","slot2","slot3","slot4","slot5","slot6"],
];

const C = {
  bgCard:"#fdf6e8", bgPanel:"#f5edd8", border:"#d4b87a", borderLight:"#e8d4a0",
  gold:"#8b5e1a", goldDim:"#c8a060", text:"#2a1a08", textDim:"#6b4e28", textBright:"#1a0e04",
};

const PLAYERS = [
  { key:"sky",  label:"Sky",  color:"#2a4a8a", light:"#e8f0f8", border:"#4a6a9a" },
  { key:"cell", label:"Cell", color:"#7a2a1a", light:"#f8ede8", border:"#9a4a2a" },
];

// ─── STAT CALC ────────────────────────────────────────────────────────────────
const STAT_KEYS = [
  { key:"pa",        label:"PA",     emoji:"⭐", effectIds:[160] },
  { key:"pm",        label:"PM",     emoji:"👢", effectIds:[174] },
  { key:"po",        label:"PO",     emoji:"👁️", effectIds:[176] },
  { key:"vita",      label:"Vita",   emoji:"❤️", effectIds:[110] },
  { key:"force",     label:"Force",  emoji:"🌍", effectIds:[118] },
  { key:"intel",     label:"Intel",  emoji:"🔥", effectIds:[122] },
  { key:"chance",    label:"Chance", emoji:"💧", effectIds:[120] },
  { key:"agil",      label:"Agilité",emoji:"💨", effectIds:[119] },
  { key:"sagesse",   label:"Sagesse",emoji:"📖", effectIds:[124] },
  { key:"dmgFeu",    label:"Dmg🔥",  emoji:"🔥", effectIds:[96,104] },
  { key:"dmgEau",    label:"Dmg💧",  emoji:"💧", effectIds:[97,101] },
  { key:"dmgTerre",  label:"Dmg🌍",  emoji:"🌍", effectIds:[98,102] },
  { key:"dmgAir",    label:"Dmg💨",  emoji:"💨", effectIds:[99,103] },
  { key:"resFeu",    label:"Rés🔥",  emoji:"🔥", effectIds:[84,88] },
  { key:"resEau",    label:"Rés💧",  emoji:"💧", effectIds:[83,87] },
  { key:"resTerre",  label:"Rés🌍",  emoji:"🌍", effectIds:[82,86] },
  { key:"resAir",    label:"Rés💨",  emoji:"💨", effectIds:[81,85] },
];

function calcStats(stuff) {
  const totals = {};
  STAT_KEYS.forEach(s => { totals[s.key] = 0; });
  Object.values(stuff).filter(Boolean).forEach(item => {
    (item.effects || []).forEach(eff => {
      const effId = eff.effect_id || eff.effectId || (eff.type?.id);
      const val = eff.int_maximum ?? eff.diceSide ?? eff.value ?? 0;
      STAT_KEYS.forEach(s => {
        if (s.effectIds.includes(effId)) totals[s.key] += val;
      });
    });
  });
  return totals;
}

// ─── ITEM SEARCH ──────────────────────────────────────────────────────────────
function ItemSearch({ onSelect, slotTypes }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const debRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const search = async (query) => {
    if (!query || query.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/items/equipment/search?query=${encodeURIComponent(query.trim())}&limit=20`);
      const data = res.ok ? await res.json() : [];
      const arr = Array.isArray(data) ? data : data.data || [];
      const filtered = slotTypes
        ? arr.filter(i => {
            const t = typeof i.type === "object" ? i.type?.name || "" : i.type || "";
            return slotTypes.some(st => t.toLowerCase().includes(st.toLowerCase()));
          })
        : arr;
      setResults(filtered);
      setOpen(true);
    } catch(e) { setResults([]); }
    setLoading(false);
  };

  const handleInput = (e) => {
    const v = e.target.value; setQ(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => search(v), 350);
  };

  const select = (item) => { onSelect(item); setQ(""); setResults([]); setOpen(false); };

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <input value={q} onChange={handleInput} onFocus={() => results.length && setOpen(true)}
        placeholder="🔍 Rechercher…"
        style={{ width:"100%", padding:"5px 8px", background:"white", border:`1px solid ${C.border}`, borderRadius:4, fontFamily:"Georgia,serif", fontSize:12, color:C.text, outline:"none" }}
      />
      {loading && <span style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.textDim }}>⟳</span>}
      {open && results.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:2000, background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:5, boxShadow:"0 4px 16px rgba(42,26,8,0.2)", maxHeight:180, overflowY:"auto" }}>
          {results.map((r, i) => {
            const name = typeof r.name === "object" ? r.name?.fr || "" : r.name || "";
            const type = typeof r.type === "object" ? r.type?.name || "" : r.type || "";
            return (
              <div key={i} onClick={() => select(r)} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", cursor:"pointer", borderBottom:`1px solid ${C.borderLight}` }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(139,94,26,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {r.image_urls?.icon && <img src={r.image_urls.icon} style={{ width:20, height:20, imageRendering:"pixelated" }} alt="" onError={e=>e.target.style.display="none"} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</div>
                  <div style={{ fontSize:9, color:C.textDim }}>{type}{r.level ? ` — Niv. ${r.level}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SLOT BOX ─────────────────────────────────────────────────────────────────
function SlotBox({ slot, item, onSearch, onRemove }) {
  const [hover, setHover] = useState(false);
  const img = item?.image_urls?.icon;
  const name = item ? (typeof item.name === "object" ? item.name?.fr || "" : item.name || "") : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <div onClick={onSearch} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} title={name || slot.label}
        style={{ width:44, height:44, borderRadius:6, cursor:"pointer", background:item?"white":"rgba(139,94,26,0.06)", border:`2px solid ${item?C.goldDim:C.borderLight}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", transition:"all 0.15s", boxShadow:hover?"0 0 6px rgba(139,94,26,0.3)":"none" }}
      >
        {img ? <img src={img} alt={name} style={{ width:34, height:34, imageRendering:"pixelated" }} onError={e=>e.target.style.display="none"} />
              : <span style={{ fontSize:18, opacity:0.5 }}>{slot.emoji}</span>}
        {item && hover && (
          <div onClick={(e)=>{e.stopPropagation();onRemove();}} style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:"#8a2a2a", color:"white", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>✕</div>
        )}
      </div>
      <div style={{ fontSize:8, color:C.textDim, fontFamily:"'Cinzel',serif", textAlign:"center", maxWidth:46, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {name || slot.label}
      </div>
    </div>
  );
}

// ─── STATS PANEL ─────────────────────────────────────────────────────────────
function StatsPanel({ stuff, color }) {
  const stats = calcStats(stuff);
  const hasAny = Object.values(stats).some(v => v > 0);
  if (!hasAny) return <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic", textAlign:"center", padding:"8px 0" }}>Équipe un item pour voir les stats</div>;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 8px" }}>
      {STAT_KEYS.map(s => stats[s.key] ? (
        <div key={s.key} style={{ display:"flex", justifyContent:"space-between", fontSize:10, padding:"1px 0" }}>
          <span style={{ color:C.textDim }}>{s.emoji} {s.label}</span>
          <span style={{ fontWeight:700, color: stats[s.key] > 0 ? color : "#8a2a2a" }}>{stats[s.key] > 0 ? `+${stats[s.key]}` : stats[s.key]}</span>
        </div>
      ) : null)}
    </div>
  );
}

// ─── PERSO STUFF ─────────────────────────────────────────────────────────────
function PersoStuff({ label, color, light, border, stuff, onUpdate }) {
  const [activeSlot, setActiveSlot] = useState(null);
  const activeSlotObj = activeSlot ? SLOTS.find(s => s.id === activeSlot) : null;

  const handleSelect = async (item) => {
    if (!activeSlot) return;
    try {
      const res = await fetch(`${BASE}/items/equipment/${item.ankama_id}`);
      const full = res.ok ? await res.json() : item;
      onUpdate({ ...stuff, [activeSlot]: full });
    } catch(e) { onUpdate({ ...stuff, [activeSlot]: item }); }
    setActiveSlot(null);
  };

  return (
    <div style={{ background:light, border:`2px solid ${border}`, borderRadius:8, padding:"10px 12px" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color, marginBottom:10, letterSpacing:1, textAlign:"center", borderBottom:`1px solid ${border}44`, paddingBottom:6 }}>
        ◈ {label}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {/* Slots visuels */}
        <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center" }}>
          {SLOT_LAYOUT.map((row, ri) => (
            <div key={ri} style={{ display:"flex", gap:4, justifyContent:"center" }}>
              {row.map(slotId => {
                const slot = SLOTS.find(s => s.id === slotId);
                return (
                  <SlotBox key={slotId} slot={slot} item={stuff[slotId]||null}
                    onSearch={() => setActiveSlot(slotId === activeSlot ? null : slotId)}
                    onRemove={() => { const s={...stuff}; delete s[slotId]; onUpdate(s); }}
                  />
                );
              })}
            </div>
          ))}
          <div style={{ fontSize:9, color:C.textDim, textAlign:"center", marginTop:2 }}>
            {Object.values(stuff).filter(Boolean).length}/{SLOTS.length} slots
          </div>
        </div>
        {/* Stats */}
        <div style={{ flex:1, background:"white", borderRadius:6, border:`1px solid ${border}44`, padding:"8px" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Stats (max)</div>
          <StatsPanel stuff={stuff} color={color} />
        </div>
      </div>
      {/* Recherche conditionnelle */}
      {activeSlot && (
        <div style={{ marginTop:8, padding:"6px 8px", background:"rgba(139,94,26,0.06)", borderRadius:5, border:`1px solid ${C.goldDim}` }}>
          <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>
            Slot : <strong style={{ color:C.gold }}>{activeSlotObj?.label}</strong>
          </div>
          <ItemSearch onSelect={handleSelect} slotTypes={activeSlotObj?.types} />
        </div>
      )}
    </div>
  );
}

// ─── LISTE DE COURSES ─────────────────────────────────────────────────────────
async function fetchRecipeResources(recipe) {
  if (!recipe?.length) return [];
  const results = await Promise.all(
    recipe.map(r =>
      fetch(`${BASE}/items/resources/${r.item_ankama_id}`)
        .then(res => res.ok ? res.json() : null)
        .then(d => d ? { id:r.item_ankama_id, name:d.name||`#${r.item_ankama_id}`, qty:r.quantity, img:d.image_urls?.icon||null } : null)
        .catch(() => null)
    )
  );
  return results.filter(Boolean);
}

function aggregateResources(items) {
  const agg = {};
  items.forEach(item => {
    if (!item?.recipe?.length) return;
    item.recipe.forEach(r => {
      const id = r.item_ankama_id;
      if (!agg[id]) agg[id] = { id, name:`#${id}`, qty:0, img:null, _nameResolved:false };
      agg[id].qty += r.quantity;
      if (item._resolvedRecipe) {
        const found = item._resolvedRecipe.find(rr => rr.id === id);
        if (found) { agg[id].name = found.name; agg[id].img = found.img; }
      }
    });
  });
  return Object.values(agg).sort((a,b) => b.qty - a.qty);
}

function ShoppingColumn({ title, color, items, checked, onCheck }) {
  const resList = aggregateResources(items);
  const done = resList.filter(r => checked[r.id]).length;

  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color, letterSpacing:1, textTransform:"uppercase", marginBottom:8, display:"flex", justifyContent:"space-between" }}>
        <span>{title}</span>
        <span style={{ color:C.textDim }}>{done}/{resList.length}</span>
      </div>
      {resList.length === 0
        ? <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic" }}>Aucune recette</div>
        : resList.map(r => (
          <div key={r.id} onClick={() => onCheck(r.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px", marginBottom:3, borderRadius:4, cursor:"pointer", background:checked[r.id]?"#eef4ee":"white", border:`1px solid ${checked[r.id]?"#4a8a4a":C.borderLight}`, opacity:checked[r.id]?0.65:1, transition:"all 0.1s" }}>
            <div style={{ width:14, height:14, borderRadius:2, border:`1px solid ${checked[r.id]?"#2a6a2a":C.goldDim}`, background:checked[r.id]?"#2a6a2a":"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, flexShrink:0 }}>
              {checked[r.id] && <span style={{ color:"white" }}>✓</span>}
            </div>
            {r.img && <img src={r.img} style={{ width:16, height:16, imageRendering:"pixelated", flexShrink:0 }} alt="" onError={e=>e.target.style.display="none"} />}
            <span style={{ flex:1, fontSize:11, color:C.text, textDecoration:checked[r.id]?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:C.gold, flexShrink:0 }}>×{r.qty}</span>
            <a href={`https://dofusdb.fr/fr/database/item/${r.id}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:9, color:C.goldDim, flexShrink:0 }}>↗</a>
          </div>
        ))
      }
    </div>
  );
}

function ShoppingList({ stuff }) {
  const [checked, setChecked] = useState({});
  const [resolvedStuff, setResolvedStuff] = useState({});
  const [loading, setLoading] = useState(false);

  // Résoudre les noms des ressources
  useEffect(() => {
    const allItems = Object.values(stuff).flat().filter(Boolean);
    if (!allItems.length) { setResolvedStuff({}); return; }
    setLoading(true);
    Promise.all(allItems.map(async item => {
      if (!item?.recipe?.length || item._resolvedRecipe) return item;
      const resolved = await fetchRecipeResources(item.recipe);
      return { ...item, _resolvedRecipe: resolved };
    })).then(resolved => {
      const newStuff = {};
      Object.entries(stuff).forEach(([key, val]) => {
        newStuff[key] = resolved.find(r => r?.ankama_id === val?.ankama_id || r?.id === val?.id) || val;
      });
      setResolvedStuff(newStuff);
      setLoading(false);
    });
  }, [stuff]);

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const skyItems  = [resolvedStuff.sky1, resolvedStuff.sky2].filter(Boolean);
  const cellItems = [resolvedStuff.cell1, resolvedStuff.cell2].filter(Boolean);
  const allItems  = [...skyItems, ...cellItems];

  if (loading) return <div style={{ textAlign:"center", padding:"12px", color:C.textDim, fontSize:12 }}>Chargement des recettes…</div>;

  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
        🛒 Liste de Courses
      </div>
      {/* Sky + Cell côte à côte */}
      <div style={{ display:"flex", gap:16, marginBottom:16 }}>
        <ShoppingColumn title="Sky" color="#2a4a8a" items={skyItems} checked={checked} onCheck={toggle} />
        <div style={{ width:1, background:C.borderLight }} />
        <ShoppingColumn title="Cell" color="#7a2a1a" items={cellItems} checked={checked} onCheck={toggle} />
      </div>
      {/* Liste globale */}
      <div style={{ borderTop:`2px solid ${C.border}`, paddingTop:12 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Globale (tous les 4 persos)</div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {aggregateResources(allItems).map(r => (
            <div key={r.id} onClick={() => toggle(r.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px", borderRadius:4, cursor:"pointer", background:checked[r.id]?"#eef4ee":"white", border:`1px solid ${checked[r.id]?"#4a8a4a":C.borderLight}`, opacity:checked[r.id]?0.65:1, transition:"all 0.1s" }}>
              <div style={{ width:14, height:14, borderRadius:2, border:`1px solid ${checked[r.id]?"#2a6a2a":C.goldDim}`, background:checked[r.id]?"#2a6a2a":"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, flexShrink:0 }}>
                {checked[r.id] && <span style={{ color:"white" }}>✓</span>}
              </div>
              {r.img && <img src={r.img} style={{ width:16, height:16, imageRendering:"pixelated", flexShrink:0 }} alt="" onError={e=>e.target.style.display="none"} />}
              <span style={{ flex:1, fontSize:11, color:C.text, textDecoration:checked[r.id]?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:C.gold, flexShrink:0 }}>×{r.qty}</span>
              <a href={`https://dofusdb.fr/fr/database/item/${r.id}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:9, color:C.goldDim, flexShrink:0 }}>↗</a>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => setChecked({})} style={{ marginTop:10, padding:"3px 10px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:3, fontSize:10, color:C.textDim, cursor:"pointer" }}>
        Réinitialiser
      </button>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StuffTab({ db, skydroMeta, cellMeta }) {
  const [stuff, setStuff] = useState({ sky1:{}, sky2:{}, cell1:{}, cell2:{} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, "stuff"), snap => {
      if (snap.exists()) setStuff(snap.val());
      setLoaded(true);
    });
    setTimeout(() => setLoaded(true), 2000);
    return () => unsub();
  }, []);

  const update = (key, newStuff) => {
    const next = { ...stuff, [key]: newStuff };
    setStuff(next);
    set(ref(db, "stuff"), next);
  };

  const skyPersos  = skydroMeta?.persos || [];
  const cellPersos = cellMeta?.persos   || [];

  const PERSOS = [
    { key:"sky1",  label:skyPersos[0]?.name  || "Sky — Perso 1",  ...PLAYERS[0] },
    { key:"sky2",  label:skyPersos[1]?.name  || "Sky — Perso 2",  ...PLAYERS[0] },
    { key:"cell1", label:cellPersos[0]?.name || "Cell — Perso 1", ...PLAYERS[1] },
    { key:"cell2", label:cellPersos[1]?.name || "Cell — Perso 2", ...PLAYERS[1] },
  ];

  if (!loaded) return <div style={{ textAlign:"center", padding:"40px", color:C.textDim, fontSize:13 }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:"#8b5e1a", letterSpacing:2, textTransform:"uppercase", marginBottom:14, textAlign:"center" }}>
        ⚔ Planificateur de Stuff
      </div>

      {/* Sky en haut, Cell en bas */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
        {/* Ligne Sky */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {PERSOS.filter(p=>p.key.startsWith("sky")).map(p => (
            <PersoStuff key={p.key} label={p.label} color={p.color} light={p.light} border={p.border}
              stuff={stuff[p.key]||{}} onUpdate={(s)=>update(p.key,s)} />
          ))}
        </div>
        {/* Ligne Cell */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {PERSOS.filter(p=>p.key.startsWith("cell")).map(p => (
            <PersoStuff key={p.key} label={p.label} color={p.color} light={p.light} border={p.border}
              stuff={stuff[p.key]||{}} onUpdate={(s)=>update(p.key,s)} />
          ))}
        </div>
      </div>

      {/* Liste de courses */}
      <div style={{ background:"white", border:`1px solid #d4b87a`, borderRadius:8, padding:"14px 16px" }}>
        <ShoppingList stuff={stuff} />
      </div>
    </div>
  );
}
