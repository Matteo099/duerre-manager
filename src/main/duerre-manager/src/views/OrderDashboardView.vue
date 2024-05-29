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
      expand-on-click
      hover
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
        <v-icon :color="statusMapper[value].color">{{ statusMapper[value].icon }}</v-icon>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <v-row class="my-10">
              <v-col>
                <v-card class="mx-auto" max-width="800">
                  <v-row class="my-2 mx-10 justify-space-between" v-for="(v, k) of orderMapper">
                    <v-col cols="auto" v-if="item[k] && !v.hide">
                      <b>{{ v.name }}</b>
                    </v-col>
                    <v-col cols="auto" v-if="item[k] && !v.hide">
                      {{ v.process(item[k]) }}
                    </v-col>
                  </v-row>
                  <v-card-actions>
                    <v-btn
                      v-if="item.status == 'TODO' || item.status == 'CANCELLED'"
                      @click="startOrder(item.orderId)"
                      class="ma-2"
                      color="primary"
                      text="Avvia"
                      variant="text"
                    ></v-btn>
                    <v-btn
                      v-if="item.status == 'IN_PROGRESS'"
                      @click="completeOrder(item.orderId)"
                      class="ma-2"
                      color="success"
                      text="Completa"
                      variant="text"
                    ></v-btn>
                    <v-btn
                      v-if="item.status == 'IN_PROGRESS'"
                      @click="cancelOrder(item.orderId)"
                      class="ma-2"
                      color="error"
                      text="Annulla"
                      variant="text"
                    ></v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col v-if="item.dieName">
                <AsyncDieCard :id="item.dieName" />
              </v-col>
            </v-row>
          </td>
        </tr>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          class="me-2"
          size="small"
          @click.stop
          :to="'/edit-order/' + item.orderId"
          variant="text"
          icon="mdi-pencil"
        ></v-btn>
        <v-dialog v-model="dialog" max-width="400" persistent>
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              class="me-2"
              size="small"
              v-bind="activatorProps"
              variant="text"
              icon="mdi-delete"
            ></v-btn>
          </template>

          <v-card
            prepend-icon="mdi-trash-can-outline"
            :text="`Sei sicuro di voler eliminare l'ordine ${item.orderId}? Una volta eliminato non sarà possibile recuperarlo!`"
            title="Eliminare ordine?"
          >
            <template v-slot:actions>
              <v-spacer></v-spacer>

              <v-btn @click="dialog = false"> Annulla </v-btn>

              <v-btn @click="deleteOrder(item.orderId)"> Elimina </v-btn>
            </template>
          </v-card>
        </v-dialog>
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
import AsyncDieCard from '@/components/AsyncDieCard.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'

const http = useHttp()
const orders = ref<Client.Components.Schemas.Order[]>([])
const page = ref(1)
const total = ref(0)
const itemsPerPage = 12
const loading = ref(false)
const dialog = ref(false)
const expanded = ref<any>([])
const headers = [
  { title: 'Articolo', key: 'dieName' },
  { title: 'Cliente', key: 'customer.name' },
  { title: 'Quantità (m)', key: 'quantity' },
  { title: 'Descrizione', key: 'description' },
  { title: 'Stato', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
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
  },
  CANCELLED: {
    icon: 'mdi-cancel',
    color: 'error'
  }
}
type OrderKeys = keyof Client.Components.Schemas.Order

const orderMapper: { [key in OrderKeys]: any } = {
  id: {
    name: 'Codice Ordine',
    process: (v: any) => v,
    hide: true
  },
  orderId: {
    name: 'Codice Ordine',
    process: (v: any) => v
  },
  dieName: {
    name: 'Articolo',
    process: (v: any) => v
  },
  customer: {
    name: 'Cliente',
    process: (v: any) => v.name
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
  startDate: {
    name: 'Data di Inizio',
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
  status: {
    name: 'Stato di Avanzamento',
    process: (v: any) =>
      v == 'TODO'
        ? 'Da fare'
        : v == 'IN_PROGRESS'
          ? 'In Corso'
          : v == 'DONE'
            ? 'Completato'
            : 'Annullato'
  },
  duration: {
    name: 'Tempo Richiesto',
    process: (s: any) => `${s / 3600}:${(s % 3600) / 60}:${s % 60}`
  }
}

function goToPage(page: number) {
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  // const tempDies = diesToPaginate.slice(start, end)//.map(d => ({...d, key: getKey(d)}));
  // dies.value = tempDies;
}

async function loadOrders() {
  const client = await http.client
  const res = await client.listOrders()

  if (res?.status == 200) {
    console.log(res.data)
    orders.value = res.data
  }
}

function startOrder(id?: string) {
  updateOrderStatus(id, 'IN_PROGRESS')
}
function completeOrder(id?: string) {
  updateOrderStatus(id, 'DONE')
}
function cancelOrder(id?: string) {
  updateOrderStatus(id, 'CANCELLED')
}

async function updateOrderStatus(
  id: string | undefined,
  status: Client.Components.Schemas.OrderStatus
) {
  if (id === undefined) return

  const client = await http.client
  const res = await client.changeOrderStatus({ id, status })

  if (res?.status == 200) {
    const index = orders.value.findIndex((o) => o.id == id)
    if (index !== -1) orders.value[index] = res.data
  }
}

function onSubmit() {}

async function deleteOrder(id?: string) {
  dialog.value = false

  if (!id) {
    toast.warning("Impossibile elimianre l'ordine: l'ID non esiste")
    return
  }
  const client = await http.client
  const res = await client.deleteOrder({ id })
  if (res?.status == 200) {
    toast.success("L'ordine è stato eliminato!")
  }
}

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
