import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');`;

const styles = `
  ${FONT}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Sans', sans-serif; }

  .app { min-height: 100vh; background: #0f0f0f; color: #e8e8e8; padding: 32px 24px; max-width: 1400px; margin: 0 auto; }

  .header { border-bottom: 1px solid #2a2a2a; padding-bottom: 20px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .header-left h1 { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; color: #fff; }
  .header-left p { font-size: 13px; color: #666; margin-top: 4px; font-family: 'IBM Plex Mono', monospace; }
  .sync-status { font-family: 'IBM Plex Mono', monospace; font-size: 11px; display: flex; align-items: center; gap: 6px; }
  .sync-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .sync-dot.ok { background: #5acd5a; }
  .sync-dot.loading { background: #f5a623; animation: pulse 1s ease-in-out infinite; }
  .sync-dot.error { background: #ff6b6b; }

  .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  @media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } }

  .panel { background: #171717; border: 1px solid #2a2a2a; border-radius: 4px; overflow: hidden; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #1e1e1e; border-bottom: 1px solid #2a2a2a; }
  .panel-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #888; }
  .panel-count { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #555; }
  .panel-body { padding: 16px; }

  .form-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .input { background: #0f0f0f; border: 1px solid #333; color: #e8e8e8; padding: 8px 10px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; border-radius: 3px; outline: none; transition: border-color 0.15s; }
  .input:focus { border-color: #4a9eff; }
  .input::placeholder { color: #444; }
  .input-sm { width: 72px; }
  .input-md { flex: 1; min-width: 100px; }

  .btn { padding: 8px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; border: none; border-radius: 3px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: #4a9eff; color: #000; }
  .btn-primary:hover:not(:disabled) { background: #6db3ff; }
  .btn-danger { background: transparent; color: #ff6b6b; border: 1px solid #3a2020; padding: 4px 8px; font-size: 10px; }
  .btn-danger:hover:not(:disabled) { background: #2a1515; border-color: #ff6b6b; }

  .list { display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; }
  .list-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #0f0f0f; border: 1px solid #252525; border-radius: 3px; gap: 8px; transition: border-color 0.15s; }
  .list-item:hover { border-color: #3a3a3a; }
  .list-item.is-pending { border-color: #3a3010; }
  .list-item-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

  .position { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #444; width: 18px; text-align: right; flex-shrink: 0; }
  .item-name { font-size: 13px; font-weight: 500; color: #e8e8e8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; padding: 2px 6px; border-radius: 2px; background: #1e2a3a; color: #4a9eff; border: 1px solid #1e3a5a; white-space: nowrap; flex-shrink: 0; }
  .tag-green { background: #1a2e1a; color: #5acd5a; border-color: #1a3e1a; }
  .tag-amber { background: #2a2010; color: #f5a623; border-color: #3a2e10; }

  .equip-num { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600; color: #4a9eff; flex-shrink: 0; }
  .divider { border: none; border-top: 1px solid #2a2a2a; margin: 16px 0; }
  .queue-actions { display: flex; gap: 4px; flex-shrink: 0; }
  .btn-move { background: transparent; color: #555; border: 1px solid #2a2a2a; padding: 3px 7px; font-size: 10px; }
  .btn-move:hover { color: #e8e8e8; border-color: #555; }
  .pref-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .error { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #ff6b6b; margin-top: 4px; }
  .empty { padding: 24px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #444; }

  .pending-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #f5a623; margin-right: 6px; flex-shrink: 0; animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  .section-panel { background: #171717; border: 1px solid #2a2a2a; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #2a2a2a; flex-wrap: wrap; gap: 10px; }

  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table th { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #555; padding: 10px 16px; text-align: left; border-bottom: 1px solid #222; background: #141414; }
  .data-table td { padding: 10px 16px; border-bottom: 1px solid #1a1a1a; vertical-align: middle; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: #1a1a1a; }

  .col-num { color: #444; font-family: 'IBM Plex Mono', monospace; font-size: 10px; }
  .col-name { font-weight: 500; color: #e8e8e8; }
  .col-arrow { font-family: 'IBM Plex Mono', monospace; color: #333; font-size: 12px; }
  .col-equip-green { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #5acd5a; }
  .col-equip-amber { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #f5a623; }
  .col-desc { font-size: 12px; color: #555; }

  .row-actions { display: flex; gap: 6px; align-items: center; }
  .btn-confirm-row { background: #1a2e1a; color: #5acd5a; border: 1px solid #2a4e2a; padding: 4px 10px; font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; border-radius: 3px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn-confirm-row:hover:not(:disabled) { background: #22c55e; color: #000; border-color: #22c55e; }
  .btn-confirm-row:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-deny-row { background: transparent; color: #666; border: 1px solid #2a2a2a; padding: 4px 10px; font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; border-radius: 3px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn-deny-row:hover:not(:disabled) { background: #2a1515; color: #ff6b6b; border-color: #3a2020; }
  .btn-deny-row:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-confirm-all { background: #22c55e; color: #000; padding: 6px 14px; font-size: 11px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; border: none; border-radius: 3px; cursor: pointer; transition: all 0.15s; }
  .btn-confirm-all:hover:not(:disabled) { background: #4ade80; }
  .btn-confirm-all:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-undo { background: transparent; color: #555; border: 1px solid #2a2a2a; padding: 3px 8px; font-size: 10px; font-family: 'IBM Plex Mono', monospace; border-radius: 3px; cursor: pointer; transition: all 0.15s; }
  .btn-undo:hover:not(:disabled) { color: #f5a623; border-color: #f5a623; }
  .btn-undo:disabled { opacity: 0.4; cursor: not-allowed; }

  .global-error { background: #2a1515; border: 1px solid #5a2020; border-radius: 4px; padding: 12px 16px; margin-bottom: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #ff6b6b; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
`;

