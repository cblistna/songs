import { describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { parseText, parseXml, Song, toText, toXml } from "./song.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

describe("Song", () => {
  it("should serialize to xml", () => {
    assertEquals(toXml(song), xml);
  });
  it("should serialize to text", () => {
    assertEquals(toText(song), text);
  });
  it("should parse xml", () => {
    assertEquals(parseXml(song.file, xml), {
      ...song,
      alt: undefined,
      tags: [],
    });
  });
  it("should parse text", () => {
    assertEquals(parseText(text), song);
  });
  it("should have structure", () => {
    assert(song);
  });
});

const xml = `<?xml version='1.0' encoding='UTF-8'?>
<song>
  <title>A Song Title</title>
  <lyrics>[V1]
 [C]Verse 1 l[e]ine 1
 [D]Verse 1 l[a]ine 2 ||
 [C]Verse 1 l[e]ine 3
 [D]Verse 1 l[a]ine 4

[V2]
 [C]Verse 2 l[e]ine 1
 [D]Verse 2 l[a]ine 2 ||
 [C]Verse 2 l[e]ine 3
 [D]Verse 2 l[a]ine 4

[C]
 [C]Chorus  l[e]ine 1
 [D]Chorus  l[a]ine 2
</lyrics>
<presentation>V1 C V2 C</presentation>
</song>
`;

const text = `A Song Title (Alternative Title ěščř) #Leszek #new
V1 C V2 C

:V1
[C]Verse 1 l[e]ine 1
[D]Verse 1 l[a]ine 2

[C]Verse 1 l[e]ine 3
[D]Verse 1 l[a]ine 4

:V2
[C]Verse 2 l[e]ine 1
[D]Verse 2 l[a]ine 2

[C]Verse 2 l[e]ine 3
[D]Verse 2 l[a]ine 4

:C
[C]Chorus  l[e]ine 1
[D]Chorus  l[a]ine 2
`;
const song: Song = {
  file: "A Song Title Alternative Title escr.xml",
  title: "A Song Title",
  alt: "Alternative Title ěščř",
  sections: [
    {
      id: "V1",
      slides: [
        [
          "[C]Verse 1 l[e]ine 1",
          "[D]Verse 1 l[a]ine 2",
        ],
        [
          "[C]Verse 1 l[e]ine 3",
          "[D]Verse 1 l[a]ine 4",
        ],
      ],
    },
    {
      id: "V2",
      slides: [
        [
          "[C]Verse 2 l[e]ine 1",
          "[D]Verse 2 l[a]ine 2",
        ],
        [
          "[C]Verse 2 l[e]ine 3",
          "[D]Verse 2 l[a]ine 4",
        ],
      ],
    },
    {
      id: "C",
      slides: [[
        "[C]Chorus  l[e]ine 1",
        "[D]Chorus  l[a]ine 2",
      ]],
    },
  ],
  outline: ["V1", "C", "V2", "C"],
  tags: ["Leszek", "new"],
};
