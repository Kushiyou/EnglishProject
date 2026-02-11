<template>
  <RouterView />
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import { getWordBookList } from './apis/word-book';
import { onMounted } from 'vue';
const getList = async () => {
  const res = await getWordBookList(
    { 
      page: 1, 
      pageSize: 12
    }
  );
  console.log(res);
}
onMounted(() => {
  getList();
})
</script>  