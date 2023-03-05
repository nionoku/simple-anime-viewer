export type ListItem = {
  id: number
  posterUrlSmall: string
  season: string
  titles: {
    romaji: string
    ru: string
    en: string
  }
  typeTitle: string
  genres: [{
    id: number
    title: string
  }]
  descriptions: [{
    source: string
    value: string
  }]
  episodes: [{
    id: number
    episodeInt: string
    episodeFull: string
    episodeType: string
  }]
}