<template>
    <section class="section education">
        <h2>{{ title || "" }}</h2>
        <div class="education-entry">
            <p class="education-university">{{ education?.university || "" }}</p>
            <h3 class="education-degree">{{ education?.degree || "" }}</h3>
            <p class="education-date">{{ education?.date || "" }}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { CvTranslation } from "../../types";

defineProps<{
    title?: string;
    education?: CvTranslation["education"];
}>();
</script>
