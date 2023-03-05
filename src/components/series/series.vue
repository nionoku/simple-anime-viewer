<template>
  <div class="series">
    <Player
      :episodes="videos"
      :episode="videoId"
      :current-time="time"
      :playback-rate="playbackRate"
      autoplay
      @episode-change="episodeChange"
      @time-change="timeChange"
      class="video"
    />

    <div class="episodes-selector">
      <label>
        <span class="title">
          Выбор эпизода
        </span>

        <select v-model="episode" @change="selectEpisode">
          <option :value="null" disabled selected>Выберите эпизод</option>
          <option v-for="item in episodes" :value="item">
            {{ item.episodeFull }} ({{ item.episodeType }})
          </option>
        </select>
      </label>

      <label>
        <span class="title">
          Выбор перевода
        </span>

        <select v-model="translation" @change="selectTranslation">
          <option :value="null" disabled selected>Выберите перевод</option>
          <option v-for="item in filtredTranslations" :value="item">
            {{ [item.authorsList[0] || item.authorsSummary, item.typeKind, item.typeLang].filter(Boolean).join(', ') }}
          </option>
        </select>
      </label>

      <label>
        <span class="title">
          Выбор качества
        </span>

        <select v-model="quality" @change="selectVideo">
          <option :value="null" disabled selected>Выберите качество видео</option>
          <option v-for="item in qualities" :value="item">
            {{ item.height }}
          </option>
        </select>
      </label>

      <label>
        <span class="title">
          Ускоренный проигрыш опенинга
        </span>

        <div class="controls">
          <input v-model="skipOpEnabled" type="checkbox" @change="isSkipOpChange">

          <button @click="setOpStart">Отметить начало опенинга {{ skipOpStartTime }}</button>
          <button @click="setOpEnd">Отметить окончание опенинга {{ skipOpEndTime }}</button>
        </div>
      </label>

      <label>
        <span class="title">
          Ускоренный проигрыш эндинга
        </span>

        <div class="controls">
          <input v-model="skipEdEnabled" type="checkbox" @change="isSkipEdChange">

          <button @click="setEdStart">Отметить начало эндинга {{ skipEdStartTime }}</button>
          <button @click="setEdEnd">Отметить окончание эндинга {{ skipEdEndTime }}</button>
        </div>
      </label>
    </div>

    <div class="description">
      <div class="title">
        {{ props.item.titles.ru }}
      </div>

      <div class="subtitle">
        {{ props.item.titles.romaji }}
      </div>

      <div class="genres">
        <span v-for="item in props.item.genres" class="genre">
          {{ item.title }}
        </span>
      </div>

      <div class="summary">
        <div v-for="item in props.item.descriptions" class="summary-post">
          <div class="author">
            {{ item.source }}
          </div>
          <div class="text">
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, Ref, ref, onBeforeMount } from 'vue';
import { EpisodeItem, StreamItem, TranslationItem, EpisodeDescriptionItem } from '../../types/episode';
import { ListItem } from '../../types/list';
import { EpisodesMeta } from '../../types/episode';
import { useEpisodeMetaStorage } from '../../utils/episode-meta-storage';
import { Player } from '../player';

const props = defineProps<{
  item: ListItem
}>();

const videos: Ref<EpisodeItem[]> = ref([])
const translations: Ref<TranslationItem[]> = ref([])
const qualities: Ref<StreamItem[]> = ref([])

const playbackRate = ref(1)
const time = ref(0)
let preferTranslation = ''
let preferQuality = -1

const episode: Ref<EpisodeDescriptionItem | null> = ref(null)
const translation: Ref<TranslationItem | null> = ref(null)
const quality: Ref<StreamItem | null> = ref(null)
const videoId = ref(-1)

const skipOpeningMeta: Ref<EpisodesMeta['skipOpening']> = ref({
  enabled: false
})
const skipEndingMeta: Ref<EpisodesMeta['skipEnding']> = ref({
  enabled: false
})

const { save, load } = useEpisodeMetaStorage(props.item.id)

const episodes = computed(() => props.item.episodes)

const skipOpEnabled = computed(() => skipOpeningMeta.value?.enabled || false)
const skipEdEnabled = computed(() => skipEndingMeta.value?.enabled || false)

