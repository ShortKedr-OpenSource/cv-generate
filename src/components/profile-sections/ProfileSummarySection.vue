<template>
    <section class="section summary">
        <h2>{{ title || "" }}</h2>
        <div id="summary-content">
            <p v-for="(item, index) in items || []" :key="`summary-${index}`">
                {{ item }}
            </p>
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    title?: string;
    items?: string[];
}>();
</script>
