#!/bin/sh

# Get clipboard contents (one entry per line)
CLIPBOARD_CONTENT=$(xclip -o -selection clipboard)

# Calculate days until next Sunday (0=Sunday, 6=Saturday)
TODAY_DOW=$(date +%w)  # 0=Sunday, 1=Monday, ..., 6=Saturday
if [ "$TODAY_DOW" -eq 0 ]; then
  DAYS_UNTIL_SUNDAY=7
else
  DAYS_UNTIL_SUNDAY=$((7 - TODAY_DOW))
fi

# POSIX date arithmetic workaround:
NEXT_SUNDAY=$(date -d "+$DAYS_UNTIL_SUNDAY days" +%Y-%m-%d 2>/dev/null)
if [ -z "$NEXT_SUNDAY" ]; then
  # For BSD/macOS, fallback using 'date -v'
  NEXT_SUNDAY=$(date -v+${DAYS_UNTIL_SUNDAY}d +%Y-%m-%d)
fi

FILENAME="${NEXT_SUNDAY}_nedele.xml"
SETNAME="${NEXT_SUNDAY}_nedele"

# Write XML to file
{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n'
  printf '<set name="%s">\n' "$SETNAME"
  printf '  <slide_groups>\n'
  printf '%s\n' "$CLIPBOARD_CONTENT" | while IFS= read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue
    # Replace .txt at end with .xml
    name=$(printf '%s' "$line" | sed 's/\.txt$/.xml/')
    printf '    <slide_group name="%s" type="song" presentation="" path=""/>\n' "$name"
  done
  printf '  </slide_groups>\n'
  printf '</set>\n'
} > "$FILENAME"

printf 'XML file generated: %s\n' "$FILENAME"
