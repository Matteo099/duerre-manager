// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'

const myCustomLightTheme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#6200EE',
        'primary-darken-1': '#3700B3',
        secondary: '#03DAC6',
        'secondary-darken-1': '#018786',
        error: '#B00020',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
        'blue-grey-lighten': '#37474F'
    }
}
const myCustomDarkTheme = {
    dark: true,
    colors: {
        success: '#78dc77',
        secondary: '#000000',
        primary: '#cfbdff',
        info: '#9ecaff',
        'blue-grey-lighten': '#ECEFF1'
    }
}

const vuetify = createVuetify({
    components:{
        ...components,
        ...labsComponents
    },
    directives,
    theme: {
        defaultTheme: 'myCustomLightTheme',
        themes: {
            myCustomLightTheme,
            myCustomDarkTheme
        }
    }
})

export default vuetify