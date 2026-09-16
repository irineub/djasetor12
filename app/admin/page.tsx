"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";

interface Person {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  ficha_rifa: number;
  status?: string;
  created_at?: string;
  reservation_id?: string;
}

interface ReservationGroup {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  items: Person[];
  status: string;
}

const getDisplayStatus = (person: Person) => {
  if (person.status === "PAGO") return "PAGO";
  if (person.status === "PENDENTE" && person.created_at) {
    const diff = (new Date().getTime() - new Date(person.created_at).getTime()) / (1000 * 60);
    if (diff > 15) return "EXPIRADO";
    return "PENDENTE";
  }
  return person.status || "DESCONHECIDO";
};

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"PAINEL" | "SORTEIO" | "CONFIG">("PAINEL");
  const [drawResults, setDrawResults] = useState<Person[]>([]);
  const [configTotalNumbers, setConfigTotalNumbers] = useState(500);

  // Edit state
  const [editingGroup, setEditingGroup] = useState<ReservationGroup | null>(null);

  useEffect(() => {
    const logged = localStorage.getItem("admin_logged_in");
    if (logged === "true") {
      setIsLoggedIn(true);
      fetchPeople();
    }
  }, []);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://www.enpassantescoladexadrez.com.br/api/admin-easter");
      const data = await res.json();
      setPeople(data);

      const configRecord = data.find((p: Person) => p.nome === "CONFIG_TOTAL_NUMBERS");
      if (configRecord) setConfigTotalNumbers(Number(configRecord.ficha_rifa));
    } catch (err) {
      console.error("Error fetching people", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin-mqv" && password === "IrineuLindo") {
      setIsLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      fetchPeople();
      setError("");
    } else {
      setError("Credenciais inválidas");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
    setUsername("");
    setPassword("");
  };

  const groupedPeople = useMemo(() => {
    const groups = new Map<string, ReservationGroup>();

    // Filter out logically deleted records AND config records
    const activePeople = people.filter(p => p.status !== "EXCLUIDO" && p.nome !== "CONFIG_TOTAL_NUMBERS");

    activePeople.forEach((person) => {
      let key = person.reservation_id;
      if (!key) {
        const dateStr = person.created_at ? new Date(person.created_at).toLocaleDateString() : 'legacy';
        key = `${person.cpf}_${dateStr}`;
      }

      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          nome: person.nome,
          cpf: person.cpf,
          telefone: person.telefone,
          items: [],
          status: "DESCONHECIDO"
        });
      }
      groups.get(key)!.items.push(person);
    });

    const result = Array.from(groups.values());
    result.forEach(group => {
      group.items.sort((a, b) => a.ficha_rifa - b.ficha_rifa);

      let hasPago = false;
      let hasPendente = false;

      group.items.forEach(p => {
        const s = getDisplayStatus(p);
        if (s === "PAGO") hasPago = true;
        if (s === "PENDENTE") hasPendente = true;
      });

      if (hasPago) group.status = "PAGO";
      else if (hasPendente) group.status = "PENDENTE";
      else group.status = "EXPIRADO";
    });

    result.sort((a, b) => {
      const aTime = new Date(a.items[0]?.created_at || 0).getTime();
      const bTime = new Date(b.items[0]?.created_at || 0).getTime();
      return bTime - aTime;
    });

    return result;
  }, [people]);

  const handleConfirmPayment = async (group: ReservationGroup) => {
    if (!confirm(`Confirmar o pagamento de todos os números (${group.items.length}) de ${group.nome}?`)) return;

    setLoading(true);
    try {
      const promises = group.items.map(async (person) => {
        if (person.status === "PAGO") return;
        return fetch(`https://www.enpassantescoladexadrez.com.br/api/admin-easter/${person.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...person, status: "PAGO" }),
        });
      });

      await Promise.all(promises);
      fetchPeople();
    } catch (err) {
      console.error(err);
      alert("Erro ao confirmar pagamento.");
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (group: ReservationGroup) => {
    if (!confirm(`ATENÇÃO: Deseja realmente EXCLUIR permanentemente as reservas de ${group.nome}?`)) return;
    if (!confirm(`Confirmação Dupla: Tem certeza absoluta? Essa ação liberará os números no site.`)) return;

    setLoading(true);
    try {
      const promises = group.items.map(async (person) => {
        return fetch(`https://www.enpassantescoladexadrez.com.br/api/admin-easter/${person.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...person, status: "EXCLUIDO" }),
        });
      });

      await Promise.all(promises);
      fetchPeople();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir reserva.");
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setLoading(true);

    try {
      const promises = editingGroup.items.map(async (person) => {
        return fetch(`https://www.enpassantescoladexadrez.com.br/api/admin-easter/${person.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...person,
            nome: editingGroup.nome,
            cpf: editingGroup.cpf,
            telefone: editingGroup.telefone,
            status: editingGroup.status
          }),
        });
      });

      await Promise.all(promises);
      setEditingGroup(null);
      fetchPeople();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar.");
      setLoading(false);
    }
  };

  const handleDraw = () => {
    const validTickets = people.filter(p => getDisplayStatus(p) === "PAGO");
    const uniqueTickets = Array.from(new Map(validTickets.map(item => [item.ficha_rifa, item])).values());

    if (uniqueTickets.length < 3) {
      alert("É necessário ter pelo menos 3 números pagos para realizar o sorteio.");
      return;
    }

    const shuffled = [...uniqueTickets].sort(() => 0.5 - Math.random());
    setDrawResults(shuffled.slice(0, 3));
  };

  const handleSaveConfig = async () => {
    const configRecord = people.find(p => p.nome === "CONFIG_TOTAL_NUMBERS");
    setLoading(true);
    try {
      if (configRecord) {
        await fetch(`https://www.enpassantescoladexadrez.com.br/api/admin-easter/${configRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...configRecord, ficha_rifa: configTotalNumbers }),
        });
      } else {
        await fetch(`https://www.enpassantescoladexadrez.com.br/api/admin-easter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: "CONFIG_TOTAL_NUMBERS",
            cpf: "00000000000",
            telefone: "00000000000",
            ficha_rifa: configTotalNumbers,
            status: "CONFIG",
            created_at: new Date().toISOString()
          }),
        });
      }
      alert("Configurações salvas!");
      fetchPeople();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar configurações.");
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-border w-full max-w-md">
            <h1 className="text-2xl font-bold text-primary-dark mb-6 text-center">Acesso Restrito</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-colors mt-2"
              >
                Entrar
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-dark">Painel Administrativo</h1>
            <div className="flex gap-4 items-center">
              <div className="bg-gray-200 p-1 rounded-lg flex">
                <button
                  onClick={() => setActiveTab("PAINEL")}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'PAINEL' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Reservas
                </button>
                <button
                  onClick={() => setActiveTab("SORTEIO")}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'SORTEIO' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sorteio
                </button>
                <button
                  onClick={() => setActiveTab("CONFIG")}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'CONFIG' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Configurações
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          {activeTab === "PAINEL" ? (
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-muted">Carregando dados...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        <th className="p-4 font-semibold text-sm text-gray-600">ID / Grupo</th>
                        <th className="p-4 font-semibold text-sm text-gray-600">Qtd. / Números</th>
                        <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                        <th className="p-4 font-semibold text-sm text-gray-600">Dados do Usuário</th>
                        <th className="p-4 font-semibold text-sm text-gray-600 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedPeople.map((group: ReservationGroup) => {
                        const displayStatus = group.status;
                        const numerosStr = group.items.map((i: Person) => String(i.ficha_rifa).padStart(3, '0')).join(', ');

                        return (
                          <tr key={group.id} className="border-b border-border hover:bg-gray-50/50">
                            <td className="p-4 text-xs font-mono text-gray-500">#{group.id.slice(0, 8)}</td>
                            <td className="p-4">
                              <div className="font-bold text-primary">{group.items.length} números</div>
                              <div className="text-xs text-muted max-w-[150px] truncate" title={numerosStr}>{numerosStr}</div>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${displayStatus === 'PAGO' ? 'bg-green-100 text-green-700' :
                                displayStatus === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' :
                                  displayStatus === 'EXPIRADO' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {displayStatus}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-medium">{group.nome}</div>
                              <div className="text-xs text-muted">{group.cpf} • {group.telefone}</div>
                            </td>
                            <td className="p-4 flex gap-2 justify-end">
                              {displayStatus !== 'PAGO' && (
                                <button
                                  onClick={() => handleConfirmPayment(group)}
                                  className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                >
                                  Confirmar Pag. ({group.items.length})
                                </button>
                              )}
                              <button
                                onClick={() => setEditingGroup(group)}
                                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Editar
                              </button>
                              {displayStatus === 'EXPIRADO' && (
                                <button
                                  onClick={() => handleDeleteGroup(group)}
                                  className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                >
                                  Excluir
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {groupedPeople.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted">Nenhuma reserva encontrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === "SORTEIO" ? (
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">Realizar Sorteio</h2>
              <p className="text-muted mb-8">
                O sorteio selecionará aleatoriamente 3 números distintos dentre todos os números com status <strong className="text-green-600">PAGO</strong>.
              </p>

              <button
                onClick={handleDraw}
                className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg hover:shadow-xl text-lg mb-10"
              >
                Sortear Agora
              </button>

              {drawResults.length > 0 && (
                <div className="space-y-4 text-left">
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl relative overflow-hidden">
                    <div className="text-4xl absolute -right-4 -bottom-4 opacity-20">🥇</div>
                    <div className="text-sm font-bold text-yellow-800 mb-1">1º Prêmio (R$ 300,00)</div>
                    <div className="text-2xl font-bold text-primary-dark">Número: {String(drawResults[0].ficha_rifa).padStart(3, '0')}</div>
                    <div className="text-lg font-medium">{drawResults[0].nome}</div>
                    <div className="text-sm text-muted">{drawResults[0].telefone} - {drawResults[0].cpf}</div>
                  </div>

                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl relative overflow-hidden">
                    <div className="text-4xl absolute -right-4 -bottom-4 opacity-20">🥈</div>
                    <div className="text-sm font-bold text-gray-600 mb-1">2º Prêmio (R$ 250,00)</div>
                    <div className="text-2xl font-bold text-primary-dark">Número: {String(drawResults[1].ficha_rifa).padStart(3, '0')}</div>
                    <div className="text-lg font-medium">{drawResults[1].nome}</div>
                    <div className="text-sm text-muted">{drawResults[1].telefone} - {drawResults[1].cpf}</div>
                  </div>

                  <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl relative overflow-hidden">
                    <div className="text-4xl absolute -right-4 -bottom-4 opacity-20">🥉</div>
                    <div className="text-sm font-bold text-orange-800 mb-1">3º Prêmio (R$ 200,00)</div>
                    <div className="text-2xl font-bold text-primary-dark">Número: {String(drawResults[2].ficha_rifa).padStart(3, '0')}</div>
                    <div className="text-lg font-medium">{drawResults[2].nome}</div>
                    <div className="text-sm text-muted">{drawResults[2].telefone} - {drawResults[2].cpf}</div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "CONFIG" ? (
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-primary-dark mb-6">Configurações da Rifa</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total de Números Disponíveis</label>
                  <p className="text-sm text-muted mb-4">Defina quantos números serão exibidos para compra. O padrão é 500. Os números são divididos automaticamente em páginas de 100.</p>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={configTotalNumbers}
                    onChange={(e) => setConfigTotalNumbers(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-colors"
                >
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Modal de Edição */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-primary-dark mb-4">Editar Grupo ({editingGroup.items.length} números)</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                  <input
                    type="text"
                    value={editingGroup.nome}
                    onChange={(e) => setEditingGroup({ ...editingGroup, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">CPF</label>
                  <input
                    type="text"
                    value={editingGroup.cpf}
                    onChange={(e) => setEditingGroup({ ...editingGroup, cpf: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                  <input
                    type="text"
                    value={editingGroup.telefone}
                    onChange={(e) => setEditingGroup({ ...editingGroup, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status de todos</label>
                  <select
                    value={editingGroup.status || ""}
                    onChange={(e) => setEditingGroup({ ...editingGroup, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="EXPIRADO">Expirado</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingGroup(null)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary hover:bg-primary-light text-white rounded-lg font-bold transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
