import { parse as parse } from "https://deno.land/x/xml@6.0.4/mod.ts";

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

export const toXml: (song: Song) => string = (song: Song) => {
  return "";
};

export const toText: (song: Song) => string = (song: Song) => {
  return "";
};

export const parseXml: (file: string, xml: string) => Song | undefined = (
  file: string,
  xml: string,
) => {
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

  const sectionTag = (line: string) => line.match(/^\[.+\]$/);
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
        state.song.sections.push({
          id: line.substring(1, line.length - 1),
          slides: [],
        });
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
      lastSlide().push(line.replaceAll("||", "").trim());
      if (line.endsWith("||")) return "slides";
      return "slide";
    },
    error: () => "error",
  };

  const { song } = parse(xml) as unknown as {
    song: { title: string; lyrics: string; presentation: string };
  };

  const events = [
    song.title,
    song.presentation,
    ...song.lyrics.trim().split("\n").map((l) => l?.trim()),
  ];

  events.forEach((event) => {
    while (true) {
      const next = parser[state.name](event);
      state.name = next.replaceAll("!", "") as ParserState;
      if (next.endsWith("!")) continue;
      break;
    }
  });

  state.song.tags = [];
  state.song.file = file;

  return state.name !== "error" ? state.song as Song : undefined;
};

export const parseText: (text: string) => Song | undefined = (text: string) => {
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
