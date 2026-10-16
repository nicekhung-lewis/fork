import { JobDetail } from "@/pages/JobDetail";
import { Category, JobStatus, OfferStatus } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ALICE,
  BOB,
  type MockActor,
  installActor,
  makeJob,
  makeOffer,
  makePublicProfile,
  principal,
  renderRoute,
  resetAuth,
  signIn,
} from "./test-utils";

function renderJobDetail(jobId = "1") {
  return renderRoute("/jobs/$id", () => <JobDetail />, {
    initialEntries: [`/jobs/${jobId}`],
  });
}

describe("JobDetail", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
    actor.getPublicProfile.mockResolvedValue(
      makePublicProfile({
        profile: { ...makePublicProfile().profile, displayName: "สมชาย" },
      }),
    );
  });

  it("shows the job title, budget, and description to a signed-out visitor", async () => {
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        title: "ทำความสะอาดคอนโด",
        description: "ทำความสะอาด 2 ห้องนอน",
        budget: { min: 500n, max: 1500n },
      }),
    );

    renderJobDetail();

    expect(
      await screen.findByRole("heading", { name: "ทำความสะอาดคอนโด" }),
    ).toBeInTheDocument();
    expect(screen.getByText("฿500 - ฿1,500")).toBeInTheDocument();
    expect(screen.getByText("ทำความสะอาด 2 ห้องนอน")).toBeInTheDocument();
    expect(screen.getByText("เปิดรับข้อเสนอ")).toBeInTheDocument();
  });

  it("asks a signed-out visitor to sign in before offering", async () => {
    actor.getJobDetail.mockResolvedValue(makeJob({ id: 1n }));

    renderJobDetail();

    expect(
      await screen.findByText("เข้าสู่ระบบเพื่อส่งข้อเสนอสำหรับงานนี้"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "ส่งข้อเสนอ" }),
    ).not.toBeInTheDocument();
  });

  it("shows the owner their received offers and lets them accept one", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(
      makeJob({ id: 1n, owner: principal(ALICE), status: JobStatus.open }),
    );
    actor.listOffersForJob.mockResolvedValue([
      makeOffer({ id: 10n, worker: principal(BOB), price: 1200n }),
    ]);
    actor.acceptOffer.mockResolvedValue(
      makeOffer({ id: 10n, status: OfferStatus.accepted }),
    );

    renderJobDetail();

    expect(
      await screen.findByRole("heading", { name: /ข้อเสนอที่ได้รับ/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText("฿1,200")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "เลือกผู้รับงานคนนี้" }));

    await waitFor(() => {
      expect(actor.acceptOffer).toHaveBeenCalledWith(1n, 10n);
    });
  });

  it("lets a signed-in non-owner submit an offer with price, message, and duration", async () => {
    const user = userEvent.setup();
    signIn(BOB);
    actor.getJobDetail.mockResolvedValue(
      makeJob({ id: 1n, owner: principal(ALICE), status: JobStatus.open }),
    );
    actor.listMyOffers.mockResolvedValue([]);
    actor.submitOffer.mockResolvedValue(5n);

    renderJobDetail();

    await user.type(await screen.findByLabelText("ราคาที่เสนอ (บาท)"), "1200");
    await user.type(screen.getByLabelText("ระยะเวลาทำเสร็จ (วัน)"), "3");
    await user.type(screen.getByLabelText("ข้อความแนะนำตัว"), "ผมรับงานนี้ได้");
    await user.click(screen.getByRole("button", { name: "ส่งข้อเสนอ" }));

    await waitFor(() => {
      expect(actor.submitOffer).toHaveBeenCalledWith(1n, {
        price: 1200n,
        message: "ผมรับงานนี้ได้",
        durationDays: 3n,
      });
    });
  });

  it("tells the owner they cannot offer on their own job", async () => {
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(
      makeJob({ id: 1n, owner: principal(ALICE) }),
    );
    actor.listOffersForJob.mockResolvedValue([]);

    renderJobDetail();

    expect(
      await screen.findByText(
        "นี่คือโพสต์งานของคุณ คุณไม่สามารถส่งข้อเสนอให้งานของตัวเองได้",
      ),
    ).toBeInTheDocument();
  });

  it("shows the accepted worker the completion panel and a chat link", async () => {
    signIn(BOB);
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        owner: principal(ALICE),
        status: JobStatus.inProgress,
        acceptedOfferId: 10n,
      }),
    );
    actor.listMyOffers.mockResolvedValue([
      makeOffer({
        id: 10n,
        jobId: 1n,
        worker: principal(BOB),
        status: OfferStatus.accepted,
      }),
    ]);

    renderJobDetail();

    expect(
      await screen.findByRole("heading", { name: "การยืนยันงานเสร็จ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /เปิดแชท/ })).toBeInTheDocument();
  });

  it("shows a not-found state when the job does not exist", async () => {
    actor.getJobDetail.mockResolvedValue(null);

    renderJobDetail("999");

    expect(await screen.findByText("ไม่พบงานนี้")).toBeInTheDocument();
  });
});
