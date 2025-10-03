# Lyrics features

## Select playlists

- static web page, single HTML file, embedded CSS and JS
- songs with lyrics are embedded in the HTML file as big JSON array of songs
- provides search with lookup dropdown of song titles
- would load songs by fetching from  'songs.json' assumes web static file web server running
- creates in memory index of song titles and first line of song lyrics
- use trigram fuzzy search
- use lower case letters, remove accents from song title and first line of song when indexing
