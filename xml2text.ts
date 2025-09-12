import { parseXml, Song, toText } from "./song.ts";

const source = Deno.args[0];
const destination = Deno.args[1];

console.log(
  `Converting songs from xml -> text, source: '${source}', destination: '${destination}'...`,
);

const songFileName = (file: string) => file.toLowerCase().endsWith(".xml");
const notSongFileName = (file: string) => !songFileName(file);
const toTextFileName = (song: Song) => song.file.replace(/\.xml$/, ".txt");

let songs = 0;
let failed = 0;
for await (const file of Deno.readDir(source)) {
  if (file.isDirectory || notSongFileName(file.name)) continue;
  const xml = await Deno.readTextFile(`${source}/${file.name}`);
  try {
    const song = parseXml(file.name, xml);
    if (!song) {
      throw new Error(`Failed to parse XML from ${file.name}`);
    }
    const text = toText(song);
    // await Deno.writeTextFile(`${destination}/${toTextFileName(song)}`, text);
    await Deno.writeTextFile(`${destination}/${file.name.replace(/\.xml$/, ".txt")}`, text);
    songs++;
  } catch (err) {
    console.log(`Failed parsing '${file.name}'.`);
    failed++;
  }
}

console.log(`Converted ${songs} song(s), failed: ${failed}.`);
