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
  bgPanel:"#f5edd8", border:"#d4b87a", borderLight:"#e8d4a0",
  gold:"#8b5e1a", goldDim:"#c8a060", text:"#2a1a08", textDim:"#6b4e28",
};

const PLAYERS = [
  { key:"sky",  label:"Sky",  color:"#2a4a8a", light:"#e8f0f8", border:"#4a6a9a" },
  { key:"cell", label:"Cell", color:"#7a2a1a", light:"#f8ede8", border:"#9a4a2a" },
];

const EMPTY_STUFF = { sky1:{}, sky2:{}, cell1:{}, cell2:{} };

// ─── STATS ────────────────────────────────────────────────────────────────────
const EFFECT_MAP = {
  9:"vita", 10:"sagesse", 12:"pa", 8:"pm", 31:"po",
  45:"force", 13:"intel", 22:"chance", 36:"agil",
  61:"dmgFeu", 27:"dmgEau", 48:"dmgTerre", 47:"dmgAir", 49:"dmgNeutre", 195:"dmgNeutre", 30:"dmg",
  96:"resFeu", 97:"resEau", 98:"resTerre", 99:"resAir", 100:"resNeutre",
  84:"resFeu%", 83:"resEau%", 82:"resTerre%", 81:"resAir%",
  26:"tacle", 75:"esquivePA", 76:"esquivePM",
  29:"critique", 28:"invocation", 25:"init",
};

const STAT_DISPLAY = [
  { key:"pa",        label:"PA",         emoji:"⭐" },
  { key:"pm",        label:"PM",         emoji:"👢" },
  { key:"po",        label:"PO",         emoji:"👁️" },
  { key:"vita",      label:"Vita",       emoji:"❤️" },
  { key:"force",     label:"Force",      emoji:"🌍" },
  { key:"intel",     label:"Intel",      emoji:"🔥" },
  { key:"chance",    label:"Chance",     emoji:"💧" },
  { key:"agil",      label:"Agilité",    emoji:"💨" },
  { key:"sagesse",   label:"Sagesse",    emoji:"📖" },
  { key:"dmg",       label:"Dommages",   emoji:"⚔️" },
  { key:"dmgFeu",    label:"Dmg Feu",    emoji:"🔥" },
  { key:"dmgEau",    label:"Dmg Eau",    emoji:"💧" },
  { key:"dmgTerre",  label:"Dmg Terre",  emoji:"🌍" },
  { key:"dmgAir",    label:"Dmg Air",    emoji:"💨" },
  { key:"dmgNeutre", label:"Dmg Neutre", emoji:"⬜" },
  { key:"resFeu%",   label:"Rés% Feu",   emoji:"🔥" },
  { key:"resEau%",   label:"Rés% Eau",   emoji:"💧" },
  { key:"resTerre%", label:"Rés% Terre", emoji:"🌍" },
  { key:"resAir%",   label:"Rés% Air",   emoji:"💨" },
  { key:"resFeu",    label:"Rés Feu",    emoji:"🔥" },
  { key:"resEau",    label:"Rés Eau",    emoji:"💧" },
  { key:"resTerre",  label:"Rés Terre",  emoji:"🌍" },
  { key:"resAir",    label:"Rés Air",    emoji:"💨" },
  { key:"critique",  label:"Critique",   emoji:"🎯" },
  { key:"init",      label:"Initiative", emoji:"⚡" },
];

