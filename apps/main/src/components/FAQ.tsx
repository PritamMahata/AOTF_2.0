import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@aotf/ui/components/accordion'

const FAQ = () => {
  return (
    <section className="container mx-auto px-6 py-12">
      {/* Heading and description */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-primary/80">FAQ</h3>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">Answers to common questions</h2>
        <p className="mt-3 text-muted-foreground">Quick answers about the product, pricing, and getting started.</p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is this platform?</AccordionTrigger>
            <AccordionContent>
              A minimal, professional toolkit to build and scale fast with clean UI and sensible defaults.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I get started?</AccordionTrigger>
            <AccordionContent>
              Click “Get Started” on the homepage to create an account. You can also log in if you already have one.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Is there a free plan?</AccordionTrigger>
            <AccordionContent>
              Yes. You can explore core features on a free tier and upgrade anytime as your needs grow.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionContent>
              We follow best practices, encryption, and regular reviews to keep your data safe and private.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
            <AccordionContent>
              Absolutely. You can manage your subscription from your account settings with no hidden fees.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}

export default FAQ