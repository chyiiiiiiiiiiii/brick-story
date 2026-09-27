// Scenes -> audio/sfx_events.json (every brick landing, figure drop, sign pop and scene transition).
import { mkdirSync, writeFileSync } from "node:fs";
import { allSfx } from "../src/engine/resolve";
import { TOTAL } from "../src/engine/story";

mkdirSync(new URL("../audio/", import.meta.url), { recursive: true });
const events = allSfx();
writeFileSync(new URL("../audio/sfx_events.json", import.meta.url), JSON.stringify({ fps: 30, total: TOTAL, events }));
console.log(`${events.length} sound events`);
