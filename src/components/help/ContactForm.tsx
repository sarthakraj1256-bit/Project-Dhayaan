import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle2, Loader2, AlertTriangle, Paperclip, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const SUBJECTS = [
  "General Doubt / Question",
  "Audio Not Playing",
  "Syncing Issue",
  "Offline Access Problem",
  "Meditation Session Issue",
  "Temple Darshan Issue",
  "Healing Frequencies Issue",
  "Games / Cartoons Issue",
  "Billing / Subscription",
  "Feature Request",
  "Other",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

const contactSchema = z.object({
  from_name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  from_email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;
type Status = "idle" | "sending" | "success" | "error";

const inputClasses =
  "bg-muted/50 border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:ring-offset-0 transition-colors";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [sentEmail, setSentEmail] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachError, setAttachError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { from_name: "", from_email: "", subject: "", message: "" },
  });

  // Auto-fill from auth session
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const email = session.user.email ?? "";
      form.setValue("from_email", email);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile?.display_name) {
        form.setValue("from_name", profile.display_name);
      }
    })();
  }, [form]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAttachError("Only images are allowed (PNG, JPG, WebP, GIF)");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAttachError("File must be under 5 MB");
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachment(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachment(null);
    setPreviewUrl(null);
    setAttachError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() ?? "png";
    const path = `contact/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("garden-screenshots") // reuse existing public bucket
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) return null;

    const { data: urlData } = supabase.storage
      .from("garden-screenshots")
      .getPublicUrl(path);

    return urlData?.publicUrl ?? null;
  };

  const onSubmit = async (data: ContactFormData) => {
    setStatus("sending");
    try {
      const { data: configData, error: configError } = await supabase.functions.invoke("emailjs-config");
      if (configError || !configData?.serviceId) throw new Error("Config unavailable");

      const { serviceId, contactTemplateId, autoreplyTemplateId, publicKey } = configData;

      let screenshotUrl = "";
      if (attachment) {
        const url = await uploadScreenshot(attachment);
        screenshotUrl = url ?? "";
      }

      const templateParams: Record<string, string> = {
        from_name: data.from_name,
        from_email: data.from_email,
        subject: data.subject,
        message: data.message,
        screenshot_url: screenshotUrl
          ? `\n\n📎 Screenshot attached: ${screenshotUrl}`
          : "",
      };

      await emailjs.send(serviceId, contactTemplateId, templateParams, publicKey);

      if (autoreplyTemplateId) {
        emailjs.send(serviceId, autoreplyTemplateId, templateParams, publicKey).catch(() => {});
      }

      setSentEmail(data.from_email);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    form.reset();
    removeAttachment();
    setStatus("idle");
    setSentEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="w-10 h-10 text-primary" />
        <p className="text-sm font-medium text-foreground">Message Sent Successfully 🙏</p>
        <p className="text-xs text-muted-foreground">
          We'll reply to <span className="font-medium text-foreground">{sentEmail}</span> within 24–48 hours.
        </p>
        <Button variant="outline" size="sm" onClick={reset} className="mt-2">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="from_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} className="bg-muted/60 border-border focus:border-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="from_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} className="bg-muted/60 border-border focus:border-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Subject *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-muted/60 border-border focus:border-primary">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Message *</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Describe your question or issue…"
                  {...field}
                  className="bg-muted/60 border-border focus:border-primary resize-y"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attachment */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Attach Screenshot (optional)</label>

          {!attachment ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/60 transition-colors"
            >
              <Paperclip className="w-4 h-4 shrink-0" />
              <span>Tap to attach an image (max 5 MB)</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded object-cover border border-border"
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{attachment.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(attachment.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {attachError && (
            <p className="text-xs text-destructive">{attachError}</p>
          )}
        </div>

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Something went wrong. Please try emailing us directly at{" "}
              <a href="mailto:try.dhyaan@gmail.com" className="underline font-medium">
                try.dhyaan@gmail.com
              </a>
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "sending"}
          className="w-full min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending your message…
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
