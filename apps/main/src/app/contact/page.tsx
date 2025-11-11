import { NormalAppHeader } from "@aotf/ui/navigation/app-header";
import React from "react";
import { Label } from "@aotf/ui/components/label";
import { Input } from "@aotf/ui/components/input";
import { Textarea } from "@aotf/ui/components/textarea";
import { Button } from "@aotf/ui/components/button";

const page = () => {
  return (
    <div>
      <NormalAppHeader />
      <div className="container mx-auto px-4 py-8 pb-20 ">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <section className="mt-5 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="container px-4 py-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Get in touch</h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Have a question or want to work together? Fill out the form
                    and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message"
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit">Submit</Button>
                </form>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Contact Information</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get in touch with us using the information below.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        11 No. Dulal Nagar, Belgharia, Kolkata – 700056 <br />
                        Near Alap Banquet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        6290338214 (WhatsApp & Call)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MailIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        contact@aotf.in
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;

function MailIcon(
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MapPinIcon(
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon(
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
