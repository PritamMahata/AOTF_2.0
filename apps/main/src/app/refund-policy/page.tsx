import { NormalAppHeader } from "@/components/navigation/app-header";

export default function RefundPolicy() {
  return (
    <>
      <NormalAppHeader />
      <div className="py-8 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl mx-auto prose prose-gray dark:prose-invert bg-white/80 dark:bg-gray-950/80 rounded-lg p-8 shadow-md">
            <div className="pb-4 mb-6 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-4xl font-bold tracking-tight mb-0">
                Refund Policy
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Last updated: November 1, 2025
              </p>
            </div>
            <h2 className="text-2xl mt-6 mb-2 font-semibold">No Refunds</h2>
            <p>
              All payments made for products or services through this website
              are <span className="font-semibold">non-refundable</span>. Once a
              payment is completed, the transaction is final and cannot be
              reversed or refunded under any circumstances.
            </p>
            <h2 className="text-2xl mt-6 mb-2 font-semibold">Policy Details</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                No refunds will be provided for any reason, including but not
                limited to dissatisfaction with the service, change of mind, or
                unused portion of the service.
              </li>
              <li>
                It is the responsibility of the customer to review and accept
                the terms before making any payment.
              </li>
            </ul>
            <h2 className="text-2xl mt-6 mb-2 font-semibold">Contact Us</h2>
            <p>
              If you have any questions regarding our refund policy, please
              contact our support team. While we do not provide refunds, we are
              committed to addressing any concerns regarding our services.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
