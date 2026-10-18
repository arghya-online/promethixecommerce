import { faqs } from "@/data/faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection() {
  return (
    <section id="faqs" className="py-16 md:py-24 bg-gradient-to-b from-[#f5efe7] via-[#ede7dc] to-[#f5efe7] border-b border-border/80 relative" aria-label="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Clear Answers
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-foreground-muted mt-2">
            Everything you need to know about pricing, materials, design turnaround, and replacement parts.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="cost" className="w-full space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-surface border border-border rounded-xl px-5 py-1 shadow-xs transition-colors hover:border-primary/40 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left font-heading font-semibold text-sm sm:text-base text-foreground hover:no-underline hover:text-primary py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-foreground-muted leading-relaxed pb-4 pt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
