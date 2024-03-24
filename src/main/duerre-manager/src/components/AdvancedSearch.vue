<template>
  <v-form @submit="onSubmit">
    <v-text-field
      v-model="text"
      v-bind="textProps"
      label="Text"
      placeholder="Ricerca per nome o alias"
      loading
      clearable
      @click:clear="clearSearch"
    >
      <template v-slot:prepend>
        <v-btn
          :icon="more ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          variant="text"
          @click="showMore"
        ></v-btn>
      </template>
      <template v-slot:loader>
        <v-progress-linear
          :active="searching"
          color="info"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
      <template v-slot:append>
        <v-btn type="submit" icon="mdi-flip-h mdi-magnify" variant="text"></v-btn>
      </template>
    </v-text-field>

    <v-expand-transition>
      <v-container class="py-0" v-show="more" fluid>
        <v-row align="center" no-glutters>
          <v-col cols="auto">
            <DieEditCard :editable="true" />
          </v-col>
          <v-col>
            <v-row no-glutters>
              <v-text-field v-model="email" v-bind="emailProps" label="Email" type="email" />
            </v-row>
            <v-row no-glutters>
              <v-text-field
                v-model="password"
                v-bind="passwordProps"
                label="Password"
                type="password"
              />
            </v-row>
          </v-col>
        </v-row>

        <v-row no-glutters>
          <v-col>
            <v-text-field
              v-model="passwordConfirm"
              v-bind="confirmProps"
              label="Password confirmation"
              type="password"
            />
          </v-col>
          <v-col>
            <v-text-field />
          </v-col>
        </v-row>

        <v-row no-glutters>
          <v-col cols="12" sm="3">
            <v-text-field />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field />
          </v-col>
        </v-row>

        <v-checkbox v-model="terms" v-bind="termsProps" label="Do you agree?" color="primary" />
        <v-btn color="outline" class="ml-4" @click="resetForm()"> Reset </v-btn>
      </v-container>
    </v-expand-transition>
  </v-form>

  <!-- <v-form @submit="onSubmit" class="px-4">
    <v-text-field v-model="name" v-bind="nameProps" label="Name" />
    <v-text-field v-model="email" v-bind="emailProps" label="Email" type="email" />
    <v-text-field v-model="password" v-bind="passwordProps" label="Password" type="password" />
    <v-text-field
      v-model="passwordConfirm"
      v-bind="confirmProps"
      label="Password confirmation"
      type="password"
    />

    <v-checkbox v-model="terms" v-bind="termsProps" label="Do you agree?" color="primary" />

    <v-btn color="primary" type="submit"> Submit </v-btn>
    <v-btn color="outline" class="ml-4" @click="resetForm()"> Reset </v-btn>
  </v-form> -->
</template>

<script setup lang="ts">
import DieEditCard from './die/DieEditCard.vue'
import { useForm, type GenericObject } from 'vee-validate'
import { ref } from 'vue'
import * as yup from 'yup'

const schema = yup.object({
  text: yup.string().required().label('Text')
  //   email: yup.string().email().required().label('E-mail'),
  //   password: yup.string().min(6).required(),
  //   passwordConfirm: yup
  //     .string()
  //     .oneOf([yup.ref('password')], 'Passwords must match')
  //     .required()
  //     .label('Password confirmation'),
  //   terms: yup.boolean().required().oneOf([true], 'You must agree to terms and conditions')
})

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

// Refer to the docs for how to make advanced validation behaviors with dynamic configs
// TODO: Add link
const vuetifyConfig = (state: any) => ({
  props: {
    'error-messages': state.errors
  }
})

const [text, textProps] = defineField('text', vuetifyConfig)
const [email, emailProps] = defineField('email', vuetifyConfig)
const [password, passwordProps] = defineField('password', vuetifyConfig)
const [passwordConfirm, confirmProps] = defineField('passwordConfirm', vuetifyConfig)
const [terms, termsProps] = defineField('terms', vuetifyConfig)
const searching = ref(false)
const more = ref(false)

const onSubmit = handleSubmit((values) => search(values))

async function search(values: GenericObject) {
  searching.value = true
  console.log('Submitted with', values)
  setTimeout(() => (searching.value = false), 2000)
}

function clearSearch() {}

function showMore() {
  more.value = !more.value
}
</script>
