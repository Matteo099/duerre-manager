<template>
  <v-container fluid>
    <v-row class="mt-2" align="center" no-glutters>
      <v-col cols="auto" align="center">
        <DieEditCard v-model="dieData" v-bind="dieDataProps" />
      </v-col>
      <v-col>
        <v-row no-glutters>
          <v-text-field v-model="name" v-bind="nameProps" label="Codice" />
        </v-row>
        <v-row no-glutters>
          <v-combobox clearable v-model="customer" v-bind="customerProps" label="Cliente"
            :items="customers"></v-combobox>
        </v-row>
        <v-row no-glutters>
          <v-combobox clearable chips multiple label="Aliases" v-model="aliases" v-bind="aliasesProps"></v-combobox>
        </v-row>
      </v-col>
    </v-row>

    <v-row no-glutters>
      <v-col>
        <v-select v-bind="materialProps" v-model="material" label="Materiale" :items="materials"
          placeholder="Seleziona un materiale..." required></v-select>
      </v-col>
      <v-col>
        <v-select v-bind="dieTypeProps" v-model="dieType" label="Colore" :items="dieTypes"
          placeholder="Seleziona un tipo di stampo..." required></v-select>
      </v-col>
    </v-row>

    <v-row no-glutters>
      <v-col cols="12" sm="3">
        <v-text-field v-bind="totalWidthProps" v-model="totalWidth" label="Larghezza Totale" suffix="mm"
          type="number"></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field v-bind="totalHeightProps" v-model="totalHeight" label="Altezza Totale" suffix="mm"
          type="number"></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field v-bind="shoeWidthProps" v-model="shoeWidth" label="Larghezza Scarpetta" suffix="mm"
          type="number"></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field v-bind="crestWidthProps" v-model="crestWidth" label="Larghezza Cresta" suffix="mm"
          type="number"></v-text-field>
      </v-col>
    </v-row>

    <!-- <v-checkbox v-model="terms" v-bind="termsProps" label="Do you agree?" color="primary" /> -->
    <v-btn color="outline" class="ml-4" @click="resetForm()"> Reset </v-btn>
    <v-btn color="outline" class="ml-4" @click="onSubmit">Crea</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import DieEditCard from '@/components/die/DieEditCard.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { useForm, type GenericObject, type InvalidSubmissionContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'

interface DieDataEditProps {
  editable?: boolean
  dieId?: string
}

const props = withDefaults(defineProps<DieDataEditProps>(), {
  editable: false
})

const http = useHttp()
const materials = ref<Client.Components.Schemas.MaterialType[]>(['TPU', 'PVC', 'TR', 'POLIETILENE'])
const dieTypes = ref<Client.Components.Schemas.DieType[]>(['MONOCOLORE', 'BICOLORE', 'TRICOLORE'])
const customers = ref<string[]>(['Test'])

watch(
  () => props.dieId,
  () => loadDie(props.dieId)
)

const emit = defineEmits<{
  (e: 'onSuccess', res?: GenericObject): void,
  (e: 'onFail', res?: InvalidSubmissionContext<GenericObject>): void,
}>()

const schema = yup.object({
  name: yup.string().required("Il Codice è necessario").label('Codice'),
  aliases: yup.array().of(yup.string()).label('Aliases'),
  customer: yup.string().required("Il cliente è obbligatorio").label('Cliente'),
  dieData: yup.object().required("Il disegno dello stampo è obbligatorio").test({
    test: (v: any) => !!v && v.valid,
    message: "Il disegno dello stampo non è completo",
    exclusive: false,
    skipAbsent: true,
    name: "polygon"
  }).label('DieData'),
  material: yup.string().required("Il materiale è obbligatorio").label('Materiale'),
  dieType: yup.string().required("Il tipo dello stampo è obbligatorio").label('Colore'),
  totalWidth: yup.number().required("La larghezza totale è obbligatoria").positive("La larghezza totale deve essere positiva").label('Larghezza Totale'),
  totalHeight: yup.number().required("L'altezza totale è obbligatoria").positive("L'altezza totale deve essere positiva").label('Altezza Totale'),
  shoeWidth: yup.number().required("La larghezza della scarpetta è obbligatoria").positive("La larghezza della scarpetta deve essere positiva").label('Larghezza Scarpetta'),
  crestWidth: yup.number().required("La larghezza della cresta è obbligatoria").positive("La larghezza della cresta deve essere positiva").label('Larghezza Cresta')
})

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors
  }
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [customer, customerProps] = defineField('customer', vuetifyConfig)
const [aliases, aliasesProps] = defineField('aliases', vuetifyConfig)
const [dieData, dieDataProps] = defineField('dieData', vuetifyConfig)
const [material, materialProps] = defineField('material', vuetifyConfig)
const [dieType, dieTypeProps] = defineField('dieType', vuetifyConfig)
const [totalWidth, totalWidthProps] = defineField('totalWidth', vuetifyConfig)
const [totalHeight, totalHeightProps] = defineField('totalHeight', vuetifyConfig)
const [shoeWidth, shoeWidthProps] = defineField('shoeWidth', vuetifyConfig)
const [crestWidth, crestWidthProps] = defineField('crestWidth', vuetifyConfig)

console.log(dieDataProps)

const onSubmit = handleSubmit(async (values: GenericObject) => {
  console.log('Submitted with', values)
  emit('onSuccess', values);
}, err => {
  console.log(err)
  emit('onFail', err);
})


async function loadDie(id?: string) {
  if (id === undefined) {
    const die: Client.Components.Schemas.Die = {
      name: "test",
      customer: { name: "ABC" },
      aliases: ["a", "b"],
      dieData: {
        state: [
          {
            "type": "bezier",
            "points": [
              200,
              300,
              200,
              350,
              600,
              200
            ]
          }
        ]
      },
      material: 'POLIETILENE',
      dieType: 'BICOLORE',
      totalWidth: 1,
      totalHeight: 1,
      shoeWidth: 1,
      crestWidth: 1,
    };
    name.value = die.name;
    customer.value = die.customer?.name;
    aliases.value = die.aliases;
    dieData.value = die.dieData;
    material.value = die.material
    dieType.value = die.dieType
    totalWidth.value = die.totalWidth
    totalHeight.value = die.totalHeight
    shoeWidth.value = die.shoeWidth
    crestWidth.value = die.crestWidth
    return
  }

  const client = await http.client
  const res = await client.getDie({ id })
  const die = res.data

  name.value = die.name;
  customer.value = die.customer?.name;
  aliases.value = die.aliases;
  dieData.value = die.dieData;
  material.value = die.material
  dieType.value = die.dieType
  totalWidth.value = die.totalWidth
  totalHeight.value = die.totalHeight
  shoeWidth.value = die.shoeWidth
  crestWidth.value = die.crestWidth
}

onMounted(() => {
  loadDie(props.dieId)
})
</script>
