<template>
    <header class="header">
        <h1>{{ cvData.name || "" }}</h1>
        <p class="subtitle">{{ cvData.subtitle || "" }}</p>
        <p class="location">{{ cvData.location || "" }}</p>
    </header>
</template>

<script setup lang="ts">
import type { CvTranslation } from "../types";

defineProps<{ cvData: CvTranslation }>();
</script>
