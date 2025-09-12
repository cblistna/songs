import { parseText, Song, toXml } from "./song.ts";

const source = Deno.args[0];
const destination = Deno.args[1];

console.log(
  `Converting songs from text -> xml, source: '${source}', destination: '${destination}'...`,
);

const songFileName = (file: string) => file.toLowerCase().endsWith(".txt");
const notSongFileName = (file: string) => !songFileName(file);

let songs = 0;
let failed = 0;
for await (const file of Deno.readDir(source)) {
  if (file.isDirectory || notSongFileName(file.name)) continue;
  const text = await Deno.readTextFile(`${source}/${file.name}`);
  try {
    const song = parseText(text);
    if (!song) {
      throw new Error(`Failed to parse song from ${file.name}`);
    }
    const xml = toXml(song);
    await Deno.writeTextFile(`${destination}/${file.name.replace(/\.txt$/, ".xml")}`, xml);
    songs++;
  } catch (err) {
    console.log(`Failed parsing '${file.name}'.`);
    failed++;
  }
}

console.log(`Converted ${songs} song(s), failed: ${failed}.`);
