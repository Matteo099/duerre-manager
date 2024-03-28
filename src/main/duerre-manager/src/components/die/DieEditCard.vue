<template>
  <v-card
    class="mx-auto"
    height="200"
    image="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
    width="200"
    :link="editable"
    @click="onEdit"
  >
    <v-container v-if="editable" class="h-100" fluid>
      <v-row class="h-100" align="center" no-gutters>
        <v-col class="text-center">
          <v-icon color="success" icon="mdi-pencil"> </v-icon>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import Client from '@/plugins/http/openapi'
import { inject } from 'vue'

type DieEdit = string | Client.Components.Schemas.Die | Client.Components.Schemas.DieDao
interface DieEditCardProp {
  die?: DieEdit
  editable?: boolean
}

const props = defineProps<DieEditCardProp>()
const emit = defineEmits<{
  edit: [dieEdit?: DieEdit]
}>()
const edit = inject<(dieEdit?: DieEdit) => void>('edit')

function onEdit() {
  if (!props.editable) return

  emit('edit', props.die)
  edit?.(props.die)
}
</script>
