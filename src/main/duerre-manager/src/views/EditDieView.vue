<template>
  <h1 align="center">Modifica stampo</h1>
  <DieDataEdit :editable="true" :die-id="id" @on-success="onSuccess" @on-fail="onFail" okButton="Modifica" :show-buttons="true" />
</template>

<script setup lang="ts">
import DieDataEdit from '@/components/die/DieDataEdit.vue'
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
  const die: Client.Components.Schemas.DieDao = { ...values };
  const client = await http.client
  const res = await client.editDie(null, die)

  console.log(res);
  if (res?.status == 200) {
    router.push("/die/" + res.data.id).then(_ => {
      toast.success("Lo stampo è stato modificato!");
    })
  }
}
function onFail() {
  toast.warn("Ci sono alcuni errori! Inserisci correttamente i dati");
}

onMounted(() => id.value = route.params.id as string)
</script>
