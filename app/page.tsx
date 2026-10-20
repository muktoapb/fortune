"use client";

import { LangProvider } from "@/components/LangProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import Experience from "@/components/sections/Experience";
import Shares from "@/components/sections/Shares";
import Home from "@/components/sections/Home";
import Price from "@/components/sections/Price";
import Location from "@/components/sections/Location";
import Trust from "@/components/sections/Trust";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

export default function Page() {
  return (
    <LangProvider>
      <SmoothScroll />
      <Preloader />
      <Nav />
      <main id="top">
        <Experience />
        <Shares />
        <Home />
        <Price />
        <Location />
        <Trust />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <div className="grain" aria-hidden />
    </LangProvider>
  );
}
