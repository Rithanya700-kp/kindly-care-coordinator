import { describe, expect, it } from "vitest";
import { isSlotTaken, nextToken, type Appointment } from "@/lib/booking";

const base: Appointment = {
  id: "A1", token: "GM-001", patientName: "X", age: 30, gender: "Male", mobile: "9876543210",
  deptId: "gm", doctorId: "gm-1", date: "2026-11-10", time: "09:00", reason: "x",
  status: "Waiting", createdAt: 0,
};

describe("booking rules", () => {
  it("blocks a duplicate slot for the same doctor, date and time", () => {
    expect(isSlotTaken([base], "gm-1", "2026-11-10", "09:00")).toBe(true);
  });
  it("allows the same slot with a different doctor", () => {
    expect(isSlotTaken([base], "gm-2", "2026-11-10", "09:00")).toBe(false);
  });
  it("frees a slot once the appointment is cancelled", () => {
    expect(isSlotTaken([{ ...base, status: "Cancelled" }], "gm-1", "2026-11-10", "09:00")).toBe(false);
  });
  it("issues sequential queue tokens per doctor per day", () => {
    expect(nextToken([base], "gm-1", "2026-11-10", "GM")).toBe("GM-002");
    expect(nextToken([base], "gm-1", "2026-11-11", "GM")).toBe("GM-001");
  });
});
