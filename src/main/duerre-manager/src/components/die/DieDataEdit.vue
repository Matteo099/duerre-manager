<template>
  <v-container fluid>
    <v-row class="mt-2" align="center" no-glutters>
      <v-col cols="auto" align="center" v-if="dieDataField.visible">
        <DieEditCard v-model="dieData" v-bind="dieDataProps" />
      </v-col>
      <v-col>
        <v-row no-glutters v-if="nameField.visible">
          <v-text-field v-model="name" v-bind="nameProps" label="Codice" />
        </v-row>
        <v-row no-glutters v-if="customerField.visible">
          <v-combobox clearable v-model="customer" v-bind="customerProps" label="Cliente"
            :items="customers"></v-combobox>
        </v-row>
        <v-row no-glutters v-if="aliasesField.visible">
          <v-combobox clearable chips multiple label="Aliases" v-model="aliases" v-bind="aliasesProps"></v-combobox>
        </v-row>

        <template v-if="availableSpace">
          <v-row no-glutters v-if="materialField.visible">
            <v-select clearable v-bind="materialProps" v-model="material" label="Materiale" :items="materials"
              placeholder="Seleziona un materiale..." required></v-select>
          </v-row>
          <v-row no-glutters v-if="dieTypeField.visible">
            <v-select clearable v-bind="dieTypeProps" v-model="dieType" label="Colore" :items="dieTypes"
              placeholder="Seleziona un tipo di stampo..." required></v-select>
          </v-row>
        </template>
      </v-col>
    </v-row>

    <v-row no-glutters v-if="!availableSpace">
      <v-col v-if="materialField.visible">
        <v-select v-bind="materialProps" v-model="material" label="Materiale" :items="materials"
          placeholder="Seleziona un materiale..." required></v-select>
      </v-col>
      <v-col v-if="dieTypeField.visible">
        <v-select v-bind="dieTypeProps" v-model="dieType" label="Colore" :items="dieTypes"
          placeholder="Seleziona un tipo di stampo..." required></v-select>
      </v-col>
    </v-row>

    <v-row no-glutters>
      <v-col cols="12" sm="3" v-if="totalWidthField.visible">
        <v-text-field v-bind="totalWidthProps" v-model="totalWidth" label="Larghezza Totale" suffix="mm"
          type="number"></v-text-field>
      </v-col>
      <v-col cols="12" sm="3" v-if="totalHeightField.visible">
        <v-text-field v-bind="totalHeightProps" v-model="totalHeight" label="Altezza Totale" suffix="mm"
          type="number"></v-text-field>
      </v-col>
      <v-col cols="12" sm="3" v-if="shoeWidthField.visible">
        <v-text-field v-bind="shoeWidthProps" v-model="shoeWidth" label="Larghezza Scarpetta" suffix="mm"
          type="number"></v-text-field>
      </v-col>
      <v-col cols="12" sm="3" v-if="crestWidthField.visible">
        <v-text-field v-bind="crestWidthProps" v-model="crestWidth" label="Larghezza Cresta" suffix="mm"
          type="number"></v-text-field>
      </v-col>
    </v-row>

    <v-row no-glutters align="center" justify="center" v-if="showButtons">
      <v-col cols="auto">
        <v-btn color="outline" class="ml-4" @click="resetForm()"> Reset </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="success" class="ml-4" @click="onSubmit">{{ okButton }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import DieEditCard from '@/components/die/DieEditCard.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { useForm, type GenericObject, type InvalidSubmissionContext } from 'vee-validate'
import { computed } from 'vue'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

interface FieldProp {
  visible: boolean
  required?: boolean
  value?: any
}
interface DieDataEditProps {
  editable?: boolean
  dieId?: string

  nameField?: FieldProp
  aliasesField?: FieldProp
  customerField?: FieldProp
  dieDataField?: FieldProp
  materialField?: FieldProp
  dieTypeField?: FieldProp
  totalWidthField?: FieldProp
  totalHeightField?: FieldProp
  shoeWidthField?: FieldProp
  crestWidthField?: FieldProp

  showButtons?: boolean,
  okButton?: string
  handleFormSubmit?: (values: any) => void
}

const props = withDefaults(defineProps<DieDataEditProps>(), {
  editable: false,

  nameField: () => ({ visible: true, required: true }),
  aliasesField: () => ({ visible: true, required: true }),
  customerField: () => ({ visible: true, required: true }),
  dieDataField: () => ({ visible: true, required: true }),
  materialField: () => ({ visible: true, required: true }),
  dieTypeField: () => ({ visible: true, required: true }),
  totalWidthField: () => ({ visible: true, required: true }),
  totalHeightField: () => ({ visible: true, required: true }),
  shoeWidthField: () => ({ visible: true, required: true }),
  crestWidthField: () => ({ visible: true, required: true }),

  showButtons: false,
  okButton: 'Crea'
})

const http = useHttp()
const materials = ref<Client.Components.Schemas.MaterialType[]>(['TPU', 'PVC', 'TR', 'POLIETILENE'])
const dieTypes = ref<Client.Components.Schemas.DieType[]>(['MONOCOLORE', 'BICOLORE', 'TRICOLORE'])
const customers = ref<string[]>([])
const availableSpace = computed(() => {
  let availableUpperSpaces = 0
  availableUpperSpaces += props.nameField.visible ? 0 : 1
  availableUpperSpaces += props.aliasesField.visible ? 0 : 1
  availableUpperSpaces += props.customerField.visible ? 0 : 1

  let lowerFields = 0
  lowerFields += props.materialField.visible ? 1 : 0
  lowerFields += props.dieTypeField.visible ? 1 : 0
  return availableUpperSpaces >= lowerFields
})

watch(
  () => props.dieId,
  () => loadDie(props.dieId)
)

const watchers = [
  { prop: () => props.nameField, model: () => name },
  { prop: () => props.aliasesField, model: () => aliases },
  { prop: () => props.customerField, model: () => customer },
  { prop: () => props.dieDataField, model: () => dieData },
  { prop: () => props.materialField, model: () => material },
  { prop: () => props.dieTypeField, model: () => dieType },
  { prop: () => props.totalWidthField, model: () => totalWidth },
  { prop: () => props.totalHeightField, model: () => totalHeight },
  { prop: () => props.shoeWidthField, model: () => shoeWidth },
  { prop: () => props.crestWidthField, model: () => crestWidth }
];
watchers.forEach(w => {
  watch(
    () => w.prop(),
    () => {
      if (w.prop().value)
        w.model().value = w.prop().value
    }
  )
})



const emit = defineEmits<{
  (e: 'onSuccess', res?: GenericObject): void
  (e: 'onFail', res?: InvalidSubmissionContext<GenericObject>): void
  (e: 'dirty', res: boolean): void
}>()

const schema = yup.object({
  name:
    props.nameField.visible && props.nameField.required
      ? yup.string().required('Il Codice è necessario').label('Codice')
      : yup.string().label('Codice'),
  aliases: yup.array().of(yup.string()).label('Aliases'),
  customer:
    props.customerField.visible && props.customerField.required
      ? yup.string().required('Il cliente è obbligatorio').label('Cliente')
      : yup.string().label('Cliente').nullable().optional(),
  dieData:
    props.dieDataField.visible && props.dieDataField.required
      ? yup
        .object()
        .required('Il disegno dello stampo è obbligatorio')
        .test({
          test: (v: any) => !!v && v.valid,
          message: 'Il disegno dello stampo non è completo',
          exclusive: false,
          skipAbsent: true,
          name: 'polygon'
        })
        .label('DieData')
      : yup
        .object()
        .test({
          test: (v: any) => !!v && v.valid,
          message: 'Il disegno dello stampo non è completo',
          exclusive: false,
          skipAbsent: true,
          name: 'polygon'
        })
        .label('DieData'),
  material:
    props.materialField.visible && props.materialField.required
      ? yup.string().required('Il materiale è obbligatorio').label('Materiale')
      : yup.string().label('Materiale').nullable().optional(),
  dieType:
    props.dieTypeField.visible && props.dieTypeField.required
      ? yup.string().required('Il tipo dello stampo è obbligatorio').label('Colore')
      : yup.string().label('Colore').nullable().optional(),
  totalWidth:
    props.totalWidthField.visible && props.totalWidthField.required
      ? yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required('La larghezza totale è obbligatoria')
        .positive('La larghezza totale deve essere positiva')
        .label('Larghezza Totale')
      : yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive('La larghezza totale deve essere positiva')
        .label('Larghezza Totale'),
  totalHeight:
    props.totalHeightField.visible && props.totalHeightField.required
      ? yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required("L'altezza totale è obbligatoria")
        .positive("L'altezza totale deve essere positiva")
        .label('Altezza Totale')
      : yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive("L'altezza totale deve essere positiva")
        .label('Altezza Totale'),
  shoeWidth:
    props.shoeWidthField.visible && props.shoeWidthField.required
      ? yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required('La larghezza della scarpetta è obbligatoria')
        .positive('La larghezza della scarpetta deve essere positiva')
        .label('Larghezza Scarpetta')
      : yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive('La larghezza della scarpetta deve essere positiva')
        .label('Larghezza Scarpetta'),
  crestWidth:
    props.crestWidthField.visible && props.crestWidthField.required
      ? yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required('La larghezza della cresta è obbligatoria')
        .positive('La larghezza della cresta deve essere positiva')
        .label('Larghezza Cresta')
      : yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive('La larghezza della cresta deve essere positiva')
        .label('Larghezza Cresta')
})

const { defineField, handleSubmit, resetForm, values, meta } = useForm({
  validationSchema: schema
})

const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors
  }
})

