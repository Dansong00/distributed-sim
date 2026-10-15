import { startEditor } from "./start-editor";
import { expect, test } from "@playwright/test";
test("renders the notes starter with members, links, boundary, and assumptions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await startEditor(page);
  await expect(page.locator(".document-title")).toHaveText("Note-Taking App");
  await expect(page.locator(".component-card")).toHaveCount(3);
  await expect(
    page.locator(".component-card").filter({ hasText: "Notes API" }),
  ).toBeVisible();
  await expect(
    page.locator(".component-card").filter({ hasText: "PostgreSQL" }),
  ).toBeVisible();
  await expect(page.locator(".container-node")).toHaveText("Application");
  await expect(page.locator(".sticky-node")).toContainText("single-region");
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(2);
  await expect(
    page
      .locator(".react-flow__edge-text")
      .filter({ hasText: "HTTPS requests" }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/canvas-task1.png", fullPage: true });
  expect(errors).toEqual([]);
});