function calcStats(stuff) {
  const totals = {};
  STAT_DISPLAY.forEach(s => { totals[s.key] = 0; });
  Object.values(stuff).filter(Boolean).forEach(item => {
    (item.effects || []).forEach(eff => {
      const effId = eff.type?.id ?? eff.effect_id ?? eff.effectId;
      const val = (eff.int_maximum === 0 && eff.int_minimum > 0)
        ? eff.int_minimum
        : (eff.int_maximum ?? eff.int_minimum ?? eff.value ?? 0);
      const statKey = EFFECT_MAP[effId];
      if (statKey && totals[statKey] !== undefined) totals[statKey] += Number(val) || 0;
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

function ItemTooltip({ item, color }) {
  const name = typeof item.name === "object" ? item.name?.fr || "" : item.name || "";
  const type = typeof item.type === "object" ? item.type?.name || "" : item.type || "";
  const stats = calcStats({ _item: item });
  const visible = STAT_DISPLAY.filter(s => stats[s.key] > 0);
  return (
    <div style={{
      position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)",
      zIndex:3000, width:200, background:"#2a1a08", border:`1px solid ${C.goldDim}`,
      borderRadius:8, padding:"10px 12px", boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
      pointerEvents:"none",
    }}>
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
        {item.image_urls?.sd && <img src={item.image_urls.sd} style={{ width:36, height:36, imageRendering:"pixelated", flexShrink:0 }} alt="" onError={e=>e.target.style.display="none"} />}
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:"#f5d060", lineHeight:1.2 }}>{name}</div>
          <div style={{ fontSize:10, color:"rgba(245,237,216,0.6)", marginTop:2 }}>{type}{item.level ? ` · Niv. ${item.level}` : ""}</div>
        </div>
      </div>
      {visible.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(200,160,80,0.3)", paddingTop:6 }}>
          {visible.map(s => (
            <div key={s.key} style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:1 }}>
              <span style={{ color:"rgba(245,237,216,0.7)" }}>{s.emoji} {s.label}</span>
              <span style={{ color:"#a8d060", fontWeight:700 }}>+{stats[s.key]}</span>
            </div>
          ))}
        </div>
      )}
      {item.recipe?.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(200,160,80,0.3)", paddingTop:6, marginTop:6 }}>
          <div style={{ fontSize:9, color:"rgba(245,237,216,0.5)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Recette</div>
          {item.recipe.slice(0,4).map((r,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, marginBottom:2 }}>
              {r._img && <img src={r._img} style={{ width:14, height:14, imageRendering:"pixelated" }} alt="" onError={e=>e.target.style.display="none"} />}
              <span style={{ color:"rgba(245,237,216,0.8)" }}>{r.quantity}× {r._name || `#${r.item_ankama_id}`}</span>
            </div>
          ))}
          {item.recipe.length > 4 && <div style={{ fontSize:9, color:"rgba(245,237,216,0.4)" }}>+{item.recipe.length-4} autres…</div>}
        </div>
      )}
    </div>
  );
}

function SlotBox({ slot, item, onSearch, onRemove }) {
  const [hover, setHover] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const img = item?.image_urls?.icon;
  const name = item ? (typeof item.name === "object" ? item.name?.fr || "" : item.name || "") : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
      {showTooltip && item && <ItemTooltip item={item} />}
      <div
        onClick={onSearch}
        onMouseEnter={() => { setHover(true); setShowTooltip(true); }}
        onMouseLeave={() => { setHover(false); setShowTooltip(false); }}
        title={!item ? slot.label : undefined}
        style={{ width:44, height:44, borderRadius:6, cursor:"pointer", background:item?"white":"rgba(139,94,26,0.06)", border:`2px solid ${item?C.goldDim:C.borderLight}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", transition:"all 0.15s", boxShadow:hover?"0 0 6px rgba(139,94,26,0.3)":"none" }}
      >
        {img ? <img src={img} alt={name} style={{ width:34, height:34, imageRendering:"pixelated" }} onError={e=>e.target.style.display="none"} />
              : <span style={{ fontSize:18, opacity:0.5 }}>{slot.emoji}</span>}
        {item && hover && (
          <div onClick={(e)=>{e.stopPropagation();onRemove();}} style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:"#8a2a2a", color:"white", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:1 }}>✕</div>
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
  const visible = STAT_DISPLAY.filter(s => stats[s.key] > 0);
  if (!visible.length) return (
    <div style={{ fontSize:10, color:C.textDim, fontStyle:"italic", textAlign:"center", padding:"6px 0" }}>
      Équipe un item pour voir les stats
    </div>
  );
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 8px" }}>
      {visible.map(s => (
        <div key={s.key} style={{ display:"flex", justifyContent:"space-between", fontSize:10, padding:"1px 0" }}>
          <span style={{ color:C.textDim }}>{s.emoji} {s.label}</span>
          <span style={{ fontWeight:700, color }}>{stats[s.key] > 0 ? `+${stats[s.key]}` : stats[s.key]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PERSO STUFF ─────────────────────────────────────────────────────────────
function PersoStuff({ persoKey, label, color, light, border, stuff, onUpdate }) {
  const [activeSlot, setActiveSlot] = useState(null);
  const activeSlotObj = activeSlot ? SLOTS.find(s => s.id === activeSlot) : null;

  const handleSelect = async (item) => {
    if (!activeSlot) return;
    try {
      const res = await fetch(`${BASE}/items/equipment/${item.ankama_id}`);
      const full = res.ok ? await res.json() : item;
      // Résoudre les noms des ressources de la recette immédiatement
      if (full.recipe?.length) {
        const resolved = await Promise.all(
          full.recipe.map(r =>
            fetch(`${BASE}/items/resources/${r.item_ankama_id}`)
              .then(res2 => res2.ok ? res2.json() : null)
              .then(d => ({ ...r, _name: d?.name || `#${r.item_ankama_id}`, _img: d?.image_urls?.icon || null }))
              .catch(() => ({ ...r, _name: `#${r.item_ankama_id}`, _img: null }))
          )
        );
        full.recipe = resolved;
      }
      const newStuff = { ...stuff, [activeSlot]: full };
      onUpdate(newStuff);
    } catch(e) {
      onUpdate({ ...stuff, [activeSlot]: item });
    }
    setActiveSlot(null);
  };

  return (
    <div style={{ background:light, border:`2px solid ${border}`, borderRadius:8, padding:"10px 12px" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color, marginBottom:10, letterSpacing:1, textAlign:"center", borderBottom:`1px solid ${border}44`, paddingBottom:6 }}>
        ◈ {label}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {/* Slots */}
        <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"center" }}>
          {SLOT_LAYOUT.map((row, ri) => (
            <div key={ri} style={{ display:"flex", gap:4, justifyContent:"center" }}>
              {row.map(slotId => {
                const slot = SLOTS.find(s => s.id === slotId);
                return (
                  <SlotBox key={slotId} slot={slot} item={stuff[slotId] || null}
                    onSearch={() => setActiveSlot(slotId === activeSlot ? null : slotId)}
                    onRemove={() => { const s = { ...stuff }; delete s[slotId]; onUpdate(s); }}
                  />
                );
              })}
            </div>
          ))}
          <div style={{ fontSize:9, color:C.textDim, marginTop:2 }}>
            {Object.values(stuff).filter(Boolean).length}/{SLOTS.length} slots
          </div>
        </div>
        {/* Stats */}
        <div style={{ flex:1, background:"white", borderRadius:6, border:`1px solid ${border}44`, padding:"8px", minWidth:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:5 }}>Stats (max)</div>
          <StatsPanel stuff={stuff} color={color} />
        </div>
      </div>
      {/* Recherche */}
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

