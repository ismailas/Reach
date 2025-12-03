<template>
  <router-view />
  <AuthStatus />
</template>

<script setup lang="ts">
import AuthStatus from './components/common/AuthStatus.vue'
</script>

