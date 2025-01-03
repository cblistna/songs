import {
  Entry,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
} from "https://deno.land/x/zipjs@v2.7.54/index.js";

const release = await fetch(
  `https://api.github.com/repos/cblistna/songs/releases/latest`,
  {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  },
);

if (!release.ok) {
  throw new Error(`Failed to fetch latest release: ${release.statusText}`);
}

const asset = (await release.json()).assets.find((
  asset: Record<string, string>,
) => asset.name.startsWith("songs-v"));

if (!asset) {
  throw new Error(`Songs asset not found in the release.`);
}

const artifact = await fetch(asset.browser_download_url);

if (!artifact.body) {
  throw new Error(
    `Failed to download artifact: ${asset.browser_download_url}.`,
  );
}

const archive = new ZipReader(
  new Uint8ArrayReader(new Uint8Array(await artifact.arrayBuffer())),
  { useWebWorkers: false },
);

const entries: Entry[] = await archive.getEntries();
for (const entry of entries) {
  if (entry.directory) {
    await Deno.mkdir(`${entry.filename}`, { recursive: true });
  } else if (entry.getData) {
    const song = await entry.getData(new Uint8ArrayWriter());
    await Deno.writeFile(`${entry.filename}`, song);
    console.log(entry.filename);
  }
}

archive.close();

console.log("Done.");
