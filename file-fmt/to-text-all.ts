import { parseXml, toText } from "./song.ts";

const container = "../Songs";

const songFileName = (file: string) => file.toLowerCase().endsWith(".xml");
const notSongFileName = (file: string) => !songFileName(file);

for await (const file of Deno.readDir(container)) {
  if (file.isDirectory || notSongFileName(file.name)) continue;
  const xml = await Deno.readTextFile(`${container}/${file.name}`);
  try {
    const song = parseXml(file.name, xml);
    const text = toText(song);
    console.log(`---\n${text}`);
  } catch (err) {
    console.log(`Failed parsing '${file.name}': '${xml}'`);
  }
}
console.log("...");
