import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLang } from "../context/LanguageContext";
import { MessageCircle, MapPin } from "lucide-react";

const PARAGRAPHS = [
  "Com mais de 5 anos de experiência, a Esforço Notável tem vindo a construir relações de confiança, ajudando particulares, famílias e investidores a concretizar os seus objetivos. A nossa equipa reúne conhecimentos em diferentes áreas, permitindo prestar um serviço completo e adaptado às necessidades de cada cliente.",
  "Na área imobiliária, acompanhamos todas as etapas do processo, desde a angariação e promoção de imóveis até ao apoio na compra, venda e arrendamento. Prestamos ainda aconselhamento sobre a documentação necessária, verificação de processos, análise de imóveis e apoio na realização de toda a componente administrativa, garantindo maior segurança e tranquilidade em cada negócio.",
  "Para além dos serviços imobiliários, continuamos a disponibilizar soluções nas áreas da integração de estrangeiros, obtenção de vistos, importação de veículos, alteração de cartas de condução, seguros, criação de projetos empresariais, análises topográficas, elaboração de artigos urbanos e serviços de solicitadoria. Desta forma, oferecemos um acompanhamento completo, reunindo vários serviços num único local.",
  "Na Esforço Notável acreditamos que cada cliente merece um acompanhamento próximo, profissional e transparente. Trabalhamos diariamente para simplificar processos, reduzir burocracias e encontrar as melhores soluções para quem pretende viver, investir ou adquirir um imóvel em Portugal.",
  "Se procura uma empresa de confiança para o acompanhar na compra, venda ou arrendamento de um imóvel, ou necessita de apoio complementar nas restantes áreas de consultoria, a Esforço Notável está preparada para o ajudar.",
];

export default function About() {
  const { t } = useLang();
  return (
    <div>
      <Navbar />
      <section className="relative bg-[#0d3b54] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-4">{t("hero_overline")}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black" data-testid="about-title">{t("nav_about")}</h1>
          <p className="mt-4 flex items-center gap-2 text-white/80"><MapPin className="w-4 h-4" aria-hidden="true" /> Castelo Branco, Portugal</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-6 text-slate-600 leading-relaxed text-base" data-testid="about-content">
          {PARAGRAPHS.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p className="font-display text-2xl font-bold text-[#0d3b54] pt-4">
            Esforço Notável — O seu parceiro de confiança na integração em Portugal!
          </p>
        </div>

        <a href="https://wa.me/351919389514" target="_blank" rel="noopener noreferrer" data-testid="about-whatsapp"
          className="mt-10 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-full px-7 py-3.5 transition-colors">
          <MessageCircle className="w-5 h-5" aria-hidden="true" /> {t("nav_contact")}
        </a>
      </section>

      <Footer />
    </div>
  );
}
