<template>
  <div class="container">
    <video
      ref="video"
      controls
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, Ref, watch } from 'vue';
import { EpisodeItem } from '../../types/episode';

const props = defineProps<{
  episodes: EpisodeItem[]
  episode: number
  currentTime: number
  autoplay?: boolean
}>();

const emits = defineEmits({
  episodeChange: (episode: number) => episode,
  timeChange: (time: number) => time
});

const video: Ref<HTMLVideoElement | null> = ref(null)
let playbackRate = 1

onMounted(() => {
  const videoElement = video.value as HTMLVideoElement

  videoElement.addEventListener('timeupdate', () => {
    emits('timeChange', videoElement.currentTime)
  })

  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.currentTime = props.currentTime
    videoElement.playbackRate = playbackRate
  })

  videoElement.addEventListener('ended', () => {
    playbackRate = videoElement.playbackRate

    const nextEpisodeIndex = props.episodes.findIndex(it => it.translation.id === props.episode) + 1
    emits('episodeChange', props.episodes.at(nextEpisodeIndex)?.translation.id ?? -1)
  })

  watch(() => props.episode, (episode, lastEpisode) => {
    const episodeIndex = props.episodes.findIndex(it => it.translation.id === episode)
    videoElement.src = props.episodes[episodeIndex]?.url || ''

    if (props.autoplay && episodeIndex > 0 && Number.isFinite(lastEpisode)) {
      videoElement.play()
    }
  }, { immediate: true })
})

</script>

<style scoped>
.container>video {
  width: 100%;
}
</style>