import { JobChat } from "@/pages/JobChat";
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
  makeMessage,
  makeOffer,
  makePublicProfile,
  principal,
  renderRoute,
  resetAuth,
  signIn,
} from "./test-utils";

function renderJobChat(jobId = "1") {
  return renderRoute("/jobs/$id/chat", () => <JobChat />, {
    initialEntries: [`/jobs/${jobId}/chat`],
  });
}

describe("JobChat", () => {
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

  it("shows the thread to the job owner and sends a message", async () => {
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
    actor.listMessages.mockResolvedValue([
      makeMessage({ id: 1n, body: "สวัสดีครับ", sender: principal(BOB) }),
    ]);
    actor.sendMessage.mockResolvedValue(2n);

    renderJobChat();

    expect(await screen.findByText("สวัสดีครับ")).toBeInTheDocument();

    await user.type(screen.getByLabelText("ข้อความ"), "ยินดีที่ได้ร่วมงาน");
    await user.click(screen.getByRole("button", { name: "ส่ง" }));

    await waitFor(() => {
      expect(actor.sendMessage).toHaveBeenCalledWith(1n, "ยินดีที่ได้ร่วมงาน");
    });
  });

  it("shows the thread to the accepted worker", async () => {
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
    actor.listMessages.mockResolvedValue([]);

    renderJobChat();

    expect(await screen.findByText("ยังไม่มีข้อความ")).toBeInTheDocument();
  });

  it("denies a signed-in non-participant access to the thread", async () => {
    signIn(BOB);
    actor.getJobDetail.mockResolvedValue(
      makeJob({
        id: 1n,
        owner: principal(ALICE),
        status: JobStatus.inProgress,
        acceptedOfferId: 10n,
      }),
    );
    actor.listMyOffers.mockResolvedValue([]);

    renderJobChat();

    expect(
      await screen.findByRole("heading", { name: "คุณไม่มีสิทธิ์เข้าดูแชทนี้" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("ข้อความ")).not.toBeInTheDocument();
  });

  it("shows a not-found state when the job does not exist", async () => {
    signIn(ALICE);
    actor.getJobDetail.mockResolvedValue(null);

    renderJobChat("999");

    expect(
      await screen.findByRole("heading", { name: "ไม่พบงานนี้" }),
    ).toBeInTheDocument();
  });
});
