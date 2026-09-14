import { parseText, Song, toXml } from "./song.ts";

const source = Deno.args[0];
const destination = Deno.args[1];

console.log(
  `Converting songs from text -> xml, source: '${source}', destination: '${destination}'...`,
);

const isSongFile = (file: string) => file.toLowerCase().endsWith(".txt");

let songs = 0;
let failed = 0;

const entries: Deno.DirEntry[] = [];
for await (const entry of Deno.readDir(source)) entries.push(entry);
entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const fileStem = (fileName: string) => fileName.replace(/\.txt$/i, "");
const usedFiles = new Set<string>();

for (const file of entries) {
  if (file.isDirectory || !isSongFile(file.name)) continue;

  const text = await Deno.readTextFile(`${source}/${file.name}`);

  try {
    const song = parseText(text);
    if (!song) {
      throw new Error(`Failed to parse song from ${file.name}`);
    }

    if (usedFiles.has(song.file)) {
      song.file = `${fileStem(file.name)}.xml`;
    }
    usedFiles.add(song.file);

    await Deno.writeTextFile(`${destination}/${song.file}`, toXml(song));
    songs++;
  } catch (err) {
    console.log(`Failed parsing '${file.name}'.`);
    failed++;
  }
}

console.log(`Converted ${songs} song(s), failed: ${failed}.`);
