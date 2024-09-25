# Spotify_Complex_Network

## Index
- [Recomendation\_System](#movies_Recommendation_System)
	- [Index](#index)
	- [Nombre de los alumnos participantes](#integrantes)
    - [Introducción](#introducción)
	- [Objetivo del trabajo](#objetivos-del-trabajo)
	- [Descripción del dataset](#descripción-del-dataset)
		- [`artist_count.csv`](#artist-playlist)
	- [Conclusiones](#conclusiones)
	- [Licencia](#licencia)
---

## Integrantes
- Espíritu Cueva, Renzo Andree (u202113340)
- Pilco Chiuyare, André Darío (u202110764)
- Poma Astete, Luis Felipe (u202110902)
- John Davids Sovero Cubillas (u202115065)

**Docente:** Carlos Fernando Montoya Cubas

## Introducción
El presente proyecto corresponde al trabajo parcial del curso de Complex Networks, el cual plantea el desarrollo de un sistema basado en grafos para identificar relaciones y patrones entre los artistas presentes en cada playlist. Durante este proceso, se emplearán los conocimientos adquiridos durante el ciclo académico sobre entendimiento del negocio, comprensión de los datos, modelado y evaluación.

## Objetivos del trabajo
- Determinar cuáles son los artistas más influyentes dentro de la red.
- Identificar cómo se pueden clasificar los artistas en función de sus estilos musicales y géneros

## Descripción del dataset
El dataset de Spotify utilizado en el RecSysChallenge 2018 contiene 1,000,000 playlists creadas entre enero de 2010 y octubre de 2017. Cada playlist incluye información detallada como el título, las listas de canciones, los IDs de las canciones y sus metadatos, en total 11 características. Además, seproporcionan datos adicionales como el nombre de la playlist, el númerodeálbumes, el número de canciones, la duracióntotalyotroselementosrelevantesenformatoJSON.

### `artist_count.csv`
#### colección de playlist
| Columna               | Descripción                                                                       |
|-----------------------|-----------------------------------------------------------------------------------|
| name                  | Nombre de la playlist.                                                            |
| collaborative         | La lista no es colaborativa.                                                      |
| pid                   | Identificador único de la lista de reproducción.                                  |
| modified_at           | Última modificación en formato timestamp.                                         |
| num_tracks            | Cantidad de álbumes incluidos en la lista.                                        |
| num_followers         | Cantidad de canciones totales.                                                    |
| num_edits             | Cantidad de seguidores de la lista.                                               |
| duration_ms           | Duración total de todas las canciones en milisegundos.                            |
| num_artists           | Número de artistas únicos en la lista.                                            |
| tracks                | Información detallada de las canciones, incluyendo nombre, artista, álbum, y URI. |

#### colección de canciones
| Columna               | Descripción                                                                       |
|-----------------------|-----------------------------------------------------------------------------------|
| pos                   | Índice de la canción dentro de la playlist.                                       |
| artist_name           | Nombre del artista autor de la canción.                                           |
| track_uri             | URI de la canción.                                                                |
| artist_uri            | URI del artista.                                                                  |
| track_name            | Nombre de la canción.                                                             |
| album_uri             | URI del álbum de la canción.                                                      |
| duration_ms           | Duración de la canción en milisegundos.                                           |
| album_name            | Nombre del álbum de la canción.                                                   |


## Conclusiones 
... en desarrollo

## Licencia
Este trabajo está disponible bajo licencia [MIT License].
