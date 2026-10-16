import { Profile } from "@/pages/Profile";
import { UserRole } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ALICE,
  type MockActor,
  installActor,
  makeProfile,
  makePublicProfile,
  principal,
  renderRoute,
  resetAuth,
  signIn,
} from "./test-utils";

function renderProfile() {
  return renderRoute("/profile", () => <Profile />, {
    initialEntries: ["/profile"],
  });
}

describe("Profile", () => {
  let actor: MockActor;

  beforeEach(() => {
    resetAuth();
    actor = installActor();
    actor.getPublicProfile.mockResolvedValue(
      makePublicProfile({
        stats: { completedJobs: 3n, averageRating: 4.5, reviewCount: 2n },
      }),
    );
  });

  it("asks a signed-out visitor to sign in", async () => {
    renderProfile();

    expect(
      await screen.findByRole("heading", { name: "เข้าสู่ระบบเพื่อจัดการโปรไฟล์" }),
    ).toBeInTheDocument();
  });

  it("saves the display name, bio, service area, and skills", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.getMyProfile.mockResolvedValue(makeProfile({ id: principal(ALICE) }));
    actor.upsertMyProfile.mockResolvedValue(
      makeProfile({ id: principal(ALICE), displayName: "สมชาย ใจดี" }),
    );

    renderProfile();

    const nameInput = await screen.findByLabelText("ชื่อที่แสดง");
    await user.clear(nameInput);
    await user.type(nameInput, "สมชาย ใจดี");
    await user.type(screen.getByLabelText("คำแนะนำตัว"), "ช่างทำความสะอาดมืออาชีพ");
    await user.type(screen.getByLabelText("พื้นที่ให้บริการ"), "กรุงเทพฯ");
    await user.type(screen.getByLabelText("ทักษะ"), "ทำความสะอาด");
    await user.click(screen.getByRole("button", { name: "เพิ่ม" }));

    await user.click(screen.getByRole("button", { name: "บันทึกโปรไฟล์" }));

    await waitFor(() => {
      expect(actor.upsertMyProfile).toHaveBeenCalledWith({
        displayName: "สมชาย ใจดี",
        bio: "ช่างทำความสะอาดมืออาชีพ",
        serviceArea: "กรุงเทพฯ",
        skills: ["ทำความสะอาด"],
      });
    });
  });

  it("switches the active role to worker", async () => {
    const user = userEvent.setup();
    signIn(ALICE);
    actor.getMyProfile.mockResolvedValue(
      makeProfile({ id: principal(ALICE), activeRole: UserRole.client }),
    );
    actor.setMyRole.mockResolvedValue(
      makeProfile({ id: principal(ALICE), activeRole: UserRole.worker }),
    );

    renderProfile();

    await user.click(await screen.findByRole("button", { name: /ผู้รับงาน/ }));

    await waitFor(() => {
      expect(actor.setMyRole).toHaveBeenCalledWith(UserRole.worker);
    });
  });

  it("shows the caller's reputation stats", async () => {
    signIn(ALICE);
    actor.getMyProfile.mockResolvedValue(makeProfile({ id: principal(ALICE) }));

    renderProfile();

    expect(await screen.findByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