const skipOpStartTime = computed(() => {
  if (typeof skipOpeningMeta.value?.from !== 'number') {
    return
  }

  const time = Math.round(skipOpeningMeta.value.from)
  const min = Math.floor(time / 60)
  const sec = time >= 60 ? time % (60 * min) : time
  return `(с ${min}:${sec})`
})

const skipOpEndTime = computed(() => {
  if (typeof skipOpeningMeta.value?.to !== 'number') {
    return
  }

  const time = Math.round(skipOpeningMeta.value.to)
  const min = Math.floor(time / 60)
  const sec = time >= 60 ? time % (60 * min) : time
  return `(с ${min}:${sec})`
})

const skipEdStartTime = computed(() => {
  if (typeof skipEndingMeta.value?.from !== 'number') {
    return
  }

  const time = Math.round(skipEndingMeta.value.from)
  const min = Math.floor(time / 60)
  const sec = time >= 60 ? time % (60 * min) : time
  return `(с ${min}:${sec})`
})

const skipEdEndTime = computed(() => {
  if (typeof skipEndingMeta.value?.to !== 'number') {
    return
  }

  const time = Math.round(skipEndingMeta.value.to)
  const min = Math.floor(time / 60)
  const sec = time >= 60 ? time % (60 * min) : time
  return `(с ${min}:${sec})`
})

const filtredTranslations = computed(() =>
  translations.value
    .sort((a, b) => a.typeLang.localeCompare(b.typeLang))
    .sort((a, b) => a.typeKind.localeCompare(b.typeKind))
    .reverse()
)

const fetchNextEpisode = async (lastEpisode: EpisodeItem) => {
  const nextIndex = episodes.value.findIndex(it => it.id === lastEpisode.episode.id) + 1

  if (nextIndex === 0) {
    return
  }

  const episode = episodes.value[nextIndex]
  const eps = await fetch(`/api/episodes/${episode.id}`).then(it => it.json())
  const translation: TranslationItem = eps.data.translations.find((it: TranslationItem) => it.authorsSummary.includes(preferTranslation))
    || eps.data.translations.find((it: TranslationItem) => it.typeKind === 'voice' && it.typeLang === 'ru')
    || eps.data.translations.find((it: TranslationItem) => it.typeLang === 'ru')
    || eps.data.translations[0]
  const translations = await fetch(`/api/translations/embed/${translation.id}`).then(it => it.json())
  const video: StreamItem = translations.data.stream.find((it: StreamItem) => it.height === preferQuality) 
    || translations.data.stream.find((it: StreamItem) => it.height < preferQuality)
    || translations.data.stream[0]
  
  if (video) {
    videos.value.push({
      translation,
      episode,
      quality: video,
      url: video.urls[0]
    })
  }
}

const episodeChange = async (ep: number) => {
  time.value = 0
  videoId.value = ep

  const episodeMeta = videos.value.find(it => it.translation.id === ep)

  if (episodeMeta) {
    episode.value = episodeMeta.episode
    translation.value = episodeMeta.translation
    quality.value = episodeMeta.quality

    await fetchNextEpisode(episodeMeta)
  }

  save({
    ...load(),
    lastEpisode: episodeMeta?.episode,
    lastTranslation: episodeMeta?.translation,
    videos: videos.value
  })
}

const timeChange = (sec: number) => {
  time.value = sec

  save({
    ...load(),
    lastEpisodeTime: sec
  });

  const isSkipTime = [skipOpeningMeta.value, skipEndingMeta.value].some(it => {
    return it?.enabled && time.value >= (it?.from ?? -1) && time.value <= (it?.to ?? -1)
  })
  
  playbackRate.value = isSkipTime ? 10 : 1
}

const selectEpisode = async () => {
  translation.value = null
  qualities.value = []
  quality.value = null
  videos.value = []

  try {
    const response = await fetch(`/api/episodes/${episode.value?.id}`).then(it => it.json())
    translations.value = response.data.translations
  } catch (err) {
    console.error(err)
  }
}

const selectTranslation = async () => {
  quality.value = null
  videos.value = []

  try {
    const response = await fetch(`/api/translations/embed/${translation.value?.id}`).then(it => it.json())
    qualities.value = response.data.stream

    localStorage.setItem('preferTranslation', translation.value?.authorsSummary as string)
  } catch (err) {
    console.error(err)
  }
}

