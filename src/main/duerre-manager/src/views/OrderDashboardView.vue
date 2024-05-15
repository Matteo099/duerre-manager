<template>
  <div class="ma-4">
    <v-row no-gutters>
      <v-col cols="12">
        <v-form @submit="onSubmit">
          <v-combobox
            class="mx-auto"
            density="comfortable"
            menu-icon=""
            placeholder="Ricerca ordine"
            theme="light"
            variant="solo"
          >
            <template v-slot:append>
              <v-btn type="submit" icon="mdi-flip-h mdi-magnify" variant="text"></v-btn>
            </template>
          </v-combobox>
        </v-form>
      </v-col>
    </v-row>

    <v-row no-gutters v-if="loading">
      <v-col v-for="i in 3" :key="i" cols="12" md="4" class="px-2">
        <v-skeleton-loader :elevation="3" type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-data-table
      v-model:expanded="expanded"
      :headers="headers"
      :items="orders"
      item-value="id"
      no-data-text="Nessun ordine disponibile!"
      show-expand
    >
      <!-- <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Expandable Table</v-toolbar-title>
        </v-toolbar>
      </template> -->
      <template v-slot:item.name="{ value, item }">
        <div class="d-flex align-center">
          {{ value }}
          <v-btn
            icon="mdi-open-in-new"
            size="small"
            variant="text"
            :to="`/order/${item.id}`"
          ></v-btn>
        </div>
      </template>
      <template v-slot:item.description="{ value }">
        <span class="d-inline-block text-truncate" style="max-width: 150px">
          {{ value }}
        </span>
      </template>
      <template v-slot:item.status="{ value, item }">
        <v-icon v-if="item.cancelled" color="error">mdi-cancel</v-icon>
        <v-icon v-else :color="statusMapper[value].color">{{ statusMapper[value].icon }}</v-icon>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <v-container fluid>
              <v-card class="mx-auto" max-width="800">
                <v-row class="my-2 mx-10 justify-space-between" v-for="(v, k) of item">
                  <v-col cols="auto">
                    <b>{{ orderMapper[k].name }}</b>
                  </v-col>
                  <v-col cols="auto">{{ orderMapper[k].process(v) }}</v-col>
                </v-row>
                <v-card-actions>
                  <v-btn
                    color="primary"
                    text="Visualizza"
                    variant="text"
                    :to="`/order/${item.id}`"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-container>
          </td>
        </tr>
      </template>
    </v-data-table>

    <div v-if="total > 0" class="text-center pb-6">
      <v-pagination
        v-model="page"
        :length="total"
        rounded="circle"
        :total-visible="4"
        @update:model-value="goToPage"
      ></v-pagination>
    </div>

    <v-fab color="success" icon="mdi-plus" size="64" to="/create-order" fixed app appear></v-fab>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Order {
  id: string | number
  name: string
  customer: string
  quantity: number
  description?: string
  creationDate: string
  expirationDate?: string
  completitionDate?: string
  cancelled: boolean
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  completitionTime?: number
}

const orders = ref<Order[]>([])
const page = ref(1)
const total = ref(0)
const itemsPerPage = 12
const loading = ref(false)
const expanded = ref<any>([])
const headers = [
  { title: 'Articolo', key: 'name' },
  { title: 'Cliente', key: 'customer' },
  { title: 'Quantità (m)', key: 'quantity' },
  { title: 'Descrizione', key: 'description' },
  { title: 'Stato', key: 'status' }
]
const statusMapper: { [key: string]: any } = {
  TODO: {
    icon: 'mdi-new-box',
    color: 'warning'
  },
  IN_PROGRESS: {
    icon: 'mdi-progress-helper',
    color: 'info'
  },
  DONE: {
    icon: 'mdi-check-decagram',
    color: 'success'
  }
}
const orderMapper: { [key: string]: any } = {
  id: {
    name: 'Codice Ordine',
    process: (v: any) => v
  },
  name: {
    name: 'Articolo',
    process: (v: any) => v
  },
  customer: {
    name: 'Cliente',
    process: (v: any) => v
  },
  quantity: {
    name: 'Quantità',
    process: (v: any) => v + ' m'
  },
  description: {
    name: 'Descrizione',
    process: (v: any) => v
  },
  creationDate: {
    name: 'Data di Creazione',
    process: (v: any) => v
  },
  completitionDate: {
    name: 'Data di Completamento',
    process: (v: any) => v
  },
  expirationDate: {
    name: 'Data di Scadenza',
    process: (v: any) => v
  },
  cancelled: {
    name: 'Annullato',
    process: (v: any) => (v ? 'Si' : 'No')
  },
  status: {
    name: 'Stato di Avanzamento',
    process: (v: any) => (v == 'TODO' ? 'Da fare' : v == 'IN_PROGRESS' ? 'In Corso' : 'Completato')
  },
  completitionTime: {
    name: 'Tempo Richiesto',
    process: (v: any) => v + ' minuti'
  }
}

function goToPage(page: number) {
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  // const tempDies = diesToPaginate.slice(start, end)//.map(d => ({...d, key: getKey(d)}));
  // dies.value = tempDies;
}

async function loadOrders() {
  orders.value = [
    {
      id: 1,
      name: '2',
      customer: 'C1',
      quantity: 100,
      cancelled: false,
      creationDate: '',
      status: 'IN_PROGRESS'
    },
    {
      id: 2,
      name: '3',
      customer: 'ASB',
      quantity: 1345,
      description: 'some description about color, type, stitching and so on',
      creationDate: '',
      completitionDate: '',
      cancelled: false,
      status: 'TODO'
    },
    {
      id: 3,
      name: '4',
      customer: 'ASB',
      quantity: 1345,
      description: 'some description about color, type, stitching and so on',
      creationDate: '',
      completitionDate: '',
      cancelled: false,
      status: 'DONE',
      completitionTime: 129
    },
    {
      id: 4,
      name: '3',
      customer: 'ASB',
      quantity: 1345,
      description: 'some description about color, type, stitching and so on',
      creationDate: '',
      completitionDate: '',
      cancelled: true,
      status: 'TODO'
    }
  ]
}

function onSubmit() {}

onMounted(() => loadOrders())
</script>

<style>
/* using <style scoped> the table header are not bold! */
.v-table > .v-table__wrapper > table > tbody > tr > th,
.v-table > .v-table__wrapper > table > thead > tr > th,
.v-table > .v-table__wrapper > table > tfoot > tr > th {
  font-weight: 600;
}
</style>
