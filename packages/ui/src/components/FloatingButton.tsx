"use client";

import { useState } from "react";
import { Phone, MessageCircle, MessageCircleQuestionMark } from "lucide-react";

export default function FloatingButton() {
  const [open, setOpen] = useState(false);
  const telephoneNumber = "+1234567890"; // Replace with your desired phone number
  const whatsAppNumber = "+1234567890"; // Replace with your desired WhatsApp number

  return (
    <div className="fixed bottom-20 md:bottom-10 right-4 flex flex-col items-center space-y-3 z-50">
      {/* Popup Icons */}
      <div
        className={`flex flex-col items-center space-y-3 mb-3 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {/* WhatsApp Icon */}
        <a
          href={`https://wa.me/${whatsAppNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition"
        >
          <MessageCircle size={24} />
        </a>

        {/* Call Icon */}
        <a
          href={`tel:${telephoneNumber}`}
          className="bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-gray-900 transition"
        >
          <Phone size={22} />
        </a>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition text-2xl"
      >
        {open ? "x" : <MessageCircleQuestionMark />}
      </button>
    </div>
  );
}
