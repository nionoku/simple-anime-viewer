<template>
  <div class="container">
    <input
      v-model="input"
      placeholder="Поиск по списку"
      class="search"
      @input="onSearch"
    />

    <List
      v-show="input"
      :items="items"
      class="list"
      @click="onClick"
    />

    <Series
      v-if="selectedItem"
      :id="0" 
      :item="selectedItem"
      :style="{
        gridColumn: input ? '2 / 3' : '1 / 3'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { List } from './components/list';
import { Series } from './components/series';
import { ListItem } from './types/list';
import { debounce } from 'lodash'

const input = ref('')
const items: Ref<ListItem[]> = ref([])
const selectedItem: Ref<ListItem | null> = ref(null)

const fetchSeries = debounce(async (query: string) => {
  const response = await fetch(`/api/series?query=${query}`).then(it => it.json())
  items.value = response.data
}, 300)

const onSearch = async (event: Event) => {
  const query = (event.target as HTMLInputElement).value

  fetchSeries(query)
}

const onClick = (item: ListItem) => {
  selectedItem.value = item
  localStorage.setItem('lastSeries', JSON.stringify(item))

  window.location.reload()
}

onBeforeMount(async () => {
  selectedItem.value = JSON.parse(localStorage.getItem('lastSeries') as string)
})

</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;

  display: grid;
  grid-template-columns: minmax(300px, 25%) 1fr;
  grid-template-rows: max-content 1fr;
  gap: 12px;

  overflow: hidden;
}

.list {
  overflow: auto;
}

.search {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;

  font-size: 0.9rem;

  grid-column: 1 / 3;
}

.series {
  overflow: auto;
}
</style>
