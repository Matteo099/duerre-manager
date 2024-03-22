<template>
  <v-card
    class="mx-auto"
    height="200"
    image="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
    width="200"
    link
    @click="$emit('edit', 0)"
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
interface DieEditCardProp {
  image?: string
  editable?: boolean
}

const props = defineProps<DieEditCardProp>()
const emit = defineEmits<{
  edit: [id: number]
}>()
</script>