const isDirty = computed(() => meta.value.dirty)
watch(
  () => isDirty.value,
  () => emit('dirty', isDirty.value)
)

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

const onSubmit = handleSubmit(
  async (values: GenericObject) => {
    console.log('Submitted with', values)
    emit('onSuccess', values)
  },
  (err) => {
    console.log(err)
    emit('onFail', err)
  }
)
function getFormValues() {
  return values
}
defineExpose({
  onSubmit,
  getFormValues,
  handleSubmit,
  resetForm
})

async function loadDie(id?: string) {
  if (!id) {
    return
  }

  const client = await http.client
  const res = await client.getDie({ id })
  const die = res.data

  name.value = die.name
  customer.value = die.customer?.name
  aliases.value = die.aliases
  dieData.value = die.dieData
  material.value = die.material
  dieType.value = die.dieType
  totalWidth.value = die.totalWidth
  totalHeight.value = die.totalHeight
  shoeWidth.value = die.shoeWidth
  crestWidth.value = die.crestWidth
}

async function loadCustomers() {
  const client = await http.client
  const res = await client.listCustomers()
  if (res?.status == 200) {
    customers.value = res.data.filter(c => !!c).map(c => c.name!);
  }
}

onMounted(() => {
  loadDie(props.dieId)
  loadCustomers();
})
</script>
