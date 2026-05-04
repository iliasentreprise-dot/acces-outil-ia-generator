import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const REVENUE_OPTIONS = [
  { value: "500", emoji: "💰", amount: "500€/mois", desc: "Complément de revenu" },
  { value: "1000", emoji: "🔥", amount: "1 000€/mois", desc: "Revenu solide" },
  { value: "3000", emoji: "⚡", amount: "3 000€/mois", desc: "Remplacer un salaire" },
  { value: "10000+", emoji: "🏴‍☠️", amount: "10K+/mois", desc: "Empire digital" },
];

const Index = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", objectif_revenu: "" });

  const update = (f: string, v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: "" }));
  };

  const goStep2 = () => {
    const errs: Record<string, string> = {};
    if (form.prenom.trim().length < 2) errs.prenom = "Requis";
    if (form.nom.trim().length < 2) errs.nom = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Email invalide";
    if (form.telephone.trim().length < 6) errs.telephone = "Requis";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  };
  const goStep3 = () => {
    if (!form.objectif_revenu) { setErrors({ objectif_revenu: "Sélectionne un objectif" }); return; }
    setStep(3);
  };
  const submit = async () => {
    setSubmitting(true);
    try {
      await supabase.functions.invoke("submit-lead", { body: form });
      setSuccess(true);
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const dotClass = (n: number) => (n < step ? "done" : n === step ? "active" : "");

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F0E8] relative overflow-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="fixed inset-0 z-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(201,168,76,0.06) 0%, transparent 50%), #060608" }} />
      <div className="fixed inset-0 z-0" style={{ backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-5 py-1.5 rounded-sm text-[11px] font-semibold tracking-[3px] uppercase text-primary mb-5">
            ⚡ Cadeau Live — Accès Limité
          </div>
          <h1 className="text-[clamp(36px,6vw,68px)] font-light leading-none" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            DROP<span className="text-primary">DIGITAL</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3 tracking-wide">Outil offert en direct · Places non garanties</p>
        </div>

        <div className="w-full max-w-[520px] bg-[#0D0D10] border border-primary/15 rounded-lg p-10 sm:p-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

          {!success && (
            <div className="flex items-center justify-center gap-0 mb-10">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${dotClass(n) === "done" ? "bg-primary border-primary text-[#060608]" : dotClass(n) === "active" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                    {dotClass(n) === "done" ? "✓" : n}
                  </div>
                  {n < 3 && <div className="w-16 h-px bg-border mx-1 relative"><div className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ${n < step ? "w-full" : "w-0"}`} /></div>}
                </div>
              ))}
            </div>
          )}

          {step === 1 && !success && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-primary tracking-[4px] uppercase font-semibold mb-3">Étape 1 / 3</p>
              <h2 className="text-3xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Où t'envoyer<br />l'outil ?</h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Entre tes infos. L'outil DropDigital sera envoyé <strong className="text-primary">directement à ton email</strong> dans les secondes qui suivent.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {(["prenom", "nom"] as const).map((f) => (
                  <div key={f}>
                    <label className="text-[10px] tracking-[2px] uppercase text-muted-foreground font-semibold mb-2 block">{f === "prenom" ? "Prénom" : "Nom"}</label>
                    <input value={form[f]} onChange={(e) => update(f, e.target.value)} className={`w-full bg-[#141418] border ${errors[f] ? "border-red-500" : "border-border"} rounded px-4 py-3 text-sm focus:border-primary focus:outline-none`} placeholder={f === "prenom" ? "Jean" : "Dupont"} />
                    {errors[f] && <span className="text-red-500 text-[11px] mt-1 block">{errors[f]}</span>}
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="text-[10px] tracking-[2px] uppercase text-muted-foreground font-semibold mb-2 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={`w-full bg-[#141418] border ${errors.email ? "border-red-500" : "border-border"} rounded px-4 py-3 text-sm focus:border-primary focus:outline-none`} placeholder="dupont@gmail.com" />
                {errors.email && <span className="text-red-500 text-[11px] mt-1 block">{errors.email}</span>}
              </div>
              <div className="mb-8">
                <label className="text-[10px] tracking-[2px] uppercase text-muted-foreground font-semibold mb-2 block">Téléphone</label>
                <input type="tel" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} className={`w-full bg-[#141418] border ${errors.telephone ? "border-red-500" : "border-border"} rounded px-4 py-3 text-sm focus:border-primary focus:outline-none`} placeholder="+33 6 00 00 00 00" />
                {errors.telephone && <span className="text-red-500 text-[11px] mt-1 block">{errors.telephone}</span>}
              </div>
              <button onClick={goStep2} className="w-full py-4 bg-gradient-to-r from-primary to-[#E8C96A] text-[#060608] font-bold text-sm tracking-[2px] uppercase rounded hover:brightness-110 transition">CONTINUER →</button>
            </div>
          )}

          {step === 2 && !success && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-primary tracking-[4px] uppercase font-semibold mb-3">Étape 2 / 3</p>
              <h2 className="text-3xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ton objectif<br />de revenus ?</h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Sois honnête. Ça me permet d'adapter les conseils que tu recevras avec l'outil.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {REVENUE_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => update("objectif_revenu", opt.value)} className={`flex items-center gap-3 p-4 rounded border text-left transition-all ${form.objectif_revenu === opt.value ? "border-primary bg-primary/10" : "border-border bg-[#141418] hover:border-primary/40"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.objectif_revenu === opt.value ? "border-primary" : "border-muted-foreground"}`}>
                      {form.objectif_revenu === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <span className="mr-2">{opt.emoji}</span>
                      <span className="font-semibold text-sm">{opt.amount}</span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.objectif_revenu && <p className="text-red-500 text-[11px] mb-4">{errors.objectif_revenu}</p>}
              <button onClick={goStep3} className="w-full py-4 bg-gradient-to-r from-primary to-[#E8C96A] text-[#060608] font-bold text-sm tracking-[2px] uppercase rounded hover:brightness-110 transition">CONFIRMER MON OBJECTIF →</button>
            </div>
          )}

          {step === 3 && !success && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-primary tracking-[4px] uppercase font-semibold mb-3">Étape 3 / 3</p>
              <h2 className="text-3xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Tout est prêt.</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Vérifie tes infos. L'outil arrive directement dans ta boîte mail.</p>
              <div className="bg-primary/5 border border-primary/15 rounded p-4 mb-6 text-xs leading-8 text-muted-foreground">
                <strong className="text-primary">Prénom :</strong> {form.prenom}<br />
                <strong className="text-primary">Nom :</strong> {form.nom}<br />
                <strong className="text-primary">Email :</strong> {form.email}<br />
                <strong className="text-primary">Téléphone :</strong> {form.telephone}<br />
                <strong className="text-primary">Objectif :</strong> {REVENUE_OPTIONS.find(o => o.value === form.objectif_revenu)?.amount}
              </div>
              <button onClick={submit} disabled={submitting} className="w-full py-4 bg-gradient-to-r from-primary to-[#E8C96A] text-[#060608] font-bold text-sm tracking-[2px] uppercase rounded hover:brightness-110 transition disabled:opacity-60">
                {submitting ? "⏳ Envoi en cours..." : "⚡ RECEVOIR L'OUTIL MAINTENANT"}
              </button>
              <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wider">📬 Envoyé instantanément à ton adresse email</p>
            </div>
          )}

          {success && (
            <div className="text-center animate-fade-in py-5">
              <span className="text-5xl block mb-5">⚡</span>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>C'est <span className="text-primary">parti</span> !</h2>
              <p className="text-sm text-muted-foreground mb-7 max-w-sm mx-auto leading-relaxed">Le Générateur DropDigital vient d'être envoyé à ton adresse email. Vérifie ta boîte de réception — et les spams si besoin.</p>
              <div className="bg-primary/5 border border-primary/20 rounded p-4 text-xs text-primary tracking-wider mb-5">📬 Ouvre ton email pour accéder à l'outil DropDigital</div>
              <p className="text-[11px] text-muted-foreground tracking-wider">Profite bien — c'est un cadeau.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-8 pt-6 border-t border-primary/10">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-wider uppercase"><span className="text-primary">🔒</span> 100% Sécurisé</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-wider uppercase"><span className="text-primary">📬</span> Email Instantané</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-wider uppercase"><span className="text-primary">🏴‍☠️</span> Outil Gratuit</div>
        </div>
      </div>
    </div>
  );
};

export default Index;
