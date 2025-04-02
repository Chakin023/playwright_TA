import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { parse } from "csv-parse/sync";

// อ่านไฟล์ CSV และแปลงเป็น JSON
const records = parse(fs.readFileSync(path.join(__dirname, "data.csv")), {
  columns: true, // Use first row as keys (test_case, todo_text)
  skip_empty_lines: true, // Skip empty lines if any in the CSV
});

// วนลูปสร้างเทสจาก CSV
for (const record of records) {
  test(`Test Case: ${record.test_case}`, async ({ page }) => {
    await page.goto("https://demo.playwright.dev/todomvc/#/");

    // ตรวจสอบว่าหน้าเว็บโหลดเสร็จและมี heading "todos"
    await expect(page.getByRole("heading")).toContainText("todos");

    // คลิกที่ช่องป้อนข้อความ
    const inputBox = page.getByRole("textbox", {
      name: "What needs to be done?",
    });
    await inputBox.click();

    // กรอกข้อความจาก CSV
    await inputBox.fill(record.todo_text);
    await inputBox.press("Enter");

    // ตรวจสอบว่าข้อความที่เพิ่มเข้ามาตรงกับที่ใส่จาก CSV
    await expect(page.locator(".todo-list li")).toContainText(record.todo_text);
  });
}
