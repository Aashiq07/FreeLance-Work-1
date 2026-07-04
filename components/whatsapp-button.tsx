"use client"

import { motion } from "framer-motion"
import { FaWhatsapp } from "react-icons/fa"

export function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/919043542304?text=Hi%20Rare%20Drop!%20I'm%20interested%20in%20your%20digital%20marketing%20services."
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5C] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="h-7 w-7 text-white" />

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </motion.a>
  )
}
