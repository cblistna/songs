#!/usr/bin/env bash

if [ $# -eq 0 ]; then
  echo "usage: hash-dir.sh <dir-path>" >&2
  exit 1
fi

pushd "$1" >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Dir not found: '$1'." >&2
  exit 1
fi

md5sum * 2>/dev/null | sed 's/  /|/'

popd >/dev/null 2>&1

