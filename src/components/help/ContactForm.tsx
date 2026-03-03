import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
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

const contactSchema = z.object({
  from_name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  from_email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [sentEmail, setSentEmail] = useState("");

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

  const onSubmit = async (data: ContactFormData) => {
    setStatus("sending");
    try {
      // Fetch EmailJS config from edge function
      const { data: configData, error: configError } = await supabase.functions.invoke("emailjs-config");
      if (configError || !configData?.serviceId) throw new Error("Config unavailable");

      const { serviceId, contactTemplateId, autoreplyTemplateId, publicKey } = configData;

      const templateParams = {
        from_name: data.from_name,
        from_email: data.from_email,
        subject: data.subject,
        message: data.message,
      };

      // Send contact email
      await emailjs.send(serviceId, contactTemplateId, templateParams, publicKey);

      // Send auto-reply (non-blocking)
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
