import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page with hero section', async ({ page }) => {
    // Check hero heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Tu proximo hogar empieza aca');
  });

  test('should display featured properties section', async ({ page }) => {
    // Wait for featured properties to load
    const featuredSection = page.locator('text=destacadas');
    await expect(featuredSection).toBeVisible();

    // Check that property cards are present (article tags with images)
    const cards = page.locator('article').filter({ has: page.locator('img') });
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display new listings section', async ({ page }) => {
    const newListingsSection = page.locator('text=Nuevos ingresos');
    await expect(newListingsSection).toBeVisible();

    // Check for "Nuevo" badge
    const nuevoBadge = page.locator('text=Nuevo');
    await expect(nuevoBadge.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display neighborhood grid', async ({ page }) => {
    const neighborhoodSection = page.locator('text=San Justo').first();
    await expect(neighborhoodSection).toBeVisible({ timeout: 5000 });
  });

  test('should have working search bar with operation toggle', async ({ page }) => {
    // Check for "Comprar" and "Alquilar" buttons
    const comprarBtn = page.locator('text=Comprar').first();
    const alquilarBtn = page.locator('text=Alquilar').first();

    await expect(comprarBtn).toBeVisible();
    await expect(alquilarBtn).toBeVisible();
  });

  test('should have functioning locality search', async ({ page }) => {
    // Find the search input for zones
    const zoneInput = page.locator('input[placeholder*="Donde queres"]').first();
    await expect(zoneInput).toBeVisible();

    // Type in the input
    await zoneInput.fill('San Justo');

    // Check that dropdown appears with suggestions
    const suggestion = page.locator('text=San Justo');
    await expect(suggestion.nth(1)).toBeVisible({ timeout: 3000 });
  });

  test('should navigate to sales page when clicking "Ver todas las propiedades"', async ({ page }) => {
    const ctaButton = page.locator('a:has-text("Ver todas las propiedades")').first();
    await expect(ctaButton).toBeVisible({ timeout: 5000 });

    await ctaButton.click();
    await page.waitForURL('/ventas');

    expect(page.url()).toContain('/ventas');
  });

  test('should have team section with team members', async ({ page }) => {
    const teamSection = page.locator('text=Franco Russo').first();
    await expect(teamSection).toBeVisible({ timeout: 5000 });
  });

  test('should have contact buttons visible on home', async ({ page }) => {
    // Scroll to see property cards
    const firstCard = page.locator('article').filter({ has: page.locator('img') }).first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });

    // Look for WhatsApp button (Consultar)
    const whatsappBtn = page.locator('button:has-text("Consultar")').first();
    await expect(whatsappBtn).toBeVisible();
  });
});