// ─── Pure assignment logic (unchanged from original) ───────────────────────
function computePending(queue, equipment, confirmedResIds, confirmedEquipIds, denied) {
  const deniedKeys = new Set(denied.map(d => `${d.reservation_id}:${d.equip_id}`));
  const usedEquipIds = new Set(confirmedEquipIds);
  const results = [];
  for (const r of queue) {
    if (confirmedResIds.has(r.id)) continue;
    const match = equipment.find(e =>
      r.prefs.includes(e.letters) &&
      !usedEquipIds.has(e.id) &&
      !deniedKeys.has(`${r.id}:${e.id}`)
    );
    if (match) {
      usedEquipIds.add(match.id);
      results.push({ reservation: r, equip: match });
    }
  }
  return results;
}

function computeWaiting(queue, confirmedResIds, pendingResIds) {
  return queue.filter(r => !confirmedResIds.has(r.id) && !pendingResIds.has(r.id));
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [queue, setQueue] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [denied, setDenied] = useState([]);

  const [syncStatus, setSyncStatus] = useState("loading"); // 'ok' | 'loading' | 'error'
  const [globalError, setGlobalError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [qName, setQName] = useState("");
  const [qPrefs, setQPrefs] = useState("");
  const [qError, setQError] = useState("");

  const [eLetters, setELetters] = useState("");
  const [eNumber, setENumber] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [eError, setEError] = useState("");

  // ── Load all data on mount ──
  useEffect(() => {
    loadAll();
    // Real-time subscriptions — refresh any time another session changes data
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => loadAll())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function loadAll() {
    setSyncStatus("loading");
    try {
      const [qRes, eRes, cRes, dRes] = await Promise.all([
        supabase.from('reservations').select('*').order('position'),
        supabase.from('equipment').select('*').order('created_at'),
        supabase.from('confirmed_matches').select('*').order('created_at'),
        supabase.from('denied_pairs').select('*'),
      ]);
      if (qRes.error || eRes.error || cRes.error || dRes.error)
        throw new Error("Failed to load data from Supabase.");
      setQueue(qRes.data.map(r => ({ ...r, prefs: r.prefs ?? [] })));
      setEquipment(eRes.data);
      setConfirmed(cRes.data);
      setDenied(dRes.data);
      setSyncStatus("ok");
      setGlobalError(null);
    } catch (err) {
      setSyncStatus("error");
      setGlobalError(err.message);
    }
  }

  async function withBusy(fn) {
    setBusy(true);
    try { await fn(); }
    catch (err) { setGlobalError(err.message); setSyncStatus("error"); }
    finally { setBusy(false); }
  }

  // ── Derived state ──
  const confirmedResIds = new Set(confirmed.map(c => c.reservation_id));
  const confirmedEquipIds = new Set(confirmed.map(c => c.equip_id));
  const pending = computePending(queue, equipment, confirmedResIds, confirmedEquipIds, denied);
  const pendingResIds = new Set(pending.map(p => p.reservation.id));
  const pendingEquipIds = new Set(pending.map(p => p.equip.id));
  const waiting = computeWaiting(queue, confirmedResIds, pendingResIds);
  const activeEquipment = equipment.filter(e => !confirmedEquipIds.has(e.id));

  // ── Queue actions ──
  const addToQueue = () => {
    if (!qName.trim()) { setQError("Name is required."); return; }
    const prefs = qPrefs.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
    const invalid = prefs.filter(p => !/^[A-Z]{1,2}$/.test(p));
    if (invalid.length) { setQError(`Invalid type(s): ${invalid.join(", ")} — 1–2 letters only.`); return; }
    setQError("");
    const name = qName.trim();
    setQName(""); setQPrefs("");
    withBusy(async () => {
      // FIX: fetch max position server-side to avoid race conditions between concurrent adds
      const { data: maxData } = await supabase
        .from('reservations')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();
      const position = maxData ? maxData.position + 1 : 0;
      const { error } = await supabase.from('reservations').insert({ name, prefs, position });
      if (error) throw new Error(error.message);
    });
  };

  const removeFromQueue = (id) => withBusy(async () => {
    // Cascade deletes handle denied_pairs and confirmed_matches via FK constraints
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });

  // FIX: use atomic DB function to swap positions in a single transaction
  const moveQueue = (id, dir) => withBusy(async () => {
    const idx = queue.findIndex(r => r.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= queue.length) return;
    const a = queue[idx], b = queue[target];
    const { error } = await supabase.rpc('swap_positions', { id_a: a.id, id_b: b.id });
    if (error) throw new Error(error.message);
  });

  // ── Equipment actions ──
  const addEquipment = () => {
    if (!/^[a-zA-Z]{0,2}$/.test(eLetters)) { setEError("Type: up to 2 letters only."); return; }
    if (!/^\d{7,9}$/.test(eNumber)) { setEError("Number must be 7–9 digits."); return; }
    if (equipment.find(e => e.number === eNumber)) { setEError("Number already exists."); return; }
    setEError("");
    const letters = eLetters.toUpperCase(), number = eNumber, description = eDesc.trim();
    setELetters(""); setENumber(""); setEDesc("");
    withBusy(async () => {
      const { error } = await supabase.from('equipment').insert({ letters, number, description });
      if (error) throw new Error(error.message);
    });
  };

  const removeEquipment = (id) => withBusy(async () => {
    await supabase.from('denied_pairs').delete().eq('equip_id', id);
    await supabase.from('confirmed_matches').delete().eq('equip_id', id);
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });

  // ── Match actions ──
  const confirmMatch = ({ reservation, equip }) => withBusy(async () => {
    const { data: insertedRow, error } = await supabase.from('confirmed_matches').insert({
      reservation_id: reservation.id,
      reservation_name: reservation.name,
      equip_id: equip.id,
      assigned_type: equip.letters,
      assigned_number: equip.number,
      equip_description: equip.description || '',
    }).select().single();
    if (error) throw new Error(error.message);
    console.log('DEBUG inserted confirmed_match:', JSON.stringify(insertedRow));
    console.log('DEBUG reservation.id was:', reservation.id);
    await loadAll();
    console.log('DEBUG confirmed state after loadAll will refresh via setConfirmed');
  });

  const denyMatch = ({ reservation, equip }) => withBusy(async () => {
    const { error } = await supabase.from('denied_pairs').insert({
      reservation_id: reservation.id,
      equip_id: equip.id,
    });
    if (error && !error.message.includes('unique')) throw new Error(error.message);
  });

  const confirmAll = () => withBusy(async () => {
    const toConfirm = pending.filter(({ reservation, equip }) =>
      !confirmed.some(c => c.reservation_id === reservation.id) &&
      !confirmed.some(c => c.equip_id === equip.id));
    if (toConfirm.length === 0) return;
    const rows = toConfirm.map(({ reservation, equip }) => ({
      reservation_id: reservation.id,
      reservation_name: reservation.name,
      equip_id: equip.id,
      assigned_type: equip.letters,
      assigned_number: equip.number,
      equip_description: equip.description || '',
    }));
    const { error } = await supabase.from('confirmed_matches').insert(rows);
    if (error) throw new Error(error.message);
    await loadAll();
  });

  const undoConfirmed = (id) => withBusy(async () => {
    const { error } = await supabase.from('confirmed_matches').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });

  // ── Render ──
  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-left">
            <h1>// RESOURCE MANAGER</h1>
            <p>equipment assignment · persistent · multi-session</p>
          </div>
          <div className="sync-status">
            <span className={`sync-dot ${syncStatus}`} />
            <span style={{ color: syncStatus === "ok" ? "#3a6e3a" : syncStatus === "error" ? "#ff6b6b" : "#f5a623" }}>
              {syncStatus === "ok" ? "synced" : syncStatus === "loading" ? "syncing..." : "sync error"}
            </span>
          </div>
        </div>

        {globalError && (
          <div className="global-error">
            ⚠ {globalError} — Check your Supabase credentials in <code>src/supabaseClient.js</code>
          </div>
        )}

        {/* Confirmed Matches */}
        <div className="section-panel">
          <div className="section-header" style={{ background: "#111e11", borderBottomColor: "#1a3a1a" }}>
            <span className="panel-title" style={{ color: "#5acd5a" }}>Confirmed Matches</span>
            <span className="panel-count" style={{ color: "#3a6e3a" }}>{confirmed.length} pair{confirmed.length !== 1 ? "s" : ""}</span>
          </div>
          {confirmed.length === 0
            ? <div className="empty">No confirmed matches yet.</div>
            : <table className="data-table">
                <thead><tr><th>#</th><th>Reservation</th><th></th><th>Type</th><th>Equipment #</th><th>Description</th><th></th></tr></thead>
                <tbody>
                  {confirmed.map((c, i) => (
                    <tr key={c.id}>
                      <td className="col-num">{i + 1}</td>
                      <td className="col-name">{c.reservation_name}</td>
                      <td className="col-arrow">→</td>
                      <td><span className="tag tag-green">{c.assigned_type || "—"}</span></td>
                      <td className="col-equip-green">{c.assigned_number}</td>
                      <td className="col-desc">{c.equip_description || <span style={{ color: "#2a2a2a" }}>—</span>}</td>
                      <td><button className="btn-undo" disabled={busy} onClick={() => undoConfirmed(c.id)}>↩ undo</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Pending Matches */}
        <div className="section-panel">
          <div className="section-header" style={{ background: "#1a1800", borderBottomColor: "#3a3000" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="panel-title" style={{ color: "#f5a623" }}>Pending Matches</span>
              <span className="panel-count">{pending.length} ready</span>
            </div>
            {pending.length > 0 &&
              <button className="btn-confirm-all" disabled={busy} onClick={confirmAll}>✓ Confirm All</button>}
          </div>
          {pending.length === 0
            ? <div className="empty">No pending matches — add reservations with preferred types and matching equipment.</div>
            : <table className="data-table">
                <thead><tr><th>#</th><th>Reservation</th><th></th><th>Type</th><th>Equipment #</th><th>Description</th><th style={{ width: 160 }}></th></tr></thead>
                <tbody>
                  {pending.map(({ reservation, equip }, i) => (
                    <tr key={reservation.id}>
                      <td className="col-num">{i + 1}</td>
                      <td className="col-name">{reservation.name}</td>
                      <td className="col-arrow">→</td>
                      <td><span className="tag tag-amber">{equip.letters || "—"}</span></td>
                      <td className="col-equip-amber">{equip.number}</td>
                      <td className="col-desc">{equip.description || <span style={{ color: "#2a2a2a" }}>—</span>}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-confirm-row" disabled={busy} onClick={() => confirmMatch({ reservation, equip })}>✓ Confirm</button>
                          <button className="btn-deny-row" disabled={busy} onClick={() => denyMatch({ reservation, equip })}>✕ Deny</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Waiting */}
        {waiting.length > 0 && (
          <div className="section-panel" style={{ marginBottom: 24, borderColor: "#2a2a10" }}>
            <div className="section-header" style={{ background: "#1a1a0e", borderBottomColor: "#2a2a10" }}>
              <span className="panel-title" style={{ color: "#f5a623" }}>Waiting — No Match Available</span>
              <span className="panel-count" style={{ color: "#5e5a1a" }}>{waiting.length} unmatched</span>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {waiting.map((r, i) => (
                <div className="list-item" key={r.id}>
                  <div className="list-item-left">
                    <span className="position">{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="item-name">{r.name}</div>
                      {r.prefs.length > 0 &&
                        <div className="pref-tags">{r.prefs.map(p => <span className="tag tag-amber" key={p}>{p}</span>)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input pools */}
        <div className="main-grid">
          {/* Queue */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Reservation Queue</span>
              <span className="panel-count">{queue.filter(r => !confirmedResIds.has(r.id)).length} waiting</span>
            </div>
            <div className="panel-body">
              <div className="form-row">
                <input className="input input-md" placeholder="Name" value={qName}
                  onChange={e => setQName(e.target.value)} onKeyDown={e => e.key === "Enter" && addToQueue()} />
              </div>
              <div className="form-row">
                <input className="input input-md" placeholder="Preferred types (e.g. A, BC)" value={qPrefs}
                  onChange={e => setQPrefs(e.target.value)} onKeyDown={e => e.key === "Enter" && addToQueue()} />
                <button className="btn btn-primary" disabled={busy} onClick={addToQueue}>Add</button>
              </div>
              {qError && <div className="error">{qError}</div>}
              <hr className="divider" />
              <div className="list">
                {queue.filter(r => !confirmedResIds.has(r.id)).length === 0 && <div className="empty">Queue is empty.</div>}
                {queue.filter(r => !confirmedResIds.has(r.id)).map((r, i) => {
                  const isPending = pendingResIds.has(r.id);
                  return (
                    <div className={`list-item${isPending ? " is-pending" : ""}`} key={r.id}>
                      <div className="list-item-left">
                        <span className="position">{i + 1}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {isPending && <span className="pending-dot" />}
                            <span className="item-name">{r.name}</span>
                          </div>
                          {r.prefs.length > 0 &&
                            <div className="pref-tags">{r.prefs.map(p => <span className="tag" key={p}>{p}</span>)}</div>}
                        </div>
                      </div>
                      <div className="queue-actions">
                        <button className="btn btn-move" disabled={busy} onClick={() => moveQueue(r.id, -1)}>▲</button>
                        <button className="btn btn-move" disabled={busy} onClick={() => moveQueue(r.id, 1)}>▼</button>
                        <button className="btn btn-danger" disabled={busy} onClick={() => removeFromQueue(r.id)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Available Equipment</span>
              <span className="panel-count">{activeEquipment.length} unassigned / {equipment.length} total</span>
            </div>
            <div className="panel-body">
              <div className="form-row">
                <input className="input input-sm" placeholder="Type" maxLength={2} value={eLetters}
                  onChange={e => setELetters(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }} />
                <input className="input" placeholder="7–9 digit number" value={eNumber}
                  onChange={e => setENumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  style={{ flex: 1, fontFamily: "'IBM Plex Mono', monospace" }} />
              </div>
              <div className="form-row">
                <input className="input input-md" placeholder="Description (optional)" value={eDesc}
                  onChange={e => setEDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && addEquipment()} />
                <button className="btn btn-primary" disabled={busy} onClick={addEquipment}>Add</button>
              </div>
              {eError && <div className="error">{eError}</div>}
              <hr className="divider" />
              <div className="list">
                {equipment.length === 0 && <div className="empty">No equipment added yet.</div>}
                {activeEquipment.length === 0 && equipment.length > 0 && <div className="empty">All equipment assigned.</div>}
                {activeEquipment.map(e => {
                  const isPending = pendingEquipIds.has(e.id);
                  return (
                    <div className={`list-item${isPending ? " is-pending" : ""}`} key={e.id}>
                      <div className="list-item-left">
                        <span className={`tag${isPending ? " tag-amber" : ""}`}>{e.letters || "—"}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {isPending && <span className="pending-dot" />}
                            <span className="equip-num" style={isPending ? { color: "#f5a623" } : {}}>{e.number}</span>
                          </div>
                          {e.description && <div className="item-sub">{e.description}</div>}
                        </div>
                      </div>
                      <button className="btn btn-danger" disabled={busy} onClick={() => removeEquipment(e.id)}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
