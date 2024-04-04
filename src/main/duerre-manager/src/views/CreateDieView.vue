<template>
  <h1 align="center">Crea un nuovo stampo</h1>
  <DieDataEdit :editable="true" @on-success="onSuccess" @on-fail="onFail" okButton="Crea" :show-buttons="true" />
</template>

<script setup lang="ts">
import DieDataEdit from '@/components/die/DieDataEdit.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import type { GenericObject } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const http = useHttp()

async function onSuccess(values?: GenericObject) {
  const die: Client.Components.Schemas.DieDao = { ...values }
  const client = await http.client
  const res = await client.createDie(null, die)
  console.log(res)
  if (res.status == 200) {
    router.push('/die/' + res.data.id).then((_) => {
      toast.success('Lo stampo è stato creato!')
    })
  }
}
function onFail() {
  toast.warn('Ci sono alcuni errori! Inserisci correttamente i dati')
}
</script>
