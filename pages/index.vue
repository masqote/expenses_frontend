<script setup lang="ts">
const token = import.meta.client ? localStorage.getItem('token') : null
await navigateTo(token ? '/dashboard' : '/login')
</script>
