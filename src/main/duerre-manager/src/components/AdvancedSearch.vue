<template>
  <v-form @submit="onSubmit">
    <v-text-field v-model="text" v-bind="textProps" label="Text" placeholder="Ricerca per nome o alias" loading
      clearable @click:clear="clearSearch">
      <template v-slot:prepend>
        <v-btn :icon="more ? 'mdi-chevron-up' : 'mdi-chevron-down'" variant="text" @click="showMore"></v-btn>
      </template>
      <template v-slot:loader>
        <v-progress-linear :active="searching" color="info" height="4" indeterminate></v-progress-linear>
      </template>
      <template v-slot:append>
        <v-btn type="submit" icon="mdi-flip-h mdi-magnify" variant="text"></v-btn>
      </template>
    </v-text-field>

    <v-expand-transition>
      <DieDataEdit class="py-0" v-show="more" 
        :name-field="{ visible: false }"
        :aliases-field="{ visible: false }"
        :customer-field="{ visible: true, required: false }" 
        :material-field="{ visible: true, required: false }" 
        :die-type-field="{ visible: true, required: false }"
        :total-width-field="{ visible: true, required: false }" 
        :total-height-field="{ visible: true, required: false }"
        :shoe-width-field="{ visible: true, required: false }"
        :crest-width-field="{ visible: true, required: false }" />
    </v-expand-transition>
  </v-form>
</template>

<script setup lang="ts">
import DieDataEdit from './die/DieDataEdit.vue';
import { useForm, type GenericObject } from 'vee-validate'
import { ref } from 'vue'
import * as yup from 'yup'

const schema = yup.object({
  text: yup.string().required().label('Text')
  //   email: yup.string().email().required().label('E-mail'),
  //   password: yup.string().min(6).required(),
  //   passwordConfirm: yup
  //     .string()
  //     .oneOf([yup.ref('password')], 'Passwords must match')
  //     .required()
  //     .label('Password confirmation'),
  //   terms: yup.boolean().required().oneOf([true], 'You must agree to terms and conditions')
})

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

// Refer to the docs for how to make advanced validation behaviors with dynamic configs
// TODO: Add link
const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors
  }
})

const [text, textProps] = defineField('text', vuetifyConfig)

const searching = ref(false)
const more = ref(false)

const onSubmit = handleSubmit((values) => search(values))

async function search(values: GenericObject) {
  searching.value = true
  console.log('Submitted with', values)
  setTimeout(() => (searching.value = false), 2000)
}

function clearSearch() { }

function showMore() {
  more.value = !more.value
}
</script>
