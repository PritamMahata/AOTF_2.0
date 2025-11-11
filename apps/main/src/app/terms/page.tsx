"use client";

import { NormalAppHeader } from "@/components/navigation/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@aotf/ui/components/card";
import { Separator } from "@aotf/ui/components/separator";

export default function TuitionTerms() {
  return (
    <>
      <NormalAppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6 pb-20 md:px-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg rounded-2xl">
            <CardHeader className="pb-6 border-b">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Terms & Conditions
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Last Updated: November 1, 2025
              </p>
            </CardHeader>

            <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-8 pt-6">
              <section>
                <h2>1. Introduction</h2>
                <p>
                  These Terms and Conditions (“Agreement”) govern the
                  relationship between <strong>Academy of Tutorials and Freelancers</strong> (“the
                  Academy”), holding Trade License No.{" "}
                  <strong>0917P396725363505</strong>, and individuals (“Teachers”)
                  who register to receive tuition assignments through the
                  Academy. By registering or accepting any tuition assignment,
                  the Teacher agrees to comply with all the terms stated herein.
                </p>
              </section>

              <Separator />

              <section>
                <h2>2. Nature of Service</h2>
                <p>
                  The Academy acts as an intermediary that connects students or
                  guardians (“Clients”) seeking tutors with qualified teachers.
                  The Academy does not employ teachers; all teachers operate as
                  independent service providers. The Academy is not responsible
                  for the continuation or termination of any tuition arrangement
                  beyond the initial facilitation.
                </p>
              </section>

              <Separator />

              <section>
                <h2>3. Academy Fee Options</h2>
                <p>
                  Teachers may choose one of the following payment structures
                  prior to accepting any tuition assignment:
                </p>

                <h3 className="font-semibold mt-4">Option A</h3>
                <p>
                  The Teacher pays <strong>75%</strong> of the first month’s
                  remuneration as an “Academy Fee.” The remaining{" "}
                  <strong>25%</strong> of that month’s remuneration is released
                  to the Teacher by the Academy.
                </p>

                <h3 className="font-semibold mt-4">Option B</h3>
                <p>
                  The Academy collects <strong>100%</strong> of the first
                  month’s remuneration directly from the guardian and retains{" "}
                  <strong>60%</strong> as the Academy Fee for the first month,
                  and <strong>40%</strong> as the Academy Fee for the second
                  month.
                </p>
              </section>

              <Separator />

              <section>
                <h2>4. Payment Terms</h2>
                <ul>
                  <li>
                    All payments are to be made only to the{" "}
                    <strong>official business bank account</strong> of the
                    Academy.
                  </li>
                  <li>
                    Teachers agree not to engage in direct payment arrangements
                    with guardians for the first month without Academy consent.
                  </li>
                  <li>
                    Any such direct transaction may lead to suspension or
                    permanent removal from the Academy’s network.
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2>5. Refund and Discontinuation Policy</h2>
                <ul>
                  <li>
                    If tuition is discontinued after the first month, the
                    Teacher shall be entitled to <strong>50%</strong> of the
                    first month’s remuneration, provided valid proof of
                    discontinuation is submitted and confirmed that the reason
                    does not lie with the Teacher.
                  </li>
                  <li>
                    Proof of discontinuation must include written or digital
                    confirmation from the guardian stating that the termination
                    was not due to the Teacher’s fault.
                  </li>
                  <li>
                    If the discontinuation occurs due to reasons attributable to
                    the Teacher — such as poor appearance, inappropriate
                    behavior, unprofessional attitude, offensive language, or
                    lack of communication — <strong>no refund or payment</strong>{" "}
                    will be issued.
                  </li>
                  <li>
                    The Academy reserves the right to make the final
                    determination in all refund-related matters.
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2>6. Conduct and Obligations of Teachers</h2>
                <ul>
                  <li>
                    Maintain a respectful, punctual, and professional attitude
                    at all times.
                  </li>
                  <li>
                    Communicate effectively with both guardians and the Academy.
                  </li>
                  <li>
                    Avoid any behavior that could be deemed offensive,
                    negligent, or unprofessional.
                  </li>
                  <li>
                    Represent the Academy’s name and reputation with integrity.
                  </li>
                  <li>
                    The Academy reserves the right to terminate or blacklist any
                    Teacher found violating professional standards.
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2>7. Limitation of Liability</h2>
                <ul>
                  <li>
                    The Academy shall not be liable for any disputes, damages,
                    or losses arising between Teachers and Clients after the
                    introduction.
                  </li>
                  <li>
                    The Academy shall not be responsible for any
                    discontinuation of tuition arrangements beyond the initial
                    match.
                  </li>
                  <li>
                    The Academy shall not be liable for any indirect,
                    incidental, or consequential damages resulting from the
                    services.
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2>8. Termination of Relationship</h2>
                <p>
                  Either party may terminate this arrangement by providing
                  written notice. Any pending dues, payments, or refunds will be
                  settled according to Clause 5.
                </p>
              </section>

              <Separator />

              <section>
                <h2>9. Governing Law and Dispute Resolution</h2>
                <p>
                  This Agreement shall be governed by and construed in
                  accordance with the laws of India, specifically under the{" "}
                  <strong>Indian Contract Act, 1872</strong>. Any disputes
                  arising from this Agreement shall be subject to the exclusive
                  jurisdiction of the competent courts in{" "}
                  <strong>[Insert Your City and State, India]</strong>.
                </p>
              </section>

              <Separator />

              <section>
                <h2>10. Acknowledgment</h2>
                <p>
                  By registering with the Academy, the Teacher acknowledges that
                  they have read, understood, and voluntarily agreed to these
                  Terms and Conditions.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
