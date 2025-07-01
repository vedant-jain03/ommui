import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { inject } from "@vercel/analytics";

const pinia = createPinia();
const app = createApp(App);

inject();

app.use(pinia);
app.mount("#app");
