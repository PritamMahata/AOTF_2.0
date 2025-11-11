import { NormalAppHeader } from "@/components/navigation/app-header";
import { siteConfig } from "@aotf/config/src/site";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <NormalAppHeader />
      <div className="py-8 pb-20 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto prose prose-gray dark:prose-invert bg-white/80 dark:bg-gray-950/80 rounded-lg p-4 shadow-md">
            {/* Header */}
            <div className="pb-4 mb-6 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-4xl font-bold tracking-tight mb-0">
                Privacy Policy
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Last updated on: November 1, 2025
              </p>
            </div>
            <p>
              Academy of Tutorials and Freelancers (“the Academy,” “we,” “our,” or “us”) 
              values the privacy of all individuals who interact with our platform, 
              including teachers, students, and guardians. This Privacy Policy explains 
              how we collect, use, store, and protect personal information obtained 
              through our website, mobile applications, and offline communications.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">1. Information We Collect</h2>
            <p>We may collect and process the following types of personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">a. Information provided directly by you:</span>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full name, contact number, email address, and physical address.</li>
                  <li>Educational qualifications and work experience (for teachers).</li>
                  <li>Child/student details and tutoring requirements (for guardians).</li>
                  <li>Payment and bank account details (for processing remuneration or refunds).</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">b. Automatically collected information:</span>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address, browser type, device details, and interaction data.</li>
                  <li>Usage statistics and activity logs to improve services and security.</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">c. Sensitive personal data:</span> 
                We may collect limited sensitive personal information (e.g., payment details) 
                only when necessary to process transactions securely.
              </li>
            </ul>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">2. Purpose of Data Collection</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To facilitate connections between students/guardians and teachers.</li>
              <li>To manage tuition assignments, payments, and refund processes.</li>
              <li>To verify identity and prevent fraud.</li>
              <li>To communicate updates, confirmations, and support-related information.</li>
              <li>To comply with applicable laws and government regulations.</li>
            </ul>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">3. Consent</h2>
            <p>
              By using our services, you consent to the collection, use, and storage of your 
              information as described in this policy. You may withdraw your consent at any time 
              by contacting us; however, doing so may limit access to certain features of our platform.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">4. Data Sharing and Disclosure</h2>
            <p>We do not sell or trade your personal data. However, your information may be shared in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With guardians or teachers to facilitate tuition matching.</li>
              <li>With payment processors and banks to process legitimate transactions.</li>
              <li>With legal authorities if required by law or lawful request.</li>
              <li>
                With trusted third-party service providers (e.g., hosting or email providers) 
                who operate under strict confidentiality agreements.
              </li>
            </ul>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">5. Data Storage and Retention</h2>
            <p>
              All personal information is securely stored on encrypted systems and servers. 
              We retain personal data only as long as necessary to fulfill the purposes for 
              which it was collected or as required by law.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">6. Data Security</h2>
            <p>
              The Academy employs industry-standard technical and organizational measures to 
              protect personal data, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption and SSL for online transactions.</li>
              <li>Password protection and restricted access to sensitive systems.</li>
              <li>Regular audits and monitoring to detect unauthorized activity.</li>
            </ul>
            <p>
              While we take all reasonable precautions, no system is entirely secure, 
              and data transmission is done at your own risk.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">7. Your Rights</h2>
            <p>
              Under Indian law, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-medium">Access:</span> Request details of personal data held by us.</li>
              <li><span className="font-medium">Correction:</span> Request correction of inaccurate or outdated information.</li>
              <li><span className="font-medium">Withdrawal of Consent:</span> Revoke previously granted consent.</li>
              <li><span className="font-medium">Deletion:</span> Request deletion of personal data when it is no longer necessary.</li>
            </ul>
            <p>
              Requests may be made by contacting us at:  
              <Link href={`mailto:${siteConfig.contact.email}`} className="text-blue-600 hover:underline">{siteConfig.contact.email}</Link>
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">8. Cookies and Tracking</h2>
            <p>
              Our website may use cookies and tracking technologies to enhance functionality 
              and user experience. You can modify your browser settings to disable cookies, 
              but some features may not function properly if cookies are disabled.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">9. Third-Party Links</h2>
            <p>
              Our platform may contain links to external websites. The Academy is not 
              responsible for the content, privacy practices, or security of third-party websites.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">10. Changes to This Policy</h2>
            <p>
              We reserve the right to modify or update this Privacy Policy at any time. 
              Updates will be reflected by the “Last Updated” date above. Continued use 
              of our services after changes indicates acceptance of the revised policy.
            </p>

            <h2 className="text-2xl mt-8 mb-2 font-semibold">11. Contact Information</h2>
            <p>
              For privacy-related concerns, please contact:
            </p>
            <ul className="list-none pl-0">
              <li><span className="font-medium">Academy of Tutorials and Freelancers</span></li>
              <li>City: Kolkata, West Bengal, India</li>
              <li>Email: <Link href={`mailto:${siteConfig.contact.email}`} className="text-blue-600 hover:underline">{siteConfig.contact.email}</Link></li>
              <li>Phone: {siteConfig.contact.phone}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
