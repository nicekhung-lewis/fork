import { JobNew } from "@/pages/JobNew";
import { Category } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ALICE,
  type MockActor,
  installActor,
  renderRoute,
  resetAuth,
  signIn,
} from "./test-utils";

function renderJobNew() {
  return renderRoute("/jobs/new", () => <JobNew />, {
    initialEntries: ["/jobs/new"],
  });
}

describe("JobNew", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
  });

  it("asks a signed-out visitor to sign in before posting", async () => {
    renderJobNew();

    expect(
      await screen.findByRole("heading", { name: "เข้าสู่ระบบเพื่อโพสต์งาน" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "โพสต์งาน" }),
    ).not.toBeInTheDocument();
  });

  it("creates a job with title, budget, and category and navigates to it", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.createJob.mockResolvedValue(42n);

    const { router } = renderJobNew();

    await user.type(
      await screen.findByLabelText("หัวข้องาน"),
      "ทำความสะอาดคอนโด",
    );
    await user.type(
      screen.getByLabelText("รายละเอียดงาน"),
      "ทำความสะอาด 2 ห้องนอน",
    );
    await user.type(screen.getByLabelText("งบประมาณขั้นต่ำ (บาท)"), "500");
    await user.type(screen.getByLabelText("งบประมาณสูงสุด (บาท)"), "1500");
    await user.type(screen.getByLabelText("สถานที่"), "อารีย์ กรุงเทพฯ");

    await user.click(screen.getByRole("button", { name: "โพสต์งาน" }));

    await waitFor(() => {
      expect(actor.createJob).toHaveBeenCalledWith({
        title: "ทำความสะอาดคอนโด",
        description: "ทำความสะอาด 2 ห้องนอน",
        category: Category.cleaning,
        budget: { min: 500n, max: 1500n },
        location: "อารีย์ กรุงเทพฯ",
        images: [],
      });
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/jobs/42");
    });
  });

  it("blocks submission and shows a validation error when the title is empty", async () => {
    const user = userEvent.setup();
    signIn(ALICE);

    renderJobNew();

    await user.type(
      await screen.findByLabelText("รายละเอียดงาน"),
      "ทำความสะอาด 2 ห้องนอน",
    );
    await user.type(screen.getByLabelText("งบประมาณขั้นต่ำ (บาท)"), "500");
    await user.type(screen.getByLabelText("งบประมาณสูงสุด (บาท)"), "1500");
    await user.type(screen.getByLabelText("สถานที่"), "อารีย์ กรุงเทพฯ");

    await user.click(screen.getByRole("button", { name: "โพสต์งาน" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "กรุณากรอกหัวข้องาน",
    );
    expect(actor.createJob).not.toHaveBeenCalled();
  });
});
