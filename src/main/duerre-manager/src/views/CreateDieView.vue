<template>
  <DieDataEdit :editable="true" :die-id="id" />
</template>

<script setup lang="ts">
import DieDataEdit from '@/components/die/DieDataEdit.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { onMounted } from 'vue'
import { watch } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const http = useHttp()
const props = defineProps<{ id?: string }>()
const die = ref<Client.Components.Schemas.Die>()
</script>
