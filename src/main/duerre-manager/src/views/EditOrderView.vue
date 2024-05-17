<template>
  <h1 align="center">Modifica ordine</h1>
  <EditOrder :editable="true" :order-id="id" @on-success="onSuccess" @on-fail="onFail" okButton="Modifica" :show-buttons="true" />
</template>

<script setup lang="ts">
import EditOrder from '@/components/EditOrder.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import type { GenericObject } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useRoute } from 'vue-router';

const route = useRoute()
const router = useRouter()
const http = useHttp()
const id = ref<string>();

watch(
  () => route.params.id,
  (_, _2) => id.value = route.params.id as string)

async function onSuccess(values?: GenericObject) {
  const order: Client.Components.Schemas.OrderDao = { ...values };
  const client = await http.client
  const res = await client.editOrder(null, order)

  console.log(res);
  if (res?.status == 200) {
    router.push("/order-dashboard").then(_ => {
      toast.success("L'ordine è stato modificato!");
    })
  }
}
function onFail() {
  toast.warn("Ci sono alcuni errori! Inserisci correttamente i dati");
}

onMounted(() => id.value = route.params.id as string)
</script>
