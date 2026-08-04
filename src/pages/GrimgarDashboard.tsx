import React, { useEffect, useState } from "react";
import GrimgarUI from "./GrimgarUI";
import NPCEditor from "./NPCEditor";
import ScheduleBuilder from "./ScheduleBuilder";
import SubstatEditor from "./SubstatEditor";
import ImportExport from "./ImportExport";

export default function GrimgarDashboard(): JSX.Element {
  const [tab, setTab] = useState<string>("ui");

  return (
    <div style={{ padding: 12 }}>
      <h1>Grimgar Dashboard</h1>
      <nav style={{ marginBottom: 12 }}>
        <button onClick={() => setTab("ui")}>Quick UI</button>
        <button onClick={() => setTab("npc")}>NPC Editor</button>
        <button onClick={() => setTab("schedule")}>Schedule Builder</button>
        <button onClick={() => setTab("substat")}>Substat & Ripple</button>
        <button onClick={() => setTab("import")}>Import / Export</button>
      </nav>
      <div>
        {tab === "ui" && <GrimgarUI />}
        {tab === "npc" && <NPCEditor />}
        {tab === "schedule" && <ScheduleBuilder />}
        {tab === "substat" && <SubstatEditor />}
        {tab === "import" && <ImportExport />}
      </div>
    </div>
  );
}
