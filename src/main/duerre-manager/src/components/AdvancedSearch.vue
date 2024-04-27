<template>
  <v-form @submit="onSubmit">
    <v-text-field
      v-model="text"
      v-bind="textProps"
      label="Parole Chiavi"
      placeholder="Ricerca per nome o alias"
      loading
    >
      <template v-slot:prepend>
        <v-btn
          :icon="more ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          variant="text"
          @click="showMore"
        ></v-btn>
      </template>
      <template v-slot:loader>
        <v-progress-linear
          :active="searching"
          color="info"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
      <template v-slot:append-inner>
        <v-slide-x-reverse-transition class="py-0">
          <v-btn
            v-show="visible"
            icon="mdi-close-circle mdi"
            variant="text"
            @click="clearSearch"
          ></v-btn>
        </v-slide-x-reverse-transition>
      </template>
      <template v-slot:append>
        <v-btn type="submit" icon="mdi-flip-h mdi-magnify" variant="text"></v-btn>
      </template>
    </v-text-field>

    <v-expand-transition>
      <DieDataEdit
        class="py-0"
        v-show="more"
        :name-field="{ visible: false }"
        :aliases-field="{ visible: false }"
        :customer-field="{ visible: true, required: false }"
        :material-field="{ visible: true, required: false }"
        :die-data-field="{ visible: true, required: false }"
        :die-type-field="{ visible: true, required: false }"
        :total-width-field="{ visible: true, required: false }"
        :total-height-field="{ visible: true, required: false }"
        :shoe-width-field="{ visible: true, required: false }"
        :crest-width-field="{ visible: true, required: false }"
        ref="dieDataForm"
        @dirty="onDirty"
      />
    </v-expand-transition>
  </v-form>
</template>

<script setup lang="ts">
import { useForm, type GenericObject } from 'vee-validate'
import { ref, watch } from 'vue'
import * as yup from 'yup'
import DieDataEdit from './die/DieDataEdit.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'

interface AdvancedSearchProps {
  searchDies: (searchOpts: Client.Components.Schemas.DieSearchDao) => Promise<any>
  closeOnSearch?: boolean
}

const http = useHttp()
const searching = ref(false)
const more = ref(false)
const dieDataForm = ref()
const visible = ref(false)
const props = withDefaults(defineProps<AdvancedSearchProps>(), {
  closeOnSearch: true
})

const schema = yup.object({
  text: yup.string().label('Parole Chiavi')
})
const { defineField, handleSubmit, resetForm, meta } = useForm({
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

const onSubmit = handleSubmit((values) => {
  dieDataForm.value.handleSubmit((innerValues: GenericObject) => {
    search({ ...values, ...innerValues })
  })()
})
watch(
  () => meta.value.dirty,
  () => onDirty(meta.value.dirty)
)
const emit = defineEmits<{
  (e: 'reset'): void
}>()

async function search(values: GenericObject) {
  // console.log('Submitted with', values)

  const clonedObj = { ...values }
  Object.entries(clonedObj).forEach((entry) => {
    const k = entry[0]
    const v = entry[1]
    if (v === undefined || v === '') {
      delete clonedObj[k]
    }
  })

  if (JSON.stringify(clonedObj) === '{}') {
    return
  }

  if (props.closeOnSearch == true) {
    more.value = false
  }

  searching.value = true
  await props.searchDies(clonedObj)
  searching.value = false
}

function clearSearch() {
  resetForm()
  dieDataForm.value.resetForm()
  emit('reset')
}

function showMore() {
  more.value = !more.value
}

function onDirty(dirty: boolean) {
  console.log('isDirty', dirty)
  visible.value = meta.value.dirty || dirty
}
</script>
