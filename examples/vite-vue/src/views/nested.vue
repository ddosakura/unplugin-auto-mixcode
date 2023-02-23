<template>
  <div>
    <h3>Nested Layout</h3>
    <nav>
      <RouterLink to="/nested">Index</RouterLink>
      <span>|</span>
      <RouterLink to="/nested/page">Page</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
