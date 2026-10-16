import { PublicProfile } from "@/pages/PublicProfile";
import { Principal } from "@icp-sdk/core/principal";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ALICE,
  type MockActor,
  installActor,
  makeProfile,
  makePublicProfile,
  makeReview,
  principal,
  renderRoute,
  resetAuth,
} from "./test-utils";

/**
 * `PublicProfile` parses the route param with `Principal.fromText`, so the URL
 * must carry a genuinely valid principal text. Derive one from the SDK rather
 * than hardcoding a string that may not round-trip.
 */
const BOB_PRINCIPAL = Principal.fromUint8Array(
  new Uint8Array([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
).toText();
const BOB = BOB_PRINCIPAL;

function renderPublicProfile(principalText: string) {
  return renderRoute("/profile/$principal", () => <PublicProfile />, {
    initialEntries: [`/profile/${principalText}`],
  });
}

/**
 * Read the value shown in the stat tile whose label matches `label`. The label
 * is a `<p>` inside the tile; the same text can also appear as a section
 * heading, so restrict the match to the paragraph element.
 */
function statValue(label: string): string {
  const labelNode = screen
    .getAllByText(label)
    .find((node) => node.tagName === "P");
  const valueNode = labelNode?.parentElement?.querySelector("p:last-child");
  return valueNode?.textContent?.trim() ?? "";
}

describe("PublicProfile", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
  });

  it("shows the display name, bio, service area, skills, and stats", async () => {
    actor.getPublicProfile.mockResolvedValue(
      makePublicProfile({
        profile: makeProfile({
          id: principal(BOB),
          displayName: "สมชาย ใจดี",
          bio: "ช่างทำความสะอาดมืออาชีพ",
          serviceArea: "กรุงเทพฯ",
          skills: ["ทำความสะอาด", "ย้ายบ้าน"],
        }),
        stats: { completedJobs: 12n, averageRating: 4.8, reviewCount: 9n },
      }),
    );
    actor.listReviewsForUser.mockResolvedValue([]);

    renderPublicProfile(BOB);

    expect(
      await screen.findByRole("heading", { name: "สมชาย ใจดี" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ช่างทำความสะอาดมืออาชีพ")).toBeInTheDocument();
    expect(screen.getByText("กรุงเทพฯ")).toBeInTheDocument();
    expect(screen.getByText("ทำความสะอาด")).toBeInTheDocument();
    expect(screen.getByText("ย้ายบ้าน")).toBeInTheDocument();
    // Stat tiles: assert the value rendered next to each label, since the
    // average rating also appears inside the StarRating summary.
    expect(statValue("คะแนนเฉลี่ย")).toBe("4.8");
    expect(statValue("งานที่สำเร็จ")).toBe("12");
    expect(statValue("รีวิวที่ได้รับ")).toBe("9");
  });

  it("lists the reviews the user has received", async () => {
    actor.getPublicProfile.mockResolvedValue(
      makePublicProfile({ profile: makeProfile({ id: principal(BOB) }) }),
    );
    actor.listReviewsForUser.mockResolvedValue([
      makeReview({
        id: 1n,
        subject: principal(BOB),
        author: principal(ALICE),
        comment: "ทำงานดีมาก",
        rating: 5n,
      }),
    ]);

    renderPublicProfile(BOB);

    expect(await screen.findByText("ทำงานดีมาก")).toBeInTheDocument();
  });

  it("shows the empty review state when there are no reviews", async () => {
    actor.getPublicProfile.mockResolvedValue(
      makePublicProfile({ profile: makeProfile({ id: principal(BOB) }) }),
    );
    actor.listReviewsForUser.mockResolvedValue([]);

    renderPublicProfile(BOB);

    expect(await screen.findByText("ยังไม่มีรีวิว")).toBeInTheDocument();
  });

  it("shows a not-found state for an invalid principal", async () => {
    renderPublicProfile("not-a-principal");

    expect(
      await screen.findByRole("heading", { name: "ไม่พบผู้ใช้รายนี้" }),
    ).toBeInTheDocument();
  });
});
