import { MyJobs } from "@/pages/MyJobs";
import { JobStatus } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ALICE,
  type MockActor,
  installActor,
  makeJob,
  principal,
  renderRoute,
  resetAuth,
  signIn,
} from "./test-utils";

function renderMyJobs() {
  return renderRoute("/my-jobs", () => <MyJobs />, {
    initialEntries: ["/my-jobs"],
  });
}

describe("MyJobs", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
  });

  it("asks a signed-out visitor to sign in", async () => {
    renderMyJobs();

    expect(
      await screen.findByRole("heading", { name: "เข้าสู่ระบบเพื่อดูงานของฉัน" }),
    ).toBeInTheDocument();
  });

  it("lists the caller's open jobs with status and budget", async () => {
    signIn(ALICE);
    actor.listMyJobs.mockResolvedValue([
      makeJob({
        id: 1n,
        title: "ทำความสะอาดคอนโด",
        owner: principal(ALICE),
        status: JobStatus.open,
        budget: { min: 500n, max: 1500n },
      }),
    ]);

    renderMyJobs();

    const list = await screen.findByRole("list", { name: "" });
    expect(
      await screen.findByRole("link", { name: "ทำความสะอาดคอนโด" }),
    ).toBeInTheDocument();
    expect(within(list).getByText("เปิดรับข้อเสนอ")).toBeInTheDocument();
    expect(within(list).getByText("฿500 - ฿1,500")).toBeInTheDocument();
  });

  it("closes an open job", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.listMyJobs.mockResolvedValue([
      makeJob({ id: 1n, owner: principal(ALICE), status: JobStatus.open }),
    ]);
    actor.closeJob.mockResolvedValue(
      makeJob({ id: 1n, owner: principal(ALICE), status: JobStatus.closed }),
    );

    renderMyJobs();

    await user.click(await screen.findByRole("button", { name: "ปิดรับ" }));

    await waitFor(() => {
      expect(actor.closeJob).toHaveBeenCalledWith(1n);
    });
  });

  it("deletes a job after confirming the dialog", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.listMyJobs.mockResolvedValue([
      makeJob({ id: 1n, owner: principal(ALICE), status: JobStatus.open }),
    ]);
    actor.deleteJob.mockResolvedValue(undefined);

    renderMyJobs();

    await user.click(await screen.findByRole("button", { name: "ลบ" }));
    await user.click(await screen.findByRole("button", { name: "ลบงาน" }));

    await waitFor(() => {
      expect(actor.deleteJob).toHaveBeenCalledWith(1n);
    });
  });

  it("shows the empty state when the caller has no jobs in a status", async () => {
    signIn(ALICE);
    actor.listMyJobs.mockResolvedValue([]);

    renderMyJobs();

    expect(await screen.findByText("ยังไม่มีงานในสถานะนี้")).toBeInTheDocument();
  });
});
