<template>
    <section class="section experience">
        <h2>{{ title || "" }}</h2>
        <div id="experience-content">
            <ExperienceJobItem
                v-for="(job, index) in items || []"
                :key="`${job.company || 'job'}-${index}`"
                :job="job"
            />
        </div>
    </section>
</template>

<script setup lang="ts">
import type { CvExperienceItem } from "../../types";
import ExperienceJobItem from "./ExperienceJobItem.vue";

defineProps<{
    title?: string;
    items?: CvExperienceItem[];
}>();
</script>
