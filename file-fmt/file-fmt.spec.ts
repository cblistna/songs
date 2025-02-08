import { describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

export type Song = {
  file: string;
  title: string;
  alt: string | undefined;
  sections: Section[];
  outline: string[];
  tags: string[];
};

export type Section = {
  id: string;
  slides: string[][];
};

const parse: (text: string) => Song | undefined = (text: string) => {
  type ParserState =
    | "title"
    | "outline"
    | "sections"
    | "section"
    | "slides"
    | "slide"
    | "error";

  const titlePattern =
    /^(?<title>[^(]+?)(\s*\((?<alt>[^)]+?)\)?)?\s*(?<tags>#.+?)?\s*$/;

  const state = {
    name: "title" as ParserState,
    song: {
      title: undefined as unknown as string,
      alt: undefined as string | undefined,
      file: undefined as unknown as string,
      sections: [] as Section[],
      outline: [] as string[],
      tags: undefined as string[] | undefined,
    },
  };

  const sectionTag = (line: string) => line.startsWith(":");
  const noSection = () => state.song.sections.length === 0;
  const lastSection = () => state.song.sections[state.song.sections.length - 1];
  const lastSlide = () => lastSection().slides[lastSection().slides.length - 1];

  const parser = {
    title: (line: string) => {
      const { title, alt, tags: rawTags } = titlePattern.exec(line)?.groups!;
      const file = [title, alt].filter((i) => i).join(" ") + ".xml";
      const tags = rawTags ? rawTags.split(/ *#/).filter((i) => i) : [];
      state.song = { ...state.song, title, alt, file, tags };
      return "outline";
    },
    outline: (line: string) => {
      if (line) state.song = { ...state.song, outline: line.split(/\s+/) };
      return "sections";
    },
    sections: (line: string) => {
      if (sectionTag(line)) {
        if (lastSection() && lastSlide()?.length === 0) {
          lastSection().slides.pop();
        }
        state.song.sections.push({ id: line.substring(1), slides: [] });
        return "section";
      }
      return "sections";
    },
    section: (line: string) => {
      if (noSection()) "error";
      if (!line) return "section";
      return "slides!";
    },
    slides: (line: string) => {
      if (noSection()) "error";
      if (sectionTag(line)) return "sections!";
      if (line) {
        lastSection().slides.push([]);
        return "slide!";
      }
      return "slides";
    },
    slide: (line: string) => {
      if (noSection()) "error";
      if (sectionTag(line)) return "sections!";
      if (!line) return "slides";
      lastSlide().push(line);
      return "slide";
    },
    error: () => "error",
  };

  const events = [...text.trim().split("\n").map((l) => l?.trim())];

  events.forEach((event) => {
    while (true) {
      const next = parser[state.name](event);
      state.name = next.replaceAll("!", "") as ParserState;
      if (next.endsWith("!")) continue;
      break;
    }
  });

  return state.name !== "error" ? state.song as Song : undefined;
};

describe("song model", () => {
  it("should parse format to structure", () => {
    const parsed = parse(text);
    assertEquals(parsed, song);
  });
  it("should have structure", () => {
    assert(song.title);
  });
});

const text = `
A Song Title (Alternative Title) #Leszek #new
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
  file: "A Song Title Alternative Title.xml",
  title: "A Song Title",
  alt: "Alternative Title",
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
