import { useState, useEffect, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
const BASE = "https://api.dofusdu.de/dofus3/v1/fr";

// ─── SLOTS ────────────────────────────────────────────────────────────────────
const SLOTS = [
  { id:"hat",       label:"Chapeau",       types:["Chapeau"],                    emoji:"🎩" },
  { id:"amulet",    label:"Amulette",      types:["Amulette"],                   emoji:"📿" },
  { id:"ring1",     label:"Anneau 1",      types:["Anneau"],                     emoji:"💍" },
  { id:"ring2",     label:"Anneau 2",      types:["Anneau"],                     emoji:"💍" },
  { id:"cloak",     label:"Cape",          types:["Cape"],                       emoji:"🧣" },
  { id:"belt",      label:"Ceinture",      types:["Ceinture"],                   emoji:"👑" },
  { id:"boots",     label:"Bottes",        types:["Bottes"],                     emoji:"👢" },
  { id:"weapon",    label:"Arme",          types:["Épée","Baguette","Arc","Dague","Bâton","Marteau","Hache","Pelle","Faux","Masse","Outil","Lance","Pioche","Bâton à deux mains","Épée à deux mains"],emoji:"⚔️" },
  { id:"shield",    label:"Bouclier",      types:["Bouclier"],                   emoji:"🛡️" },
  { id:"trophy",    label:"Trophée",       types:["Trophée"],                    emoji:"🏆" },
  { id:"dofus1",    label:"Dofus 1",       types:["Dofus","Dofawa"],             emoji:"🥚" },
  { id:"dofus2",    label:"Dofus 2",       types:["Dofus","Dofawa"],             emoji:"🥚" },
  { id:"dofus3",    label:"Dofus 3",       types:["Dofus","Dofawa"],             emoji:"🥚" },
  { id:"dofus4",    label:"Dofus 4",       types:["Dofus","Dofawa"],             emoji:"🥚" },
  { id:"dofus5",    label:"Dofus 5",       types:["Dofus","Dofawa"],             emoji:"🥚" },
  { id:"dofus6",    label:"Dofus 6",       types:["Dofus","Dofawa"],             emoji:"🥚" },
];

const SLOT_LAYOUT = [
  ["hat"],
  ["amulet","ring1","ring2"],
  ["cloak","weapon","shield"],
  ["belt"],
  ["boots"],
  ["trophy"],
  ["dofus1","dofus2","dofus3","dofus4","dofus5","dofus6"],
];

const PLAYERS = [
  { key:"sky",  label:"Sky",  color:"#2a4a8a", light:"#e8f0f8", border:"#4a6a9a" },
  { key:"cell", label:"Cell", color:"#7a2a1a", light:"#f8ede8", border:"#9a4a2a" },
];

const C = {
  bgCard:"#fdf6e8", bgPanel:"#f5edd8", border:"#d4b87a", borderLight:"#e8d4a0",
  gold:"#8b5e1a", goldLight:"#a0721f", goldDim:"#c8a060",
  text:"#2a1a08", textDim:"#6b4e28", textBright:"#1a0e04",
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────
function ItemSearch({ onSelect, slotTypes }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const ref2 = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref2.current && !ref2.current.contains(e.target)) setOpen(false); };
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
      // Filtre par type de slot si spécifié
      const filtered = slotTypes
        ? arr.filter(i => slotTypes.some(t => (typeof i.type === "object" ? i.type?.name : i.type || "").toLowerCase().includes(t.toLowerCase())))
        : arr;
      setResults(filtered);
      setOpen(true);
    } catch(e) { setResults([]); }
    setLoading(false);
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQ(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const select = (item) => {
    onSelect(item);
    setQ("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={ref2} style={{ position:"relative" }}>
      <input
        value={q} onChange={handleInput} onFocus={() => results.length && setOpen(true)}
        placeholder="🔍 Rechercher un équipement…"
        style={{ width:"100%", padding:"6px 10px", background:"white", border:`1px solid ${C.border}`, borderRadius:5, fontFamily:"Georgia,serif", fontSize:13, color:C.text, outline:"none" }}
      />
      {loading && <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:12, color:C.textDim }}>⟳</span>}
      {open && results.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:1000, background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:6, boxShadow:"0 4px 16px rgba(42,26,8,0.2)", maxHeight:220, overflowY:"auto" }}>
          {results.map((r, i) => {
            const name = typeof r.name === "object" ? r.name?.fr || "" : r.name || "";
            const type = typeof r.type === "object" ? r.type?.name || "" : r.type || "";
            return (
              <div key={i} onClick={() => select(r)} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", cursor:"pointer", borderBottom:`1px solid ${C.borderLight}` }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(139,94,26,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {r.image_urls?.icon && <img src={r.image_urls.icon} style={{ width:24, height:24, imageRendering:"pixelated" }} alt="" onError={e=>e.target.style.display="none"} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</div>
                  <div style={{ fontSize:10, color:C.textDim }}>{type}{r.level ? ` — Niv. ${r.level}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SLOT VISUEL ─────────────────────────────────────────────────────────────
function SlotBox({ slot, item, onSearch, onRemove }) {
  const [hover, setHover] = useState(false);
  const img = item?.image_urls?.icon;
  const name = item ? (typeof item.name === "object" ? item.name?.fr || "" : item.name || "") : null;

  return (
    <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
      <div
        onClick={onSearch}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={name || slot.label}
        style={{
          width:52, height:52, borderRadius:8, cursor:"pointer",
          background: item ? "white" : "rgba(139,94,26,0.06)",
          border:`2px solid ${item ? C.goldDim : C.borderLight}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative", transition:"border-color 0.15s, box-shadow 0.15s",
          boxShadow: hover ? "0 0 8px rgba(139,94,26,0.3)" : "none",
        }}
      >
        {img
          ? <img src={img} alt={name} style={{ width:40, height:40, imageRendering:"pixelated" }} onError={e=>e.target.style.display="none"} />
          : <span style={{ fontSize:20, opacity:0.5 }}>{slot.emoji}</span>
        }
        {item && hover && (
          <div onClick={(e)=>{e.stopPropagation();onRemove();}} style={{
            position:"absolute", top:-6, right:-6, width:16, height:16, borderRadius:"50%",
            background:"#8a2a2a", color:"white", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
          }}>✕</div>
        )}
      </div>
      <div style={{ fontSize:9, color:C.textDim, fontFamily:"'Cinzel',serif", letterSpacing:0.3, textAlign:"center", maxWidth:54, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {name || slot.label}
      </div>
    </div>
  );
}

// ─── LISTE DE COURSES ─────────────────────────────────────────────────────────
async function fetchRecipeItems(recipe) {
  if (!recipe?.length) return [];
  const results = await Promise.all(
    recipe.map(r =>
      fetch(`${BASE}/items/resources/${r.item_ankama_id}`)
        .then(res => res.ok ? res.json() : null)
        .then(d => d ? { id:r.item_ankama_id, name:d.name||`#${r.item_ankama_id}`, qty:r.quantity, img:d.image_urls?.icon||null, subtype:r.item_subtype } : null)
        .catch(() => null)
    )
  );
  return results.filter(Boolean);
}

function ShoppingList({ stuffByPlayer }) {
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const allItems = Object.values(stuffByPlayer).flatMap(perso =>
      Object.values(perso).filter(Boolean)
    );
    if (!allItems.length) { setResources({}); return; }

    setLoading(true);
    const aggregate = {};

    Promise.all(allItems.map(async (item) => {
      if (!item?.recipe?.length) return;
      const rItems = await fetchRecipeItems(item.recipe);
      rItems.forEach(r => {
        const key = r.id;
        if (!aggregate[key]) aggregate[key] = { ...r, qty:0 };
        aggregate[key].qty += r.qty;
      });
    })).then(() => {
      setResources({...aggregate});
      setLoading(false);
    });
  }, [stuffByPlayer]);

  const resList = Object.values(resources).sort((a,b) => b.qty - a.qty);
  const doneCount = resList.filter(r => checked[r.id]).length;

  if (!resList.length && !loading) return (
    <div style={{ textAlign:"center", padding:"20px", color:C.textDim, fontStyle:"italic", fontSize:13 }}>
      Ajoute des équipements pour voir la liste de courses.
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:2, textTransform:"uppercase" }}>
          🛒 Liste de Courses
        </div>
        <div style={{ fontSize:11, color:C.textDim }}>{doneCount}/{resList.length} collectées</div>
      </div>
      {loading && <div style={{ textAlign:"center", padding:"16px", color:C.textDim, fontSize:13 }}>Chargement des recettes…</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {resList.map(r => (
          <div key={r.id} onClick={() => setChecked(p => ({...p, [r.id]:!p[r.id]}))} style={{
            display:"flex", alignItems:"center", gap:8, padding:"6px 10px",
            borderRadius:5, cursor:"pointer",
            background: checked[r.id] ? "#eef4ee" : "white",
            border:`1px solid ${checked[r.id] ? "#4a8a4a" : C.borderLight}`,
            opacity: checked[r.id] ? 0.65 : 1, transition:"all 0.12s",
          }}>
            <div style={{ width:18, height:18, borderRadius:3, border:`2px solid ${checked[r.id]?"#2a6a2a":C.goldDim}`, background:checked[r.id]?"#2a6a2a":"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>
              {checked[r.id] && <span style={{ color:"white" }}>✓</span>}
            </div>
            {r.img && <img src={r.img} style={{ width:22, height:22, imageRendering:"pixelated", flexShrink:0 }} alt="" onError={e=>e.target.style.display="none"} />}
            <span style={{ flex:1, fontSize:13, color:C.text, textDecoration:checked[r.id]?"line-through":"none" }}>{r.name}</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color:C.gold, flexShrink:0 }}>×{r.qty}</span>
            <a href={`https://dofusdb.fr/fr/database/item/${r.id}`} target="_blank" rel="noopener noreferrer"
              onClick={e=>e.stopPropagation()}
              style={{ fontSize:10, color:C.goldDim, flexShrink:0 }}>↗</a>
          </div>
        ))}
      </div>
      {resList.length > 0 && (
        <button onClick={() => setChecked({})} style={{ marginTop:10, padding:"4px 12px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:4, fontSize:11, color:C.textDim, cursor:"pointer", fontFamily:"Georgia,serif" }}>
          Réinitialiser
        </button>
      )}
    </div>
  );
}

// ─── PERSO STUFF ─────────────────────────────────────────────────────────────
function PersoStuff({ persoKey, label, color, light, border, stuff, onUpdate }) {
  const [activeSlot, setActiveSlot] = useState(null);

  const handleSelect = async (item) => {
    if (!activeSlot) return;
    // Charger les détails complets (recette)
    try {
      const res = await fetch(`${BASE}/items/equipment/${item.ankama_id}`);
      const full = res.ok ? await res.json() : item;
      onUpdate({ ...stuff, [activeSlot]: full });
    } catch(e) {
      onUpdate({ ...stuff, [activeSlot]: item });
    }
    setActiveSlot(null);
  };

  const activeSlotObj = activeSlot ? SLOTS.find(s => s.id === activeSlot) : null;

  return (
    <div style={{ background:light, border:`2px solid ${border}`, borderRadius:8, padding:"14px 16px" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, fontWeight:700, color, marginBottom:12, letterSpacing:1 }}>◈ {label}</div>

      {/* Interface visuelle slots */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"center", marginBottom:14 }}>
        {SLOT_LAYOUT.map((row, ri) => (
          <div key={ri} style={{ display:"flex", gap:6, justifyContent:"center" }}>
            {row.map(slotId => {
              const slot = SLOTS.find(s => s.id === slotId);
              return (
                <SlotBox
                  key={slotId}
                  slot={slot}
                  item={stuff[slotId] || null}
                  onSearch={() => setActiveSlot(slotId === activeSlot ? null : slotId)}
                  onRemove={() => { const s={...stuff}; delete s[slotId]; onUpdate(s); }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Barre de recherche conditionnelle */}
      {activeSlot && (
        <div style={{ marginBottom:10, padding:"8px 10px", background:"rgba(139,94,26,0.06)", borderRadius:6, border:`1px solid ${C.goldDim}` }}>
          <div style={{ fontSize:11, color:C.textDim, marginBottom:6, fontStyle:"italic" }}>
            Slot sélectionné : <strong style={{ color:C.gold }}>{activeSlotObj?.label}</strong> — clique sur un item pour l'équiper
          </div>
          <ItemSearch onSelect={handleSelect} slotTypes={activeSlotObj?.types} />
        </div>
      )}

      {/* Résumé stats */}
      <div style={{ fontSize:10, color:C.textDim, textAlign:"center" }}>
        {Object.values(stuff).filter(Boolean).length} / {SLOTS.length} slots équipés
      </div>
    </div>
  );
}

// ─── ONGLET STUFF PRINCIPAL ───────────────────────────────────────────────────
export default function StuffTab({ db, skydroMeta, cellMeta }) {
  const [stuff, setStuff] = useState({
    sky1:{}, sky2:{}, cell1:{}, cell2:{}
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, "stuff"), snap => {
      if (snap.exists()) setStuff(snap.val());
      setLoaded(true);
    });
    setTimeout(() => setLoaded(true), 2000);
    return () => unsub();
  }, []);

  const updatePerso = (key, newStuff) => {
    const next = { ...stuff, [key]: newStuff };
    setStuff(next);
    set(ref(db, "stuff"), next);
  };

  // Récupère les noms depuis les metas
  const skyPersos = skydroMeta?.persos || [];
  const cellPersos = cellMeta?.persos || [];

  const PERSOS = [
    { key:"sky1",  label: skyPersos[0]?.name  || "Sky — Perso 1",  ...PLAYERS[0] },
    { key:"sky2",  label: skyPersos[1]?.name  || "Sky — Perso 2",  ...PLAYERS[0] },
    { key:"cell1", label: cellPersos[0]?.name || "Cell — Perso 1", ...PLAYERS[1] },
    { key:"cell2", label: cellPersos[1]?.name || "Cell — Perso 2", ...PLAYERS[1] },
  ];

  if (!loaded) return <div style={{ textAlign:"center", padding:"40px", color:C.textDim, fontSize:13 }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:16, textAlign:"center" }}>
        ⚔ Planificateur de Stuff
      </div>

      {/* 4 persos en 2x2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        {PERSOS.map(p => (
          <PersoStuff
            key={p.key}
            persoKey={p.key}
            label={p.label}
            color={p.color}
            light={p.light}
            border={p.border}
            stuff={stuff[p.key] || {}}
            onUpdate={(s) => updatePerso(p.key, s)}
          />
        ))}
      </div>

      {/* Liste de courses globale */}
      <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:8, padding:"16px 18px" }}>
        <ShoppingList stuffByPlayer={stuff} />
      </div>
    </div>
  );
}
