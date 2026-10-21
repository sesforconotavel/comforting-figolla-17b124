import React from "react";
import { MessageCircle } from "lucide-react";

const AGENCY_PHONE = "351919389514";

export default function FloatingWhatsApp() {
  const href = `https://wa.me/${AGENCY_PHONE}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre os vossos imóveis.")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Contactar via WhatsApp"
      className="fixed bottom-6 left-6 z-[60] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:bg-[#1da851] transition-transform duration-200"
    >
      <MessageCircle className="w-7 h-7" aria-hidden="true" />
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
    </a>
  );
}
