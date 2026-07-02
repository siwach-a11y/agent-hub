import { promises as fs } from "node:fs";
import path from "node:path";
import { DiscoveredOffer, PipelineStatus, QueueFilter, UpsertResult } from "./types";

/**
 * Persistence for the discovery pipeline.
 *
 * The default driver persists to a JSON file under `.data/` for local dev and
 * the OpenNext server, falling back to an in-memory map when the filesystem is
 * unavailable (e.g. Cloudflare Workers). Swap in a Supabase/D1 driver for
 * production by implementing this same interface (Fando's env-first ethos).
 */
export interface PipelineStore {
  list(filter?: QueueFilter): Promise<DiscoveredOffer[]>;
  get(id: string): Promise<DiscoveredOffer | null>;
  /** Insert offers, skipping ids that already exist (canonical dedupe). */
  upsertMany(offers: DiscoveredOffer[]): Promise<UpsertResult>;
  updateStatus(
    id: string,
    status: PipelineStatus,
    patch?: Partial<DiscoveredOffer>
  ): Promise<DiscoveredOffer | null>;
}

const DATA_FILE = path.join(process.cwd(), ".data", "pipeline.json");

// Module-global fallback so at least a single serverless isolate keeps state.
const memory: { offers: Map<string, DiscoveredOffer> } = { offers: new Map() };
let loadedFromDisk = false;

async function readDisk(): Promise<DiscoveredOffer[] | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as DiscoveredOffer[];
  } catch {
    return null;
  }
}

async function writeDisk(offers: DiscoveredOffer[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(offers, null, 2), "utf8");
  } catch {
    // Filesystem unavailable (serverless) — memory map remains the source.
  }
}

async function ensureLoaded(): Promise<void> {
  if (loadedFromDisk) return;
  const disk = await readDisk();
  if (disk) {
    memory.offers = new Map(disk.map((o) => [o.id, o]));
  }
  loadedFromDisk = true;
}

async function persist(): Promise<void> {
  await writeDisk(Array.from(memory.offers.values()));
}

function matches(o: DiscoveredOffer, f?: QueueFilter): boolean {
  if (!f) return true;
  if (f.status && o.status !== f.status) return false;
  if (f.country && o.country !== f.country) return false;
  if (f.category && o.category !== f.category) return false;
  if (f.rewardType && o.rewardType !== f.rewardType) return false;
  return true;
}

export const fileStore: PipelineStore = {
  async list(filter) {
    await ensureLoaded();
    return Array.from(memory.offers.values())
      .filter((o) => matches(o, filter))
      .sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
  },

  async get(id) {
    await ensureLoaded();
    return memory.offers.get(id) ?? null;
  },

  async upsertMany(offers) {
    await ensureLoaded();
    let added = 0;
    let skipped = 0;
    const accepted: DiscoveredOffer[] = [];
    for (const o of offers) {
      if (memory.offers.has(o.id)) {
        skipped++;
        continue;
      }
      memory.offers.set(o.id, o);
      accepted.push(o);
      added++;
    }
    if (added) await persist();
    return { added, skipped, offers: accepted };
  },

  async updateStatus(id, status, patch) {
    await ensureLoaded();
    const current = memory.offers.get(id);
    if (!current) return null;
    const updated: DiscoveredOffer = { ...current, ...patch, status };
    memory.offers.set(id, updated);
    await persist();
    return updated;
  },
};

/** Active store — single place to swap in a Supabase/D1 driver later. */
export const store: PipelineStore = fileStore;
