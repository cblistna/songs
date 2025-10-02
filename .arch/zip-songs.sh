#!/usr/bin/env bash

if [ ! $# -eq 2 ]; then
  echo "usage: zip-songs.sh <songs-zip-archive-path> <songs-source-dir-path>" >&2
  exit 1
fi

if [ -f "$1" ]; then
  echo "Songs archive alredy exists '$1'." >&2
  exit 1
fi
archive="$(realpath "$1")"

songs="$(cd "$2" >/dev/null && pwd)"
if [ ! -d "$songs" ]; then
  echo "Songs dir not found '$2'." >&2
  exit 1
fi
echo "Songs source dir '"$(realpath --relative-to="$PWD" "$songs")"' contains "$(ls $songs | wc -l)" songs." >&2

temp=$(mktemp -d -p /tmp songs.XXXX)

pushd "$temp" >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Failed creating temp folder '$temp'." >&2
  exit 1
fi

cp -r "$songs" "./"
if [ $? -ne 0 ]; then
  echo "Failed copying songs to '$temp'." >&2
  exit 1
fi

if [ "$(basename "$songs")" != "Songs" ]; then
  mv "./$(basename "$songs")" "Songs"
fi
if [ ! -d "$temp/Songs" ]; then
  echo "Failed renaming to '$temp/Songs'." >&2
  exit 1
fi

zip -r -UN=UTF8 "$archive" Songs >/dev/null
if [ $? -ne 0 ]; then
  echo "Failed creating songs archive '$archive'." >&2
  exit 1
fi

popd >/dev/null 2>&1

echo "Created songs archive '"$(realpath --relative-to="$PWD" "$archive")"' containing "$(unzip -l "$archive" | grep '/' | grep -v -E '/$' | grep -v 'Archive: ' | wc -l)" song(s)." >&2

rm -rf "$temp"

