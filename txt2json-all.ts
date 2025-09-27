import { parseText, Song } from "./song.ts";

const songsDirectory = "lyrics/";

console.error(
  `Converting songs from text -> json, source: '${songsDirectory}'...`,
);

const songFileName = (file: string) => file.toLowerCase().endsWith(".txt");
const notSongFileName = (file: string) => !songFileName(file);

let songs = 0;
let failed = 0;
const songsMap: Record<string, Song> = {};

for await (const file of Deno.readDir(songsDirectory)) {
  if (file.isDirectory || notSongFileName(file.name)) continue;

  const text = await Deno.readTextFile(`${songsDirectory}/${file.name}`);

  try {
    const song = parseText(text);
    if (!song) {
      throw new Error(`Failed to parse song from ${file.name}`);
    }

    const key = song.title;
    songsMap[key] = song;
    songs++;
  } catch (err) {
    console.error(`Failed parsing '${file.name}': ${err}`);
    failed++;
  }
}

console.error(`Converted ${songs} song(s), failed: ${failed}.`);
console.log(JSON.stringify(songsMap, null, 2));
