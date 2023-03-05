import { EpisodesMeta } from "../types/episode"

export function useEpisodeMetaStorage(key: number) {
  const load = (): EpisodesMeta => {
    return JSON.parse(localStorage.getItem(`meta:${key}`) as string)
  }

  const save = (meta: EpisodesMeta) => {
    localStorage.setItem(`meta:${key}`, JSON.stringify(meta))
  }

  return {
    load,
    save
  }
}