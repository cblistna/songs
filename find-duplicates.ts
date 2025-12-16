// Script to find duplicate songs by comparing content similarity

const songsDirectory = "lyrics/";

const songFileName = (file: string) => file.toLowerCase().endsWith(".txt");

// Normalize text for comparison: lowercase, remove diacritics, extra whitespace
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Calculate similarity ratio between two strings using Jaccard similarity on words
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Word-based Jaccard similarity (only words with length > 2)
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;

  return intersection / union;
}

// Read all songs
const songs: { name: string; content: string; normalized: string }[] = [];

for await (const file of Deno.readDir(songsDirectory)) {
  if (file.isDirectory || !songFileName(file.name)) continue;

  const content = await Deno.readTextFile(`${songsDirectory}/${file.name}`);
  const normalized = normalizeText(content);

  // Skip empty or very short files
  if (normalized.length < 20) continue;

  songs.push({ name: file.name, content, normalized });
}

console.log(`Analyzing ${songs.length} songs for duplicates...\n`);

// Find duplicates (similarity > 0.7)
const SIMILARITY_THRESHOLD = 0.7;
const duplicates: { files: [string, string]; similarity: number }[] = [];
const processed = new Set<string>();

for (let i = 0; i < songs.length; i++) {
  for (let j = i + 1; j < songs.length; j++) {
    const sim = similarity(songs[i].normalized, songs[j].normalized);

    if (sim >= SIMILARITY_THRESHOLD) {
      duplicates.push({
        files: [songs[i].name, songs[j].name],
        similarity: sim,
      });
    }
  }
}

// Sort by similarity (highest first)
duplicates.sort((a, b) => b.similarity - a.similarity);

// Output results
console.log(
  `Found ${duplicates.length} pairs of similar songs (>= ${
    SIMILARITY_THRESHOLD * 100
  }% similarity):\n`,
);

for (const dup of duplicates) {
  const simPercent = (dup.similarity * 100).toFixed(1);
  console.log(`[${simPercent}%] ${dup.files[0]}`);
  console.log(`        ${dup.files[1]}`);
  console.log();
}
