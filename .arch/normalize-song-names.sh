#!/usr/bin/env bash

if [ ! $# -eq 1 ]; then
  echo "Normalize song names in place. Song file names would:" >&2
  echo "  - use only [a-zA-Z0-9 ] characters (except for '.xml' suffix)" >&2
  echo "  - end with .xml suffix" >&2
  echo "  - no double, no leading, and no trailing spaces" >&2
  echo "  - no text in parenthesis (.*)" >&2
  echo "" >&2
  echo "usage: normalize-song-names.sh <songs-path>" >&2
  exit 1
fi

songs="$(cd "$1" >/dev/null && pwd)"
if [ ! -d "$songs" ]; then
  echo "Songs dir not found '$2'." >&2
  exit 1
fi

echo "Songs dir '"$(realpath --relative-to="$PWD" "$songs")"' contains "$(ls $songs | wc -l)" songs." >&2

for song in "$songs"/*; do
  base=$(basename "$song")
  name=$(echo "$base" | iconv -f utf8 -t ascii//TRANSLIT | sed -E 's/\(.*\)//g; s/.xml$//; s/[^a-zA-Z0-9 ]/ /g; s/  +/ /g; s/^ +//; s/ +$//').xml
  if [ "${songs}/${name}" != "$song" ]; then
    if [ -f "${songs}/${name}" ]; then
      echo "Skipped '$base', target file '$name' already exists." >&2
    else
      mv "$song" "${songs}/${name}"
      echo "Renamed '$base' -> '$name'." >&2
    fi
  fi
done

