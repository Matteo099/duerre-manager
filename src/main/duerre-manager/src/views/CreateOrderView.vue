<template>
  <h1 align="center">Crea un nuovo ordine</h1>
  <EditOrder :editable="true" @on-success="onSuccess" @on-fail="onFail" okButton="Crea" :show-buttons="true" />
</template>

<script setup lang="ts">
import EditOrder from '@/components/EditOrder.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import type { GenericObject } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const http = useHttp()

async function onSuccess(values?: GenericObject) {
  const order: Client.Components.Schemas.OrderDao = { ...values }
  const client = await http.client
  const res = await client.createOrder(null, order)
  console.log(res)
  if (res?.status == 200) {
    router.push('/order-dashboard').then((_) => {
      toast.success(`L'ordine è stato creato!`)
    })
  }
}
function onFail() {
  toast.warn('Ci sono alcuni errori! Inserisci correttamente i dati')
}
</script>
