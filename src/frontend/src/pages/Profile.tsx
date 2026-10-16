import { ProfileForm, RoleToggle } from "@/components/ProfileForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { usePublicProfile } from "@/hooks/use-jobs";
import {
  useMyProfile,
  useSetRole,
  useUpsertProfile,
} from "@/hooks/use-profile";
import { formatRating } from "@/lib/format";
import type { ProfileUpdate, UserRole } from "@/types";
import { UserRole as UserRoleEnum } from "@/types";
import { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  LogIn,
  Star,
} from "lucide-react";
import { toast } from "sonner";

/** The signed-in user's profile editor and role switcher. */
export function Profile() {
  const { isAuthenticated, isInitializing, login, principal } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const upsert = useUpsertProfile();
  const setRole = useSetRole();

  const selfPrincipal = principal ? Principal.fromText(principal) : null;
  const { data: publicProfile } = usePublicProfile(selfPrincipal);
  const stats = publicProfile?.stats;

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="profile.auth_required"
        className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground">
          เข้าสู่ระบบเพื่อจัดการโปรไฟล์
        </h1>
        <p className="text-sm text-muted-foreground">
          ตั้งชื่อที่แสดง คำแนะนำตัว ทักษะ และสลับบทบาทได้ในบัญชีเดียว
        </p>
        <Button
          type="button"
          data-ocid="profile.sign_in_button"
          disabled={isInitializing}
          onClick={() => login()}
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isInitializing ? "กำลังโหลด…" : "เข้าสู่ระบบ"}
        </Button>
      </div>
    );
  }

  function handleSave(update: ProfileUpdate) {
    upsert.mutate(update, {
      onSuccess: () => toast.success("บันทึกโปรไฟล์แล้ว"),
      onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  function handleRole(role: UserRole) {
    setRole.mutate(role, {
      onSuccess: () =>
        toast.success(
          role === UserRoleEnum.client ? "สลับเป็นผู้จ้างงานแล้ว" : "สลับเป็นผู้รับงานแล้ว",
        ),
      onError: () => toast.error("สลับบทบาทไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  return (
    <div
      data-ocid="profile.page"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            โปรไฟล์ของฉัน
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ข้อมูลนี้จะแสดงต่อผู้จ้างงานและผู้รับงานคนอื่น
          </p>
        </div>
        {principal && (
          <Button
            asChild
            variant="outline"
            data-ocid="profile.view_public_button"
            className="rounded-full"
          >
            <Link to="/profile/$principal" params={{ principal }}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              ดูโปรไฟล์สาธารณะ
            </Link>
          </Button>
        )}
      </header>

      {isLoading ? (
        <div data-ocid="profile.loading_state" className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-subtle">
            <h2 className="mb-3 font-display text-base font-bold text-foreground">
              บทบาทที่ใช้งาน
            </h2>
            <RoleToggle
              activeRole={profile?.activeRole ?? UserRoleEnum.client}
              onChange={handleRole}
              isPending={setRole.isPending}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              สลับบทบาทได้ตลอดเวลาโดยไม่ต้องสร้างบัญชีใหม่
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-7">
            <ProfileForm
              profile={profile ?? null}
              onSubmit={handleSave}
              isSubmitting={upsert.isPending}
            />
          </section>

          <section className="rounded-2xl border border-border bg-secondary/40 p-5">
            <h2 className="mb-3 font-display text-base font-bold text-foreground">
              สรุปความน่าเชื่อถือ
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile
                icon={<Star className="h-4 w-4" aria-hidden="true" />}
                label="คะแนนเฉลี่ย"
                value={formatRating(stats?.averageRating ?? 0)}
              />
              <StatTile
                icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                label="งานที่สำเร็จ"
                value={(stats?.completedJobs ?? 0n).toString()}
              />
              <StatTile
                icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
                label="รีวิวที่ได้รับ"
                value={(stats?.reviewCount ?? 0n).toString()}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              สถิติจะอัปเดตอัตโนมัติเมื่อคุณทำงานเสร็จและได้รับรีวิว
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="nums-tabular font-display text-lg font-bold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
