import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, LifeBuoy, HelpCircle, Target, Radio, Layers, TrendingUp, Volume2, RefreshCw, WifiOff, MessageCircle, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sadhanaSteps = [
  {
    id: "step-1",
    icon: Target,
    title: "Setting Your Sankalpa",
    content:
      "Open the Lakshya tab to set your daily spiritual goal, whether it's 10 minutes of meditation or 108 Japs. A clear intention anchors your entire practice.",
  },
  {
    id: "step-2",
    icon: Radio,
    title: "Frequency Selection",
    content:
      "Visit the Sonic Lab and select a frequency that matches your current state—use 174 Hz for grounding or 528 Hz for transformation.",
  },
  {
    id: "step-3",
    icon: Layers,
    title: "Layering Your Atmosphere",
    content:
      "Add nature sounds like River Flow or Temple Bells to create an immersive environment that deepens your focus.",
  },
  {
    id: "step-4",
    icon: TrendingUp,
    title: "Tracking Progress",
    content:
      "After your session, check your Karma Points in the dashboard to see your growth from Seeker to Yogi.",
  },
];

const supportItems = [
  {
    id: "support-1",
    icon: Volume2,
    title: "Audio Not Playing",
    content:
      'Ensure your device is not on "Silent Mode." On iOS, Safari requires a physical "Play" tap to start audio streams.',
  },
  {
    id: "support-2",
    icon: RefreshCw,
    title: "Syncing Progress",
    content:
      "If your Karma Points aren't updating, ensure you are logged into your account and have a stable internet connection.",
  },
  {
    id: "support-3",
    icon: WifiOff,
    title: "Offline Access",
    content:
      'To use Dhyaan without a browser, use the "Add to Home Screen" feature on your iPhone or Android device.',
  },
  {
    id: "support-4",
    icon: MessageCircle,
    title: "Contact Us",
    isContact: true,
  },
];

const faqItems = [
  {
    id: "faq-1",
    question: "What are Solfeggio Frequencies?",
    answer:
      "These are specific tones used in the Sonic Lab that are believed to aid in physical and mental healing. Each frequency targets a different aspect of well-being.",
  },
  {
    id: "faq-2",
    question: "How do I earn Karma Points?",
    answer:
      'Points are awarded for consistent use of the Mantrochar and Sonic Lab modules, and for completing your daily "Lakshya" goals.',
  },
  {
    id: "faq-3",
    question: "Data Security and Infrastructure",
    answer:
      "We employ a multi-layered security framework to protect user information. Our backend implements PostgreSQL-level data isolation, meaning every user's record is protected by a dedicated security policy. This ensures complete privacy for your spiritual milestones and profile data, providing a secure environment for your daily Sadhana.",
  },
  {
    id: "faq-4",
    question: "What is the Inner Calm Garden?",
    answer:
      "The Inner Calm Garden is your personal digital sanctuary where meditation progress grows sacred plants like the Lotus and Bodhi Tree. You earn Water Drops—1 drop for every 10 minutes of meditation—which you use to nurture your garden. It features dynamic weather, seasonal events, daily challenges, and over 20 achievement badges to unlock.",
  },
];

interface SectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const Section = ({ icon: Icon, title, children, delay = 0 }: SectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="rounded-xl bg-card border border-border p-4 md:p-6"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <BackButton />
        <h1 className="text-lg font-semibold text-foreground">Help & Guide</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Sadhana Guide */}
        <Section icon={Compass} title="Sadhana Guide" delay={0.05}>
          <p className="text-sm text-muted-foreground mb-4">
            Follow these steps to build a meaningful daily practice.
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {sadhanaSteps.map((step, i) => (
              <AccordionItem
                key={step.id}
                value={step.id}
                className="border border-border/60 rounded-xl px-4 data-[state=open]:bg-primary/[0.03]"
              >
                <AccordionTrigger className="py-3 hover:no-underline gap-3 text-left">
                  <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {step.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 pl-9">
                  {step.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* Help & Support */}
        <Section icon={LifeBuoy} title="Help & Support" delay={0.1}>
          <Accordion type="single" collapsible className="space-y-2">
            {supportItems.map((item) => {
              const Icon = item.icon;
              return (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border border-border/60 rounded-xl px-4 data-[state=open]:bg-primary/[0.03]"
                >
                  <AccordionTrigger className="py-3 hover:no-underline gap-3 text-left">
                    <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      {item.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 pl-9">
                    {'isContact' in item && item.isContact ? (
                      <div className="space-y-3">
                        <p>
                          Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
                        </p>
                        <a
                          href="mailto:try.dhyaan@gmail.com"
                          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          try.dhyaan@gmail.com
                        </a>
                        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                          <li>Report bugs or playback issues with detailed steps</li>
                          <li>Suggest new mantras, frequencies, or temple streams</li>
                          <li>Request features like the Jap Bank or new guided sessions</li>
                          <li>We typically respond within 24–48 hours</li>
                        </ul>
                      </div>
                    ) : (
                      item.content
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Section>

        {/* FAQs */}
        <Section icon={HelpCircle} title="Frequently Asked Questions" delay={0.15}>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-border/60 rounded-xl px-4 data-[state=open]:bg-primary/[0.03]"
              >
                <AccordionTrigger className="py-3 hover:no-underline text-left">
                  <span className="text-sm font-medium text-primary">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      </main>
    </div>
  );
};

export default Help;
