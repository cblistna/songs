# Conversation History

---

**User** (*2025-10-16 15:10:30*)

review, optimize playlist sharing, loadig, check for errors, inconsistencies

do not fix, explain problems, suggest solution

---

**Assistant** (*2025-10-16 15:10:30*)

I’ll start by reading `index.html` and `songs.json` to review loading and sharing.

[Tool: read]

---

**Assistant** (*2025-10-16 15:10:36*)

[Tool: read]

---

**Assistant** (*2025-10-16 15:10:40*)

[Tool: read]

---

**Assistant** (*2025-10-16 15:10:48*)

Here’s a focused review of playlist loading and sharing, plus notable errors and inconsistencies. I’m not changing code; this is a diagnosis with concrete fixes to consider.

**Loading & Search**
- Data load timing: `loadSongsData()` runs before UI init, which is good. However, no visible “loading” state exists; search appears inert until data arrives. Suggest: show a lightweight loader or “Načítám písně…” until `songsData` is ready.
- Error surfacing: JSON load failure writes only into `#songDetailsContent`. Suggest: also disable search and show a prominent banner/toast with the fetch error.
- Normalization gaps: `removeAccents` uses NFD and drops only combining marks. Characters like Polish “ł/Ł” don’t decompose and are lost by `normalizeText`’s regex. Suggest: use NFKD + strip diacritics, and map “ł→l”, “đ→d”, “ß→ss”, etc., for consistent search.
- Main-thread work: building trigrams for all songs can jank on large sets. Suggest: offload trigram indexing to a Web Worker or precompute offline and ship with the dataset.

**Security (XSS)**
- Unsafe innerHTML: titles and first lines are interpolated into HTML without escaping in:
  - Search results (`displayResults` → `div.innerHTML = ...`)
  - Playlist items (`a.innerHTML = <strong>${it.title}</strong>...`)
  - Song content (`formatSongContent` renders raw text into innerHTML)
  If songs.json or remote items ever include HTML, this is an XSS vector. Suggest: render via `textContent` or escape before injecting; if formatting is required, sanitize using a vetted sanitizer.

**Playlist State & Export**
- Silent export drops: export ignores playlist items missing `songsData[item.songKey].file` without user notice. Suggest: warn which items couldn’t be exported and why.
- Export filename: downloaded file lacks “.xml”, which may hinder integrations. Suggest: append `.xml` to `a.download` or offer both options.
- XML shape: your output sets `<slide_group name="fileName" type="song" presentation="" path=""/>`. Verify target tool expects name=file and empty path; many presenters expect “name” as human title and “path” to point at the song file. If this XML feeds a downstream generator, align with its exact spec.

**Sharing (Client → Server)**
- Content-Type: POST uses `Content-Type: text/plain` with JSON body. Many servers expect `application/json`. Mismatch can cause 415/400s. Suggest: send `application/json`.
- Unhandled rejections: `sharePlaylist` throws on non-OK but never `.catch(...)`, causing unhandled promise rejections and no UI feedback on failure. Suggest: add catch, show user-visible error, and don’t mark shared state locally on failure.
- Share identifier: `playlistId` is derived from playlist name + username (“Playlist (User)”), which collides on rename or duplication. Suggest: include a stable client-side UUID in payload; store and use that for unshare.
- CORS and server URL: no CORS handling or timeouts; user misconfig (bad URL) fails silently except for console. Suggest: expose errors visibly, validate URL format, and test CORS preflight paths.
- Query assembly: `appendQueryString` uses `URLSearchParams(queryString).forEach(set)`, which overwrites duplicate keys and assumes `queryString` is parseable. If the server supplies an encoded query string with repeated params, behavior changes. Suggest: accept both `?a=1&b=2` and raw “a=1&b=2”, and preserve duplicate keys if required.

**Shared Playlists (Loading & Import)**
- Config option typo handling: accepts `option === "playlisQuery"` (typo) which is a good guard but signals upstream config inconsistency. Suggest: fix server config and keep the guard as fallback.
- Non-reactive dropdown: when remote playlists finish loading after opening dropdown, the UI stays in “Načítání…” state until closed/reopened. Suggest: re-render dropdown on load completion or add a refresh button.
- Payload validation: `normalizeRemotePlaylists` trusts `payload.songs` and uses raw strings if not found in `songsData`. Suggest: validate payload shape, filter unknown keys with a warning, and surface counts (e.g., “3/10 známých písní”).

**UX & Accessibility**
- Tab behavior: pressing Tab on search triggers selection of first result. That clashes with expected focus navigation. Suggest: reserve Enter to select; keep Tab for focus traversal.
- Focus jumps after actions: several actions force focus to search, which can be jarring (e.g., after share/unshare). Suggest: only restore focus when action originated from search.
- Playlist dropdown density: remote playlists are unsorted and ungrouped. Suggest: sort by updated/share time or label; include `sharedBy` for clarity.

**Error Handling & Resilience**
- LocalStorage writes: no quota/error handling when saving large playlists. Suggest: catch and show storage errors (quota exceeded), with guidance to prune.
- Remote fetch caching: `cache: "no-store"` is correct for freshness. Consider ETag and If-None-Match if server supports, to reduce bandwidth without staleness.

**Data Quality (songs.json)**
- Mixed punctuation/markers in lyric lines: several slides embed “V1:”, “C:”, “Ref:”, which then appear in first-line previews. If these are labels (not lyrics), consider dropping them at render time.
- Key naming oddities: entries like “Príď, tak príď,” (trailing comma), fully uppercase titles, and mixed casing (e.g., “set me free”) are okay internally but can surprise users and affect sorting. Suggest: maintain a display title separate from key; you already compute `displayTitle`, so consistently use it in UI.
- File field assumptions: if any future song lacks `file`, export will skip it; ensure toolchain that generates songs.json always sets `file`.

**Performance**
- List growth: playlist container is non-scrollable and can grow boundlessly. Very long playlists can degrade layout performance. Suggest: make it scrollable past a reasonable height and virtualize if it grows large.
- Global `touchmove` preventDefault: document-level handler can impact scroll perf on mobile. Suggest: scope to the playlist container and set `passive: false` only when dragging.

**Suggested Next Steps**
- Harden search normalization (NFKD + mappings) and XSS sanitization for all HTML injections.
- Improve share/unshare robustness (application/json, proper error handling, stable IDs).
- Add user-facing load/errors for songs fetch and sharing actions.
- Make remote playlist dropdown reactive and sorted; validate payloads on import.
- Optionally, move trigram indexing to a Web Worker for large datasets.
- Warn on export omissions and consider adding .xml extension to downloads.

If you want, I can prioritize and outline exact code changes for these areas without touching unrelated parts.

