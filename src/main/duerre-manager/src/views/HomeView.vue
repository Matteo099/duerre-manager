<template>
  <button @click="toastC">toast</button>

  <!-- <DieEditor class="h-screen" /> -->
</template>

<script setup lang="ts">
import DieEditor from '@/components/die/DieEditor.vue'
import { toast } from 'vue3-toastify'

function toastC() {
  toast.error("An error occured...")
  toast.success('Wow so easy!')
  toast.info("Info")
  toast.warning("Warning")
}
</script>
