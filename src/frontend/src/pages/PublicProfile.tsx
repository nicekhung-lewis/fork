import { ReviewList } from "@/components/ReviewList";
import { StarRating } from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { usePublicProfile } from "@/hooks/use-jobs";
import { useReviewsForUser } from "@/hooks/use-marketplace";
import { formatRating, shortPrincipal } from "@/lib/format";
import { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
  Star,
  UserX,
} from "lucide-react";
import { useMemo } from "react";

/** Public profile of any user: reputation stats and reviews received. */
export function PublicProfile() {
  const { principal } = useParams({ from: "/profile/$principal" });

  const user = useMemo(() => {
    try {
      return Principal.fromText(principal);
    } catch {
      return null;
    }
  }, [principal]);

  const { data, isLoading, isError } = usePublicProfile(user);
  const { data: reviews } = useReviewsForUser(user);
  const avatarUrl = useBlobUrl(data?.profile.avatar);

  if (!user) {
    return (
      <NotFound
        title="ไม่พบผู้ใช้รายนี้"
        description="ลิงก์โปรไฟล์อาจไม่ถูกต้องหรือผู้ใช้ถูกลบไปแล้ว"
      />
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="public_profile.loading_state"
        className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <NotFound
        title="โหลดโปรไฟล์ไม่สำเร็จ"
        description="เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองรีเฟรชหน้า"
      />
    );
  }

  if (!data) {
    return (
      <NotFound title="ไม่พบโปรไฟล์นี้" description="ผู้ใช้รายนี้อาจยังไม่ได้สร้างโปรไฟล์" />
    );
  }

  const { profile, stats } = data;
  const displayName = profile.displayName.trim() || shortPrincipal(principal);

  return (
    <div
      data-ocid="public_profile.page"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Button
        asChild
        variant="ghost"
        data-ocid="public_profile.back_button"
        className="mb-4 -ml-2 rounded-full"
      >
        <Link to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          กลับหน้าหลัก
        </Link>
      </Button>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 border border-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 font-display text-2xl font-bold text-primary">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              {displayName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <StarRating
                value={stats.averageRating}
                count={Number(stats.reviewCount)}
                size="md"
              />
              {profile.serviceArea.trim() && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {profile.serviceArea}
                </span>
              )}
            </div>
            {profile.bio.trim() && (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile
            icon={<Star className="h-4 w-4" aria-hidden="true" />}
            label="คะแนนเฉลี่ย"
            value={formatRating(stats.averageRating)}
          />
          <StatTile
            icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            label="งานที่สำเร็จ"
            value={stats.completedJobs.toString()}
          />
          <StatTile
            icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
            label="รีวิวที่ได้รับ"
            value={stats.reviewCount.toString()}
          />
        </div>

        {profile.skills.length > 0 && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-foreground">ทักษะ</h2>
            <ul
              data-ocid="public_profile.skill_list"
              className="flex flex-wrap gap-2"
            >
              {profile.skills.map((skill, index) => (
                <li
                  key={skill}
                  data-ocid={`public_profile.skill.${index + 1}`}
                  className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-foreground">
          รีวิวที่ได้รับ
        </h2>
        <ReviewList reviews={reviews ?? []} />
      </section>
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
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
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

function NotFound({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      data-ocid="public_profile.not_found_state"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <UserX className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-bold text-foreground">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild className="rounded-full">
        <Link to="/" data-ocid="public_profile.home_button">
          กลับหน้าหลัก
        </Link>
      </Button>
    </div>
  );
}
