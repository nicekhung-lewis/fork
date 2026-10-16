import { Home } from "@/pages/Home";
import { Category, JobSort, JobStatus } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  type MockActor,
  installActor,
  makeJob,
  renderRoute,
  resetAuth,
} from "./test-utils";

function renderHome(initialEntries: string[] = ["/"]) {
  return renderRoute("/", () => <Home />, { initialEntries });
}

describe("Home job feed", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
  });

  it("renders the feed heading and job cards from the backend", async () => {
    actor.searchJobs.mockResolvedValue({
      jobs: [
        makeJob({ id: 1n, title: "ทำความสะอาดคอนโด" }),
        makeJob({ id: 2n, title: "ย้ายบ้าน", category: Category.moving }),
      ],
      total: 2n,
    });

    renderHome();

    expect(
      await screen.findByRole("heading", { name: "ตลาดงาน" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("ทำความสะอาดคอนโด")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ย้ายบ้าน" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows the empty state when no jobs match", async () => {
    actor.searchJobs.mockResolvedValue({ jobs: [], total: 0n });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("ไม่พบงานที่ตรงกับเงื่อนไข")).toBeInTheDocument();
    });
  });

  it("passes the keyword from the URL to the backend filter", async () => {
    actor.searchJobs.mockResolvedValue({ jobs: [], total: 0n });

    renderHome(["/?keyword=ทำความสะอาด"]);

    await waitFor(() => {
      expect(actor.searchJobs).toHaveBeenCalled();
    });
    const filter = actor.searchJobs.mock.calls.at(-1)?.[0];
    expect(filter?.keyword).toBe("ทำความสะอาด");
  });

  it("passes category, location, and sort from the URL to the backend filter", async () => {
    actor.searchJobs.mockResolvedValue({ jobs: [], total: 0n });

    renderHome(["/?category=cleaning&location=กรุงเทพฯ&sort=highestBudget"]);

    await waitFor(() => {
      expect(actor.searchJobs).toHaveBeenCalled();
    });
    const filter = actor.searchJobs.mock.calls.at(-1)?.[0];
    expect(filter?.category).toBe(Category.cleaning);
    expect(filter?.location).toBe("กรุงเทพฯ");
    expect(filter?.sort).toBe(JobSort.highestBudget);
  });

  it("ignores an unknown category in the URL instead of forwarding it", async () => {
    actor.searchJobs.mockResolvedValue({ jobs: [], total: 0n });

    renderHome(["/?category=not-a-category"]);

    await waitFor(() => {
      expect(actor.searchJobs).toHaveBeenCalled();
    });
    const filter = actor.searchJobs.mock.calls.at(-1)?.[0];
    expect(filter?.category).toBeUndefined();
  });

  it("updates the URL when the keyword is submitted", async () => {
    const user = userEvent.setup();
    actor.searchJobs.mockResolvedValue({ jobs: [], total: 0n });

    const { router } = renderHome();

    const input = await screen.findByLabelText("ค้นหางาน");
    await user.type(input, "ย้ายบ้าน");
    await user.click(screen.getByRole("button", { name: "ค้นหา" }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ keyword: "ย้ายบ้าน" });
    });
  });

  it("clears filters from the empty state", async () => {
    const user = userEvent.setup();
    actor.searchJobs.mockResolvedValue({ jobs: [], total: 0n });

    const { router } = renderHome(["/?keyword=ไม่มีอยู่จริง"]);

    await waitFor(() => {
      expect(screen.getByText("ไม่พบงานที่ตรงกับเงื่อนไข")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));

    await waitFor(() => {
      expect(router.state.location.search).toEqual({});
    });
  });

  it("shows an error state with a retry action when the search fails", async () => {
    actor.searchJobs.mockRejectedValue(new Error("boom"));

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("โหลดรายการงานไม่สำเร็จ")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "ลองใหม่" })).toBeInTheDocument();
  });

  it("renders a job's status badge and budget on its card", async () => {
    actor.searchJobs.mockResolvedValue({
      jobs: [
        makeJob({
          id: 7n,
          title: "งานทดสอบ",
          status: JobStatus.open,
          budget: { min: 500n, max: 1500n },
        }),
      ],
      total: 1n,
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("งานทดสอบ")).toBeInTheDocument();
    });
    expect(screen.getByText("เปิดรับข้อเสนอ")).toBeInTheDocument();
    expect(screen.getByText("฿500 - ฿1,500")).toBeInTheDocument();
  });
});
