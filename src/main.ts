import { createApp } from "vue";
import App from "./App.vue";
import "./styles/index.css";

// Bundle all theme styles so theme switching works in both Vite dev and static builds.
import.meta.glob("../styles/themes/*.css", { eager: true });

createApp(App).mount("#app");
