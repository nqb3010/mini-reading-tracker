<script setup>
import { RouterLink } from 'vue-router'

defineProps({ shelfCount: { type: Number, default: null } })
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__left">
        <RouterLink to="/" class="brand" aria-label="Reading Tracker — trang tìm kiếm">
          <span class="brand__wordmark">Reading Tracker</span>
        </RouterLink>
        <nav class="nav" aria-label="Điều hướng chính">
          <RouterLink to="/" class="nav__link">Tìm sách</RouterLink>
          <RouterLink to="/shelf" class="nav__link">
            Tủ sách
            <span v-if="shelfCount !== null" class="nav__count tabular">{{ shelfCount }}</span>
          </RouterLink>
        </nav>
      </div>
      <div class="header__meta">
        <span>Dữ liệu: Open Library</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: var(--header-h);
  background: var(--buyer-header);
}
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  max-width: 1320px;
  height: 100%;
  margin: 0 auto;
  padding: 0 28px;
}
.header__left {
  display: flex;
  align-items: center;
  gap: 28px;
}
.brand {
  text-decoration: none;
  border-radius: var(--radius-md);
}
.brand__wordmark {
  font-size: var(--text-md);
  font-weight: var(--fw-semibold);
  color: var(--white);
  white-space: nowrap;
}
.nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 var(--space-3);
  border-bottom: 3px solid transparent;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  color: var(--gray-400);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--dur-fast), background var(--dur-fast);
}
.nav__link:hover { color: var(--white); background: rgba(255,255,255,0.08); }
.nav__link.router-link-active {
  color: var(--white);
  border-bottom-color: var(--buyer-active);
}
.nav__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  background: var(--buyer-accent);
  color: var(--white);
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
}
.header__meta {
  font-size: var(--text-sm);
  color: var(--gray-400);
  white-space: nowrap;
}
@media (max-width: 960px) { .header__meta { display: none; } }
@media (max-width: 640px) {
  .header__inner { gap: var(--space-3); padding: 0 var(--space-4); }
  .header__left  { gap: var(--space-3); }
}
</style>
