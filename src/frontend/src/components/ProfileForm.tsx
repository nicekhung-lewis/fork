import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { cn } from "@/lib/utils";
import { type Profile, type ProfileUpdate, UserRole } from "@/types";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

interface ProfileFormProps {
  profile: Profile | null;
  onSubmit: (update: ProfileUpdate) => void;
  isSubmitting: boolean;
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

async function fileToBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Profile editor: display name, avatar, bio, service area and skills.
 * Owns every field locally and reports a `ProfileUpdate` on submit.
 */
export function ProfileForm({
  profile,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [serviceArea, setServiceArea] = useState(profile?.serviceArea ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [avatar, setAvatar] = useState<Uint8Array | undefined>(profile?.avatar);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = useBlobUrl(avatar);

  async function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const bytes = await fileToBytes(file);
    setAvatar(bytes);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addSkill() {
    const value = skillDraft.trim();
    if (!value) return;
    if (skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    setSkills((current) => [...current, value]);
    setSkillDraft("");
  }

  function removeSkill(index: number) {
    setSkills((current) => current.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      setError("กรุณากรอกชื่อที่แสดง");
      return;
    }
    setError(null);
    const update: ProfileUpdate = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      serviceArea: serviceArea.trim(),
      skills,
    };
    if (avatar !== undefined) update.avatar = avatar;
    onSubmit(update);
  }

  return (
    <form
      data-ocid="profile_form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="รูปโปรไฟล์" />}
          <AvatarFallback className="bg-primary/10 font-display text-xl font-bold text-primary">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            data-ocid="profile_form.upload_avatar_button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            เปลี่ยนรูปโปรไฟล์
          </Button>
          <p className="text-xs text-muted-foreground">
            รองรับไฟล์รูปภาพ JPG หรือ PNG
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleAvatar}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">ชื่อที่แสดง</Label>
        <Input
          id="profile-name"
          data-ocid="profile_form.display_name_input"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="เช่น สมชาย ใจดี"
          maxLength={80}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-bio">คำแนะนำตัว</Label>
        <Textarea
          id="profile-bio"
          data-ocid="profile_form.bio_textarea"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="เล่าประสบการณ์และจุดเด่นของคุณให้ผู้จ้างงานรู้จัก"
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-area">พื้นที่ให้บริการ</Label>
        <Input
          id="profile-area"
          data-ocid="profile_form.service_area_input"
          value={serviceArea}
          onChange={(event) => setServiceArea(event.target.value)}
          placeholder="เช่น กรุงเทพฯ และปริมณฑล"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-skill">ทักษะ</Label>
        <div className="flex gap-2">
          <Input
            id="profile-skill"
            data-ocid="profile_form.skill_input"
            value={skillDraft}
            onChange={(event) => setSkillDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
              }
            }}
            placeholder="เช่น ทำความสะอาด, ประกอบเฟอร์นิเจอร์"
          />
          <Button
            type="button"
            variant="outline"
            data-ocid="profile_form.add_skill_button"
            onClick={addSkill}
            className="shrink-0 rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            เพิ่ม
          </Button>
        </div>
        {skills.length > 0 && (
          <ul
            data-ocid="profile_form.skill_list"
            className="mt-1 flex flex-wrap gap-2"
          >
            {skills.map((skill, index) => (
              <li
                key={skill}
                data-ocid={`profile_form.skill.${index + 1}`}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
              >
                {skill}
                <button
                  type="button"
                  data-ocid={`profile_form.remove_skill_button.${index + 1}`}
                  aria-label={`ลบทักษะ ${skill}`}
                  onClick={() => removeSkill(index)}
                  className="rounded-full text-muted-foreground transition-smooth hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p
          data-ocid="profile_form.error_state"
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          data-ocid="profile_form.save_button"
          disabled={isSubmitting}
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          บันทึกโปรไฟล์
        </Button>
      </div>
    </form>
  );
}

interface RoleToggleProps {
  activeRole: UserRole;
  onChange: (role: UserRole) => void;
  isPending: boolean;
}

/** Segmented control switching the account's active role. */
export function RoleToggle({
  activeRole,
  onChange,
  isPending,
}: RoleToggleProps) {
  const roles: { value: UserRole; label: string; hint: string }[] = [
    { value: UserRole.client, label: "ผู้จ้างงาน", hint: "โพสต์งานและจ้างคน" },
    { value: UserRole.worker, label: "ผู้รับงาน", hint: "รับงานและส่งข้อเสนอ" },
  ];

  return (
    <div
      data-ocid="profile.role_toggle"
      className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary/50 p-1.5"
    >
      {roles.map((role) => {
        const active = role.value === activeRole;
        return (
          <button
            key={role.value}
            type="button"
            data-ocid={`profile.role_toggle.${role.value}`}
            aria-pressed={active}
            disabled={isPending}
            onClick={() => onChange(role.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              active
                ? "bg-card text-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="text-sm font-semibold">{role.label}</span>
            <span className="text-xs">{role.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
