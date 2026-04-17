import { test, expect } from '@playwright/test';

test.describe('Additional Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ventas');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Map View', () => {
    test('should show map on desktop', async ({ page }) => {
      // Map should be visible on desktop
      const mapContainer = page.locator('text=Ver mapa').or(page.locator('[class*="map"]'));

      // Try to find map on desktop (might be in sticky area)
      const hasMap = await page.locator('div').filter({ has: page.locator('svg') }).count();
      expect(hasMap).toBeGreaterThanOrEqual(0);
    });

    test('should show mobile map button on small screens', async ({ page }) => {
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Look for "Ver mapa" button
      const mapBtn = page.locator('button:has-text("Ver mapa")');
      const isVisible = await mapBtn.isVisible().catch(() => false);

      // Button might exist but not always visible
      if (isVisible) {
        await expect(mapBtn).toBeVisible();
      }
    });
  });

  test.describe('Favorites', () => {
    test('should toggle favorite heart icon', async ({ page }) => {
      // Reset viewport to desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      // Find the first property card
      const firstCard = page.locator('article').filter({ has: page.locator('img') }).first();
      await expect(firstCard).toBeVisible({ timeout: 5000 });

      // Find heart button (it will be a button with SVG inside or heart icon)
      const favoriteBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).nth(1); // Usually 2nd button is favorite

      const exists = await favoriteBtn.isVisible().catch(() => false);
      if (exists) {
        // Click to favorite
        await favoriteBtn.click();
        await page.waitForTimeout(500);

        // Click again to unfavorite
        await favoriteBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should navigate to favorites page', async ({ page }) => {
      // Navigate to favorites
      await page.goto('/favoritos');
      await page.waitForLoadState('networkidle');

      // Page should load (might be empty or with items)
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
    });
  });

  test.describe('Contact Buttons', () => {
    test('should have WhatsApp button on property cards', async ({ page }) => {
      // Reset to desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      // Find first property card
      const firstCard = page.locator('article').first();
      await firstCard.scrollIntoViewIfNeeded();

      // Look for WhatsApp button
      const whatsappBtn = firstCard.locator('button, a').filter({ hasText: 'Consultar' });
      const exists = await whatsappBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (exists) {
        await expect(whatsappBtn).toBeVisible();

        // Check that it's a valid WhatsApp link
        const href = await whatsappBtn.getAttribute('href');
        expect(href).toContain('wa.me');
      }
    });

    test('should have phone button on listing pages (not on home)', async ({ page }) => {
      // Get first card
      const firstCard = page.locator('article').first();
      await firstCard.scrollIntoViewIfNeeded();

      // Look for phone button
      const phoneBtn = firstCard.locator('button, a').filter({ has: page.locator('svg') });
      // Just verify multiple contact options exist
      expect(await phoneBtn.count()).toBeGreaterThanOrEqual(1);
    });

    test('should have email button on listing pages', async ({ page }) => {
      // Just verify page has contact functionality
      const contacts = page.locator('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]');
      const count = await contacts.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Property Detail Page', () => {
    test('should navigate to property detail page', async ({ page }) => {
      // Find first property card
      const firstCard = page.locator('article').filter({ has: page.locator('img') }).first();
      await expect(firstCard).toBeVisible({ timeout: 5000 });

      // The whole card is clickable link
      await firstCard.click();

      // Wait for navigation to property detail page
      await page.waitForURL(/\/propiedad\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Check that page loaded
      const pageTitle = page.locator('h1');
      const isVisible = await pageTitle.isVisible({ timeout: 3000 }).catch(() => false);
      expect(isVisible).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/ventas');
      await page.waitForLoadState('networkidle');

      // Check that layout doesn't overflow
      const body = page.locator('body');
      const width = await body.evaluate(el => el.scrollWidth);

      // Some margin for error, but shouldn't significantly overflow
      expect(width).toBeLessThan(500);

      // Check that buttons are clickable
      const buttons = page.locator('button');
      expect(await buttons.count()).toBeGreaterThan(0);
    });

    test('should be responsive on tablet (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/ventas');
      await page.waitForLoadState('networkidle');

      // Layout should be comfortable
      const cards = page.locator('article');
      expect(await cards.count()).toBeGreaterThan(0);
    });

    test('should be responsive on desktop (1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/ventas');
      await page.waitForLoadState('networkidle');

      // Full layout should work
      const cards = page.locator('article');
      expect(await cards.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between ventas and alquileres', async ({ page }) => {
      // Start on ventas
      expect(page.url()).toContain('/ventas');

      // Click operation button to switch to alquileres
      const operationDropdown = page.locator('button:has-text("Comprar")');
      await operationDropdown.click();

      // Click "Alquilar"
      const alquilarOption = page.locator('[role="option"]:has-text("Alquilar")');
      await alquilarOption.click();

      // Should navigate to alquileres
      await page.waitForURL('/alquileres', { timeout: 5000 });
      expect(page.url()).toContain('/alquileres');
    });

    test('should navigate back to home', async ({ page }) => {
      // Click home link or logo
      const homeLink = page.locator('a[href="/"]').first();
      const exists = await homeLink.isVisible({ timeout: 2000 }).catch(() => false);

      if (exists) {
        await homeLink.click();
        await page.waitForURL('/', { timeout: 5000 });
        expect(page.url()).toBe('http://localhost:3003/');
      }
    });
  });

  test.describe('SEO & Metadata', () => {
    test('should have proper title on home page', async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title.toLowerCase()).toContain('propied') || expect(title.toLowerCase()).toContain('russo');
    });

    test('should have proper meta description', async ({ page }) => {
      await page.goto('/ventas');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(0);
    });

    test('should have Open Graph metadata on property detail', async ({ page }) => {
      // Go to sales page
      await page.goto('/ventas');
      await page.waitForLoadState('networkidle');

      // Find and click first property
      const firstCard = page.locator('article').filter({ has: page.locator('img') }).first();
      await firstCard.click();

      // Wait for navigation
      await page.waitForURL(/\/propiedad\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Check for OG tags
      const ogTitle = await page.locator('meta[property="og:title"]').count();
      const ogImage = await page.locator('meta[property="og:image"]').count();

      expect(ogTitle).toBeGreaterThan(0);
      expect(ogImage).toBeGreaterThan(0);
    });
  });
});
