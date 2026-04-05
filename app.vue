<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: #0f0e17;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

html { scroll-behavior: smooth; }
* { -webkit-tap-highlight-color: transparent; }
button, a { touch-action: manipulation; }

/* Safe area for notched phones */
.pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
</style>
