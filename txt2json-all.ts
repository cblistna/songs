import { parseText, Song } from "./song.ts";

const songsDirectory = "lyrics/";

console.error(
  `Converting songs from text -> json, source: '${songsDirectory}'...`,
);

const isSongFile = (file: string) => file.toLowerCase().endsWith(".txt");

let songs = 0;
let failed = 0;
const songsMap: Record<string, Song> = {};

// Deterministic processing order (Deno.readDir has no guaranteed order).
const entries: Deno.DirEntry[] = [];
for await (const entry of Deno.readDir(songsDirectory)) entries.push(entry);
entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const usedKeys = new Set<string>();
const usedFiles = new Set<string>();

const asciiFold: Record<string, string> = {
  "ł": "l",
  "Ł": "L",
  "ø": "o",
  "Ø": "O",
  "ß": "ss",
  "æ": "ae",
  "Æ": "AE",
  "ð": "d",
  "Ð": "D",
  "þ": "th",
  "Þ": "TH",
  "đ": "d",
  "Đ": "D",
  "ı": "i",
  "ſ": "s",
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\x00-\x7f]/g, (c) => asciiFold[c] ?? c)
    .toLowerCase();

const fileStem = (fileName: string) => fileName.replace(/\.txt$/i, "");

// Keep only the part of the file name not explained by the title.
// "Godzien chwaly Leszek" + title "Godzien chwały" -> "Leszek"
function filenameToken(baseTitle: string, fileName: string): string | null {
  const baseWords = normalize(baseTitle).split(/[\s_-]+/).filter(Boolean);
  const rawWords = fileStem(fileName).split(/[\s_-]+/).filter(Boolean);
  let bi = 0;
  const remainder: string[] = [];
  for (const word of rawWords) {
    if (bi < baseWords.length && normalize(word) === baseWords[bi]) {
      bi++;
    } else {
      remainder.push(word);
    }
  }
  return remainder.join(" ") || null;
}

function uniqueSongKey(
  title: string,
  fileName: string,
  used: Set<string>,
): string {
  if (!used.has(title)) return title;

  const token = filenameToken(title, fileName);
  if (token && !used.has(`${title} (${token})`)) {
    return `${title} (${token})`;
  }

  // Opaque but collision-proof last resort; never fails the build.
  let ordinal = 2;
  while (used.has(`${title} (${ordinal})`)) ordinal++;
  return `${title} (${ordinal})`;
}

for (const file of entries) {
  if (file.isDirectory || !isSongFile(file.name)) continue;

  const text = await Deno.readTextFile(`${songsDirectory}/${file.name}`);

  try {
    const song = parseText(text);
    if (!song) {
      throw new Error(`Failed to parse song from ${file.name}`);
    }

    const key = uniqueSongKey(song.title, file.name, usedKeys);
    usedKeys.add(key);

    // Keep the exported .xml name unique too.
    if (usedFiles.has(song.file)) {
      song.file = `${fileStem(file.name)}.xml`;
    }
    usedFiles.add(song.file);

    songsMap[key] = song;
    songs++;
  } catch (err) {
    console.error(`Failed parsing '${file.name}': ${err}`);
    failed++;
  }
}

console.error(`Converted ${songs} song(s), failed: ${failed}.`);
console.log(JSON.stringify(songsMap, null, 2));
