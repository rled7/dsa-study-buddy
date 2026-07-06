// ─── Brain (v3: growing local RAG knowledge base) ──────────────────────────
//
// Client-side only, matching the rest of this app's no-server architecture.
// The locked spec named sqlite-vec/LanceDB, but both need a backend process,
// which would break the static `base: './'` build this app ships as (drop
// dist/ anywhere, no server). At this app's scale — a personal notes corpus,
// not a search engine — a linear cosine scan over IndexedDB-stored vectors
// is plenty fast and keeps the "no server" promise intact.

export interface BrainChunk {
  id: string;
  sourceTitle: string;
  text: string;
  embedding: number[];
  createdAt: number;
}

export interface RetrievedChunk {
  text: string;
  sourceTitle: string;
  score: number;
}

const DB_NAME = "dsa_study_buddy_brain";
const DB_VERSION = 1;
const STORE_NAME = "chunks";

const OLLAMA_EMBED_URL = "http://localhost:11434/api/embed";
const OLLAMA_EMBED_MODEL = "nomic-embed-text";

const MAX_CHUNK_CHARS = 800;

function openBrainDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch(OLLAMA_EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input: text }),
  });
  if (!res.ok) {
    throw new Error(`Ollama embed responded ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const vec = data?.embeddings?.[0];
  if (!Array.isArray(vec)) {
    throw new Error("Ollama returned no embedding");
  }
  return vec;
}

// Paragraph-first split, falling back to sentence-packing for long paragraphs.
// Deliberately NOT LLM-distilled: distilling per chunk means a full generation
// call per paragraph (slow for anything but tiny inputs) and can strip the
// exact wording a later query needs to match against. Raw-but-chunked text
// embeds and retrieves better; distillation is a fair future refinement for
// what gets *injected*, not what gets *embedded*.
function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_CHARS) {
      chunks.push(para);
      continue;
    }
    const sentences = para.split(/(?<=[.?!])\s+/);
    let current = "";
    for (const sentence of sentences) {
      if (current && current.length + sentence.length + 1 > MAX_CHUNK_CHARS) {
        chunks.push(current);
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function ingestText(sourceTitle: string, rawText: string): Promise<{ chunksAdded: number }> {
  const pieces = chunkText(rawText);
  const db = await openBrainDb();
  let added = 0;
  for (const text of pieces) {
    const embedding = await embed(text);
    const chunk: BrainChunk = {
      id: crypto.randomUUID(),
      sourceTitle,
      text,
      embedding,
      createdAt: Date.now(),
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(chunk);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    added++;
  }
  db.close();
  return { chunksAdded: added };
}

export async function getAllChunks(): Promise<BrainChunk[]> {
  const db = await openBrainDb();
  const chunks = await new Promise<BrainChunk[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as BrainChunk[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return chunks.sort((a, b) => b.createdAt - a.createdAt);
}

export async function clearBrain(): Promise<void> {
  const db = await openBrainDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function retrieveRelevant(query: string, topK = 3): Promise<RetrievedChunk[]> {
  const all = await getAllChunks();
  if (all.length === 0) return [];
  const queryEmbedding = await embed(query);
  return all
    .map((c) => ({
      text: c.text,
      sourceTitle: c.sourceTitle,
      score: cosineSimilarity(queryEmbedding, c.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
