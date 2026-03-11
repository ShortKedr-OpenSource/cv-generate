<template>
    <section :class="`${cardClass} side-card`">
        <h2 v-if="title">{{ title }}</h2>
        <p>{{ text || "" }}</p>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    cardClass: string;
    text?: string;
    title?: string;
}>();
</script>
