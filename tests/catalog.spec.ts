import { expect, test } from "@playwright/test";
import { startEditor } from "./start-editor";

test("capability search adds specialized storage and AI components with descriptions", async ({ page }) => {
  await startEditor(page);
  const search = page.getByLabel("Search components");
  for (const [query, label, description] of [
    ["vector", "Qdrant", "embedding vectors"],
    ["geospatial", "PostGIS", "geographic coordinates"],
    ["lakehouse", "Apache Iceberg", "table format"],
    ["model registry", "MLflow", "model versions"],
  ]) {
    await search.fill(query);
    await page.getByRole("button", { name: `Add ${label}`, exact: true }).click();
    await expect(page.locator(".react-flow__node.selected")).toContainText(label);
    await expect(page.locator(".inspector")).toContainText(description);
  }
  await search.fill("AI");
  await expect(page.getByRole("button", { name: "Add Generic Embedding Service", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await page.reload();
  await page.getByRole("button", { name: "Open Note-Taking App", exact: true }).click();
  await expect(page.locator(".component-card").filter({ hasText: "MLflow" })).toHaveCount(1);
});
