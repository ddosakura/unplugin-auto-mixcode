<template>
  <main>
    <header>
      <h1>Hello World!</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <span>|</span>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>

    <RouterView />
  </main>
</template>
