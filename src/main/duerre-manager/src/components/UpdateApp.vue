<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card prepend-icon="mdi-update" title="Aggiornamento applicazione">
      <template v-slot:text>
        <div v-if="!updateStatus || !updateStatus.phase || !updateStatus.updating">
          E' disponibile una nuova versione dell'applicazione (<b>v {{ newAppVersion }}</b>). Vuoi effettuare
          l'aggiornamento adesso?
          <br />
          <br />
          Prima di iniziare l'aggiornamento assicurati di aver salvato eventuali modifiche.
          <br />
          Durante l'aggiornamento <b>non</b> sarà possibile utilizzare l'applicazione.
          <br />
          <br />
          Stima tempo richiesto: <b>5 minuti</b>
        </div>
        <div v-else-if="updateStatus.error">
          Si è verificato un errorre durante il processo di aggiornamento:
          <br />
          <br />
          <p class="text-center" color="error">
            {{ updateStatus.error }}
          </p>
        </div>
        <div v-else-if="updateStatus?.phase == 'STARTING'">
          <v-row col="auto" class="my-4 justify-center">
            <v-col class="text-center">
              Avvio processo di aggiornamento dell'applicazione (<b>v {{ newAppVersion }}</b>)
            </v-col>
          </v-row>
          <v-row class="my-4 justify-center" col="auto">
            <v-progress-circular :width="3" color="red" indeterminate></v-progress-circular>
          </v-row>
        </div>
        <div v-else-if="updateStatus?.phase == 'DOWNLOADING'">
          <div>
            Download aggiornamenti dell'applicazione in corso (<b>v {{ newAppVersion }}</b>)
            <br />
            <br />
          </div>
          <v-progress-linear v-if="updateStatus.progress" color="deep-orange" height="10"
            :model-value="updateStatus.progress * 100" striped></v-progress-linear>
        </div>
        <div v-else-if="updateStatus?.phase == 'INSTALLING'">
          <v-row col="auto" class="my-4 justify-center">
            <v-col class="text-center">
              Installazione e riavvio dell'applicazione in corso...
            </v-col>
          </v-row>
          <v-row class="my-4 justify-center" col="auto">
            <v-progress-circular :width="3" color="red" indeterminate></v-progress-circular>
          </v-row>
        </div>
      </template>

      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn v-if="updateStatus?.error" @click="ackUpdateError">Ok</v-btn>
        <template v-else>
          <v-btn v-if="!updateStatus?.updating" @click="dialog = false"> Più tardi </v-btn>
          <v-btn @click="updateApp()">{{ successButton }}</v-btn>
        </template>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useHttp } from '@/plugins/http';
import Client from '@/plugins/http/openapi';
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface UpdateAppProps {
  newAppVersion: string
}

const props = defineProps<UpdateAppProps>()
const dialog = defineModel<boolean>({
  default: false
})
const updateStatus = ref<Client.Components.Schemas.UpdateStatus>();
const http = useHttp()

const successButton = computed(() => updateStatus.value?.updating ? "Chiudi" : "Aggiorna")

let evtSource: EventSource;

async function updateApp() {
  if (updateStatus.value?.updating) {
    dialog.value = false;
    return;
  }

  const client = await http.client
  const res = await client.update()

  if (res?.status == 200) {
    console.log(res.data)
    updateProgress();
  }
}

async function ackUpdateError() {
  const client = await http.client;
  const res = await client.ackUpdateError();
}

async function updateProgress() {
  if (evtSource) evtSource.close();

  console.log("updateProgress")
  evtSource = new EventSource('/api/v1/updater-controller/sse')
  evtSource.onmessage = function (e: MessageEvent<string>) {
    const data: Client.Components.Schemas.UpdateStatus = JSON.parse(e.data);
    updateStatus.value = data;
    console.log(data);
    // updating.value = data.updating ?? false;
    // progress.value = data.progress ?? 0;
    // downloaded.value = progress.value >= 1;
    // if (downloaded.value) {
    //   console.log("Download completed")
    //   progress.value = undefined;
    //   evtSource.close();
    // }
    // if (data.error) {
    //   toast.error("Errore durante l'aggiornamento: " + data.error)
    // }
  }
}

async function getUpdateStatus() {
  const client = await http.client;
  const res = await client.updateStatus();

  if (res?.status == 200) {
    updateStatus.value = res.data;
  }
}

onMounted(() => {
  getUpdateStatus();
  updateProgress();
})

onUnmounted(() => {
  if (evtSource) evtSource.close();
})
</script>
