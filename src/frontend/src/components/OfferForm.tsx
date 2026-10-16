import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useSubmitOffer } from "@/hooks/use-jobs";
import { formatBaht } from "@/lib/format";
import type { Job, Offer } from "@/types";
import { LogIn, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OfferFormProps {
  job: Job;
  /** The caller's principal, or null when signed out. */
  viewer: string | null;
  /** Existing offers for this job, used to block duplicates. */
  offers: Offer[];
}

/**
 * Offer submission for a signed-in non-owner. Blocks the job owner, blocks a
 * second offer from the same worker, and prompts sign-in when signed out.
 */
export function OfferForm({ job, viewer, offers }: OfferFormProps) {
  const { isAuthenticated, login } = useAuth();
  const submitOffer = useSubmitOffer(job.id);

  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [durationDays, setDurationDays] = useState("");

  const isOwner = viewer !== null && job.owner.toText() === viewer;
  const alreadyOffered =
    viewer !== null && offers.some((offer) => offer.worker.toText() === viewer);

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="offer_form.sign_in_prompt"
        className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-secondary/50 p-5"
      >
        <p className="text-sm text-muted-foreground">
          เข้าสู่ระบบเพื่อส่งข้อเสนอสำหรับงานนี้
        </p>
        <Button
          type="button"
          data-ocid="offer_form.sign_in_button"
          onClick={() => login()}
          className="rounded-full"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          เข้าสู่ระบบ
        </Button>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div
        data-ocid="offer_form.owner_notice"
        className="rounded-xl border border-border bg-secondary/50 p-5 text-sm text-muted-foreground"
      >
        นี่คือโพสต์งานของคุณ คุณไม่สามารถส่งข้อเสนอให้งานของตัวเองได้
      </div>
    );
  }

  if (alreadyOffered) {
    return (
      <div
        data-ocid="offer_form.duplicate_notice"
        className="rounded-xl border border-success/25 bg-success/10 p-5 text-sm font-medium text-success"
      >
        คุณส่งข้อเสนอสำหรับงานนี้แล้ว รอเจ้าของงานพิจารณาอยู่
      </div>
    );
  }

  const priceValue = Number(price);
  const durationValue = Number(durationDays);
  const isValid =
    Number.isFinite(priceValue) &&
    priceValue > 0 &&
    Number.isFinite(durationValue) &&
    durationValue > 0 &&
    message.trim().length > 0;

  return (
    <form
      data-ocid="offer_form.panel"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-subtle"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isValid) return;

        const draft = {
          price: BigInt(Math.round(priceValue)),
          message: message.trim(),
          durationDays: BigInt(Math.round(durationValue)),
        };

        // Clear the draft synchronously; restore on error unless retyped.
        setPrice("");
        setMessage("");
        setDurationDays("");

        submitOffer.mutate(draft, {
          onSuccess: () => {
            toast.success("ส่งข้อเสนอแล้ว", {
              description: `เสนอราคา ${formatBaht(draft.price)} · ${draft.durationDays.toString()} วัน`,
            });
          },
          onError: () => {
            setPrice((current) => (current === "" ? price : current));
            setMessage((current) => (current === "" ? message : current));
            setDurationDays((current) =>
              current === "" ? durationDays : current,
            );
            toast.error("ส่งข้อเสนอไม่สำเร็จ", {
              description: "กรุณาลองใหม่อีกครั้ง",
            });
          },
        });
      }}
    >
      <h2 className="font-display text-base font-bold text-foreground">
        ส่งข้อเสนอของคุณ
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="offer-price">ราคาที่เสนอ (บาท)</Label>
          <Input
            id="offer-price"
            type="number"
            min={1}
            inputMode="numeric"
            required
            data-ocid="offer_form.price_input"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="เช่น 1500"
            className="nums-tabular"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="offer-duration">ระยะเวลาทำเสร็จ (วัน)</Label>
          <Input
            id="offer-duration"
            type="number"
            min={1}
            inputMode="numeric"
            required
            data-ocid="offer_form.duration_input"
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            placeholder="เช่น 3"
            className="nums-tabular"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offer-message">ข้อความแนะนำตัว</Label>
        <Textarea
          id="offer-message"
          required
          rows={4}
          data-ocid="offer_form.message_textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="แนะนำตัวสั้น ๆ ประสบการณ์ที่เกี่ยวข้อง และสิ่งที่คุณจะทำให้"
        />
      </div>

      <Button
        type="submit"
        disabled={!isValid || submitOffer.isPending}
        data-ocid="offer_form.submit_button"
        className="self-start rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {submitOffer.isPending ? "กำลังส่ง…" : "ส่งข้อเสนอ"}
      </Button>
    </form>
  );
}
