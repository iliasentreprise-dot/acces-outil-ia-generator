import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("Ilias.entreprise@gmail.com");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin");
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMsg(error.message);
    else if (isSignup) setMsg("Compte créé. Connecte-toi maintenant.");
    else navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-primary mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>⚡ DropDigital</h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin Dashboard</p>
        </div>
        <form onSubmit={submit} className="space-y-5 bg-card border border-border rounded-lg p-8">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-input border border-border rounded px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="admin@dropdigital.com" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-input border border-border rounded px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="••••••••" />
          </div>
          {msg && <p className="text-xs text-primary">{msg}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:brightness-110 font-semibold tracking-wider py-2.5 rounded transition">
            {loading ? "..." : isSignup ? "CRÉER LE COMPTE" : "SE CONNECTER"}
          </button>
          <button type="button" onClick={() => setIsSignup((s) => !s)} className="w-full text-xs text-muted-foreground hover:text-primary transition">
            {isSignup ? "← Déjà un compte ? Se connecter" : "Créer un compte admin →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
