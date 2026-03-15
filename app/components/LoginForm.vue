<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core'
import { loginFormSchema } from '@/lib/schemas'
import { authClient } from '@/lib/auth-client'

interface LoginErrors {
  email?: string
  password?: string
  form?: string
}

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const emailId = useId()
const passwordId = useId()

const errors = ref<LoginErrors>({})
const hasSubmitted = ref(false)
const isLoading = ref(false)

const togglePassword = () => (showPassword.value = !showPassword.value)

const validateField = (field: keyof LoginErrors) => {
  if (!hasSubmitted.value) return

  const result = loginFormSchema.safeParse({
    email: email.value,
    password: password.value
  })

  const fieldError = result.success
    ? undefined
    : result.error.issues.find((i) => i.path[0] === field)

  if (fieldError) {
    errors.value[field] = fieldError.message
  } else {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete errors.value[field]
  }
}

const submit = async () => {
  hasSubmitted.value = true
  errors.value = {}

  const result = loginFormSchema.safeParse({
    email: email.value,
    password: password.value
  })

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LoginErrors
      if (!errors.value[field]) {
        errors.value[field] = issue.message
      }
    }
    return
  }

  isLoading.value = true

  try {
    await authClient.signIn.email(
      {
        email: email.value,
        password: password.value,
        callbackURL: '/dashboard'
      },
      {
        onRequest: () => {
          isLoading.value = true
        },
        onSuccess: () => {
          navigateTo('/dashboard')
        },
        onError: (ctx) => {
          // Auth-level errors (wrong password, user not found) handled here.
          // The outer catch is for network/timeout failures only.
          errors.value.form = ctx.error.message
        }
      }
    )
  } catch {
    errors.value.form = 'Network error. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const throttledSubmit = useThrottleFn(submit, 2000)
</script>

<template>
  <form class="mt-10 max-w-md space-y-6 rounded-xl" @submit.prevent="throttledSubmit">
    <!-- Form-level error -->
    <p v-if="errors.form" role="alert" class="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
      {{ errors.form }}
    </p>

    <!-- Email -->
    <div class="relative">
      <input
        :id="emailId"
        v-model="email"
        placeholder=" "
        type="email"
        autocomplete="email"
        class="peer float-input"
        :class="{ 'float-error': errors.email }"
        @blur="validateField('email')"
      />
      <label :for="emailId" class="float-label">Email</label>
      <p v-if="errors.email" role="alert" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
    </div>

    <!-- Password -->
    <div class="relative">
      <input
        :id="passwordId"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder=" "
        autocomplete="current-password"
        class="peer float-input"
        :class="{ 'float-error': errors.password }"
        @blur="validateField('password')"
      />
      <label :for="passwordId" class="float-label">Password</label>
      <button
        type="button"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
        @click="togglePassword"
      >
        {{ showPassword ? 'Hide' : 'Show' }}
      </button>
      <p v-if="errors.password" role="alert" class="mt-1 text-sm text-red-500">
        {{ errors.password }}
      </p>
    </div>

    <!-- Forgot password -->
    <div class="flex justify-end">
      <NuxtLink href="/forgot-password" class="text-sm text-blue-600 hover:underline">
        Forgot password?
      </NuxtLink>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ isLoading ? 'Signing in...' : 'Sign In' }}
    </button>

    <!-- Sign up link -->
    <p class="text-center text-sm text-gray-600">
      Don't have an account?
      <NuxtLink href="/signup" class="text-blue-600 hover:underline">Create one</NuxtLink>
    </p>
  </form>
</template>
