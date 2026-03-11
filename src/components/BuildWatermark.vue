<template>
    <div v-if="label" class="build-watermark" aria-hidden="true">
        build {{ label }}
    </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>
