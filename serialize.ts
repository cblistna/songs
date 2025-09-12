import { expandGlob } from "https://deno.land/std@0.210.0/fs/expand_glob.ts";

const globPattern = Deno.args[0];
const separator = Deno.args[1];
const outputFile = Deno.args[2];

if (!globPattern || !separator || !outputFile) {
  console.error(
    "Usage: deno run -A serialize.ts <glob-pattern> <separator> <output-file>",
  );
  console.error(
    "Example: deno run -A serialize.ts 'songs-text/*.txt' '<<<' output.txt",
  );
  Deno.exit(1);
}

console.log(
  `Serializing files matching '${globPattern}' with separator '${separator}' to '${outputFile}'...`,
);

let fileCount = 0;

try {
  // Clear/create the output file
  await Deno.writeTextFile(outputFile, "");

  for await (const file of expandGlob(globPattern)) {
    if (file.isFile) {
      const content = await Deno.readTextFile(file.path);

      // Combine separator and content in single write
      const writeContent = fileCount > 0
        ? `\n${separator}\n\n${content}`
        : content;

      await Deno.writeTextFile(outputFile, writeContent, { append: true });

      fileCount++;
      console.log(`Added: ${file.name}`);
    }
  }

  console.log(
    `Successfully serialized ${fileCount} file(s) to '${outputFile}'.`,
  );
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  Deno.exit(1);
}
