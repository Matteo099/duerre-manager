import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import http from './plugins/http'
import welcome from './plugins/welcome'
import toastr from './plugins/toast'


const app = createApp(App)

app.use(toastr);
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(http)
app.use(welcome)

app.mount('#app')