<template>
    <v-card class="ma-5 pa-2" elevation="3" v-if="die">
        <v-card-item>
            <v-card-title>

                <v-toolbar color="rgba(0, 0, 0, 0)">

                    <v-toolbar-title>
                        <v-sheet class="text-h4 ma-2 pa-2 me-auto">{{ die.name }}</v-sheet>
                    </v-toolbar-title>

                    <template v-slot:append>
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template>

                            <v-list>
                                <v-list-item prepend-icon="mdi-pencil" :to="'/edit-die/' + die.name">
                                    <v-list-item-title>Modifica</v-list-item-title>
                                </v-list-item>
                                <v-dialog v-model="dialog" max-width="400" persistent>
                                    <template v-slot:activator="{ props: activatorProps }">
                                        <v-list-item prepend-icon="mdi-trash-can-outline" v-bind="activatorProps">
                                            <v-list-item-title>Elimina</v-list-item-title>
                                        </v-list-item>
                                        <!-- <v-btn v-bind="activatorProps">
                                            Open Dialog
                                        </v-btn> -->
                                    </template>

                                    <v-card prepend-icon="mdi-trash-can-outline"
                                        :text="'Sei sicuro di voler eliminare lo stampo \'' + die.name + '\'? Una volta eliminato non sarà possibile recuperarlo!'"
                                        title="Eliminare lo stampo?">
                                        <template v-slot:actions>
                                            <v-spacer></v-spacer>

                                            <v-btn @click="dialog = false">
                                                Annulla
                                            </v-btn>

                                            <v-btn @click="dialog = false; remove()">
                                                Elimina
                                            </v-btn>
                                        </template>
                                    </v-card>
                                </v-dialog>

                            </v-list>
                        </v-menu>
                        <!-- TODO: open menu (delete & edit) -->
                    </template>
                </v-toolbar>
                <!-- <v-sheet class="d-flex mb-6 align-center">
                    <v-sheet class="text-h4 ma-2 pa-2 me-auto">{{ die.name }}</v-sheet>
                    <v-chip class="ma-2 pa-2" color="indigo" prepend-icon="mdi-invert-colors">MONOCOLORE</v-chip>
                    <v-chip class="ma-2 pa-2" color="success" prepend-icon="mdi-material-ui">PVC</v-chip>
                </v-sheet> -->

            </v-card-title>
            <v-card-subtitle>
                <v-chip v-for="alias of die.aliases" class="ma-2" color="pink" label size="small">
                    <v-icon icon="mdi-label" start></v-icon>
                    {{ alias }}
                </v-chip>
            </v-card-subtitle>
        </v-card-item>
        <v-card-text>
            <v-row>
                <v-col cols="12" md="6">
                    <DieEditor class="h-screen" v-model="die.dieData" :tools="[Tool.MOVE]" :can-save="false"
                        :can-clear="false" :can-close="false" :can-redo="false" :can-undo="false" />
                </v-col>

                <v-col cols="12" md="6">

                    <v-card color="error" append-icon="mdi-face-agent">
                        <template v-slot:title>
                            {{ die.customer?.name }}
                        </template>
                    </v-card>

                    <div class="mt-4" align="center">
                        <v-chip class="ma-2 pa-2" color="indigo" prepend-icon="mdi-invert-colors">{{ die.dieType
                            }}</v-chip>
                        <v-chip class="ma-2 pa-2" color="success" prepend-icon="mdi-material-ui">{{ die.material
                            }}</v-chip>

                        <div v-if="!die.aliases || die.aliases.length == 0">Nessun alias presente</div>
                    </div>

                    <v-divider class="mx-4 my-6"></v-divider>

                    <div class="mx-5">
                        <p class="text-h6">
                            Dimensioni stampo
                        </p>
                        <ul>
                            <li><b>Larghezza</b>: {{ die.totalWidth }} mm</li>
                            <li><b>Altezza</b>: {{ die.totalHeight }} mm</li>
                            <li><b>Larghezza Scarpetta</b>: {{ die.shoeWidth }} mm</li>
                            <li><b>Larghezza Cresta</b>: {{ die.crestWidth }} mm</li>
                        </ul>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

    <div class="text-center pa-4">

    </div>
</template>

<script setup lang="ts">
import DieEditor from '@/components/die/DieEditor.vue';
import { Tool } from '@/model/editor/tools/tool';
import { useHttp } from '@/plugins/http';
import Client from '@/plugins/http/openapi';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

const route = useRoute()
const router = useRouter()
const http = useHttp();
const die = ref<Client.Components.Schemas.Die>();
const dialog = ref();

watch(() => route.params.id, (_, _2) => {
    loadDie(route.params.id as string)
})

async function remove() {
    if (!die.value?.name) return;

    const client = await http.client
    const res = await client.deleteDie({ id: die.value.name })
    if (res.status == 200) {
        router.push("/").then(_ =>
            toast.success("Stampo eliminato!"));
    }
}
async function loadDie(id?: string) {
    console.log("loadDie", id)
    if (!id) return;

    const client = await http.client
    const res = await client.getDie({ id })
    if (res.status == 200) {
        die.value = res.data
    }
}

onMounted(() => {
    loadDie(route.params.id as string)
})
</script>