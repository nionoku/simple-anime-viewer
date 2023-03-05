<template>
  <div class="container">
    <div class="list-wrapper">
      <input
        placeholder="Поиск по списку"
        class="search"
        @input="onSearch"
      />

      <List 
        :items="items"
        class="list"
        @click="onClick"
      />
    </div>

    <Series
      v-if="selectedItem"
      :id="0" 
      :item="selectedItem"
      class="series"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { List } from './components/list';
import { Series } from './components/series';
import { ListItem } from './types/list';

const items: Ref<ListItem[]> = ref([])
const selectedItem: Ref<ListItem | null> = ref(null)

const onSearch = async (event: Event) => {
  const query = (event.target as HTMLInputElement).value

  const response = await fetch(`/api/series?query=${query}`).then(it => it.json())
  items.value = response.data
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
  display: flex;
  width: 100%;
  height: 100%;

  overflow: hidden;
}

.list-wrapper {
  display: flex;
  flex-direction: column;

  min-width: 300px;
  flex-basis: 25%;
  padding: 8px;
}

.list {
  flex: 1;
  margin-top: 8px;
  overflow: auto;
}

.search {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;

  font-size: 0.9rem;
}

.series {
  padding: 8px;
}
</style>
