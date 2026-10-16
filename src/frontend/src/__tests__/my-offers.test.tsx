import { MyOffers } from "@/pages/MyOffers";
import { OfferStatus } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ALICE,
  type MockActor,
  installActor,
  makeOffer,
  principal,
  renderRoute,
  resetAuth,
  signIn,
} from "./test-utils";

function renderMyOffers() {
  return renderRoute("/my-offers", () => <MyOffers />, {
    initialEntries: ["/my-offers"],
  });
}

describe("MyOffers", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
  });

  it("asks a signed-out visitor to sign in", async () => {
    renderMyOffers();

    expect(
      await screen.findByRole("heading", { name: "เข้าสู่ระบบเพื่อดูข้อเสนอของฉัน" }),
    ).toBeInTheDocument();
  });

  it("lists the caller's pending offers with price and duration", async () => {
    signIn(ALICE);
    actor.listMyOffers.mockResolvedValue([
      makeOffer({
        id: 1n,
        jobId: 7n,
        worker: principal(ALICE),
        status: OfferStatus.pending,
        price: 1200n,
        durationDays: 3n,
      }),
    ]);

    renderMyOffers();

    const list = await screen.findByRole("list");
    expect(
      within(list).getByRole("link", { name: "ดูรายละเอียดงาน #7" }),
    ).toBeInTheDocument();
    expect(within(list).getByText("฿1,200")).toBeInTheDocument();
    expect(within(list).getByText("3 วัน")).toBeInTheDocument();
    expect(within(list).getByText("รอพิจารณา")).toBeInTheDocument();
  });

  it("shows the empty state with a browse action when there are no offers", async () => {
    signIn(ALICE);
    actor.listMyOffers.mockResolvedValue([]);

    renderMyOffers();

    expect(await screen.findByText("ยังไม่มีข้อเสนอในสถานะนี้")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ค้นหางาน" })).toBeInTheDocument();
  });

  it("switches to the rejected tab and loads that status", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.listMyOffers.mockResolvedValue([]);

    renderMyOffers();

    await user.click(await screen.findByRole("tab", { name: "ไม่ได้รับเลือก" }));

    await waitFor(() => {
      expect(actor.listMyOffers).toHaveBeenCalledWith(OfferStatus.rejected);
    });
  });
});
