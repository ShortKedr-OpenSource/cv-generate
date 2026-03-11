<template>
    <div class="ats-print-view" aria-hidden="true">
        <header class="ats-print-header ats-print-block">
            <h1 class="ats-print-name">{{ cvData.name || "" }}</h1>
            <p class="ats-print-subtitle">{{ cvData.subtitle || "" }}</p>
            <p class="ats-print-location">{{ cvData.location || "" }}</p>
        </header>

        <section
            class="ats-print-section ats-print-block ats-print-contact-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.contact || "Contact" }}
            </h2>
            <p class="ats-print-contact-email">{{ meta.contacts.email }}</p>
            <p class="ats-print-contact-linkedin">
                {{ meta.contacts.linkedin }}
            </p>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-summary-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.summaryTitle || "" }}
            </h2>
            <div class="ats-print-summary">
                <p
                    v-for="(item, index) in cvData.summary || []"
                    :key="`ats-summary-${index}`"
                >
                    {{ item }}
                </p>
            </div>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-experience-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.experienceTitle || "" }}
            </h2>
            <div class="ats-print-experience">
                <article
                    v-for="(job, index) in cvData.experience || []"
                    :key="`ats-job-${index}`"
                    class="ats-print-job"
                >
                    <p class="ats-print-job-company">{{ job.company || "" }}</p>
                    <p class="ats-print-job-meta">
                        {{ [job.title, job.date].filter(Boolean).join(" | ") }}
                    </p>
                    <p v-if="job.description" class="ats-print-job-description">
                        {{ job.description }}
                    </p>
                </article>
            </div>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-skills-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.skillsTitle || "" }}
            </h2>
            <ul class="ats-print-list ats-print-skills">
                <li
                    v-for="skill in cvData.skills || []"
                    :key="`ats-skill-${skill}`"
                >
                    {{ skill }}
                </li>
            </ul>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-languages-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.languagesTitle || "" }}
            </h2>
            <ul class="ats-print-list ats-print-languages">
                <li
                    v-for="language in cvData.languages || []"
                    :key="`ats-language-${language}`"
                >
                    {{ language }}
                </li>
            </ul>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-certifications-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.certificationsTitle || "" }}
            </h2>
            <p class="ats-print-certifications">
                {{ cvData.certifications || "" }}
            </p>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-education-section"
        >
            <h2 class="ats-print-section-title">
                {{ cvData.educationTitle || "" }}
            </h2>
            <div class="ats-print-education-entry">
                <p class="ats-print-education-university">
                    {{ cvData.education?.university || "" }}
                </p>
                <p class="ats-print-education-degree">
                    {{ cvData.education?.degree || "" }}
                </p>
                <p class="ats-print-education-date">
                    {{ cvData.education?.date || "" }}
                </p>
            </div>
        </section>

        <section
            class="ats-print-section ats-print-block ats-print-gdpr-section"
        >
            <p class="ats-print-gdpr">{{ cvData.gdpr || "" }}</p>
        </section>
    </div>
</template>

<script setup lang="ts">
import type { CvTranslation, ProfileMeta } from "../types";

defineProps<{
    cvData: CvTranslation;
    meta: ProfileMeta;
}>();
</script>
