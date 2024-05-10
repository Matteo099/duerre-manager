<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card prepend-icon="mdi-update" title="Aggiornamento applicazione">
      <template v-slot:text>
        <div>
          E' disponibile una nuova versione dell'applicazione (<b>v {{ newAppVersion }}</b
          >). Vuoi effettuare l'aggiornamento adesso?
          <br />
          <br />
          Prima di iniziare l'aggiornamento assicurati di aver salvato eventuali modifiche.
          <br />
          Durante l'aggiornamento <b>non</b> sarà possibile utilizzare l'applicazione.
          <br />
          <br />
          Stima tempo richiesto: <b>5 minuti</b>
        </div>
      </template>

      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn @click="dialog = false"> Più tardi </v-btn>

        <v-btn @click="updateApp()"> Aggiorna </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useHttp } from '@/plugins/http'
import { onMounted } from 'vue';

interface UpdateAppProps {
  newAppVersion: string
}

const props = defineProps<UpdateAppProps>()
const dialog = defineModel<boolean>({
  default: false
})
const http = useHttp()

async function updateApp() {
  const client = await http.client
  const res = await client.update()
  dialog.value = false
  if (res?.status == 200) {
    console.log(res.data)
  }
}

async function updateProgress() {
  let evtSource = new EventSource('http://localhost:8080/api/v1/updater-controller/sse')
  evtSource.onmessage = function (e: any) {
    console.log(e.data)
    /*
    if (e.data == 'done') {
      evtSource.close()
    } else {
      commitAsyncCar(store, JSON.parse(e.data))
    }*/
  }
}

onMounted(() => {
    updateProgress();
})
</script>
