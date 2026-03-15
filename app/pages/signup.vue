<script setup lang="ts">
useHead({
  title: 'Signup | My Dorm Review'
})
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 md:grid-cols-2">
    <div class="hidden flex-col justify-between bg-indigo-600 px-16 py-20 text-white md:flex">
      <div>
        <h2 class="text-5xl leading-tight font-bold">
          Join Us and<br />
          Unlock Endless<br />
          Possibilities!
        </h2>

        <p class="mt-6 max-w-md text-indigo-100">
          Welcome to My Dorm Review, where your journey begins. Sign up now to review student
          accommodation and help others choose the best place to live.
        </p>
      </div>

      <!-- <StudentTestimonial /> -->
    </div>

    <div class="flex flex-col justify-center px-8 md:px-16">
      <div class="mx-auto w-full max-w-md">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <h1 class="text-xl font-semibold">
            Sign up to
            <br />
            <span class="text-indigo-600">My Dorm Review</span>
          </h1>

          <p class="text-sm text-gray-500">
            Already a member?
            <br />
            <NuxtLink to="/login" class="font-medium text-indigo-600"> Log in </NuxtLink>
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  </div>
</template>
