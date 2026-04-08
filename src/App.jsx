import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 🔐 Simples camada SaaS (sem backend) usando localStorage
const LS_KEY = "simulador_logistico_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

export default function App() {
  const [aba, setAba] = useState("ERP");
  const [erpTab, setErpTab] = useState("VENDAS");

  // 👤 "Auth" simples
  const [usuario, setUsuario] = useState("");
  const [turma, setTurma] = useState("A1");
  const [logado, setLogado] = useState(false);

  // ERP
  const [estoque, setEstoque] = useState(100);
  const [pedidos, setPedidos] = useState([]);
  const [pedidoQtd, setPedidoQtd] = useState(0);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  // FORNECEDORES
  const [fornecedores, setFornecedores] = useState([]);
  const [nomeFornecedor, setNomeFornecedor] = useState("");
  const [precoFornecedor, setPrecoFornecedor] = useState(0);

  // NOTA FISCAL
  const [notaFiscal, setNotaFiscal] = useState(null);
  const [historicoNF, setHistoricoNF] = useState([]);

  // TMS
  const [distancia, setDistancia] = useState(100);
  const [custoKm, setCustoKm] = useState(2);
  const [velocidade, setVelocidade] = useState(60);
  const [statusEntrega, setStatusEntrega] = useState("Aguardando");

  // WMS
  const [itens, setItens] = useState([]);
  const [itensTransporte, setItensTransporte] = useState([]);
  const [nomeItem, setNomeItem] = useState("");
  const [localizacao, setLocalizacao] = useState("");

  // KPI
  const vendasTotal = pedidos.reduce((acc, p) => acc + p.qtd, 0);
  const giroEstoque = estoque > 0 ? (vendasTotal / estoque).toFixed(2) : 0;

  const custoFrete = distancia * custoKm;
  const tempoEntrega = velocidade > 0 ? (distancia / velocidade).toFixed(2) : 0;

  const receita = vendasTotal * 10;
  const custoFornecedor = fornecedorSelecionado ? fornecedorSelecionado.preco * vendasTotal : 0;
  const lucro = receita - custoFornecedor - custoFrete;

  // 🔁 Persistência (SaaS-like)
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setUsuario(saved.usuario || "");
      setTurma(saved.turma || "A1");
      setLogado(saved.logado || false);
      setEstoque(saved.estoque ?? 100);
      setPedidos(saved.pedidos || []);
      setFornecedores(saved.fornecedores || []);
      setHistoricoNF(saved.historicoNF || []);
    }
  }, []);

  useEffect(() => {
    saveState({
      usuario,
      turma,
      logado,
      estoque,
      pedidos,
      fornecedores,
      historicoNF
    });
  }, [usuario, turma, logado, estoque, pedidos, fornecedores, historicoNF]);

  const criarPedido = () => {
    if (pedidoQtd <= 0) return;
    setPedidos([...pedidos, { qtd: pedidoQtd }]);
    setEstoque(estoque - pedidoQtd);
    setPedidoQtd(0);
  };

  const cadastrarFornecedor = () => {
    if (!nomeFornecedor) return;
    setFornecedores([...fornecedores, { nome: nomeFornecedor, preco: precoFornecedor }]);
    setNomeFornecedor("");
    setPrecoFornecedor(0);
  };

  const gerarNotaFiscal = () => {
    const icms = receita * 0.18;
    const nf = {
      numero: Math.floor(Math.random() * 10000),
      quantidade: vendasTotal,
      valorFrete: custoFrete,
      receita,
      icms,
      lucro,
      data: new Date().toLocaleDateString(),
      usuario
    };
    setNotaFiscal(nf);
    setHistoricoNF((prev) => [...prev, nf]);
  };

  const cadastrarItem = () => {
    if (!nomeItem) return;
    setItens([...itens, { nome: nomeItem, localizacao, status: "Armazenado" }]);
    setNomeItem("");
    setLocalizacao("");
  };

  const enviarParaTMS = (index) => {
    const item = itens[index];
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);
    setItensTransporte([...itensTransporte, { ...item, status: "Em Transporte" }]);
  };

  // 🏆 Ranking simples por lucro (simulação de turma)
  const ranking = historicoNF
    .slice()
    .sort((a, b) => b.lucro - a.lucro)
    .slice(0, 5);

  if (!logado) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-4 grid gap-2">
            <h2>Login do Aluno</h2>
            <Input placeholder="Seu nome" value={usuario} onChange={(e)=>setUsuario(e.target.value)} />
            <Input placeholder="Turma" value={turma} onChange={(e)=>setTurma(e.target.value)} />
            <Button onClick={()=> setLogado(true)}>Entrar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen">

      {/* MENU */}
      <div className="w-56 bg-gray-900 text-white p-4 flex flex-col gap-2">
        <h2 className="font-bold">Sistema Logístico</h2>
        <p className="text-xs">👤 {usuario} | Turma {turma}</p>
        <Button onClick={() => setAba("ERP")}>ERP</Button>
        <Button onClick={() => setAba("TMS")}>TMS</Button>
        <Button onClick={() => setAba("WMS")}>WMS</Button>
        <Button onClick={() => setAba("MRP")}>MRP</Button>
        <Button onClick={() => setAba("DASHBOARD")}>Dashboard</Button>
        <Button onClick={() => setLogado(false)}>Sair</Button>
      </div>

      <div className="flex-1 p-4 grid gap-4">

        {/* KPI */}
        <Card>
          <CardContent className="p-4 grid grid-cols-4 gap-4">
            <div><h3>Vendas</h3><p>{vendasTotal}</p></div>
            <div><h3>Estoque</h3><p>{estoque}</p></div>
            <div><h3>Giro</h3><p>{giroEstoque}</p></div>
            <div><h3>Lucro</h3><p>{lucro.toFixed(2)}</p></div>
          </CardContent>
        </Card>

        {/* DASHBOARD (ranking) */}
        {aba === "DASHBOARD" && (
          <Card>
            <CardContent className="p-4">
              <h2>🏆 Ranking (Top Lucro)</h2>
              {ranking.map((r,i)=> (
                <p key={i}>{i+1}º - {r.usuario} | R$ {r.lucro.toFixed(2)}</p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ERP */}
        {aba === "ERP" && (
          <div>
            <div className="flex gap-2">
              <Button onClick={() => setErpTab("VENDAS")}>Vendas</Button>
              <Button onClick={() => setErpTab("FORNECEDORES")}>Fornecedores</Button>
            </div>

            {erpTab === "VENDAS" && (
              <Card>
                <CardContent className="p-4 grid gap-2">
                  <h2>Vendas</h2>
                  <Input type="number" value={pedidoQtd} onChange={(e)=>setPedidoQtd(Number(e.target.value))} />
                  <Button onClick={criarPedido}>Criar Pedido</Button>
                </CardContent>
              </Card>
            )}

            {erpTab === "FORNECEDORES" && (
              <Card>
                <CardContent className="p-4 grid gap-2">
                  <h2>Fornecedores</h2>
                  <Input placeholder="Nome" value={nomeFornecedor} onChange={(e)=>setNomeFornecedor(e.target.value)} />
                  <Input type="number" placeholder="Preço" value={precoFornecedor} onChange={(e)=>setPrecoFornecedor(Number(e.target.value))} />
                  <Button onClick={cadastrarFornecedor}>Cadastrar</Button>

                  {fornecedores.map((f, i)=> (
                    <div key={i} className="border p-2">
                      {f.nome} - R$ {f.preco}
                      <Button onClick={()=>setFornecedorSelecionado(f)}>Selecionar</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TMS */}
        {aba === "TMS" && (
          <Card>
            <CardContent className="p-4 grid gap-2">
              <h2>Transporte</h2>
              <p>Frete: R$ {custoFrete.toFixed(2)}</p>
              <p>Tempo: {tempoEntrega}h</p>
              <Button onClick={()=>{setStatusEntrega("Enviado"); gerarNotaFiscal();}}>Enviar</Button>

              {notaFiscal && (
                <div className="border p-2">
                  NF Nº {notaFiscal.numero} - R$ {notaFiscal.receita}
                </div>
              )}

              <h3>Histórico</h3>
              {historicoNF.map((nf,i)=> (
                <div key={i}>NF {nf.numero} - {nf.usuario}</div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* WMS */}
        {aba === "WMS" && (
          <Card>
            <CardContent className="p-4 grid gap-2">
              <h2>WMS</h2>
              <Input value={nomeItem} onChange={(e)=>setNomeItem(e.target.value)} />
              <Input value={localizacao} onChange={(e)=>setLocalizacao(e.target.value)} />
              <Button onClick={cadastrarItem}>Cadastrar</Button>

              {itens.map((item,i)=> (
                <div key={i}>
                  {item.nome} - {item.status}
                  <Button onClick={()=>enviarParaTMS(i)}>Enviar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* MRP */}
        {aba === "MRP" && (
          <Card>
            <CardContent className="p-4">
              <h2>MRP</h2>
              <p>Comprar: {vendasTotal > estoque ? vendasTotal - estoque : 0}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

// 🔥 VERSÃO SaaS EXPORT
export function AppWeb() {
  return <App />;
}
