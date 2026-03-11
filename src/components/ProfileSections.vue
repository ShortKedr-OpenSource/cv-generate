<template>
    <main class="main-content">
        <ProfileHeader :cv-data="cvData" />

        <section class="section summary">
            <h2>{{ cvData.summaryTitle || "" }}</h2>
            <div id="summary-content">
                <p
                    v-for="(item, index) in cvData.summary || []"
                    :key="`summary-${index}`"
                >
                    {{ item }}
                </p>
            </div>
        </section>

        <section class="section experience">
            <h2>{{ cvData.experienceTitle || "" }}</h2>
            <div id="experience-content">
                <article
                    v-for="(job, index) in cvData.experience || []"
                    :key="`${job.company || 'job'}-${index}`"
                    class="job"
                >
                    <div class="job-company-date">
                        <p class="job-company">{{ job.company || "" }}</p>
                        <p class="job-date">{{ job.date || "" }}</p>
                    </div>
                    <h3 class="job-title">{{ job.title || "" }}</h3>
                    <p v-if="job.description" class="job-description">
                        {{ job.description }}
                    </p>
                </article>
            </div>
        </section>

        <section class="section education">
            <h2>{{ cvData.educationTitle || "" }}</h2>
            <div class="education-entry">
                <p class="education-university">
                    {{ cvData.education?.university || "" }}
                </p>
                <h3 class="education-degree">
                    {{ cvData.education?.degree || "" }}
                </h3>
                <p class="education-date">{{ cvData.education?.date || "" }}</p>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import type { CvTranslation } from "../types";
import ProfileHeader from "./ProfileHeader.vue";

defineProps<{ cvData: CvTranslation }>();
</script>
