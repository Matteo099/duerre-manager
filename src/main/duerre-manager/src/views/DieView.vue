<template>
    <p>Die View</p>
    <p>{{ die?.name }}</p>
</template>

<script setup lang="ts">
import { useHttp } from '@/plugins/http';
import Client from '@/plugins/http/openapi';
import router from '@/router';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const http = useHttp();
const die = ref<Client.Components.Schemas.Die>();

watch(() => route.params.id, (_, _2) => {
    loadDie(route.params.id as string)
})

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