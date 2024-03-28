<template>
  <v-container fluid>
    <v-row align="center" no-glutters>
      <v-col cols="auto">
        <DieEditCard :editable="editable" :die="die" />
      </v-col>
      <v-col>
        <v-row no-glutters>
          <v-text-field v-model="code" v-bind="codeProps" label="Codice" />
        </v-row>
        <v-row no-glutters>
          <v-combobox
            clearable
            chips
            multiple
            label="Aliases"
            v-model="aliases"
            v-bind="aliasesProps"
          ></v-combobox>
        </v-row>
        <v-row no-glutters>
          <v-text-field v-model="customer" v-bind="customerProps" label="Cliente" />
        </v-row>
      </v-col>
    </v-row>

    <v-row no-glutters>
      <v-col>
        <v-autocomplete
          ref="material"
          v-model="material"
          v-bind="materialProps"
          :items="materials"
          label="Materiale"
          placeholder="Seleziona un materiale..."
          required
        ></v-autocomplete>
      </v-col>
      <v-col>
        <v-autocomplete
          ref="dieType"
          v-model="dieType"
          v-bind="dieTypeProps"
          :items="dieTypes"
          label="Colore"
          placeholder="Seleziona un tipo di stampo..."
          required
        ></v-autocomplete>
      </v-col>
    </v-row>

    <v-row no-glutters>
      <v-col cols="12" sm="3">
        <v-text-field />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field />
      </v-col>
    </v-row>

    <!-- <v-checkbox v-model="terms" v-bind="termsProps" label="Do you agree?" color="primary" /> -->
    <v-btn color="outline" class="ml-4" @click="resetForm()"> Reset </v-btn>
    <v-btn color="outline" class="ml-4" @click="onSubmit">Crea</v-btn>

    <teleport to="body">
      <DieEditorWrapper :dialog="true" @close="close" />
    </teleport>
  </v-container>
</template>

<script setup lang="ts">
import DieEditCard from '@/components/die/DieEditCard.vue'
import DieEditorWrapper from '@/components/die/DieEditorWrapper.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { useForm } from 'vee-validate'
import { onMounted, provide, ref, watch } from 'vue'
import * as yup from 'yup'

interface DieDataEditProps {
  editable?: boolean
  dieId?: string
}

const props = withDefaults(defineProps<DieDataEditProps>(), {
  editable: false
})

const visible = ref(false)
const die = ref<Client.Components.Schemas.Die | Client.Components.Schemas.DieDao>()
const http = useHttp()
const materials = ref<Client.Components.Schemas.MaterialType[]>(['TPU', 'PVC', 'TR', 'POLIETILENE'])
const dieTypes = ref<Client.Components.Schemas.DieType[]>(['MONOCOLORE', 'BICOLORE', 'TRICOLORE'])

provide('edit', edit)
provide('visible', visible)
watch(
  () => props.dieId,
  () => loadDie(props.dieId)
)

const schema = yup.object({
  code: yup.string().required().label('Codice'),
  aliases: yup.array().of(yup.string()).label("Aliases"),
  customer: yup.string().required().label('Cliente'),
  material: yup.string().required().label('Materiale'),
  dieType: yup.string().required().label('Colore'),
  totalWidth: yup.number().required().label('Larghezza Totale'),
  totalHeight: yup.number().required().label('Altezza Totale'),
  shoeWidth: yup.number().required().label('Larghezza Scarpetta'),
  crestWidth: yup.number().required().label('Larghezza Cresta')
})

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors
  }
})

const [code, codeProps] = defineField('code', vuetifyConfig)
const [aliases, aliasesProps] = defineField('aliases', vuetifyConfig)
const [customer, customerProps] = defineField('customer', vuetifyConfig)
const [material, materialProps] = defineField('material', vuetifyConfig)
const [dieType, dieTypeProps] = defineField('dieType', vuetifyConfig)

const onSubmit = handleSubmit((values) => {
  console.log('Submitted with', values)
})
function close() {
  console.log(visible.value)
}
function edit(id?: string) {
  console.log(id)
  visible.value = true
}

async function loadDie(id?: string) {
  if (id === undefined) return

  const client = await http.client
  const res = await client.getDie({ id })
  die.value = res.data
}

onMounted(() => {
  loadDie(props.dieId)
})
</script>
