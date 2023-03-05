import { ListItem } from "./list"

export type TranslationItem = {
  id: number,
  episodeId: number,
  authorsSummary: string,
  authorsList: string[],
  embedUrl: string,
  title: string
  typeKind: string
  typeLang: string
}

export type QualityItem = {
  quality: number
  url: string
}

export type EpisodeDescriptionItem = ListItem['episodes'][number]

export type EpisodeItem = {
  translation: TranslationItem
  quality: StreamItem
  episode: EpisodeDescriptionItem
  url: string
}

export type StreamItem = {
  height: number,
  urls: string[]
}