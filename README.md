# Songs catalog for OpenSong beaming application

The songs catalog is located under `Songs` folder.

## Installation

1. Download latest release from this Github repository.
2. Extract the archive in a temporary location.
3. Optional. Backup `OpenSong Data\Songs` folder, the old song versions would be orverwritten.
4. Move the `Songs` folder to `OpenSong Data` subfolder of the installed OpenSong application, replace existing files in the destination folder.

## Song file naming convention
1. Song file name must adhere to `/^[a-zA-Z0-9 ]+\.zip$/` regural expression.
2. Additionally, double spaces, leading spaces, and trainling spaces are not allowed.
3. Song file names must be case insensitive, two song file names must not differ only in character case.
  ```
  # this is not allowed
  song.xml
  Song.xml
  ```
4. All caps song file names are allowed, but not recommended.

## Known issues

### Multiple versions of the same song

Following songs have the same *normalized* file name, but different content.
Tags should be added to one of the file's name for songs can be distinct and adhere to the naming convention.

```
Skipped 'Ať požehnán je Bůh (slavné jméno Tvé)', target file 'At pozehnan je Buh.xml' already exists.
Skipped 'Cicha noc (Neznámý autor).xml', target file 'Cicha noc.xml' already exists.
Skipped 'Mój Jezu (Neznámý autor).xml', target file 'Moj Jezu.xml' already exists.
Skipped 'Môj Boh (Neznámý autor).xml', target file 'Moj Boh.xml' already exists.
Skipped 'Pastorela__ (Neznámý autor).xml', target file 'Pastorela.xml' already exists.
Skipped 'Požehnání (Neznámý autor).xml', target file 'Pozehnani.xml' already exists.
Skipped 'Prístav (Neznámý autor).xml', target file 'Pristav.xml' already exists.
Skipped 'Před Tebou Smím Pokleknout (Neznámý autor).xml', target file 'Pred Tebou Smim Pokleknout.xml' already exists.
```

There can also be songs with different file names but the same content, or almost the same content.

### Case sensitive file names

There is number of songs that differ only in the characters case.
Contents of those files differ.
Tags should be added to one of the file's name for songs can be distinct and adhere to the naming convention.

When extracting the relase archive only one of the songs would be available as Windows file names are case insensitive.
The extractig tool would overwrite previous version of the song with case sensitive name.

Example.
```
70cf15796088b0341ff7cf1c937d4a9d  Prichazime Pred Tvoji Tvar.xml
abcb32843eb9912f329272cbbd7f9c53  Prichazime pred tvoji tvar.xml
```
