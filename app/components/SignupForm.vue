<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core'
import { signupFormSchema } from '@/lib/schemas'
import { authClient } from '@/lib/auth-client'

interface SignupErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreedToTerms?: string
  form?: string
}

// Per-instance form state (SSR-safe — no shared module-level refs)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreedToTerms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Accessible IDs for label/input association
const nameId = useId()
const emailId = useId()
const passwordId = useId()
const confirmPasswordId = useId()
const termsId = useId()

const errors = ref<SignupErrors>({})
const hasSubmitted = ref(false)

// isLoading covers only the async network call
const isLoading = ref(false)

const togglePassword = () => (showPassword.value = !showPassword.value)
const toggleConfirmPassword = () => (showConfirmPassword.value = !showConfirmPassword.value)

const reset = () => {
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  agreedToTerms.value = false
  showPassword.value = false
  showConfirmPassword.value = false
}

const validateField = (field: keyof SignupErrors) => {
  if (!hasSubmitted.value) return

  // confirmPassword depends on password — handle separately
  if (field === 'confirmPassword') {
    if (confirmPassword.value !== password.value) {
      errors.value.confirmPassword = 'Passwords do not match'
    } else {
      delete errors.value.confirmPassword
    }
    return
  }

  // All other fields can be validated in isolation
  const partialResult = signupFormSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    agreedToTerms: agreedToTerms.value
  })

  const fieldError = partialResult.success
    ? undefined
    : partialResult.error.issues.find((i) => i.path[0] === field)

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

  const result = signupFormSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    agreedToTerms: agreedToTerms.value
  })

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof SignupErrors
      if (!errors.value[field]) {
        errors.value[field] = issue.message
      }
    }
    return
  }

  isLoading.value = true

  try {
    await authClient.signUp.email(
      {
        email: email.value,
        password: password.value,
        name: name.value,
        callbackURL: '/dashboard'
      },
      {
        onRequest: () => {
          isLoading.value = true
        },
        onSuccess: () => {
          reset()
          navigateTo('/dashboard')
        },
        onError: (ctx) => {
          // Auth-level errors (duplicate email, etc.) are handled here.
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

// Throttle to prevent spam submissions between isLoading state transitions
const throttledSubmit = useThrottleFn(submit, 2000)
</script>

<template>
  <form class="mt-10 max-w-md space-y-6 rounded-xl" @submit.prevent="throttledSubmit">
    <!-- Form-level error -->
    <p v-if="errors.form" role="alert" class="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
      {{ errors.form }}
    </p>

    <!-- Name -->
    <div class="relative">
      <input
        :id="nameId"
        v-model="name"
        placeholder=""
        type="text"
        autocomplete="name"
        class="peer float-input"
        :class="{ 'float-error': errors.name }"
        @blur="validateField('name')"
      />
      <label :for="nameId" class="float-label">Name</label>
      <p v-if="errors.name" role="alert" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
    </div>

    <!-- Email -->
    <div class="relative">
      <input
        :id="emailId"
        v-model="email"
        placeholder=""
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
        placeholder=""
        autocomplete="new-password"
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

    <!-- Confirm Password -->
    <div class="relative">
      <input
        :id="confirmPasswordId"
        v-model="confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        placeholder=""
        autocomplete="new-password"
        class="peer float-input"
        :class="{ 'float-error': errors.confirmPassword }"
        @blur="validateField('confirmPassword')"
      />
      <label :for="confirmPasswordId" class="float-label">Confirm Password</label>
      <button
        type="button"
        :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
        class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
        @click="toggleConfirmPassword"
      >
        {{ showConfirmPassword ? 'Hide' : 'Show' }}
      </button>
      <p v-if="errors.confirmPassword" role="alert" class="mt-1 text-sm text-red-500">
        {{ errors.confirmPassword }}
      </p>
    </div>

    <!-- Terms -->
    <div>
      <label :for="termsId" class="flex items-start gap-2 text-sm text-gray-700">
        <input
          :id="termsId"
          v-model="agreedToTerms"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          @change="validateField('agreedToTerms')"
        />
        <span>
          I agree to the
          <NuxtLink href="/terms" class="text-blue-600 hover:underline"
            >Terms & Conditions</NuxtLink
          >
          and the
          <NuxtLink href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</NuxtLink>
        </span>
      </label>
      <p v-if="errors.agreedToTerms" role="alert" class="mt-1 text-sm text-red-500">
        {{ errors.agreedToTerms }}
      </p>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ isLoading ? 'Submitting...' : 'Create Account' }}
    </button>
  </form>
</template>
