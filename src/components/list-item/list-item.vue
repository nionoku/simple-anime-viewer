<template>
  <div class="container">
    <div
         :style="{
           backgroundImage: `url(${props.item.posterUrlSmall})`
         }"
         class="poster" />

    <div class="description">
      <div class="title">{{ props.item.titles.ru }}</div>
      <div class="subtitle">{{ props.item.titles.romaji }}</div>

      <div class="type">{{ props.item.typeTitle }}</div>
      <div class="season">{{ props.item.season }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ListItem } from '../../types/list';

const props = defineProps<{
  item: ListItem
}>();

const emits = defineEmits({
});

</script>

<style scoped>
.container {
  display: flex;
  column-gap: 16px;

  cursor: pointer;
}

.poster {
  width: 80px;
  aspect-ratio: 0.65;

  background-size: cover;
}

.title {
  font-weight: 500;
  font-size: 1.1rem;

  grid-column: 1 / 3;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.subtitle {
  font-weight: 400;
  font-size: 0.9rem;
  
  grid-column: 1 / 3;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.description {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto 1fr auto;

  flex: 1;
  padding: 6px 0;
}

.season {
  grid-row: 4;

  justify-self: flex-end;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  font-weight: 300;
  font-size: 0.95rem;
}

.type {
  grid-row: 4;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  font-weight: 300;
  font-size: 0.95rem;
}
</style>