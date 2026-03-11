<template>
    <main class="main-content">
        <ProfileHeader :cv-data="cvData" />
        <ProfileSummarySection
            :title="cvData.summaryTitle"
            :items="cvData.summary"
        />
        <ProfileExperienceSection
            :title="cvData.experienceTitle"
            :items="cvData.experience"
        />
        <ProfileEducationSection
            :title="cvData.educationTitle"
            :education="cvData.education"
        />
    </main>
</template>

<script setup lang="ts">
import type { CvTranslation } from "../types";
import ProfileHeader from "./ProfileHeader.vue";
import ProfileEducationSection from "./profile-sections/ProfileEducationSection.vue";
import ProfileExperienceSection from "./profile-sections/ProfileExperienceSection.vue";
import ProfileSummarySection from "./profile-sections/ProfileSummarySection.vue";

defineProps<{ cvData: CvTranslation }>();
</script>
