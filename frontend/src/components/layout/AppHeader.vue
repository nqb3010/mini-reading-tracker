<script setup>
import { RouterLink } from 'vue-router'

defineProps({ shelfCount: { type: Number, default: null } })
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__left">
        <RouterLink to="/" class="brand" aria-label="Mini Reading Tracker — về trang tìm kiếm">
          <span class="brand__logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </span>
          <span class="brand__wordmark">Reading Tracker</span>
        </RouterLink>
        <nav class="nav" aria-label="Điều hướng chính">
          <RouterLink to="/" class="nav__link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Tìm sách</span>
          </RouterLink>
          <RouterLink to="/shelf" class="nav__link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
            <span>Tủ sách của tôi</span>
            <span v-if="shelfCount !== null" class="nav__count tabular">
              {{ shelfCount }}<span class="sr-only"> cuốn</span>
            </span>
          </RouterLink>
        </nav>
      </div>
      <div class="header__meta">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        <span>Một người dùng · Dữ liệu sách: Open Library</span>
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
  min-width: 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  border-radius: var(--radius-md);
}
.brand__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--white);
  color: var(--buyer-header);
}
.brand__wordmark {
  font-family: var(--font-brand);
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
  border-radius: var(--radius-md);
  color: var(--gray-400);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--dur-fast),
    background var(--dur-fast);
}
.nav__link:hover {
  color: var(--white);
  background: rgba(255, 255, 255, 0.08);
}
.nav__link.router-link-active,
.nav__link[aria-current='page'] {
  color: var(--white);
  background: transparent;
  border-bottom-color: var(--buyer-active);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
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
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--gray-400);
  white-space: nowrap;
}

@media (max-width: 960px) {
  .header__meta {
    display: none;
  }
}
@media (max-width: 640px) {
  .header__inner {
    gap: var(--space-3);
    padding: 0 var(--space-4);
  }
  .header__left {
    gap: var(--space-3);
  }
  .brand__wordmark {
    display: none;
  }
}
</style>
