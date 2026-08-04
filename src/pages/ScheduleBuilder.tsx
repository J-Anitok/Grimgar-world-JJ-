import React, { useEffect, useState } from "react";
import * as G from "../data/grimgar";

export default function ScheduleBuilder(): JSX.Element {
  const [schedules, setSchedules] = useState<G.TrainingSchedule[]>([]);
  const [npcs, setNpcs] = useState<Record<string, G.NPC>>({});
  const [name, setName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("grimgar_schedules_v1");
    if (raw) setSchedules(JSON.parse(raw));
    setNpcs(G.loadNPCsFromStorage());
  }, []);

  function persist(next: G.TrainingSchedule[]) {
    localStorage.setItem("grimgar_schedules_v1", JSON.stringify(next));
    setSchedules(next);
  }

  function addSchedule() {
    const id = `sched_${Date.now()}`;
    const s: G.TrainingSchedule = { id, name: name || "New Schedule", sessions: [] };
    const next = [...schedules, s];
    persist(next);
    setName("");
  }

  function addSession(scheduleId: string) {
    const next = schedules.map(s => {
      if (s.id !== scheduleId) return s;
      const session: G.TrainingSession = { id: `sess_${Date.now()}`, name: "Session", statDeltas: { STR: 1 } } as any;
      return { ...s, sessions: [...s.sessions, session] };
    });
    persist(next);
  }

  function runSchedule(scheduleId: string) {
    const s = schedules.find(x => x.id === scheduleId);
    if (!s) return;
    const selected = Object.keys(npcs); // run on all NPCs for demo
    G.trainSelected(npcs, s, selected, {} as any);
    G.saveNPCsToStorage(npcs);
    alert("Ran schedule on all NPCs (for demo).\nYou can modify schedule.assigned NPCs in code or expand UI.");
  }

  return (
    <div>
      <h2>Training Schedule Builder</h2>
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Schedule name" />
        <button onClick={addSchedule}>Create Schedule</button>
      </div>
      <div style={{ marginTop: 12 }}>
        {schedules.map(s => (
          <div key={s.id} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
            <h4>{s.name}</h4>
            <div>Sessions: {s.sessions.length}</div>
            <button onClick={() => addSession(s.id)}>Add Session</button>
            <button onClick={() => runSchedule(s.id)} style={{ marginLeft: 8 }}>Run on all NPCs (demo)</button>
            <ul>
              {s.sessions.map(sess => (
                <li key={sess.id}>{sess.name} — {JSON.stringify(sess.statDeltas)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
