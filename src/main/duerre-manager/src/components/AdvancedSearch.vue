<template>
  <v-form @submit="onSubmit">

    <v-combobox v-model="text" :items="lastSearches" class="mx-auto" density="comfortable" menu-icon=""
      placeholder="Ricerca per nome o per alias" theme="light" variant="solo" :label="selectedSearch?.name ?? 'Ricerca'"
      item-props loading @update:focused="onFocus">

      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props" :title="item.raw.name" prepend-icon="mdi-clock-outline" @click="onSelectSearch(item.raw)"></v-list-item>
        <!-- :prepend-avatar="item.raw.avatar"  -->
      </template>

      <template v-slot:prepend>
        <v-btn :icon="more ? 'mdi-chevron-up' : 'mdi-chevron-down'" variant="text" @click="showMore"></v-btn>
      </template>
      <template v-slot:loader>
        <v-progress-linear :active="searching" color="info" height="4" indeterminate></v-progress-linear>
      </template>
      <template v-slot:append-inner>
        <v-slide-x-reverse-transition class="py-0">
          <v-btn v-show="visible" icon="mdi-close-circle mdi" variant="text" @click="clearSearch"></v-btn>
        </v-slide-x-reverse-transition>
      </template>
      <template v-slot:append>
        <v-btn type="submit" icon="mdi-flip-h mdi-magnify" variant="text"></v-btn>
      </template>
    </v-combobox>

    <!-- <v-text-field v-model="text" v-bind="textProps" label="Parole Chiavi" placeholder="Ricerca per nome o alias"
      loading>
      <template v-slot:prepend>
        <v-btn :icon="more ? 'mdi-chevron-up' : 'mdi-chevron-down'" variant="text" @click="showMore"></v-btn>
      </template>
      <template v-slot:loader>
        <v-progress-linear :active="searching" color="info" height="4" indeterminate></v-progress-linear>
      </template>
      <template v-slot:append-inner>
        <v-slide-x-reverse-transition class="py-0">
          <v-btn v-show="visible" icon="mdi-close-circle mdi" variant="text" @click="clearSearch"></v-btn>
        </v-slide-x-reverse-transition>
      </template>
      <template v-slot:append>
        <v-btn type="submit" icon="mdi-flip-h mdi-magnify" variant="text"></v-btn>
      </template>
    </v-text-field> -->

    <v-expand-transition>
      <DieDataEdit class="py-0" v-show="more" :name-field="{ visible: false }" :aliases-field="{ visible: false }"
        :customer-field="{ visible: true, required: false, value: selectedSearch?.customers?.[0] }"
        :material-field="{ visible: true, required: false, value: selectedSearch?.materials?.[0] }"
        :die-data-field="{ visible: true, required: false, value: selectedSearch?.dieData }"
        :die-type-field="{ visible: true, required: false, value: selectedSearch?.dieTypes?.[0] }"
        :total-width-field="{ visible: true, required: false, value: selectedSearch?.totalWidth }"
        :total-height-field="{ visible: true, required: false, value: selectedSearch?.totalHeight }"
        :shoe-width-field="{ visible: true, required: false, value: selectedSearch?.shoeWidth }"
        :crest-width-field="{ visible: true, required: false, value: selectedSearch?.crestWidth }" ref="dieDataForm"
        @dirty="onDirty" />
    </v-expand-transition>
  </v-form>
</template>

<script setup lang="ts">
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { useForm, type GenericObject } from 'vee-validate'
import type { Ref } from 'vue'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'
import DieDataEdit from './die/DieDataEdit.vue'

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
const lastSearches: Ref<Client.Components.Schemas.DieSearch[]> = ref([]);
const selectedSearch: Ref<Client.Components.Schemas.DieSearch | undefined> = ref();

const schema = yup.object({
  text: yup.string().label("Ricerca").nullable().optional()
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
  // const clonedObj = { ...values }
  // console.log(clonedObj)
  // Object.entries(clonedObj).forEach((entry) => {
  //   const k = entry[0]
  //   const v = entry[1]
  //   if (v === undefined || v === '') {
  //     delete clonedObj[k]
  //   }
  // })
  console.log(values)
  if (JSON.stringify(values) === '{}') {
    return
  }

  if (props.closeOnSearch == true) {
    more.value = false
  }

  const searchOpts: Client.Components.Schemas.DieSearchDao = {
    ...values,
    customers: [],
    dieTypes: [],
    materials: [],
  }
  if (values.customer) searchOpts.customers?.push(values.customer)
  if (values.dieType) searchOpts.dieTypes?.push(values.dieType)
  if (values.material) searchOpts.materials?.push(values.material)
  console.log(searchOpts)

  searching.value = true
  await props.searchDies(searchOpts)
  searching.value = false
}

function clearSearch() {
  selectedSearch.value = undefined;
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

function onFocus() {
  console.log("onFocus",text)
  loadSearches()
}

async function loadSearches() {
  const client = await http.client
  const res = await client.getSearches()
  console.log(res)

  if (res.status == 200) {
    lastSearches.value.length = 0;
    lastSearches.value.push(...res.data)
  }
}

function onSelectSearch(item: Client.Components.Schemas.DieSearch) {
  clearSearch();

  console.log("onSelectSearch", item)
  selectedSearch.value = item;
  text.value = item.text ?? ''
}

onMounted(() => loadSearches())
</script>
