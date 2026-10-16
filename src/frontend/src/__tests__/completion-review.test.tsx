import { JobDetail } from "@/pages/JobDetail";
import { JobStatus, OfferStatus } from "@/types";
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

describe("Job completion and review", () => {
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

  it("lets the owner confirm completion of an in-progress job", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        owner: principal(ALICE),
        status: JobStatus.inProgress,
        acceptedOfferId: 10n,
      }),
    );
    actor.listOffersForJob.mockResolvedValue([
      makeOffer({
        id: 10n,
        jobId: 1n,
        worker: principal(BOB),
        status: OfferStatus.accepted,
      }),
    ]);
    actor.confirmCompletion.mockResolvedValue(
      makeOffer({ id: 10n, status: OfferStatus.accepted }),
    );

    renderJobDetail();

    await user.click(
      await screen.findByRole("button", { name: "ยืนยันว่างานเสร็จ" }),
    );

    await waitFor(() => {
      expect(actor.confirmCompletion).toHaveBeenCalledWith(1n);
    });
  });

  it("lets the owner leave a 1–5 star review with a comment once completed", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        owner: principal(ALICE),
        status: JobStatus.completed,
        acceptedOfferId: 10n,
        clientCompleted: true,
        workerCompleted: true,
      }),
    );
    actor.listOffersForJob.mockResolvedValue([
      makeOffer({
        id: 10n,
        jobId: 1n,
        worker: principal(BOB),
        status: OfferStatus.accepted,
      }),
    ]);
    actor.listReviewsForUser.mockResolvedValue([]);
    actor.leaveReview.mockResolvedValue(1n);

    renderJobDetail();

    await user.click(await screen.findByRole("button", { name: "ให้ 5 ดาว" }));
    await user.type(screen.getByLabelText("ความคิดเห็น"), "ทำงานดีมาก ตรงเวลา");
    await user.click(screen.getByRole("button", { name: "ส่งรีวิว" }));

    await waitFor(() => {
      expect(actor.leaveReview).toHaveBeenCalledWith(1n, {
        rating: 5n,
        comment: "ทำงานดีมาก ตรงเวลา",
      });
    });
  });

  it("blocks a review submission until a star rating is chosen", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        owner: principal(ALICE),
        status: JobStatus.completed,
        acceptedOfferId: 10n,
        clientCompleted: true,
        workerCompleted: true,
      }),
    );
    actor.listOffersForJob.mockResolvedValue([
      makeOffer({
        id: 10n,
        jobId: 1n,
        worker: principal(BOB),
        status: OfferStatus.accepted,
      }),
    ]);
    actor.listReviewsForUser.mockResolvedValue([]);

    renderJobDetail();

    await user.click(await screen.findByRole("button", { name: "ส่งรีวิว" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "กรุณาเลือกคะแนน 1–5 ดาว",
    );
    expect(actor.leaveReview).not.toHaveBeenCalled();
  });

  it("shows the already-reviewed state instead of the form", async () => {
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        owner: principal(ALICE),
        status: JobStatus.completed,
        acceptedOfferId: 10n,
        clientCompleted: true,
        workerCompleted: true,
      }),
    );
    actor.listOffersForJob.mockResolvedValue([
      makeOffer({
        id: 10n,
        jobId: 1n,
        worker: principal(BOB),
        status: OfferStatus.accepted,
      }),
    ]);
    actor.listReviewsForUser.mockResolvedValue([
      {
        id: 1n,
        subject: principal(BOB),
        createdAt: 1_700_000_000_000_000_000n,
        jobId: 1n,
        author: principal(ALICE),
        comment: "ดีมาก",
        rating: 5n,
      },
    ]);

    renderJobDetail();

    expect(
      await screen.findByText("คุณได้รีวิวงานนี้แล้ว ขอบคุณที่ช่วยให้ชุมชนน่าเชื่อถือ"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "ส่งรีวิว" }),
    ).not.toBeInTheDocument();
  });
});
