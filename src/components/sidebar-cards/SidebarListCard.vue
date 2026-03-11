<template>
    <section :class="`${cardClass} side-card`">
        <h2>{{ title }}</h2>
        <ul :id="listId">
            <li v-for="item in items || []" :key="item">
                {{ item }}
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    cardClass: string;
    title: string;
    listId: string;
    items?: string[];
}>();
</script>