const selectVideo = async () => {
  videoId.value = translation.value?.id as number
  videos.value = [{
    translation: translation.value as TranslationItem,
    episode: episode.value as EpisodeDescriptionItem,
    quality: quality.value as StreamItem,
    url: qualities.value.find(it => it.height === quality.value?.height)?.urls[0] as string
  }]

  await fetchNextEpisode(videos.value[0])

  save({
    lastEpisode: episode.value!,
    lastTranslation: translation.value!,
    videos: videos.value
  })

  localStorage.setItem('preferQuality', quality.value?.height.toString() as string)
}

const setOpStart = () => {
  const meta = load()
  save({
    ...meta,
    skipOpening: {
      ...meta.skipOpening,
      from: time.value
    }
  })

  skipOpeningMeta.value = {
    ...meta.skipOpening,
    from: time.value
  }
}

const setOpEnd = () => {
  const meta = load()
  save({
    ...meta,
    skipOpening: {
      ...meta.skipOpening,
      to: time.value
    }
  })

  skipOpeningMeta.value = {
    ...meta.skipOpening,
    to: time.value
  }
}

const setEdStart = () => {
  const meta = load()
  save({
    ...meta,
    skipEnding: {
      ...meta.skipEnding,
      from: time.value
    }
  })

  skipEndingMeta.value = {
    ...meta.skipEnding,
    from: time.value
  }
}

const setEdEnd = () => {
  const meta = load()
  save({
    ...meta,
    skipEnding: {
      ...meta.skipEnding,
      to: time.value
    }
  })

  skipEndingMeta.value = {
    ...meta.skipEnding,
    to: time.value
  }
}

const isSkipOpChange = () => {
  const meta = load()
  save({
    ...meta,
    skipOpening: {
      ...meta.skipOpening,
      enabled: skipOpeningMeta.value?.enabled
    }
  })
}

const isSkipEdChange = () => {
  const meta = load()
  save({
    ...meta,
    skipEnding: {
      ...meta.skipEnding,
      enabled: skipEndingMeta.value?.enabled
    }
  })
}

onBeforeMount(() => {
  try {
    const meta = load()

    preferTranslation = localStorage.getItem('preferTranslation') || ''
    preferQuality = parseInt(localStorage.getItem('preferQuality') as string) ?? -1

    time.value = meta.lastEpisodeTime || 0
    videos.value = meta.videos || []
    episode.value = episodes.value.find(it => it.id === meta.lastEpisode?.id)!
    videoId.value = meta.lastTranslation?.id || videos.value[0].episode.id

    skipOpeningMeta.value = meta.skipOpening
    skipEndingMeta.value = meta.skipEnding
  } catch (err) {
    console.error(err)
  }
})

</script>

<style scoped>
.video {
  max-height: 300px;
}

.series {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 2fr;

  grid-gap: 16px;
}

@media screen and (max-width: 680px) {
  .series {
    grid-template-columns: 1fr;
  }
}

.episodes-selector {
  display: flex;
  flex-direction: column;
  justify-content: center;

  row-gap: 8px;
}

.episodes-selector>label {
  display: flex;
  flex-direction: column;
}

.episodes-selector>label>.title {
  font-size: 0.85rem;
  font-weight: 300;
}

.episodes-selector>label>select {
  padding: 4px;

  margin-top: 2px;
}

.description {
  grid-column: 1 / 3;

  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 680px) {
  .description {
    grid-column: 1;
  }
}

.title {
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  font-size: 1.2rem;
  font-weight: 300;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 8px;
}

.genre {
  padding: 4px 8px;

  background-color: #F0F0F0;
  border-radius: 4px;

  font-size: 0.8rem;
  font-weight: 300;

  white-space: nowrap;
}

.summary {
  /* overflow: auto; */

  margin-top: 12px;
  font-size: 0.9rem;
}

.summary-post:not(:first-child) {
  margin-top: 12px;
}

.summary-post>.author {
  font-size: 0.8rem;
  color: #555555;
}

.controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 8px;

  margin-top: 4px;
}

.controls > button {
  width: 280px;
}
</style>