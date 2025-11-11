import React from "react";
import { format } from "date-fns";
import BaseTemplate from "./BaseTemplate";
import { formatCurrency } from "@aotf/utils";
import { UPIQRCode } from "../UPIQRCode";
import { siteConfig } from "../@aotf/config/site";

const InvoiceTemplate = ({ data }) => {
  const {
    billTo = {},
    invoice = {},
    yourCompany = {},
    items = [],
    taxPercentage = 0,
    taxAmount = 0,
    subTotal = 0,
    grandTotal = 0,
    notes = "",
    selectedCurrency,
    signature,
    websiteUrl,
    paymentStatus = "unpaid",
  } = data || {};

  return (
    <BaseTemplate data={data}>
      {" "}
      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-4">Invoice</h1>
            <p>
              <span className="font-semibold">Invoice#:</span>{" "}
              {invoice.number || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Invoice Date:</span>{" "}
              {invoice.date
                ? format(new Date(invoice.date), "MMM dd, yyyy")
                : "N/A"}
            </p>
            {paymentStatus === "paid" ? (
              <p>
                <span className="font-semibold">Payment Date:</span>{" "}
                {invoice.paymentDate
                  ? format(new Date(invoice.paymentDate), "MMM dd, yyyy")
                  : "N/A"}
              </p>
            ) : (
              <p>
                <span className="font-semibold">Due Date:</span>{" "}
                {invoice.paymentDate
                  ? format(new Date(invoice.paymentDate), "MMM dd, yyyy")
                  : "N/A"}
              </p>
            )}
          </div>
          <div className="text-right">
            {/* Company Logo */}
            <div className="mb-4 flex justify-end">
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-website-url={websiteUrl}
                >
                  <img
                    src="/AOTF.svg"
                    alt="Company Logo"
                    className="h-16 w-auto"
                  />
                </a>
              ) : (
                <img
                  src="/AOTF.svg"
                  alt="Company Logo"
                  className="h-16 w-auto"
                />
              )}
            </div>
            <h2 className="text-2xl font-bold">
              {yourCompany.name || "Company Name"}
            </h2>
            <p>{yourCompany.address || "Company Address"}</p>
            <p>{yourCompany.phone || "Company Phone"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">
              Billed by
            </h3>
            <p>
              <strong>{yourCompany.name || "Company Name"}</strong>
            </p>
            <p>{yourCompany.address || "Company Address"}</p>
            <p>{yourCompany.phone || "Company Phone"}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">
              Billed to
            </h3>
            <p>
              <strong>{billTo.name || "Client Name"}</strong>
            </p>
            <p>{billTo.address || "Client Address"}</p>
            <p>{billTo.phone || "Client Phone"}</p>
          </div>{" "}
        </div> 
        
        {/* Items/Services Section - Card Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-purple-600 mb-4">Services</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-purple-700">
                      {index + 1}. {item.name || "Item Name"}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(item.amount || 0, selectedCurrency)}
                    </p>
                  </div>
                </div>
                
                {/* Post Details Grid */}
                {item.postDetails && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {item.postDetails.preferredTime && (
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="font-semibold ml-2">{item.postDetails.preferredTime}</span>
                        </div>
                      )}
                      {item.postDetails.preferredDays && item.postDetails.preferredDays.length > 0 && (
                        <div>
                          <span className="text-gray-500">Days:</span>
                          <span className="font-semibold ml-2">{item.postDetails.preferredDays.join(', ')}</span>
                        </div>
                      )}
                      {item.postDetails.location && (
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="font-semibold ml-2">{item.postDetails.location}</span>
                        </div>
                      )}
                      {item.postDetails.postId && (
                        <div>
                          <span className="text-gray-500">Post ID:</span>
                          <span className="font-semibold ml-2">{item.postDetails.postId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <p className="flex justify-between">
              <span>Sub Total:</span>{" "}
              <span>{formatCurrency(subTotal, selectedCurrency)}</span>
            </p>
            {taxPercentage > 0 && (
              <>
                <p className="flex justify-between">
                  <span>Tax({taxPercentage}%):</span>{" "}
                  <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
                </p>
              </>
            )}
            <hr className="my-2" />
            <p className="flex justify-between font-bold text-lg mt-2">
              <span>Total:</span>{" "}
              <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
            </p>
          </div>
        </div>
        {notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">Note</h3>
            <p>{notes}</p>
          </div>
        )}        {/* Payment Status and Signature Section */}
        <div className="mt-8 flex justify-between items-end">
          {/* UPI QR Code - Left Side */}
          <div className="w-48">
            <div className="flex flex-col items-center">
              <UPIQRCode 
                amount={grandTotal}
                upiId={siteConfig.UPI.Id}
                name={siteConfig.UPI.name}
                currency={siteConfig.UPI.Currency}
                size={150}
                className="border-2 border-purple-200 rounded-lg p-2"
              />
              <p className="text-sm text-center mt-2 font-semibold text-purple-600">
                Scan to Pay
              </p>
              <p className="text-xs text-center text-gray-500">
                {formatCurrency(grandTotal, selectedCurrency)}
              </p>
            </div>
          </div>

          {/* Payment Status - Center */}
          <div className="flex-1 flex justify-center items-center">
            <img
              src={paymentStatus === "paid" ? "/paid.png" : "/unpaid.png"}
              alt={paymentStatus === "paid" ? "Paid" : "Unpaid"}
              className="h-24 w-auto opacity-80"
            />
          </div>

          {/* Signature - Right Side */}
          {signature && (
            <div className="text-left">
              <img
                src={signature}
                alt="Signature"
                className="h-auto w-auto mb-2"
                style={{ maxWidth: "200px" }}
              />
              <div className="border-t-2 border-gray-800 pt-1 flex justify-center flex-col items-center">
                <span className="text-sm font-semibold">Administrative Head</span>
                <span className="text-sm font-semibold">{`(${siteConfig.name})`}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseTemplate>
  );
};

export default InvoiceTemplate;
