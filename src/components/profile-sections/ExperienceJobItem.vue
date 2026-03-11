<template>
    <article class="job">
        <div class="job-company-date">
            <p class="job-company">{{ job.company || "" }}</p>
            <p class="job-date">{{ job.date || "" }}</p>
        </div>
        <h3 class="job-title">{{ job.title || "" }}</h3>
        <p v-if="job.description" class="job-description">
            {{ job.description }}
        </p>
    </article>
</template>

<script setup lang="ts">
import type { CvExperienceItem } from "../../types";

defineProps<{
    job: CvExperienceItem;
}>();
</script>
