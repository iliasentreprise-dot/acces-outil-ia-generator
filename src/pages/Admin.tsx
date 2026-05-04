import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string; prenom: string; nom: string; email: string;
  telephone: string | null; objectif_revenu: string | null; created_at: string;
}

const OPTS = [
  { label: "Tous", value: "all" }, { label: "500€", value: "500" },
  { label: "1 000€", value: "1000" }, { label: "3 000€", value: "3000" }, { label: "10K+", value: "10000+" },
];

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/auth");
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setAuthChecked(true);
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (!error) setLeads(data || []);
      setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  const filtered = leads.filter((l) => {
    const mf = filter === "all" || l.objectif_revenu === filter;
    const ms = !search || [l.prenom, l.nom, l.email].some((v) => v.toLowerCase().includes(search.toLowerCase()));
    return mf && ms;
  });

  const exportCSV = () => {
    const rows = [["Prénom","Nom","Email","Téléphone","Objectif","Date"], ...filtered.map((l) => [l.prenom, l.nom, l.email, l.telephone || "", l.objectif_revenu || "", new Date(l.created_at).toLocaleDateString("fr-FR")])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-light text-primary" style={{ fontFamily: "'Cormorant Garamond', serif" }}>⚡ DropDigital</h1>
          <span className="text-xs text-muted-foreground tracking-widest uppercase border border-border px-2 py-0.5 rounded">Admin</span>
        </div>
        <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground">Déconnexion</button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6"><p className="text-3xl font-semibold">{leads.length}</p><p className="text-sm text-muted-foreground">Total leads</p></div>
          <div className="bg-card border border-border rounded-lg p-6"><p className="text-3xl font-semibold">{leads.filter((l) => l.objectif_revenu === "10000+").length}</p><p className="text-sm text-muted-foreground">Objectif 10K+</p></div>
          <div className="bg-card border border-border rounded-lg p-6"><p className="text-3xl font-semibold">{leads[0] ? new Date(leads[0].created_at).toLocaleDateString("fr-FR") : "—"}</p><p className="text-sm text-muted-foreground">Dernier lead</p></div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {OPTS.map((o) => (
              <button key={o.value} onClick={() => setFilter(o.value)} className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${filter === o.value ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}>{o.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-input border border-border rounded px-3 py-2 text-sm w-56 focus:border-primary focus:outline-none" />
            <button onClick={exportCSV} className="border border-primary/30 text-primary hover:bg-primary/10 px-4 py-2 text-sm rounded transition">CSV</button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">{["Prénom","Nom","Email","Téléphone","Objectif","Date"].map((h) => (<th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Chargement...</td></tr>)
              : filtered.length === 0 ? (<tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Aucun lead trouvé</td></tr>)
              : filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.prenom}</td><td className="px-4 py-3">{l.nom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.email}</td><td className="px-4 py-3 text-muted-foreground">{l.telephone || "—"}</td>
                  <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary border border-primary/20">{l.objectif_revenu ? `${l.objectif_revenu}€` : "—"}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
