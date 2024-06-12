<template>
  <v-container fluid>
    <v-row class="mt-2" align="center" no-glutters>
      <v-col>
        <v-row no-glutters>
          <v-combobox
            clearable
            v-model="dieName"
            v-bind="dieNameProps"
            label="Articolo"
            :items="dieNames"
          ></v-combobox>
        </v-row>
        <v-row no-glutters>
          <v-combobox
            clearable
            v-model="customer"
            v-bind="customerProps"
            label="Cliente"
            :items="customers"
          ></v-combobox>
        </v-row>
        <v-row no-glutters>
          <v-text-field
            v-bind="quantityProps"
            v-model="quantity"
            label="Quantità"
            suffix="m"
            type="number"
          ></v-text-field>
        </v-row>
      </v-col>
      <v-col>
        <v-textarea
          clear-icon="mdi-close-circle"
          label="Descrizione"
          v-model="description"
          v-bind="descriptionProps"
          clearable
        ></v-textarea>
        <v-date-input 
          v-model="expirationDate" 
          v-bind="expirationDateProps"
          label="Scadenza">
        </v-date-input>
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
import { Utils } from '@/model/utils';
import { useHttp } from '@/plugins/http'
import { useForm, type GenericObject, type InvalidSubmissionContext } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

interface FieldProp {
  visible: boolean
  required?: boolean
  value?: any
}
interface DieDataEditProps {
  editable?: boolean
  orderId?: string

  dieNameField?: FieldProp
  customerField?: FieldProp
  quantityField?: FieldProp
  descirptionField?: FieldProp
  expirationDateField?: FieldProp

  showButtons?: boolean
  okButton?: string
  handleFormSubmit?: (values: any) => void
}

const props = withDefaults(defineProps<DieDataEditProps>(), {
  editable: false,

  dieNameField: () => ({ visible: true, required: true }),
  customerField: () => ({ visible: true, required: true }),
  quantityField: () => ({ visible: true, required: true }),
  descirptionField: () => ({ visible: true, required: true }),
  expirationDateField: () => ({ visible: true, required: true }),

  showButtons: false,
  okButton: 'Crea'
})

const http = useHttp()
const dieNames = ref<string[]>([])
const customers = ref<string[]>([])

watch(
  () => props.orderId,
  () => loadOrder(props.orderId)
)

const watchers = [
  { prop: () => props.dieNameField, model: () => dieName },
  { prop: () => props.customerField, model: () => customer },
  { prop: () => props.quantityField, model: () => quantity },
]
watchers.forEach((w) => {
  watch(
    () => w.prop(),
    () => {
      if (w.prop().value) w.model().value = w.prop().value
    }
  )
})

const emit = defineEmits<{
  (e: 'onSuccess', res?: GenericObject): void
  (e: 'onFail', res?: InvalidSubmissionContext<GenericObject>): void
  (e: 'dirty', res: boolean): void
}>()

const schema = yup.object({
  dieName:
    props.dieNameField.visible && props.dieNameField.required
      ? yup.string().required(`L'articolo è necessario`).label('Articolo')
      : yup.string().label('Articolo'),
  customer:
    props.customerField.visible && props.customerField.required
      ? yup.string().required('Il cliente è obbligatorio').label('Cliente')
      : yup.string().label('Cliente').nullable().optional(),
  quantity:
    props.quantityField.visible && props.quantityField.required
      ? yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required('La quantità è obbligatoria')
          .positive('La quantità deve essere positiva')
          .label('Quantità')
      : yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .positive('La quantità deve essere positiva')
          .label('Quantità'),
  description: yup.string().label('Descrizione').nullable().optional(),
  expirationDate: yup.string().label('Scadenza').nullable().optional(),
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

const [dieName, dieNameProps] = defineField('dieName', vuetifyConfig)
const [customer, customerProps] = defineField('customer', vuetifyConfig)
const [quantity, quantityProps] = defineField('quantity', vuetifyConfig)
const [description, descriptionProps] = defineField('description', vuetifyConfig)
const [expirationDate, expirationDateProps] = defineField('expirationDate', vuetifyConfig)

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

async function loadOrder(id?: string) {
  if (!id) {
    return
  }

  const client = await http.client
  const res = await client.getOrder({ id })
  const order = res.data

  dieName.value = order.dieName
  customer.value = order.customer?.name
  quantity.value = order.quantity
  description.value = order.description
  expirationDate.value = order.expirationDate ? Utils.toDate(order.expirationDate) : undefined;
}

async function loadCustomers() {
  const client = await http.client
  const res = await client.listCustomers()
  if (res?.status == 200) {
    customers.value = res.data.filter((c) => !!c).map((c) => c.name!)
  }
}

async function loadDies() {
  const client = await http.client
  const res = await client.listDies()
  if (res?.status == 200) {
    dieNames.value = res.data.filter((d) => !!d).map((d) => d.name!)
  }
}

onMounted(() => {
  loadOrder(props.orderId)
  loadCustomers()
  loadDies()
})
</script>
