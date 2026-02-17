<template>
  <RouterView />
  <Search/>
  <Login/>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import Search from './components/Search/index.vue'
import Login from './components/Login/index.vue'
</script>  