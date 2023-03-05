<template>
  <div class="list">
    <template v-if="items.length">
      <ListItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        class="item"
        @click="emits('click', item)"
      />
    </template>

    <div v-else class="empty">
      Список пуст
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ListItem } from '../list-item';
import { ListItem as Item } from '../../types/list';

const props = defineProps<{
  items: Item[]
}>();

const emits = defineEmits({
  click: (item: Item) => item
});

</script>

<style scoped>
.item {
  padding-bottom: 8px;
}
.item:not(:first-child) {
  padding: 8px 0;
  border-top: 1px solid #EEEEEE;
}

.empty {
  margin-top: 8px;

  font-weight: 300;
  text-align: center;
}
</style>