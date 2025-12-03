<template>
  <div
    class="card-container"
    :class="{ 'is-flipped': isFlipped }"
    @click="toggleFlip"
  >
    <div class="card-inner">
      <div class="card-front">
        <CardFront :card="card" />
      </div>
      <div class="card-back">
        <CardBack :card="card" :related-cards="relatedCards" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '@/types'
import CardFront from './CardFront.vue'
import CardBack from './CardBack.vue'

interface Props {
  card: Card
  relatedCards?: Card[]
}

const props = withDefaults(defineProps<Props>(), {
  relatedCards: () => []
})

const isFlipped = ref(false)

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}
</script>

<style scoped>
.card-container {
  perspective: 1000px;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-container.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
</style>

