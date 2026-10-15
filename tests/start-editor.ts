import { expect, type Page } from "@playwright/test";
export async function startEditor(page: Page) {
  await page.goto("/");
  await page.getByLabel("Starter").selectOption("notes");
  await page
    .getByLabel("Diagram name", { exact: true })
    .fill("Note-Taking App");
  await page
    .getByRole("button", { name: "Create diagram", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Saved locally");
}