// ─── SHOPPING ────────────────────────────────────────────────────────────────
function aggregateItems(items) {
  const agg = {};
  items.filter(Boolean).forEach(item => {
    (item.recipe || []).forEach(r => {
      const id = r.item_ankama_id;
      if (!id) return;
      if (!agg[id]) agg[id] = { id, name: r._name || `#${id}`, img: r._img || null, qty: 0 };
      agg[id].qty += Number(r.quantity) || 0;
      // Met à jour le nom si résolu
      if (r._name) { agg[id].name = r._name; agg[id].img = r._img; }
    });
  });
  return Object.values(agg).filter(r => r.qty > 0).sort((a,b) => b.qty - a.qty);
}

function ResourceRow({ r, checked, onCheck }) {
  return (
    <div onClick={() => onCheck(r.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 6px", marginBottom:2, borderRadius:4, cursor:"pointer", background:checked?"#eef4ee":"white", border:`1px solid ${checked?"#4a8a4a":C.borderLight}`, opacity:checked?0.65:1, transition:"all 0.1s" }}>
      <div style={{ width:13, height:13, borderRadius:2, border:`1px solid ${checked?"#2a6a2a":C.goldDim}`, background:checked?"#2a6a2a":"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, flexShrink:0 }}>
        {checked && <span style={{ color:"white" }}>✓</span>}
      </div>
      {r.img && <img src={r.img} style={{ width:16, height:16, imageRendering:"pixelated", flexShrink:0 }} alt="" onError={e=>e.target.style.display="none"} />}
      <span style={{ flex:1, fontSize:11, color:C.text, textDecoration:checked?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
      <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:700, color:C.gold, flexShrink:0 }}>×{r.qty}</span>
      <a href={`https://dofusdb.fr/fr/database/item/${r.id}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:9, color:C.goldDim, flexShrink:0 }}>↗</a>
    </div>
  );
}

function ShoppingList({ stuff }) {
  const [checked, setChecked] = useState({});
  const [resolved, setResolved] = useState({});

  // Re-résoudre les recettes dont les noms manquent
  useEffect(() => {
    const allItems = [stuff.sky1, stuff.sky2, stuff.cell1, stuff.cell2].filter(Boolean);
    const needsResolve = allItems.filter(item => item.recipe?.length && item.recipe.some(r => !r._name));
    if (!needsResolve.length) { setResolved({}); return; }

    Promise.all(needsResolve.map(async item => {
      const resolvedRecipe = await Promise.all(
        item.recipe.map(r =>
          r._name ? Promise.resolve(r) :
          fetch(`${BASE}/items/resources/${r.item_ankama_id}`)
            .then(res => res.ok ? res.json() : null)
            .then(d => ({ ...r, _name: d?.name || `#${r.item_ankama_id}`, _img: d?.image_urls?.icon || null }))
            .catch(() => ({ ...r, _name: `#${r.item_ankama_id}`, _img: null }))
        )
      );
      return { ankama_id: item.ankama_id, recipe: resolvedRecipe };
    })).then(results => {
      const map = {};
      results.forEach(r => { map[r.ankama_id] = r.recipe; });
      setResolved(map);
    });
  }, [stuff]);

  // Merge stuff avec les recettes résolues
  const mergeStuff = (item) => {
    if (!item) return null;
    const resolvedRecipe = resolved[item.ankama_id];
    return resolvedRecipe ? { ...item, recipe: resolvedRecipe } : item;
  };

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const sky  = aggregateItems([mergeStuff(stuff.sky1),  mergeStuff(stuff.sky2)]);
  const cell = aggregateItems([mergeStuff(stuff.cell1), mergeStuff(stuff.cell2)]);
  const all  = aggregateItems([mergeStuff(stuff.sky1), mergeStuff(stuff.sky2), mergeStuff(stuff.cell1), mergeStuff(stuff.cell2)]);

  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>🛒 Liste de Courses</div>

      {/* Sky | Cell */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:"#2a4a8a", marginBottom:6, fontWeight:700 }}>◈ Sky</div>
          {sky.length ? sky.map(r => <ResourceRow key={r.id} r={r} checked={!!checked[`sky_${r.id}`]} onCheck={() => toggle(`sky_${r.id}`)} />)
            : <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic" }}>Aucun item</div>}
        </div>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:"#7a2a1a", marginBottom:6, fontWeight:700 }}>◈ Cell</div>
          {cell.length ? cell.map(r => <ResourceRow key={r.id} r={r} checked={!!checked[`cell_${r.id}`]} onCheck={() => toggle(`cell_${r.id}`)} />)
            : <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic" }}>Aucun item</div>}
        </div>
      </div>

      {/* Globale */}
      {all.length > 0 && (
        <div style={{ borderTop:`2px solid ${C.border}`, paddingTop:10 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:C.gold, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Globale (4 persos)</div>
          {all.map(r => <ResourceRow key={r.id} r={r} checked={!!checked[`all_${r.id}`]} onCheck={() => toggle(`all_${r.id}`)} />)}
        </div>
      )}

      <button onClick={() => setChecked({})} style={{ marginTop:8, padding:"3px 10px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:3, fontSize:10, color:C.textDim, cursor:"pointer" }}>
        Réinitialiser
      </button>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StuffTab({ db, skydroMeta, cellMeta }) {
  const [stuff, setStuff] = useState({ ...EMPTY_STUFF });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, "stuff"), snap => {
      if (snap.exists()) {
        const val = snap.val();
        // S'assurer que toutes les clés existent
        setStuff({ sky1:{}, sky2:{}, cell1:{}, cell2:{}, ...val });
      }
      setLoaded(true);
    });
    setTimeout(() => setLoaded(true), 2000);
    return () => unsub();
  }, []);

  // Chaque perso a sa propre fonction update isolée
  const updatePerso = (key) => (newStuff) => {
    setStuff(prev => {
      const next = { sky1:{}, sky2:{}, cell1:{}, cell2:{}, ...prev, [key]: newStuff };
      set(ref(db, "stuff"), next);
      return next;
    });
  };

  const skyPersos  = skydroMeta?.persos || [];
  const cellPersos = cellMeta?.persos   || [];

  if (!loaded) return <div style={{ textAlign:"center", padding:"40px", color:C.textDim, fontSize:13 }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:"#8b5e1a", letterSpacing:2, textTransform:"uppercase", marginBottom:14, textAlign:"center" }}>
        ⚔ Planificateur de Stuff
      </div>

      {/* Ligne Sky */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <PersoStuff persoKey="sky1" label={skyPersos[0]?.name || "Sky — Perso 1"} color="#2a4a8a" light="#e8f0f8" border="#4a6a9a"
          stuff={stuff.sky1 || {}} onUpdate={updatePerso("sky1")} />
        <PersoStuff persoKey="sky2" label={skyPersos[1]?.name || "Sky — Perso 2"} color="#2a4a8a" light="#e8f0f8" border="#4a6a9a"
          stuff={stuff.sky2 || {}} onUpdate={updatePerso("sky2")} />
      </div>

      {/* Ligne Cell */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <PersoStuff persoKey="cell1" label={cellPersos[0]?.name || "Cell — Perso 1"} color="#7a2a1a" light="#f8ede8" border="#9a4a2a"
          stuff={stuff.cell1 || {}} onUpdate={updatePerso("cell1")} />
        <PersoStuff persoKey="cell2" label={cellPersos[1]?.name || "Cell — Perso 2"} color="#7a2a1a" light="#f8ede8" border="#9a4a2a"
          stuff={stuff.cell2 || {}} onUpdate={updatePerso("cell2")} />
      </div>

      {/* Liste de courses */}
      <div style={{ background:"white", border:`1px solid #d4b87a`, borderRadius:8, padding:"14px 16px" }}>
        <ShoppingList stuff={stuff} />
      </div>
    </div>
  );
}
