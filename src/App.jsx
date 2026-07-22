import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient.js";
import {
  PhoneCall, Siren, Truck, LayoutDashboard, Clock, MapPin, User,
  Activity, ChevronRight, X, CheckCircle2, AlertTriangle, Radio,
  Stethoscope, ClipboardList, TrendingUp, Users, Timer, Bike,
  ShieldAlert, Navigation, FileBarChart, Search, Filter,
  ArrowRight, Wifi, LogOut, Lock, UserPlus, KeyRound,
  Plus, Pencil, Trash2, Save, RefreshCw, Eye, Gauge, Printer
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line, Legend, LabelList
} from "recharts";

/* ============================================================
   TOKENS — tema claro, alto contraste, fontes ampliadas
   ============================================================ */
const COLORS = {
  bg: "#F4F6F8",
  panel: "#FFFFFF",
  panel2: "#F0F2F5",
  line: "#D7DDE4",
  text: "#14171F",
  textDim: "#3F4753",
  textFaint: "#6B7280",
  accent: "#C2410C",
  accent2: "#0E7490",
  vermelho: "#DC2626",
  amarelo: "#CA8A04",
  verde: "#15803D",
  azul: "#1D4ED8",
};
const FONT_DISPLAY = "'Barlow Semi Condensed', 'Arial Narrow', sans-serif";
const FONT_BODY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Consolas', monospace";

/* ============================================================
   DADOS BASE / LISTAS DE SELEÇÃO
   ============================================================ */
const TIPO_LABEL = { USB: "USB — Suporte Básico", USA: "USA — Suporte Avançado", VIR: "VIR — Intervenção Rápida", MOTOLANCIA: "Motolância" };
const PRIORIDADES = [
  { key: "vermelho", label: "Vermelho — Crítico", color: COLORS.vermelho },
  { key: "amarelo", label: "Amarelo — Urgente", color: COLORS.amarelo },
  { key: "verde", label: "Verde — Pouco urgente", color: COLORS.verde },
  { key: "azul", label: "Azul — Orientação/Não urgente", color: COLORS.azul },
];
const STATUS_LABEL = {
  aguardando_regulacao: "Aguardando regulação", em_regulacao: "Em regulação médica", aguardando_veiculo: "Aguardando veículo",
  despachado: "Veículo despachado", em_atendimento: "Em atendimento no local", concluido: "Concluída",
  orientacao_dada: "Orientação telefônica concluída", cancelado: "Cancelada",
};
const TIPOS_ATENDIMENTO = ["APH", "TRANSPORTE", "RESGATE", "ORIENTAÇÃO"];
const ORIGEM_LIGACAO = ["AMBIENTE DE LAZER", "AMBIENTE DE TRABALHO", "AMBIENTE ESCOLAR", "DOMICÍLIO", "EVENTOS DE MASSA", "AEROPORTO", "RODOVIA", "UNIDADE DE SAÚDE", "VIA PÚBLICA", "ZONA RURAL", "OUTROS"];
const TIPOS_LEITO = ["UTI", "ENFERMARIA", "AVALIAÇÃO MÉDICA", "EXAME COMPLEMENTAR"];
const CONDUTAS_MEDICAS = [
  { key: "USA", label: "USA" }, { key: "USB", label: "USB" },
  { key: "MOTOLANCIA", label: "Motolância" }, { key: "ORIENTACAO_MEDICA", label: "Orientação Médica" },
];
const MOTIVOS_CANCELAMENTO = ["TROTE", "ENGANO", "QUEDA DA LIGAÇÃO", "OUTROS"];
const MOTIVOS_CANCELAMENTO_ATENDIMENTO = [
  "ATENDIDO PELO BOMBEIRO", "ATENDIDO E LIBERADO NO LOCAL", "PACIENTE EVADIU DO LOCAL",
  "LOCAL/PACIENTE NÃO ENCONTRADO", "LIGAÇÃO CAIU", "SOLICITANTE CANCELOU OCORRÊNCIA",
  "RECUSA DE ATENDIMENTO", "REMOVIDO POR MEIOS PRÓPRIOS/TERCEIROS", "TROTE", "OUTROS",
];

const MUNICIPIOS = [
  "APARECIDA DE GOIÂNIA", "ARAGOIÂNIA", "BELA VISTA DE GOIÁS", "BONFINÓPOLIS", "CALDAZINHA", "CEZARINA",
  "CRISTIANÓPOLIS", "CROMÍNIA", "EDEALINA", "EDÉIA", "HIDROLÂNDIA", "INDIARA", "JANDAIA", "LEOPOLDO DE BULHÕES",
  "MAIRIPOTABA", "ORIZONA", "PIRACANJUBA", "PONTALINA", "PROFESSOR JAMIL", "SÃO MIGUEL DO PASSA QUATRO",
  "SENADOR CANEDO", "SILVÂNIA", "VARJÃO", "VIANÓPOLIS", "VICENTINÓPOLIS",
];
const UNIDADES_DESTINO = [
  "CAIS COLINA AZUL", "CAIS NOVA ERA", "UPA BRASICOM", "UPA BURITI SERENO", "UPA PARQUE FLAMBOYANT",
  "MATERNIDADE MARIA DA CRUZ", "HMAP", "HEAPA", "HECAD", "HEMU", "HUGO", "HUGOL", "HOSPITAL ARAUJO JORGE",
  "HGG", "HDT", "UNIDADE DE SAÚDE INTERIOR", "OUTROS",
];
const UNIDADES_ORIGEM = [
  "CAIS COLINA AZUL", "CAIS NOVA ERA", "UPA BRASICOM", "UPA BURITI SERENO", "UPA PARQUE FLAMBOYANT",
  "MATERNIDADE MARIA DA CRUZ", "HMAP", "OUTROS",
];

const CLASSIFICACAO_TIPOS = ["CLÍNICO", "CAUSA EXTERNA", "PEDIÁTRICO", "CIRÚRGICO", "GINECO/OBSTÉTRICO", "PSIQUIÁTRICO", "NÃO INFORMADO"];
const CLASSIFICACAO_MOTIVOS = {
  "CLÍNICO": ["ALERGIA", "APOIO À UNIDADE", "ARRITMIA", "AVC", "CONSTATAÇÃO DE ÓBITO", "CRISE CONVULSIVA", "CRISE HIPERTENSIVA", "CEFALÉIA", "COMA METABÓLICO", "DESNUTRIÇÃO/DESIDRATAÇÃO", "DISPNEIA/CIANOSE", "DOR AGUDA", "DOR TORÁCICA", "DOR ABDOMINAL", "DOR CRÔNICA", "DIARRÉIA/VÔMITOS", "DPOC EXACERBADO", "HEMORRAGIA DIGESTIVA", "HIPO/HIPERGLICEMIA", "EDEMA/ANASARCA", "DIABETES", "FEBRE", "FERIDAS", "IAM (PROTOCOLO SUPRA)", "IAM", "INFECÇÃO/SEPSE", "INSUFICIÊNCIA RENAL", "INSUFICIÊNCIA CARDÍACA", "MAL ESTAR GERAL", "NEOPLASIA", "PACIENTE PALIATIVO", "PARADA CARDIORESPIRATÓRIA (PCR)", "SANGRAMENTO", "SINCOPE/DESMAIO", "TONTURA/VERTIGEM", "OUTROS"],
  "CAUSA EXTERNA": ["ACIDENTE ANIMAL PEÇONHENTO", "ACIDENTE PRODUTO TÓXICO", "ACIDENTE DE TRABALHO", "ACIDENTE COM MÚLTIPLAS VÍTIMAS", "ACIDENTE DE MOTO", "AFOGAMENTO", "AGRESSÃO FÍSICA", "AGRESSÃO POR ANIMAL", "ATROPELAMENTO", "CAPOTAMENTO", "CHOQUE ELÉTRICO", "COLISÃO MOTOXMOTO", "COLISÃO MOTOXCARRO", "COLISÃO MOTOXCAMINHÃO", "COLISÃO CARROXCARRO", "COLISÃO CARROXCAMINHÃO", "COLISÃO CAMINHÃO", "COLISÃO ÔNIBUS", "DESABAMENTO/SOTERRAMENTO", "ENFORCAMENTO", "ENGASGO", "ENTORSE/LUXAÇÃO", "EXPLOSÃO", "FERIMENTO CONTUSO", "FERIMENTO POR ARMA BRANCA", "FERIMENTO POR ARMA DE FOGO", "INTOXICAÇÃO EXÓGENA", "POLITRAUMA", "QUEDA", "QUEDA PRÓPRIA ALTURA", "QUEDA DE ALTURA", "QUEIMADURA", "SUICÍDIO/TENTATIVA", "VÍTIMA DE ABUSO SEXUAL", "VIOLÊNCIA DOMÉSTICA", "OUTROS"],
  "PEDIÁTRICO": ["ALERGIA", "CRISE ASMÁTICA", "CRISE CONVULSIVA", "DISPNEIA", "DESIDRATAÇÃO/DESNUTRIÇÃO", "FEBRE", "INTOXICAÇÃO EXÓGENA", "INFECÇÃO/SEPSE", "MENINGITE", "NÁUSEAS/VÔMITOS", "OBSTRUÇÃO DE VIAS AÉREAS", "ÓBITO", "SINCOPE/DESMAIO", "TRANSPORTE RN", "OUTROS"],
  "CIRÚRGICO": ["AVALIAÇÃO CIRÚRGICA", "ABDOME AGUDO", "ANEURISMA ROTO", "COMPLICAÇÕES PÓS-OPERATÓRIA", "LESÃO VASCULAR", "TEP", "OBSTRUÇÃO ARTERIAL", "QUEIXA UROLÓGICA", "OUTROS"],
  "GINECO/OBSTÉTRICO": ["TRABALHO DE PARTO", "TRABALHO DE PARTO PREMATURO", "HEMORRAGIA PUERPERAL", "ECLAMPSIA/PRÉ-ECLAMPSIA", "ABORTAMENTO", "GRAVIDEZ ECTÓPICA ROTA", "DOR PÉLVICA AGUDA", "SANGRAMENTO VAGINAL", "OUTROS"],
  "PSIQUIÁTRICO": ["SURTO PSICÓTICO", "ABUSO DE ÁLCOOL", "ABUSO DE DROGAS", "IDEAÇÃO/TENTATIVA SUICIDA", "CRISE DE ANSIEDADE/PÂNICO", "AGITAÇÃO PSICOMOTORA", "DEPRESSÃO GRAVE", "OUTROS"],
  "NÃO INFORMADO": ["NÃO INFORMADO"],
};
const CATEGORIAS_ESPECIAIS = ["Óbito SVO", "Óbito IML", "TROTE", "Orientação Médica", "Ocorrências Canceladas", "Masculino", "Feminino"];

const PAPEIS = [
  { key: "tarm", label: "TARM", icon: PhoneCall, desc: "Captação da chamada" },
  { key: "regulacao", label: "Regulação médica", icon: Stethoscope, desc: "Classificação e conduta" },
  { key: "frota", label: "Operação de frota", icon: Truck, desc: "Despacho de viaturas" },
  { key: "gestao", label: "Gestão", icon: LayoutDashboard, desc: "KPIs e relatórios" },
];

function agora() { return new Date(); }
function fmtHora(dt) { if (!dt) return "—"; return new Date(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function fmtData(dt) { if (!dt) return "—"; return new Date(dt).toLocaleDateString("pt-BR"); }
function fmtDataHora(dt) { if (!dt) return "—"; const d = new Date(dt); return `${fmtData(d)} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`; }
function fmtDecorrido(inicio, fim) {
  if (!inicio) return "—";
  const ms = (fim ? new Date(fim) : new Date()) - new Date(inicio);
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}min ${String(s % 60).padStart(2, "0")}s`;
}
function passaFiltroData(dt, filtro) {
  if (!filtro.dia && !filtro.mes && !filtro.ano) return true;
  const d = new Date(dt);
  if (filtro.dia && d.getDate() !== Number(filtro.dia)) return false;
  if (filtro.mes && d.getMonth() + 1 !== Number(filtro.mes)) return false;
  if (filtro.ano && d.getFullYear() !== Number(filtro.ano)) return false;
  return true;
}
function mesmaData(a, b) { const x = new Date(a), y = new Date(b); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate(); }
function mesmoMes(a, b) { const x = new Date(a), y = new Date(b); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth(); }
function valorOutro(valor, outro) { return valor === "OUTROS" ? (outro?.trim() || "OUTROS (não especificado)") : valor; }
function listaVeiculosTexto(despacho) {
  if (!despacho?.veiculoId) return "";
  return [despacho.veiculoId, ...(despacho.veiculosExtras || [])].filter(Boolean).join(" + ");
}

/* resumo textual de origem/destino conforme tipo de atendimento */
function enderecoResumo(tarm) {
  const isTransporte = tarm.tipoAtendimento?.includes("TRANSPORTE");
  const isResgate = tarm.tipoAtendimento?.includes("RESGATE");
  if (isTransporte || isResgate) {
    const origem = valorOutro(tarm.origem, tarm.origemOutro);
    const destino = valorOutro(tarm.destino, tarm.destinoOutro);
    let s = `Origem: ${origem || "—"}`;
    if (tarm.municipio) s += ` (${tarm.municipio})`;
    if (tarm.destino) s += ` → Destino: ${destino}`;
    if (tarm.aih) s += ` · AIH/Enc.: ${tarm.aih}`;
    return s;
  }
  return `${tarm.endereco} — ${tarm.bairro}, ${tarm.municipio}`;
}

/* ============================================================
   COMPONENTES DE APOIO
   ============================================================ */
function PrioridadeChip({ cls }) {
  const p = PRIORIDADES.find((x) => x.key === cls);
  if (!p) return <span style={{ color: COLORS.textFaint, fontSize: 13 }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 4, fontSize: 12, fontFamily: FONT_MONO, letterSpacing: 0.5, textTransform: "uppercase", background: p.color + "1E", color: p.color, border: `1px solid ${p.color}66`, fontWeight: 700 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
      {p.label.split("—")[0].trim()}
    </span>
  );
}
function StatusChip({ status }) {
  const map = { aguardando_regulacao: COLORS.amarelo, em_regulacao: COLORS.accent2, aguardando_veiculo: COLORS.accent, despachado: COLORS.azul, em_atendimento: COLORS.verde, concluido: COLORS.textFaint, orientacao_dada: COLORS.textFaint, cancelado: COLORS.vermelho };
  const c = map[status] || COLORS.textFaint;
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 3, fontSize: 11.5, fontFamily: FONT_MONO, letterSpacing: 0.4, textTransform: "uppercase", color: c, border: `1px solid ${c}77`, background: c + "16", fontWeight: 700 }}>{STATUS_LABEL[status] || status}</span>;
}
function TipoAtendimentoTags({ tipos }) {
  if (!tipos || tipos.length === 0) return null;
  return <span style={{ display: "inline-flex", gap: 4 }}>{tipos.map((t) => <span key={t} style={{ fontSize: 10.5, fontFamily: FONT_MONO, padding: "2px 7px", borderRadius: 3, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, color: COLORS.accent2, fontWeight: 700 }}>{t}</span>)}</span>;
}
function VeiculoIcon({ tipo }) { if (tipo === "MOTOLANCIA") return <Bike size={15} />; if (tipo === "VIR") return <Navigation size={15} />; return <Truck size={15} />; }

function Panel({ title, icon: Icon, right, children, style }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 8, boxShadow: "0 1px 3px rgba(20,23,31,0.06)", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${COLORS.line}`, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {Icon && <Icon size={17} color={COLORS.accent2} />}
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, letterSpacing: 0.5, textTransform: "uppercase", color: COLORS.text, fontWeight: 700 }}>{title}</span>
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 13 }}>
      <span style={{ display: "block", fontSize: 12.5, color: COLORS.textDim, marginBottom: 5, fontFamily: FONT_BODY, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
      {children}
    </label>
  );
}
const inputStyle = { width: "100%", boxSizing: "border-box", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 5, color: COLORS.text, padding: "9px 11px", fontSize: 14, fontFamily: FONT_BODY, outline: "none" };
const smallSelectStyle = { ...inputStyle, width: "auto", padding: "6px 8px", fontSize: 12.5 };

function SelecaoCancelamento({ motivo, setMotivo, outro, setOutro }) {
  return (
    <>
      <Field label="Motivo do cancelamento">
        <select style={inputStyle} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
          <option value="">Selecionar</option>
          {MOTIVOS_CANCELAMENTO_ATENDIMENTO.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      {motivo === "OUTROS" && (
        <Field label="Descreva o motivo">
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={outro} onChange={(e) => setOutro(e.target.value)} placeholder="Descreva o motivo do cancelamento" />
        </Field>
      )}
    </>
  );
}


function CampoComOutros({ label, opcoes, valor, onChange, outro, onChangeOutro, placeholderOutro }) {
  return (
    <>
      <Field label={label}>
        <select style={inputStyle} value={valor} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecionar</option>
          {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
      {valor === "OUTROS" && (
        <Field label={`Especifique — ${label}`}>
          <input style={inputStyle} value={outro} onChange={(e) => onChangeOutro(e.target.value)} placeholder={placeholderOutro || "Especifique"} />
        </Field>
      )}
    </>
  );
}

function Btn({ children, onClick, kind = "default", small, disabled, style, type }) {
  const kinds = {
    default: { bg: COLORS.panel2, color: COLORS.text, border: COLORS.line },
    accent: { bg: COLORS.accent, color: "#FFFFFF", border: COLORS.accent },
    outline: { bg: "transparent", color: COLORS.accent2, border: COLORS.accent2 },
    ghost: { bg: "transparent", color: COLORS.textDim, border: "transparent" },
  };
  const k = kinds[kind];
  return (
    <button type={type || "button"} onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6, cursor: disabled ? "not-allowed" : "pointer",
      background: k.bg, color: k.color, border: `1px solid ${k.border}`, borderRadius: 5,
      padding: small ? "6px 11px" : "9px 15px", fontSize: small ? 12.5 : 14, fontFamily: FONT_BODY,
      fontWeight: 700, opacity: disabled ? 0.45 : 1, transition: "filter .15s", ...style,
    }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = "brightness(0.95)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >{children}</button>
  );
}
function ClockBadge({ now }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ position: "relative", display: "inline-flex", width: 9, height: 9 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: COLORS.verde, animation: "pulse-ring 1.6s ease-out infinite" }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: COLORS.verde }} />
      </span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 14, color: COLORS.textDim, letterSpacing: 0.3, fontWeight: 600 }}>{fmtData(now)} — {now.toLocaleTimeString("pt-BR")}</span>
    </div>
  );
}
const MESES = [[1, "Jan"], [2, "Fev"], [3, "Mar"], [4, "Abr"], [5, "Mai"], [6, "Jun"], [7, "Jul"], [8, "Ago"], [9, "Set"], [10, "Out"], [11, "Nov"], [12, "Dez"]];
function FiltroDataBar({ filtro, setFiltro }) {
  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual, anoAtual - 1, anoAtual - 2];
  const ativo = filtro.dia || filtro.mes || filtro.ano;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Filter size={13} color={COLORS.textFaint} />
      <select value={filtro.dia} onChange={(e) => setFiltro((f) => ({ ...f, dia: e.target.value }))} style={smallSelectStyle}>
        <option value="">Dia</option>{Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={filtro.mes} onChange={(e) => setFiltro((f) => ({ ...f, mes: e.target.value }))} style={smallSelectStyle}>
        <option value="">Mês</option>{MESES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select value={filtro.ano} onChange={(e) => setFiltro((f) => ({ ...f, ano: e.target.value }))} style={smallSelectStyle}>
        <option value="">Ano</option>{anos.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      {ativo && <Btn small kind="ghost" onClick={() => setFiltro({ dia: "", mes: "", ano: "" })}>Limpar</Btn>}
    </div>
  );
}

/* ============================================================
   MODAL DE OCORRÊNCIA (visão completa / auditoria)
   ============================================================ */
function OcorrenciaModal({ oc, onClose }) {
  if (!oc) return null;
  const isT = oc.tarm.tipoAtendimento?.includes("TRANSPORTE");
  const isR = oc.tarm.tipoAtendimento?.includes("RESGATE");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,23,31,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose} className="no-print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; max-height: none !important; overflow: visible !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} className="print-area" style={{ width: "min(760px, 100%)", maxHeight: "88vh", overflowY: "auto", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${COLORS.line}` }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.accent2, fontWeight: 700 }}>Nº DE CONTROLE {oc.numeroControle}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: COLORS.text, textTransform: "uppercase" }}>{oc.tarm.queixa}</div>
            <div style={{ fontSize: 12.5, color: COLORS.textFaint, marginTop: 2 }}>Aberta em {fmtDataHora(oc.criadoEm)}</div>
          </div>
          <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Btn small kind="outline" onClick={() => window.print()}><Printer size={14} /> Imprimir</Btn>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.textDim, cursor: "pointer" }}><X size={22} /></button>
          </div>
        </div>
        <div style={{ padding: 20, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatusChip status={oc.status} /><PrioridadeChip cls={oc.regulacao?.classificacao} /><TipoAtendimentoTags tipos={oc.tarm.tipoAtendimento} />
            {oc.obito && <span style={{ fontSize: 12, fontFamily: FONT_MONO, padding: "3px 9px", borderRadius: 4, background: COLORS.vermelho + "1E", color: COLORS.vermelho, border: `1px solid ${COLORS.vermelho}66`, fontWeight: 700 }}>ÓBITO {oc.obito}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
            <div><span style={{ color: COLORS.textDim }}>Solicitante:</span> {oc.tarm.solicitante}</div>
            <div><span style={{ color: COLORS.textDim }}>Telefone:</span> {oc.tarm.telefone}</div>
            {(isT || isR) ? (
              <>
                <div><span style={{ color: COLORS.textDim }}>Unidade Origem:</span> {valorOutro(oc.tarm.origem, oc.tarm.origemOutro) || "—"}</div>
                <div><span style={{ color: COLORS.textDim }}>Município:</span> {oc.tarm.municipio || "—"}</div>
                <div><span style={{ color: COLORS.textDim }}>Unidade Destino:</span> {valorOutro(oc.tarm.destino, oc.tarm.destinoOutro) || "—"}</div>
                <div><span style={{ color: COLORS.textDim }}>Nº AIH/Encaminhamento:</span> {oc.tarm.aih || "—"}</div>
                {isT && <div><span style={{ color: COLORS.textDim }}>Tipo de Leito:</span> {oc.tarm.tipoLeito || "—"}</div>}
              </>
            ) : (
              <>
                <div style={{ gridColumn: "1 / -1" }}><span style={{ color: COLORS.textDim }}>Endereço:</span> {oc.tarm.endereco} — {oc.tarm.bairro}, {oc.tarm.municipio}</div>
                <div><span style={{ color: COLORS.textDim }}>Referência:</span> {oc.tarm.referencia}</div>
                {oc.tarm.origemLigacao && <div><span style={{ color: COLORS.textDim }}>Origem da ligação:</span> {valorOutro(oc.tarm.origemLigacao, oc.tarm.origemLigacaoOutro)}</div>}
              </>
            )}
            <div><span style={{ color: COLORS.textDim }}>TARM:</span> {oc.tarm.operador}</div>
            <div><span style={{ color: COLORS.textDim }}>Paciente:</span> {oc.tarm.nomePaciente}</div>
            <div><span style={{ color: COLORS.textDim }}>Idade / sexo:</span> {oc.tarm.idade} {oc.tarm.idadeUnidade === "meses" ? "meses" : "anos"} — {oc.tarm.sexo}</div>
          </div>

          {oc.status === "cancelado" && oc.justificativaCancelamento && (
            <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: "uppercase", color: COLORS.vermelho, marginBottom: 6, fontWeight: 700 }}>Ocorrência cancelada</div>
              <div style={{ fontSize: 14 }}><span style={{ color: COLORS.textDim }}>Justificativa:</span> {oc.justificativaCancelamento}</div>
            </div>
          )}

          {oc.regulacao?.medico && (
            <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 6, fontWeight: 700 }}>Regulação médica</div>
              <div style={{ fontSize: 14, display: "grid", gap: 5 }}>
                <div><span style={{ color: COLORS.textDim }}>Médico regulador:</span> {oc.regulacao.medico}</div>
                {oc.regulacao.avaliacao && <div><span style={{ color: COLORS.textDim }}>Avaliação médica:</span> {oc.regulacao.avaliacao}</div>}
                {oc.regulacao.tipoClassificacao && <div><span style={{ color: COLORS.textDim }}>Classificação da ocorrência:</span> {oc.regulacao.tipoClassificacao} — {valorOutro(oc.regulacao.motivoClassificacao, oc.regulacao.motivoClassificacaoOutro)}</div>}
                <div><span style={{ color: COLORS.textDim }}>Conduta / viatura indicada:</span> {CONDUTAS_MEDICAS.find((c) => c.key === oc.regulacao.conduta)?.label || oc.regulacao.conduta}</div>
                {oc.regulacao.unidadeDestino && <div><span style={{ color: COLORS.textDim }}>Unidade Destino (regulação):</span> {valorOutro(oc.regulacao.unidadeDestino, oc.regulacao.unidadeDestinoOutro)}</div>}
                {oc.regulacao.contraRegulacao && <div><span style={{ color: COLORS.textDim }}>Contra-regulação:</span> {oc.regulacao.contraRegulacao}</div>}
                <div><span style={{ color: COLORS.textDim }}>Tempo de regulação:</span> {fmtDecorrido(oc.regulacao.inicioRegulacao, oc.regulacao.fimRegulacao)}</div>
              </div>
            </div>
          )}

          {oc.despacho?.veiculoId && (
            <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 6, fontWeight: 700 }}>Despacho de viatura(s)</div>
              <div style={{ fontSize: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontFamily: FONT_MONO }}>
                <div>Viatura principal: <span style={{ color: COLORS.text }}>{oc.despacho.veiculoId}</span></div>
                <div>Destino: <span style={{ color: COLORS.text }}>{oc.despacho.destino || "—"}</span></div>
                {oc.despacho.veiculosExtras?.length > 0 && <div style={{ gridColumn: "1 / -1" }}>Viaturas adicionais: {oc.despacho.veiculosExtras.join(", ")}</div>}
                <div>Acionamento: {fmtHora(oc.despacho.acionamento)}</div>
                <div>Saída da base: {fmtHora(oc.despacho.saidaBase)}</div>
                <div>Chegada ao local: {fmtHora(oc.despacho.chegadaLocal)}</div>
                <div>Saída do local: {fmtHora(oc.despacho.saidaLocal)}</div>
                <div>Chegada ao destino: {fmtHora(oc.despacho.chegadaDestino)}</div>
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8, fontWeight: 700 }}>Histórico / auditoria</div>
            <div style={{ display: "grid", gap: 8 }}>
              {oc.historico.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                  <span style={{ fontFamily: FONT_MONO, color: COLORS.textFaint, minWidth: 82 }}>{fmtHora(h.ts)}</span>
                  <span style={{ color: COLORS.accent2, minWidth: 76, fontWeight: 700 }}>{h.autor}</span>
                  <span style={{ color: COLORS.text }}>{h.evento}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TELA DE LOGIN
   ============================================================ */
function LoginScreen({ modoRecuperacao }) {
  const [aba, setAba] = useState("entrar"); // entrar | recuperar
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  async function tentarEntrar() {
    if (!email.trim() || !senha) { setErro("Informe e-mail e senha."); return; }
    setCarregando(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) { setErro("E-mail ou senha inválidos."); return; }
    // A sessão é detectada automaticamente pelo App (onAuthStateChange).
  }

  async function enviarRecuperacao() {
    if (!email.trim()) { setErro("Informe o e-mail cadastrado."); return; }
    setCarregando(true); setErro(""); setSucesso("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setCarregando(false);
    if (error) { setErro("Não foi possível enviar o e-mail. Tente novamente."); return; }
    setSucesso("Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha. Verifique também a caixa de spam.");
  }

  async function confirmarNovaSenha() {
    if (novaSenha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmaSenha) { setErro("As senhas não conferem."); return; }
    setCarregando(true); setErro("");
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setCarregando(false);
    if (error) { setErro("Não foi possível salvar a nova senha. Peça um novo link."); return; }
    setSucesso("Senha atualizada! Você já pode fechar esta mensagem e usar o sistema.");
  }

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 50% -10%, #E8EEF3 0%, ${COLORS.bg} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_BODY, color: COLORS.text, padding: 20 }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes fade-up { 0% { opacity: 0; transform: translateY(10px);} 100% { opacity: 1; transform: translateY(0);} }
      `}</style>
      <div style={{ width: "min(440px, 100%)", animation: "fade-up .5s ease" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26, textAlign: "center" }}>
          <div style={{ width: 62, height: 62, borderRadius: 16, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, boxShadow: `0 0 0 6px ${COLORS.accent}22` }}>
            <Siren size={32} color="#FFFFFF" />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, letterSpacing: 0.8, textTransform: "uppercase", lineHeight: 1.15 }}>Central de Regulação<br />SAMU 192 Centro Sul</div>
          <div style={{ fontSize: 13.5, color: COLORS.textFaint, marginTop: 6, letterSpacing: 0.3 }}>Acesso restrito por função — TARM · Regulação médica · Frota · Gestão</div>
        </div>
        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 18px rgba(20,23,31,0.08)" }}>
          <div style={{ padding: "13px 0", textAlign: "center", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.panel2 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, color: COLORS.text }}>
              <Lock size={14} /> {modoRecuperacao ? "Definir nova senha" : aba === "entrar" ? "Entrar" : "Recuperar senha"}
            </span>
          </div>
          <div style={{ padding: 22 }}>
            {modoRecuperacao ? (
              <>
                <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 0 }}>Você clicou em um link de redefinição de senha. Escolha sua nova senha abaixo.</p>
                <Field label="Nova senha"><input type="password" style={inputStyle} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="mínimo 6 caracteres" /></Field>
                <Field label="Confirme a nova senha"><input type="password" style={inputStyle} value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} placeholder="repita a senha" onKeyDown={(e) => e.key === "Enter" && confirmarNovaSenha()} /></Field>
                {erro && <div style={{ color: COLORS.vermelho, fontSize: 13, marginBottom: 10 }}>{erro}</div>}
                {sucesso && <div style={{ color: COLORS.verde, fontSize: 13, marginBottom: 10 }}>{sucesso}</div>}
                <Btn kind="accent" onClick={confirmarNovaSenha} disabled={carregando} style={{ width: "100%", justifyContent: "center" }}>{carregando ? "Salvando..." : "Salvar nova senha"}</Btn>
              </>
            ) : aba === "entrar" ? (
              <>
                <Field label="E-mail"><input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" onKeyDown={(e) => e.key === "Enter" && tentarEntrar()} /></Field>
                <Field label="Senha"><input type="password" style={inputStyle} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" onKeyDown={(e) => e.key === "Enter" && tentarEntrar()} /></Field>
                {erro && <div style={{ color: COLORS.vermelho, fontSize: 13, marginBottom: 10 }}>{erro}</div>}
                <Btn kind="accent" onClick={tentarEntrar} disabled={carregando} style={{ width: "100%", justifyContent: "center" }}><KeyRound size={16} /> {carregando ? "Verificando..." : "Acessar minha função"}</Btn>
                <button onClick={() => { setAba("recuperar"); setErro(""); setSucesso(""); }} style={{ background: "transparent", border: "none", color: COLORS.accent2, fontSize: 12.5, marginTop: 14, cursor: "pointer", textDecoration: "underline", display: "block", textAlign: "center", width: "100%" }}>Esqueci minha senha</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: COLORS.textDim, marginTop: 0 }}>Informe o e-mail cadastrado — vamos enviar um link para você redefinir a senha.</p>
                <Field label="E-mail"><input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" onKeyDown={(e) => e.key === "Enter" && enviarRecuperacao()} /></Field>
                {erro && <div style={{ color: COLORS.vermelho, fontSize: 13, marginBottom: 10 }}>{erro}</div>}
                {sucesso && <div style={{ color: COLORS.verde, fontSize: 13, marginBottom: 10 }}>{sucesso}</div>}
                <Btn kind="accent" onClick={enviarRecuperacao} disabled={carregando} style={{ width: "100%", justifyContent: "center" }}>{carregando ? "Enviando..." : "Enviar link de redefinição"}</Btn>
                <button onClick={() => { setAba("entrar"); setErro(""); setSucesso(""); }} style={{ background: "transparent", border: "none", color: COLORS.textFaint, fontSize: 12.5, marginTop: 14, cursor: "pointer", textDecoration: "underline", display: "block", textAlign: "center", width: "100%" }}>Voltar para o login</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: TARM
   ============================================================ */
function TarmView({ ocorrencias, onNovaOcorrencia, onCancelarOcorrencia, now }) {
  const [form, setForm] = useState({
    tipoAtendimento: [], solicitante: "", telefone: "", endereco: "", bairro: "", municipio: "",
    referencia: "", origem: "", origemOutro: "", destino: "", destinoOutro: "", aih: "", tipoLeito: "",
    origemLigacao: "", origemLigacaoOutro: "",
    nomePaciente: "", idade: "", idadeUnidade: "anos", sexo: "", queixa: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [outroTexto, setOutroTexto] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isTransporte = form.tipoAtendimento.includes("TRANSPORTE");
  const isResgate = form.tipoAtendimento.includes("RESGATE") && !isTransporte;
  const modoUnidades = isTransporte || isResgate;

  function toggleTipo(t) { setForm((f) => ({ ...f, tipoAtendimento: f.tipoAtendimento.includes(t) ? [] : [t] })); }
  const fila = ocorrencias.filter((o) => o.status === "aguardando_regulacao").sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));

  function limparForm() {
    setForm({ tipoAtendimento: [], solicitante: "", telefone: "", endereco: "", bairro: "", municipio: "", referencia: "", origem: "", origemOutro: "", destino: "", destinoOutro: "", aih: "", tipoLeito: "", origemLigacao: "", origemLigacaoOutro: "", nomePaciente: "", idade: "", idadeUnidade: "anos", sexo: "", queixa: "" });
  }
  function submeter() {
    const enderecoValido = modoUnidades ? form.origem : form.endereco;
    if (!form.solicitante || !enderecoValido || !form.queixa || form.tipoAtendimento.length === 0) return;
    onNovaOcorrencia(form);
    limparForm(); setEnviado(true); setTimeout(() => setEnviado(false), 2200);
  }
  function confirmarCancelamento() {
    const justificativaFinal = motivoCancelamento === "OUTROS" ? outroTexto.trim() : motivoCancelamento;
    if (!motivoCancelamento || (motivoCancelamento === "OUTROS" && !outroTexto.trim())) return;
    onCancelarOcorrencia(form, justificativaFinal, motivoCancelamento);
    limparForm(); setMotivoCancelamento(""); setOutroTexto(""); setCancelando(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      <Panel title="Ocorrências aguardando regulação médica" icon={ClipboardList} right={<span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.amarelo, fontWeight: 700 }}>{fila.length} aguardando</span>}>
        <div style={{ display: "grid", gap: 9 }}>
          {fila.map((oc) => (
            <div key={oc.id} style={{ padding: "11px 13px", background: COLORS.panel2, borderRadius: 5, border: `1px solid ${COLORS.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 800, color: COLORS.accent2 }}>Nº {oc.numeroControle}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 1 }}>aberta em {fmtDataHora(oc.criadoEm)}</div>
                  <div style={{ fontSize: 14.5, marginTop: 4 }}>{oc.tarm.queixa}</div>
                  <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 2 }}><User size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{oc.tarm.nomePaciente || "Paciente não informado"}</div>
                  <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 2 }}><MapPin size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{enderecoResumo(oc.tarm)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <TipoAtendimentoTags tipos={oc.tarm.tipoAtendimento} />
                  <span style={{ fontSize: 12, color: COLORS.amarelo, fontFamily: FONT_MONO, fontWeight: 700 }}>aguardando há {fmtDecorrido(oc.criadoEm)}</span>
                </div>
              </div>
            </div>
          ))}
          {fila.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14 }}>Nenhuma ocorrência aguardando regulação médica.</div>}
        </div>
      </Panel>

      <Panel title="Captação de chamada" icon={PhoneCall}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "9px 11px", background: COLORS.panel2, borderRadius: 5, border: `1px solid ${COLORS.line}` }}>
          <span style={{ fontSize: 12.5, color: COLORS.textDim, fontWeight: 600 }}>Abertura da ocorrência</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 13.5, color: COLORS.accent2, fontWeight: 700 }}>{fmtData(now)} · {now.toLocaleTimeString("pt-BR")}</span>
        </div>

        <Field label="Tipo de atendimento">
          <div style={{ display: "flex", gap: 6 }}>
            {TIPOS_ATENDIMENTO.map((t) => (
              <button key={t} onClick={() => toggleTipo(t)} type="button" style={{ flex: 1, padding: "9px 4px", borderRadius: 5, cursor: "pointer", fontSize: 13, fontFamily: FONT_MONO, letterSpacing: 0.4, background: form.tipoAtendimento.includes(t) ? COLORS.accent : COLORS.panel, color: form.tipoAtendimento.includes(t) ? "#FFFFFF" : COLORS.textDim, border: `1px solid ${form.tipoAtendimento.includes(t) ? COLORS.accent : COLORS.line}`, fontWeight: 700 }}>{t}</button>
            ))}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Nome do solicitante"><input style={inputStyle} value={form.solicitante} onChange={set("solicitante")} placeholder="Nome completo" /></Field>
          <Field label="Telefone de contato"><input style={inputStyle} value={form.telefone} onChange={set("telefone")} placeholder="(62) 90000-0000" /></Field>
        </div>

        {!modoUnidades && (
          <Field label="Endereço da ocorrência"><input style={inputStyle} value={form.endereco} onChange={set("endereco")} placeholder="Rua, número" /></Field>
        )}

        {modoUnidades && (
          <CampoComOutros label="Unidade Origem" opcoes={UNIDADES_ORIGEM} valor={form.origem} onChange={(v) => setForm((f) => ({ ...f, origem: v }))} outro={form.origemOutro} onChangeOutro={(v) => setForm((f) => ({ ...f, origemOutro: v }))} placeholderOutro="Unidade/hospital de origem" />
        )}

        {modoUnidades && (
          <Field label="Município"><select style={inputStyle} value={form.municipio} onChange={set("municipio")}><option value="">Selecionar</option>{MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
        )}

        {modoUnidades && (
          <CampoComOutros label="Unidade Destino" opcoes={UNIDADES_DESTINO} valor={form.destino} onChange={(v) => setForm((f) => ({ ...f, destino: v }))} outro={form.destinoOutro} onChangeOutro={(v) => setForm((f) => ({ ...f, destinoOutro: v }))} placeholderOutro="Unidade/hospital de destino" />
        )}

        {modoUnidades && isTransporte && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Número de AIH/Encaminhamento"><input style={inputStyle} value={form.aih} onChange={set("aih")} placeholder="Nº da AIH ou encaminhamento" /></Field>
            <Field label="Tipo de Leito"><select style={inputStyle} value={form.tipoLeito} onChange={set("tipoLeito")}><option value="">Selecionar</option>{TIPOS_LEITO.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          </div>
        )}
        {modoUnidades && !isTransporte && (
          <Field label="Número de AIH/Encaminhamento"><input style={inputStyle} value={form.aih} onChange={set("aih")} placeholder="Nº da AIH ou encaminhamento" /></Field>
        )}

        {!modoUnidades && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Bairro"><input style={inputStyle} value={form.bairro} onChange={set("bairro")} placeholder="Bairro" /></Field>
              <Field label="Município"><select style={inputStyle} value={form.municipio} onChange={set("municipio")}><option value="">Selecionar</option>{MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Ponto de referência"><input style={inputStyle} value={form.referencia} onChange={set("referencia")} placeholder="Próximo a..." /></Field>
              <Field label="Origem da ligação"><select style={inputStyle} value={form.origemLigacao} onChange={set("origemLigacao")}><option value="">Selecionar</option>{ORIGEM_LIGACAO.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
            </div>
            {form.origemLigacao === "OUTROS" && <Field label="Especifique — Origem da ligação"><input style={inputStyle} value={form.origemLigacaoOutro} onChange={set("origemLigacaoOutro")} placeholder="Especifique a origem da ligação" /></Field>}
          </>
        )}

        <Field label="Nome do paciente"><input style={inputStyle} value={form.nomePaciente} onChange={set("nomePaciente")} placeholder="Nome completo do paciente" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Idade">
            <div style={{ display: "flex", gap: 6 }}>
              <input type="number" min={0} style={{ ...inputStyle, flex: 1 }} value={form.idade} onChange={set("idade")} placeholder="valor" />
              <select style={{ ...inputStyle, width: 110 }} value={form.idadeUnidade} onChange={set("idadeUnidade")}>
                <option value="anos">Anos</option>
                <option value="meses">Meses</option>
              </select>
            </div>
          </Field>
          <Field label="Sexo"><select style={inputStyle} value={form.sexo} onChange={set("sexo")}><option value="">Selecionar</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Não informado">Não informado</option></select></Field>
        </div>
        <Field label="Queixa principal / natureza da ocorrência"><textarea style={{ ...inputStyle, minHeight: 74, resize: "vertical" }} value={form.queixa} onChange={set("queixa")} placeholder="Descreva o relato do solicitante" /></Field>

        <Btn kind="accent" onClick={submeter} style={{ width: "100%", justifyContent: "center" }}><ArrowRight size={16} /> Enviar para regulação médica</Btn>
        {enviado && <div style={{ marginTop: 10, fontSize: 13.5, color: COLORS.verde, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}><CheckCircle2 size={15} /> Ocorrência enviada em tempo real ao médico regulador.</div>}

        {!cancelando && <Btn kind="outline" onClick={() => setCancelando(true)} style={{ width: "100%", justifyContent: "center", marginTop: 10, color: COLORS.vermelho, borderColor: COLORS.vermelho }}><X size={16} /> Cancelar Ocorrência</Btn>}

        {cancelando && (
          <div style={{ marginTop: 10, padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.vermelho}55`, borderRadius: 6 }}>
            <Field label="Justificativa do cancelamento">
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {MOTIVOS_CANCELAMENTO.map((m) => (
                  <button key={m} type="button" onClick={() => setMotivoCancelamento(m)} style={{ flex: "0 0 auto", whiteSpace: "nowrap", padding: "9px 13px", borderRadius: 5, cursor: "pointer", fontSize: 12.5, fontFamily: FONT_MONO, letterSpacing: 0.3, background: motivoCancelamento === m ? COLORS.vermelho : COLORS.panel, color: motivoCancelamento === m ? "#fff" : COLORS.textDim, border: `1px solid ${motivoCancelamento === m ? COLORS.vermelho : COLORS.line}`, fontWeight: 700 }}>{m}</button>
                ))}
              </div>
            </Field>
            {motivoCancelamento === "OUTROS" && <Field label="Descreva o motivo"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={outroTexto} onChange={(e) => setOutroTexto(e.target.value)} placeholder="Descreva o motivo do cancelamento" /></Field>}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small kind="ghost" onClick={() => { setCancelando(false); setMotivoCancelamento(""); setOutroTexto(""); }}>Voltar</Btn>
              <Btn small onClick={confirmarCancelamento} disabled={!motivoCancelamento || (motivoCancelamento === "OUTROS" && !outroTexto.trim())} style={{ background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}`, flex: 1, justifyContent: "center" }}><CheckCircle2 size={14} /> Confirmar cancelamento</Btn>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ============================================================
   VIEW: REGULAÇÃO MÉDICA
   ============================================================ */
function RegulacaoView({ ocorrencias, sessao, onRegular, onAbrir, onContraRegulacao, onAlterarClassificacao, onAlterarViatura, onAdicionarInfoComplementar, onCancelarRegulada, onDefinirUnidadeDestino }) {
  const fila = ocorrencias.filter((o) => o.status === "aguardando_regulacao").sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
  const emCurso = ocorrencias.filter((o) => ["aguardando_veiculo", "despachado", "em_atendimento"].includes(o.status));
  const [ativa, setAtiva] = useState(null);
  const [avaliacao, setAvaliacao] = useState("");
  const [tipoClass, setTipoClass] = useState("");
  const [motivoClass, setMotivoClass] = useState("");
  const [motivoClassOutro, setMotivoClassOutro] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [conduta, setConduta] = useState("");
  const [cancelandoAtiva, setCancelandoAtiva] = useState(false);
  const [motivoCancelAtiva, setMotivoCancelAtiva] = useState("");
  const [motivoCancelAtivaOutro, setMotivoCancelAtivaOutro] = useState("");

  const [reguladaId, setReguladaId] = useState(null);
  const regulada = reguladaId ? ocorrencias.find((o) => o.id === reguladaId) || null : null;
  const [acao, setAcao] = useState(null);
  const [contraTexto, setContraTexto] = useState("");
  const [novaClassificacao, setNovaClassificacao] = useState("");
  const [novaConduta, setNovaConduta] = useState("");
  const [infoTexto, setInfoTexto] = useState("");
  const [motivoCancelRegulada, setMotivoCancelRegulada] = useState("");
  const [motivoCancelReguladaOutro, setMotivoCancelReguladaOutro] = useState("");
  const [novaUnidadeDestino, setNovaUnidadeDestino] = useState("");
  const [novaUnidadeDestinoOutro, setNovaUnidadeDestinoOutro] = useState("");

  function abrirRegulacao(oc) {
    setAtiva(oc); setAvaliacao(""); setTipoClass(""); setMotivoClass(""); setMotivoClassOutro(""); setClassificacao(""); setConduta("");
    setCancelandoAtiva(false); setMotivoCancelAtiva(""); setMotivoCancelAtivaOutro("");
    setReguladaId(null); setAcao(null);
  }
  function concluir() {
    if (!classificacao || !conduta || !tipoClass || !motivoClass) return;
    onRegular(ativa.id, { avaliacao, tipoClassificacao: tipoClass, motivoClassificacao: motivoClass, motivoClassificacaoOutro: motivoClassOutro, classificacao, conduta, medico: `Dr(a). ${sessao?.nome || "Regulador Plantão"}` });
    setAtiva(null);
  }
  function confirmarCancelAtiva() {
    if (!motivoCancelAtiva || (motivoCancelAtiva === "OUTROS" && !motivoCancelAtivaOutro.trim())) return;
    onCancelarRegulada(ativa.id, valorOutro(motivoCancelAtiva, motivoCancelAtivaOutro));
    setAtiva(null);
  }
  function abrirRegulada(oc) {
    setReguladaId(oc.id); setAtiva(null); setAcao(null);
    setContraTexto(""); setNovaClassificacao(oc.regulacao?.classificacao || ""); setNovaConduta(oc.regulacao?.conduta || "");
    setInfoTexto(""); setMotivoCancelRegulada(""); setMotivoCancelReguladaOutro(""); setNovaUnidadeDestino(oc.regulacao?.unidadeDestino || ""); setNovaUnidadeDestinoOutro(oc.regulacao?.unidadeDestinoOutro || "");
  }
  function fecharRegulada() { setReguladaId(null); setAcao(null); }

  // Fecha automaticamente o painel se a ocorrência sair da lista "em curso"
  // (por exemplo, quando a frota finaliza/libera a viatura ou a ocorrência é cancelada).
  useEffect(() => {
    if (regulada && !["aguardando_veiculo", "despachado", "em_atendimento"].includes(regulada.status)) {
      setReguladaId(null); setAcao(null);
    }
  }, [regulada?.status]);

  function confirmarContra() { if (!contraTexto.trim()) return; onContraRegulacao(regulada.id, contraTexto.trim()); setContraTexto(""); fecharRegulada(); }
  function confirmarClassificacao() { if (!novaClassificacao) return; onAlterarClassificacao(regulada.id, novaClassificacao); fecharRegulada(); }
  function confirmarViatura() { if (!novaConduta) return; onAlterarViatura(regulada.id, novaConduta); fecharRegulada(); }
  function confirmarInfo() { if (!infoTexto.trim()) return; onAdicionarInfoComplementar(regulada.id, infoTexto.trim()); setInfoTexto(""); fecharRegulada(); }
  function confirmarCancelRegulada() {
    if (!motivoCancelRegulada || (motivoCancelRegulada === "OUTROS" && !motivoCancelReguladaOutro.trim())) return;
    onCancelarRegulada(regulada.id, valorOutro(motivoCancelRegulada, motivoCancelReguladaOutro));
    setMotivoCancelRegulada(""); setMotivoCancelReguladaOutro(""); fecharRegulada();
  }
  function confirmarUnidadeDestino() { if (!novaUnidadeDestino || (novaUnidadeDestino === "OUTROS" && !novaUnidadeDestinoOutro.trim())) return; onDefinirUnidadeDestino(regulada.id, novaUnidadeDestino, novaUnidadeDestinoOutro); fecharRegulada(); }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
      <Panel title="Fila de regulação médica" icon={Stethoscope} right={<span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.amarelo, fontWeight: 700 }}>{fila.length} aguardando</span>}>
        <div style={{ display: "grid", gap: 9 }}>
          {fila.map((oc) => (
            <div key={oc.id} onClick={() => abrirRegulacao(oc)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", background: ativa?.id === oc.id ? COLORS.panel2 : "transparent", border: `1px solid ${ativa?.id === oc.id ? COLORS.accent2 : COLORS.line}`, borderRadius: 6 }}>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 800, color: COLORS.accent2 }}>Nº {oc.numeroControle}</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 1 }}>{fmtDataHora(oc.criadoEm)} · aguardando há {fmtDecorrido(oc.criadoEm)}</div>
                <div style={{ fontSize: 14.5, marginTop: 4 }}>{oc.tarm.queixa} <TipoAtendimentoTags tipos={oc.tarm.tipoAtendimento} /></div>
                <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 2 }}><User size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{oc.tarm.nomePaciente || "Paciente não informado"}</div>
                <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 2 }}><MapPin size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{enderecoResumo(oc.tarm)}</div>
              </div>
              <ChevronRight size={17} color={COLORS.textFaint} />
            </div>
          ))}
          {fila.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14 }}>Fila vazia — nenhuma ocorrência aguardando regulação.</div>}
        </div>

        <div style={{ marginTop: 18, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8, fontWeight: 700 }}>Ocorrências reguladas em curso</div>
          <div style={{ display: "grid", gap: 9 }}>
            {emCurso.map((oc) => {
              const cor = PRIORIDADES.find((p) => p.key === oc.regulacao?.classificacao)?.color || COLORS.textFaint;
              const viaturaLabel = CONDUTAS_MEDICAS.find((c) => c.key === oc.regulacao?.conduta)?.label;
              const selecionada = reguladaId === oc.id;
              return (
                <div key={oc.id} onClick={() => abrirRegulada(oc)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", background: `${cor}14`, border: `1px solid ${selecionada ? COLORS.accent2 : cor + "66"}`, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 800, color: cor }}>
                      Nº {oc.numeroControle}{oc.despacho?.veiculoId && <> · {listaVeiculosTexto(oc.despacho)}</>}
                    </div>
                    <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 1 }}>{fmtDataHora(oc.criadoEm)}</div>
                    <div style={{ fontSize: 14.5, marginTop: 4 }}>{oc.tarm.queixa} <TipoAtendimentoTags tipos={oc.tarm.tipoAtendimento} /></div>
                    <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 2 }}><User size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{oc.tarm.nomePaciente || "Paciente não informado"}</div>
                    <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 2 }}><MapPin size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{enderecoResumo(oc.tarm)}</div>
                    {viaturaLabel && <div style={{ fontSize: 13, color: cor, marginTop: 4, fontFamily: FONT_MONO, fontWeight: 700 }}>Viatura/conduta indicada: {viaturaLabel}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}><StatusChip status={oc.status} /><PrioridadeChip cls={oc.regulacao?.classificacao} /></div>
                </div>
              );
            })}
            {emCurso.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 13.5 }}>Nenhuma ocorrência em curso no momento.</div>}
          </div>
        </div>
      </Panel>

      <Panel title="Avaliação e conduta" icon={ShieldAlert}>
        {!ativa && !regulada && <div style={{ color: COLORS.textFaint, fontSize: 14 }}>Selecione uma ocorrência na fila para iniciar a regulação, ou uma ocorrência regulada para consultar e gerenciar o caso.</div>}

        {ativa && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <Btn small kind="ghost" onClick={() => setAtiva(null)}>Voltar</Btn>
            </div>
            <div style={{ fontSize: 14, marginBottom: 10, padding: 11, background: COLORS.panel2, borderRadius: 5, border: `1px solid ${COLORS.line}` }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 800, color: COLORS.accent2 }}>Nº {ativa.numeroControle}</div>
              <div style={{ fontSize: 12, color: COLORS.textFaint }}>aberta em {fmtDataHora(ativa.criadoEm)}</div>
              <div style={{ marginTop: 4 }}>{ativa.tarm.queixa}</div>
              <div style={{ color: COLORS.textDim }}>{enderecoResumo(ativa.tarm)}</div>
              <div style={{ color: COLORS.textDim }}>Paciente: {ativa.tarm.nomePaciente} · {ativa.tarm.idade} {ativa.tarm.idadeUnidade === "meses" ? "meses" : "anos"} · {ativa.tarm.sexo}</div>
            </div>

            <Field label="Avaliação médica"><textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)} placeholder="Anamnese, sinais vitais relatados, histórico e demais dados da avaliação médica completa..." /></Field>

            <div style={{ padding: 12, background: COLORS.panel2, borderRadius: 6, border: `1px solid ${COLORS.line}`, marginBottom: 13 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: "uppercase", color: COLORS.textDim, marginBottom: 8, fontWeight: 700 }}>Classificação da Ocorrência</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Tipo">
                  <select style={inputStyle} value={tipoClass} onChange={(e) => { setTipoClass(e.target.value); setMotivoClass(""); setMotivoClassOutro(""); }}>
                    <option value="">Selecionar</option>
                    {CLASSIFICACAO_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Motivo">
                  <select style={inputStyle} value={motivoClass} onChange={(e) => setMotivoClass(e.target.value)} disabled={!tipoClass}>
                    <option value="">{tipoClass ? "Selecionar" : "Selecione o Tipo primeiro"}</option>
                    {(CLASSIFICACAO_MOTIVOS[tipoClass] || []).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
              {motivoClass === "OUTROS" && <Field label="Especifique o motivo"><input style={inputStyle} value={motivoClassOutro} onChange={(e) => setMotivoClassOutro(e.target.value)} placeholder="Especifique o motivo" /></Field>}
            </div>

            <Field label="Classificação de risco">
              <div style={{ display: "grid", gap: 6 }}>
                {PRIORIDADES.map((p) => (
                  <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "7px 9px", borderRadius: 5, border: `1px solid ${classificacao === p.key ? p.color : COLORS.line}`, cursor: "pointer" }}>
                    <input type="radio" name="classificacao" checked={classificacao === p.key} onChange={() => setClassificacao(p.key)} />
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />{p.label}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Conduta médica">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CONDUTAS_MEDICAS.map((c) => (
                  <button key={c.key} type="button" onClick={() => setConduta(c.key)} style={{ flex: "1 1 100px", padding: "10px 6px", borderRadius: 5, cursor: "pointer", fontSize: 13, fontFamily: FONT_MONO, letterSpacing: 0.3, background: conduta === c.key ? COLORS.accent : COLORS.panel, color: conduta === c.key ? "#FFFFFF" : COLORS.textDim, border: `1px solid ${conduta === c.key ? COLORS.accent : COLORS.line}`, fontWeight: 700 }}>{c.label}</button>
                ))}
              </div>
            </Field>

            <Btn kind="accent" onClick={concluir} disabled={!classificacao || !conduta || !tipoClass || !motivoClass} style={{ width: "100%", justifyContent: "center" }}><CheckCircle2 size={16} /> Concluir regulação</Btn>

            {!cancelandoAtiva && (
              <Btn kind="outline" onClick={() => setCancelandoAtiva(true)} style={{ width: "100%", justifyContent: "center", marginTop: 10, color: COLORS.vermelho, borderColor: COLORS.vermelho }}><X size={16} /> Cancelar Ocorrência</Btn>
            )}
            {cancelandoAtiva && (
              <div style={{ marginTop: 10, padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.vermelho}55`, borderRadius: 6 }}>
                <SelecaoCancelamento motivo={motivoCancelAtiva} setMotivo={setMotivoCancelAtiva} outro={motivoCancelAtivaOutro} setOutro={setMotivoCancelAtivaOutro} />
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small kind="ghost" onClick={() => { setCancelandoAtiva(false); setMotivoCancelAtiva(""); setMotivoCancelAtivaOutro(""); }}>Voltar</Btn>
                  <Btn small onClick={confirmarCancelAtiva} disabled={!motivoCancelAtiva || (motivoCancelAtiva === "OUTROS" && !motivoCancelAtivaOutro.trim())} style={{ background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}`, flex: 1, justifyContent: "center" }}>Confirmar cancelamento</Btn>
                </div>
              </div>
            )}
          </>
        )}

        {regulada && (() => {
          const cor = PRIORIDADES.find((p) => p.key === regulada.regulacao?.classificacao)?.color || COLORS.textFaint;
          return (
            <>
              <div style={{ fontSize: 14, marginBottom: 12, padding: 11, background: COLORS.panel2, borderRadius: 6, border: `1px solid ${cor}55` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 800, color: cor }}>Nº {regulada.numeroControle}</div>
                  <div style={{ display: "flex", gap: 6 }}><StatusChip status={regulada.status} /><PrioridadeChip cls={regulada.regulacao?.classificacao} /></div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textFaint }}>aberta em {fmtDataHora(regulada.criadoEm)}</div>
                <div style={{ marginTop: 4 }}>{regulada.tarm.queixa} <TipoAtendimentoTags tipos={regulada.tarm.tipoAtendimento} /></div>
                <div style={{ color: COLORS.textDim }}>{enderecoResumo(regulada.tarm)}</div>
                <div style={{ color: COLORS.textDim }}>Paciente: {regulada.tarm.nomePaciente} · {regulada.tarm.idade} {regulada.tarm.idadeUnidade === "meses" ? "meses" : "anos"} · {regulada.tarm.sexo}</div>
                {regulada.regulacao?.avaliacao && <div style={{ marginTop: 6 }}><span style={{ color: COLORS.textDim }}>Avaliação:</span> {regulada.regulacao.avaliacao}</div>}
                {regulada.regulacao?.tipoClassificacao && <div style={{ marginTop: 4 }}><span style={{ color: COLORS.textDim }}>Classificação:</span> {regulada.regulacao.tipoClassificacao} — {valorOutro(regulada.regulacao.motivoClassificacao, regulada.regulacao.motivoClassificacaoOutro)}</div>}
                <div style={{ marginTop: 4 }}><span style={{ color: COLORS.textDim }}>Conduta / viatura indicada:</span> {CONDUTAS_MEDICAS.find((c) => c.key === regulada.regulacao?.conduta)?.label || "—"}</div>
                {regulada.regulacao?.unidadeDestino && <div style={{ marginTop: 4 }}><span style={{ color: COLORS.textDim }}>Unidade Destino:</span> {valorOutro(regulada.regulacao.unidadeDestino, regulada.regulacao.unidadeDestinoOutro)}</div>}
                {regulada.regulacao?.contraRegulacao && <div style={{ marginTop: 4 }}><span style={{ color: COLORS.textDim }}>Contra-regulação:</span> {regulada.regulacao.contraRegulacao}</div>}
                {regulada.regulacao?.informacoesComplementares?.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: COLORS.textDim }}>Informações complementares:</span>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>{regulada.regulacao.informacoesComplementares.map((info, i) => <li key={i} style={{ fontSize: 13 }}>{fmtDataHora(info.ts)} — {info.texto}</li>)}</ul>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                <Btn small kind={acao === "contra" ? "accent" : "outline"} onClick={() => setAcao("contra")}>Contra-Regulação</Btn>
                <Btn small kind={acao === "destino" ? "accent" : "outline"} onClick={() => setAcao("destino")}>Unidade Destino</Btn>
                <Btn small kind={acao === "classificacao" ? "accent" : "outline"} onClick={() => setAcao("classificacao")}>Alterar Classificação</Btn>
                <Btn small kind={acao === "viatura" ? "accent" : "outline"} onClick={() => setAcao("viatura")}>Alterar Viatura</Btn>
                <Btn small kind={acao === "info" ? "accent" : "outline"} onClick={() => setAcao("info")}>Informações complementares</Btn>
                <Btn small kind="ghost" onClick={fecharRegulada}><X size={13} /> Voltar</Btn>
              </div>
              <Btn small kind={acao === "cancelar" ? "accent" : "outline"} onClick={() => setAcao("cancelar")} style={{ width: "100%", justifyContent: "center", marginBottom: 12, color: COLORS.vermelho, borderColor: COLORS.vermelho }}><X size={14} /> Cancelar Ocorrência</Btn>

              {acao === "contra" && (
                <div style={{ padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 6 }}>
                  <Field label="Contra-regulação"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={contraTexto} onChange={(e) => setContraTexto(e.target.value)} placeholder="Novo parecer médico após reavaliação do caso..." /></Field>
                  <Btn kind="accent" small onClick={confirmarContra} disabled={!contraTexto.trim()} style={{ width: "100%", justifyContent: "center" }}>Confirmar</Btn>
                </div>
              )}
              {acao === "destino" && (
                <div style={{ padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 6 }}>
                  <CampoComOutros label="Unidade Destino" opcoes={UNIDADES_DESTINO} valor={novaUnidadeDestino} onChange={setNovaUnidadeDestino} outro={novaUnidadeDestinoOutro} onChangeOutro={setNovaUnidadeDestinoOutro} placeholderOutro="Especifique a unidade de destino" />
                  <Btn kind="accent" small onClick={confirmarUnidadeDestino} disabled={!novaUnidadeDestino || (novaUnidadeDestino === "OUTROS" && !novaUnidadeDestinoOutro.trim())} style={{ width: "100%", justifyContent: "center" }}>Confirmar</Btn>
                </div>
              )}
              {acao === "classificacao" && (
                <div style={{ padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 6 }}>
                  <Field label="Nova classificação de risco">
                    <div style={{ display: "grid", gap: 6 }}>
                      {PRIORIDADES.map((p) => (
                        <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "7px 9px", borderRadius: 5, border: `1px solid ${novaClassificacao === p.key ? p.color : COLORS.line}`, cursor: "pointer" }}>
                          <input type="radio" name="novaClassificacao" checked={novaClassificacao === p.key} onChange={() => setNovaClassificacao(p.key)} />
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />{p.label}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Btn kind="accent" small onClick={confirmarClassificacao} disabled={!novaClassificacao} style={{ width: "100%", justifyContent: "center" }}>Confirmar</Btn>
                </div>
              )}
              {acao === "viatura" && (
                <div style={{ padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 6 }}>
                  <Field label="Nova conduta / viatura indicada">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {CONDUTAS_MEDICAS.map((c) => (
                        <button key={c.key} type="button" onClick={() => setNovaConduta(c.key)} style={{ flex: "1 1 100px", padding: "10px 6px", borderRadius: 5, cursor: "pointer", fontSize: 13, fontFamily: FONT_MONO, letterSpacing: 0.3, background: novaConduta === c.key ? COLORS.accent : COLORS.panel, color: novaConduta === c.key ? "#FFFFFF" : COLORS.textDim, border: `1px solid ${novaConduta === c.key ? COLORS.accent : COLORS.line}`, fontWeight: 700 }}>{c.label}</button>
                      ))}
                    </div>
                  </Field>
                  <Btn kind="accent" small onClick={confirmarViatura} disabled={!novaConduta} style={{ width: "100%", justifyContent: "center" }}>Confirmar</Btn>
                </div>
              )}
              {acao === "info" && (
                <div style={{ padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 6 }}>
                  <Field label="Informações complementares"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={infoTexto} onChange={(e) => setInfoTexto(e.target.value)} placeholder="Dados adicionais recebidos após o envio (exames, evolução, novos sintomas relatados)..." /></Field>
                  <Btn kind="accent" small onClick={confirmarInfo} disabled={!infoTexto.trim()} style={{ width: "100%", justifyContent: "center" }}>Confirmar</Btn>
                </div>
              )}
              {acao === "cancelar" && (
                <div style={{ padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.vermelho}55`, borderRadius: 6 }}>
                  <SelecaoCancelamento motivo={motivoCancelRegulada} setMotivo={setMotivoCancelRegulada} outro={motivoCancelReguladaOutro} setOutro={setMotivoCancelReguladaOutro} />
                  <Btn small onClick={confirmarCancelRegulada} disabled={!motivoCancelRegulada || (motivoCancelRegulada === "OUTROS" && !motivoCancelReguladaOutro.trim())} style={{ width: "100%", justifyContent: "center", background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}` }}><CheckCircle2 size={14} /> Confirmar cancelamento</Btn>
                </div>
              )}
            </>
          );
        })()}
      </Panel>
    </div>
  );
}

/* ============================================================
   VIEW: FROTA / DESPACHO
   ============================================================ */
function FrotaView({ ocorrencias, veiculos, onDespachar, onMarcarTempo, onAbrir, onAddVeiculo, onRemoveVeiculo, onUpdateVeiculo, onToggleStatus, onTrocarViatura, onAdicionarViaturaExtra, onRemoverViaturaOcorrencia, onCancelarOcorrenciaFrota, onRegistrarObito, onLiberarViatura }) {
  const aguardandoVeiculo = ocorrencias.filter((o) => o.status === "aguardando_veiculo");
  const emCurso = ocorrencias.filter((o) => ["despachado", "em_atendimento"].includes(o.status));
  const [selecionado, setSelecionado] = useState({});
  const [selecionadoTroca, setSelecionadoTroca] = useState({});
  const disponiveis = veiculos.filter((v) => v.status === "disponivel");
  const [verAvaliacaoId, setVerAvaliacaoId] = useState(null);
  const verAvaliacao = verAvaliacaoId ? ocorrencias.find((o) => o.id === verAvaliacaoId) : null;

  const [mostrarAdd, setMostrarAdd] = useState(false);
  const [novoVeiculo, setNovoVeiculo] = useState({ id: "", tipo: "", base: "", tripulantes: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [rascunho, setRascunho] = useState({ id: "", tipo: "", base: "", tripulantes: "" });

  const [acaoOc, setAcaoOc] = useState({});
  const [extraSelecionada, setExtraSelecionada] = useState({});
  const [motivoCancelFrota, setMotivoCancelFrota] = useState({});
  const [obitoSelecionado, setObitoSelecionado] = useState({});
  const [abaFrota, setAbaFrota] = useState("operacao");
  const [filtroDataFrota, setFiltroDataFrota] = useState({ dia: "", mes: "", ano: "" });
  const [paginaFrota, setPaginaFrota] = useState(1);
  const tamanhoPaginaFrota = 30;
  const [listaFrotaFiltrada, setListaFrotaFiltrada] = useState([]);
  const [totalFrotaResultados, setTotalFrotaResultados] = useState(0);
  const [carregandoPesquisaFrota, setCarregandoPesquisaFrota] = useState(false);

  useEffect(() => { setPaginaFrota(1); }, [filtroDataFrota.dia, filtroDataFrota.mes, filtroDataFrota.ano]);

  useEffect(() => {
    if (abaFrota !== "pesquisa") return;
    (async () => {
      setCarregandoPesquisaFrota(true);
      const { data, error } = await supabase.rpc("buscar_ocorrencias_paginado", {
        p_pagina: paginaFrota, p_tamanho: tamanhoPaginaFrota,
        p_dia: filtroDataFrota.dia ? Number(filtroDataFrota.dia) : null,
        p_mes: filtroDataFrota.mes ? Number(filtroDataFrota.mes) : null,
        p_ano: filtroDataFrota.ano ? Number(filtroDataFrota.ano) : null,
      });
      setCarregandoPesquisaFrota(false);
      if (error) { setListaFrotaFiltrada([]); setTotalFrotaResultados(0); return; }
      setListaFrotaFiltrada((data || []).map(ocorrenciaDoBanco));
      setTotalFrotaResultados(data?.[0]?.total_count || 0);
    })();
  }, [abaFrota, paginaFrota, filtroDataFrota.dia, filtroDataFrota.mes, filtroDataFrota.ano]);

  const totalPaginasFrota = Math.max(1, Math.ceil(totalFrotaResultados / tamanhoPaginaFrota));

  function setAcao(ocId, acao) { setAcaoOc((s) => ({ ...s, [ocId]: s[ocId] === acao ? null : acao })); }

  function iniciarEdicao(v) { setEditandoId(v.id); setRascunho({ id: v.id, tipo: v.tipo, base: v.base, tripulantes: v.tripulantes || "" }); }
  function salvarEdicao(idOriginal) { if (!rascunho.id.trim()) return; onUpdateVeiculo(idOriginal, { id: rascunho.id.trim(), tipo: rascunho.tipo.trim(), base: rascunho.base.trim(), tripulantes: rascunho.tripulantes }); setEditandoId(null); }
  function adicionar() { if (!novoVeiculo.id.trim()) return; onAddVeiculo({ id: novoVeiculo.id.trim(), tipo: novoVeiculo.tipo.trim() || "USB", base: novoVeiculo.base.trim() || "Base Centro", tripulantes: novoVeiculo.tripulantes, status: "disponivel" }); setNovoVeiculo({ id: "", tipo: "", base: "", tripulantes: "" }); setMostrarAdd(false); }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${COLORS.line}`, marginBottom: 2 }}>
        {[{ key: "operacao", label: "Operação de Frota", icon: Truck }, { key: "pesquisa", label: "Pesquisa de Ocorrências", icon: Search }].map((a) => {
          const Icon = a.icon; const ativa = abaFrota === a.key;
          return (
            <button key={a.key} onClick={() => setAbaFrota(a.key)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 15px", cursor: "pointer", background: "transparent", border: "none", borderBottom: ativa ? `2px solid ${COLORS.accent2}` : "2px solid transparent", color: ativa ? COLORS.text : COLORS.textFaint, fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 }}>
              <Icon size={15} /> {a.label}
            </button>
          );
        })}
      </div>

      {abaFrota === "operacao" && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ display: "grid", gap: 16 }}>
        <Panel title="Aguardando envio de viatura" icon={Truck} right={<span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>{aguardandoVeiculo.length}</span>}>
          <div style={{ display: "grid", gap: 11 }}>
            {aguardandoVeiculo.map((oc) => {
              const cor = PRIORIDADES.find((p) => p.key === oc.regulacao?.classificacao)?.color || COLORS.textFaint;
              const viaturaIndicada = CONDUTAS_MEDICAS.find((c) => c.key === oc.regulacao?.conduta)?.label;
              const ac = acaoOc[oc.id];
              return (
                <div key={oc.id} style={{ padding: 11, background: `${cor}14`, borderRadius: 6, border: `1px solid ${cor}66` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ cursor: "pointer" }} onClick={() => setVerAvaliacaoId(oc.id)}>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 800, color: cor }}>Nº {oc.numeroControle}</div>
                      {oc.regulacao?.medico && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 1 }}>Médico Regulador: {oc.regulacao.medico}</div>}
                      <div style={{ fontSize: 12.5, color: COLORS.textFaint, marginTop: 1 }}>{fmtDataHora(oc.criadoEm)}</div>
                      <div style={{ fontSize: 14.5, marginTop: 4 }}>{oc.tarm.queixa} <TipoAtendimentoTags tipos={oc.tarm.tipoAtendimento} /></div>
                      <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 2 }}><User size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{oc.tarm.nomePaciente || "Paciente não informado"}</div>
                      <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 2 }}><MapPin size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{enderecoResumo(oc.tarm)}</div>
                      {oc.tarm.referencia && <div style={{ fontSize: 12.5, color: COLORS.textFaint, marginTop: 2 }}>Referência: {oc.tarm.referencia}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <PrioridadeChip cls={oc.regulacao?.classificacao} />
                      <Btn small kind="ghost" onClick={() => setVerAvaliacaoId(oc.id)}><Eye size={13} /> Avaliação</Btn>
                    </div>
                  </div>
                  {viaturaIndicada && <div style={{ marginTop: 8, fontSize: 14, fontFamily: FONT_MONO, fontWeight: 800, color: cor }}>Viatura indicada pela regulação: {viaturaIndicada}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <select style={{ ...inputStyle, width: 230 }} value={selecionado[oc.id] || ""} onChange={(e) => setSelecionado((s) => ({ ...s, [oc.id]: e.target.value }))}>
                      <option value="">Selecionar viatura disponível (QRV)</option>
                      {disponiveis.map((v) => <option key={v.id} value={v.id}>{v.id} — {v.tipo} ({v.base})</option>)}
                    </select>
                    <Btn kind="accent" small disabled={!selecionado[oc.id]} onClick={() => { onDespachar(oc.id, selecionado[oc.id]); setSelecionado((s) => ({ ...s, [oc.id]: "" })); }}><Siren size={14} /> Acionar</Btn>
                  </div>
                  <Btn small kind={ac === "cancelarAguardando" ? "accent" : "outline"} onClick={() => setAcao(oc.id, "cancelarAguardando")} style={{ width: "100%", justifyContent: "center", marginTop: 8, color: COLORS.vermelho, borderColor: COLORS.vermelho }}>Cancelar Ocorrência</Btn>
                  {ac === "cancelarAguardando" && (
                    <div style={{ marginTop: 8, padding: 9, background: COLORS.panel, border: `1px solid ${COLORS.vermelho}55`, borderRadius: 5 }}>
                      <SelecaoCancelamento
                        motivo={motivoCancelFrota[oc.id]?.motivo || ""}
                        setMotivo={(m) => setMotivoCancelFrota((s) => ({ ...s, [oc.id]: { ...s[oc.id], motivo: m } }))}
                        outro={motivoCancelFrota[oc.id]?.outro || ""}
                        setOutro={(v) => setMotivoCancelFrota((s) => ({ ...s, [oc.id]: { ...s[oc.id], outro: v } }))}
                      />
                      <Btn small disabled={!motivoCancelFrota[oc.id]?.motivo || (motivoCancelFrota[oc.id]?.motivo === "OUTROS" && !motivoCancelFrota[oc.id]?.outro?.trim())}
                        onClick={() => { onCancelarOcorrenciaFrota(oc.id, valorOutro(motivoCancelFrota[oc.id].motivo, motivoCancelFrota[oc.id].outro)); setMotivoCancelFrota((s) => ({ ...s, [oc.id]: null })); setAcao(oc.id, "cancelarAguardando"); }}
                        style={{ width: "100%", justifyContent: "center", background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}` }}>Confirmar cancelamento</Btn>
                    </div>
                  )}
                </div>
              );
            })}
            {aguardandoVeiculo.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14 }}>Nenhuma ocorrência aguardando viatura.</div>}
          </div>
        </Panel>

        <Panel title="Ocorrências em deslocamento / atendimento" icon={Navigation}>
          <div style={{ display: "grid", gap: 11 }}>
            {emCurso.map((oc) => {
              const d = oc.despacho;
              const cor = PRIORIDADES.find((p) => p.key === oc.regulacao?.classificacao)?.color || COLORS.textFaint;
              const etapas = [
                { key: "saidaBase", label: "Saída da base" }, { key: "chegadaLocal", label: "Chegada ao local" },
                { key: "saidaLocal", label: "Saída do local" }, { key: "chegadaDestino", label: "Chegada ao destino" },
              ];
              const proxima = etapas.find((e) => !d[e.key]);
              const ac = acaoOc[oc.id];
              return (
                <div key={oc.id} style={{ padding: 11, background: `${cor}14`, borderRadius: 6, border: `1px solid ${cor}66` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 800, color: cor }}>Nº {oc.numeroControle} <span style={{ fontSize: 14 }}>· {listaVeiculosTexto(d)}</span></div>
                      {oc.regulacao?.medico && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 1 }}>Médico Regulador: {oc.regulacao.medico}</div>}
                      <div style={{ fontSize: 14.5, marginTop: 4, cursor: "pointer" }} onClick={() => onAbrir(oc)}>{oc.tarm.queixa}</div>
                      <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 2 }}><User size={12} style={{ verticalAlign: -2, marginRight: 3 }} />{oc.tarm.nomePaciente || "Paciente não informado"}</div>
                      {oc.obito && <div style={{ fontSize: 12.5, color: COLORS.vermelho, marginTop: 2, fontWeight: 700 }}>ÓBITO — {oc.obito}</div>}
                    </div>
                    <StatusChip status={oc.status} />
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 8, fontFamily: FONT_MONO, fontSize: 13, color: COLORS.textDim, flexWrap: "wrap" }}>
                    {etapas.map((e) => <span key={e.key} style={{ color: d[e.key] ? COLORS.verde : COLORS.textFaint }}>{e.label}: {d[e.key] ? fmtHora(d[e.key]) : "—"}</span>)}
                  </div>
                  {proxima && <Btn small kind="outline" style={{ marginTop: 8 }} onClick={() => onMarcarTempo(oc.id, proxima.key)}><Clock size={14} /> Marcar {proxima.label.toLowerCase()}</Btn>}
                  {!proxima && <div style={{ marginTop: 6, fontSize: 13, color: COLORS.verde, fontWeight: 600 }}>Atendimento no destino registrado — aguardando liberação da viatura.</div>}

                  {oc.precisaTrocarViatura && (
                    <div style={{ marginTop: 8, padding: 9, background: `${COLORS.accent}14`, border: `1px solid ${COLORS.accent}66`, borderRadius: 5 }}>
                      <div style={{ fontSize: 13, color: COLORS.accent, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={14} /> A regulação médica alterou a viatura indicada — selecione a nova viatura disponível</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select style={{ ...inputStyle, width: 230 }} value={selecionadoTroca[oc.id] || ""} onChange={(e) => setSelecionadoTroca((s) => ({ ...s, [oc.id]: e.target.value }))}>
                          <option value="">Selecionar viatura disponível (QRV)</option>
                          {disponiveis.map((v) => <option key={v.id} value={v.id}>{v.id} — {v.tipo} ({v.base})</option>)}
                        </select>
                        <Btn kind="accent" small disabled={!selecionadoTroca[oc.id]} onClick={() => { onTrocarViatura(oc.id, selecionadoTroca[oc.id]); setSelecionadoTroca((s) => ({ ...s, [oc.id]: "" })); }}><RefreshCw size={14} /> Trocar viatura</Btn>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
                    <Btn small kind={ac === "add" ? "accent" : "outline"} onClick={() => setAcao(oc.id, "add")}>Adicionar/Remover Viatura</Btn>
                    <Btn small kind={ac === "obito" ? "accent" : "outline"} onClick={() => setAcao(oc.id, "obito")} style={{ color: COLORS.vermelho, borderColor: ac === "obito" ? COLORS.vermelho : COLORS.vermelho }}>Óbito</Btn>
                    <Btn small kind={ac === "cancelar" ? "accent" : "outline"} onClick={() => setAcao(oc.id, "cancelar")} style={{ color: COLORS.vermelho, borderColor: COLORS.vermelho }}>Cancelar Ocorrência</Btn>
                    <Btn small kind="accent" onClick={() => onLiberarViatura(oc.id)}><CheckCircle2 size={13} /> Liberar Viatura</Btn>
                  </div>

                  {ac === "add" && (
                    <div style={{ marginTop: 8, padding: 9, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 5 }}>
                      <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
                        {[d.veiculoId, ...(d.veiculosExtras || [])].filter(Boolean).map((vid) => (
                          <div key={vid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 9px", background: COLORS.panel2, borderRadius: 4, fontSize: 12.5, fontFamily: FONT_MONO }}>
                            <span>{vid}</span>
                            <button title="Remover viatura desta ocorrência" onClick={() => onRemoverViaturaOcorrencia(oc.id, vid)} style={{ background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 3, cursor: "pointer", color: COLORS.vermelho }}><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select style={{ ...inputStyle, width: 230 }} value={extraSelecionada[oc.id] || ""} onChange={(e) => setExtraSelecionada((s) => ({ ...s, [oc.id]: e.target.value }))}>
                          <option value="">Selecionar viatura em QRV para adicionar</option>
                          {disponiveis.map((v) => <option key={v.id} value={v.id}>{v.id} — {v.tipo} ({v.base})</option>)}
                        </select>
                        <Btn kind="accent" small disabled={!extraSelecionada[oc.id]} onClick={() => { onAdicionarViaturaExtra(oc.id, extraSelecionada[oc.id]); setExtraSelecionada((s) => ({ ...s, [oc.id]: "" })); setAcao(oc.id, "add"); }}><Plus size={13} /> Confirmar</Btn>
                      </div>
                    </div>
                  )}
                  {ac === "obito" && (
                    <div style={{ marginTop: 8, padding: 9, background: COLORS.panel, border: `1px solid ${COLORS.vermelho}55`, borderRadius: 5 }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        {["SVO", "IML"].map((op) => (
                          <button key={op} type="button" onClick={() => setObitoSelecionado((s) => ({ ...s, [oc.id]: op }))} style={{ flex: 1, padding: "9px 6px", borderRadius: 5, cursor: "pointer", fontSize: 13, fontFamily: FONT_MONO, background: obitoSelecionado[oc.id] === op ? COLORS.vermelho : COLORS.panel2, color: obitoSelecionado[oc.id] === op ? "#fff" : COLORS.textDim, border: `1px solid ${obitoSelecionado[oc.id] === op ? COLORS.vermelho : COLORS.line}`, fontWeight: 700 }}>{op}</button>
                        ))}
                      </div>
                      <Btn small disabled={!obitoSelecionado[oc.id]} onClick={() => { onRegistrarObito(oc.id, obitoSelecionado[oc.id]); setAcao(oc.id, "obito"); }} style={{ width: "100%", justifyContent: "center", background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}` }}>Confirmar</Btn>
                    </div>
                  )}
                  {ac === "cancelar" && (
                    <div style={{ marginTop: 8, padding: 9, background: COLORS.panel, border: `1px solid ${COLORS.vermelho}55`, borderRadius: 5 }}>
                      <SelecaoCancelamento
                        motivo={motivoCancelFrota[oc.id]?.motivo || ""}
                        setMotivo={(m) => setMotivoCancelFrota((s) => ({ ...s, [oc.id]: { ...s[oc.id], motivo: m } }))}
                        outro={motivoCancelFrota[oc.id]?.outro || ""}
                        setOutro={(v) => setMotivoCancelFrota((s) => ({ ...s, [oc.id]: { ...s[oc.id], outro: v } }))}
                      />
                      <Btn small disabled={!motivoCancelFrota[oc.id]?.motivo || (motivoCancelFrota[oc.id]?.motivo === "OUTROS" && !motivoCancelFrota[oc.id]?.outro?.trim())}
                        onClick={() => { onCancelarOcorrenciaFrota(oc.id, valorOutro(motivoCancelFrota[oc.id].motivo, motivoCancelFrota[oc.id].outro)); setMotivoCancelFrota((s) => ({ ...s, [oc.id]: null })); setAcao(oc.id, "cancelar"); }}
                        style={{ width: "100%", justifyContent: "center", background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}` }}>Confirmar cancelamento</Btn>
                    </div>
                  )}
                </div>
              );
            })}
            {emCurso.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14 }}>Nenhuma viatura em deslocamento.</div>}
          </div>
        </Panel>
      </div>

      <Panel title="Quadro de frota" icon={Radio} right={<Btn small kind={mostrarAdd ? "ghost" : "outline"} onClick={() => setMostrarAdd((s) => !s)}><Plus size={14} /> {mostrarAdd ? "Cancelar" : "Nova viatura"}</Btn>}>
        {mostrarAdd && (
          <div style={{ marginBottom: 12, padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 6, display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input style={inputStyle} placeholder="Nomenclatura (ex: USB-04)" value={novoVeiculo.id} onChange={(e) => setNovoVeiculo((f) => ({ ...f, id: e.target.value }))} />
              <input style={inputStyle} placeholder="Tipo (ex: USB, USA, VIR...)" value={novoVeiculo.tipo} onChange={(e) => setNovoVeiculo((f) => ({ ...f, tipo: e.target.value }))} />
            </div>
            <input style={inputStyle} placeholder="Nome da base" value={novoVeiculo.base} onChange={(e) => setNovoVeiculo((f) => ({ ...f, base: e.target.value }))} />
            <input style={inputStyle} placeholder="Tripulantes (ex: Cond. João, Enf. Marli)" value={novoVeiculo.tripulantes} onChange={(e) => setNovoVeiculo((f) => ({ ...f, tripulantes: e.target.value }))} />
            <Btn kind="accent" small onClick={adicionar} style={{ justifyContent: "center" }}><Save size={14} /> Salvar viatura</Btn>
          </div>
        )}
        <div style={{ display: "grid", gap: 9 }}>
          {veiculos.slice().sort((a, b) => a.id.localeCompare(b.id, "pt-BR")).map((v) => {
            const statusColor = { disponivel: COLORS.verde, em_deslocamento: COLORS.accent, ocupado: COLORS.azul, manutencao: COLORS.textFaint }[v.status];
            const statusLabel = { disponivel: "QRV", em_deslocamento: "Em deslocamento", ocupado: "Ocupado", manutencao: "FA" }[v.status];
            const podeAlternar = v.status === "disponivel" || v.status === "manutencao";
            const editando = editandoId === v.id;
            if (editando) {
              return (
                <div key={v.id} style={{ padding: 11, background: COLORS.panel2, borderRadius: 6, border: `1px solid ${COLORS.accent2}`, display: "grid", gap: 6 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <input style={{ ...inputStyle, padding: "7px 9px", fontSize: 13 }} placeholder="Nomenclatura" value={rascunho.id} onChange={(e) => setRascunho((f) => ({ ...f, id: e.target.value }))} />
                    <input style={{ ...inputStyle, padding: "7px 9px", fontSize: 13 }} placeholder="Tipo" value={rascunho.tipo} onChange={(e) => setRascunho((f) => ({ ...f, tipo: e.target.value }))} />
                  </div>
                  <input style={{ ...inputStyle, padding: "7px 9px", fontSize: 13 }} placeholder="Base" value={rascunho.base} onChange={(e) => setRascunho((f) => ({ ...f, base: e.target.value }))} />
                  <input style={{ ...inputStyle, padding: "7px 9px", fontSize: 13 }} placeholder="Tripulantes" value={rascunho.tripulantes} onChange={(e) => setRascunho((f) => ({ ...f, tripulantes: e.target.value }))} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn small kind="accent" onClick={() => salvarEdicao(v.id)}><Save size={13} /> Salvar</Btn>
                    <Btn small kind="ghost" onClick={() => setEditandoId(null)}>Cancelar</Btn>
                  </div>
                </div>
              );
            }
            return (
              <div key={v.id} style={{ padding: "9px 11px", background: COLORS.panel2, borderRadius: 5, border: `1px solid ${COLORS.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <VeiculoIcon tipo={v.tipo} />
                    <div>
                      <div style={{ fontSize: 14, fontFamily: FONT_MONO, fontWeight: 700 }}>{v.id} <span style={{ color: COLORS.textFaint, fontSize: 11.5 }}>· {v.tipo}</span></div>
                      <div style={{ fontSize: 12, color: COLORS.textFaint }}>{v.base}</div>
                      {v.tripulantes && <div style={{ fontSize: 11.5, color: COLORS.textDim, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><Users size={11} /> {v.tripulantes}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontSize: 11.5, color: statusColor, fontFamily: FONT_MONO, textTransform: "uppercase", fontWeight: 700 }}>{statusLabel}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {podeAlternar && <button title="Alternar QRV / FA" onClick={() => onToggleStatus(v.id)} style={{ background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 4, cursor: "pointer", color: COLORS.textDim }}><RefreshCw size={13} /></button>}
                      <button title="Editar viatura" onClick={() => iniciarEdicao(v)} style={{ background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 4, cursor: "pointer", color: COLORS.textDim }}><Pencil size={13} /></button>
                      <button title="Remover viatura" onClick={() => onRemoveVeiculo(v.id)} style={{ background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 4, cursor: "pointer", color: COLORS.vermelho }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {veiculos.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14 }}>Nenhuma viatura cadastrada. Use "Nova viatura" para adicionar.</div>}
        </div>
      </Panel>
    </div>
      )}

      {abaFrota === "pesquisa" && (
        <Panel title="Pesquisa de Ocorrências" icon={Search} right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <FiltroDataBar filtro={filtroDataFrota} setFiltro={setFiltroDataFrota} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.accent2, fontWeight: 700 }}>{carregandoPesquisaFrota ? "Buscando..." : `${totalFrotaResultados} resultado(s)`}</span>
          </div>
        }>
          <div style={{ display: "grid", gap: 7, minHeight: 200 }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 110px 140px", fontSize: 11.5, color: COLORS.textFaint, textTransform: "uppercase", padding: "0 10px", fontFamily: FONT_MONO, fontWeight: 700 }}>
              <span>Nº controle</span><span>Queixa / endereço</span><span>Prioridade</span><span>Status</span><span>Abertura</span>
            </div>
            {listaFrotaFiltrada.map((oc) => (
              <div key={oc.id} onClick={() => onAbrir(oc)} style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "100px 1fr 110px 110px 140px", alignItems: "center", padding: "9px 10px", background: COLORS.panel2, borderRadius: 5, fontSize: 13.5 }}>
                <span style={{ fontFamily: FONT_MONO, color: COLORS.textDim, fontWeight: 700 }}>{oc.numeroControle}</span>
                <span>{oc.tarm.queixa} <span style={{ color: COLORS.textFaint }}>— {enderecoResumo(oc.tarm)}</span></span>
                <PrioridadeChip cls={oc.regulacao?.classificacao} />
                <StatusChip status={oc.status} />
                <span style={{ fontFamily: FONT_MONO, color: COLORS.textFaint }}>{fmtDataHora(oc.criadoEm)}</span>
              </div>
            ))}
            {!carregandoPesquisaFrota && listaFrotaFiltrada.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14, padding: 10 }}>Nenhuma ocorrência encontrada para o período pesquisado.</div>}
          </div>
          {totalFrotaResultados > tamanhoPaginaFrota && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${COLORS.line}` }}>
              <Btn small kind="outline" disabled={paginaFrota <= 1} onClick={() => setPaginaFrota((p) => Math.max(1, p - 1))}>Anterior</Btn>
              <span style={{ fontSize: 13, color: COLORS.textDim, fontFamily: FONT_MONO }}>Página {paginaFrota} de {totalPaginasFrota}</span>
              <Btn small kind="outline" disabled={paginaFrota >= totalPaginasFrota} onClick={() => setPaginaFrota((p) => Math.min(totalPaginasFrota, p + 1))}>Próxima</Btn>
            </div>
          )}
        </Panel>
      )}

      {verAvaliacao && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,23,31,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setVerAvaliacaoId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 100%)", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.accent2, fontWeight: 700 }}>Nº {verAvaliacao.numeroControle}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, textTransform: "uppercase" }}>Avaliação médica</div>
              </div>
              <button onClick={() => setVerAvaliacaoId(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 14.5, color: COLORS.text, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{verAvaliacao.regulacao?.avaliacao || "Nenhuma avaliação médica registrada para esta ocorrência."}</div>
            {verAvaliacao.regulacao?.tipoClassificacao && <div style={{ marginTop: 10, fontSize: 13, color: COLORS.textDim }}>Classificação: {verAvaliacao.regulacao.tipoClassificacao} — {valorOutro(verAvaliacao.regulacao.motivoClassificacao, verAvaliacao.regulacao.motivoClassificacaoOutro)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BLOCO DE DASHBOARD (reutilizado em Visão Geral e Indicadores)
   ============================================================ */
function computeStats(lista, veiculos) {
  const total = lista.length;
  const concluidas = lista.filter((o) => o.status === "concluido").length;
  const orientacoes = lista.filter((o) => o.status === "orientacao_dada").length;
  const trote = lista.filter((o) => o.motivoCancelamentoTarm === "TROTE").length;
  const canceladas = lista.filter((o) => o.status === "cancelado").length;
  const temposRegulacao = lista.filter((o) => o.regulacao?.inicioRegulacao).map((o) => (new Date(o.regulacao.fimRegulacao || Date.now()) - new Date(o.regulacao.inicioRegulacao)) / 60000);
  const mediaRegulacao = temposRegulacao.length ? (temposRegulacao.reduce((a, b) => a + b, 0) / temposRegulacao.length).toFixed(1) : "—";
  const temposResposta = lista.filter((o) => o.despacho?.chegadaLocal).map((o) => (new Date(o.despacho.chegadaLocal) - new Date(o.criadoEm)) / 60000);
  const mediaResposta = temposResposta.length ? (temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length).toFixed(1) : "—";
  const veiculosAtivos = veiculos.filter((v) => v.status !== "disponivel" && v.status !== "manutencao").length;
  const porClassificacao = PRIORIDADES.map((p) => ({ name: p.label.split("—")[0].trim(), value: lista.filter((o) => o.regulacao?.classificacao === p.key).length, color: p.color }));
  const buckets = {};
  lista.forEach((o) => { const h = new Date(o.criadoEm).getHours(); const key = `${String(h).padStart(2, "0")}h`; buckets[key] = (buckets[key] || 0) + 1; });
  const porHora = Object.entries(buckets).map(([hora, qtd]) => ({ hora, qtd })).sort((a, b) => a.hora.localeCompare(b.hora));

  // Normaliza o tipo de viatura em apenas 3 categorias (Motolância, USB, USA),
  // reconhecendo a palavra-chave dentro do campo "tipo" (que é texto livre) e
  // ignorando qualquer texto extra (ex.: número/ramal) e outros tipos (ex.: VIR).
  function normalizarTipoVeiculo(tipoBruto) {
    const t = (tipoBruto || "").toUpperCase();
    if (t.includes("MOTO")) return "Motolância";
    if (t.includes("USA")) return "USA";
    if (t.includes("USB")) return "USB";
    return null;
  }
  const bucketsTipo = { "Motolância": 0, "USB": 0, "USA": 0 };
  lista.forEach((o) => {
    if (!o.despacho?.veiculoId) return;
    const v = veiculos.find((x) => x.id === o.despacho.veiculoId);
    const categoria = normalizarTipoVeiculo(v?.tipo);
    if (categoria) bucketsTipo[categoria] += 1;
  });
  const porTipoVeiculo = Object.entries(bucketsTipo).map(([tipo, qtd]) => ({ tipo, qtd }));

  const bucketsViatura = {};
  lista.forEach((o) => {
    if (o.despacho?.veiculoId) bucketsViatura[o.despacho.veiculoId] = (bucketsViatura[o.despacho.veiculoId] || 0) + 1;
    (o.despacho?.veiculosExtras || []).forEach((vid) => { bucketsViatura[vid] = (bucketsViatura[vid] || 0) + 1; });
  });
  const porViaturaSelecionada = Object.entries(bucketsViatura).map(([viatura, qtd]) => ({ viatura, qtd })).sort((a, b) => b.qtd - a.qtd);

  // Tempo médio de resposta, dividido por fase (em minutos).
  function diffMin(a, b) { if (!a || !b) return null; return (new Date(b) - new Date(a)) / 60000; }
  function media(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
  const tDespacho = lista.map((o) => diffMin(o.criadoEm, o.despacho?.acionamento)).filter((v) => v != null);
  const tDeslocamento = lista.map((o) => diffMin(o.despacho?.acionamento, o.despacho?.chegadaLocal)).filter((v) => v != null);
  const tCena = lista.map((o) => diffMin(o.despacho?.chegadaLocal, o.despacho?.saidaLocal)).filter((v) => v != null);
  const tDestino = lista.map((o) => diffMin(o.despacho?.saidaLocal, o.despacho?.chegadaDestino)).filter((v) => v != null);
  const temposPorFase = [
    { fase: "Despacho", min: Math.round(media(tDespacho)) },
    { fase: "Deslocamento", min: Math.round(media(tDeslocamento)) },
    { fase: "Cena", min: Math.round(media(tCena)) },
    { fase: "Destino", min: Math.round(media(tDestino)) },
  ];
  const totalTempoFases = temposPorFase.reduce((a, f) => a + f.min, 0);

  return { total, concluidas, orientacoes, trote, canceladas, mediaRegulacao, mediaResposta, veiculosAtivos, porClassificacao, porHora, porTipoVeiculo, porViaturaSelecionada, temposPorFase, totalTempoFases };
}

function DashboardBlock({ stats, totalVeiculos }) {
  const kpi = (label, valor, icon, sufixo = "") => (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 15, flex: 1, minWidth: 145, boxShadow: "0 1px 3px rgba(20,23,31,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 }}>{icon}{label}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLORS.text, marginTop: 5 }}>{valor}<span style={{ fontSize: 15, color: COLORS.textDim }}>{sufixo}</span></div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {kpi("Ocorrências totais", stats.total, <Activity size={14} />)}
        {kpi("Orientações Médicas", stats.orientacoes, <Stethoscope size={14} />)}
        {kpi("Trote (TARM)", stats.trote, <AlertTriangle size={14} />)}
        {kpi("Canceladas", stats.canceladas, <X size={14} />)}
        {kpi("Concluídas", stats.concluidas, <CheckCircle2 size={14} />)}
        {kpi("Tempo médio de regulação", stats.mediaRegulacao, <Timer size={14} />, " min")}
        {kpi("Viaturas em operação", `${stats.veiculosAtivos}/${totalVeiculos}`, <Truck size={14} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Ocorrências por classificação de risco" icon={FileBarChart} right={<span style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: COLORS.accent2, fontWeight: 700 }}>{stats.porClassificacao.reduce((a, d) => a + d.value, 0)} no total</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.porClassificacao} layout="vertical" margin={{ left: 20, right: 28 }}>
              <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 6, fontSize: 13 }} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {stats.porClassificacao.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="value" position="right" style={{ fill: COLORS.text, fontSize: 12.5, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Volume de ocorrências por horário" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.porHora}>
              <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" />
              <XAxis dataKey="hora" tick={{ fill: COLORS.textDim, fontSize: 12 }} />
              <YAxis tick={{ fill: COLORS.textDim, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 6, fontSize: 13 }} />
              <Line type="monotone" dataKey="qtd" stroke={COLORS.accent2} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Tempo médio de resposta por fase" icon={Timer} right={<span style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: COLORS.accent2, fontWeight: 700 }}>{stats.totalTempoFases} min no total</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.temposPorFase} layout="vertical" margin={{ left: 20, right: 28 }}>
              <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 12 }} allowDecimals={false} unit=" min" />
              <YAxis type="category" dataKey="fase" tick={{ fill: COLORS.textDim, fontSize: 12 }} width={100} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 6, fontSize: 13 }} formatter={(v) => [`${v} min`, "Tempo médio"]} />
              <Bar dataKey="min" fill={COLORS.accent2} radius={[0, 3, 3, 0]}>
                <LabelList dataKey="min" position="right" formatter={(v) => `${v} min`} style={{ fill: COLORS.text, fontSize: 12.5, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Despachos por tipo de viatura" icon={Truck} right={<span style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: COLORS.accent2, fontWeight: 700 }}>{stats.porTipoVeiculo.reduce((a, d) => a + d.qtd, 0)} no total</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.porTipoVeiculo} layout="vertical" margin={{ left: 20, right: 28 }}>
              <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="tipo" tick={{ fill: COLORS.textDim, fontSize: 12 }} width={110} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 6, fontSize: 13 }} />
              <Bar dataKey="qtd" fill={COLORS.accent} radius={[0, 3, 3, 0]}>
                <LabelList dataKey="qtd" position="right" style={{ fill: COLORS.text, fontSize: 12.5, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Despachos por viaturas selecionadas" icon={Gauge} right={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {stats.porViaturaSelecionada.length > 8 && <span style={{ fontSize: 12, color: COLORS.textFaint }}>mostrando as 8 mais despachadas</span>}
          <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: COLORS.accent2, fontWeight: 700 }}>{stats.porViaturaSelecionada.reduce((a, d) => a + d.qtd, 0)} no total</span>
        </div>
      }>
        {(() => {
          const dadosViatura = stats.porViaturaSelecionada.slice(0, 8);
          const altura = Math.max(150, dadosViatura.length * 38 + 30);
          return (
            <ResponsiveContainer width="100%" height={altura}>
              <BarChart data={dadosViatura} layout="vertical" margin={{ left: 20, right: 28 }}>
                <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="viatura" tick={{ fill: COLORS.text, fontSize: 13, fontWeight: 600 }} width={90} />
                <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 6, fontSize: 13 }} />
                <Bar dataKey="qtd" fill={COLORS.accent2} radius={[0, 3, 3, 0]} barSize={22}>
                  <LabelList dataKey="qtd" position="right" style={{ fill: COLORS.text, fontSize: 12.5, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          );
        })()}
      </Panel>
    </div>
  );
}

/* ============================================================
   VIEW: GESTÃO
   ============================================================ */
/* ============================================================
   PAINEL DE FUNCIONÁRIOS (cadastro e atualização cadastral)
   ============================================================ */
function FuncionariosPanel({ usuarios, sessao, onCadastrar, onAtualizar, onDefinirAtivo }) {
  const [novo, setNovo] = useState({ nome: "", cpf: "", email: "", senha: "", papel: "tarm" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [rascunho, setRascunho] = useState(null);

  const listaVisivel = usuarios.filter((u) => u.papel !== "admin" || u.id === sessao?.id);
  const resultados = listaVisivel.filter((u) => !busca.trim() || u.nome.toLowerCase().includes(busca.toLowerCase()) || (u.cpf || "").includes(busca.trim()) || (u.email || "").toLowerCase().includes(busca.toLowerCase()));

  function abrirEdicao(u) { setEditando(u.id); setRascunho({ ...u }); }
  function salvarEdicao() { if (!rascunho.nome.trim()) return; onAtualizar(editando, rascunho); setEditando(null); }

  async function cadastrar() {
    if (!novo.nome.trim() || !novo.email.trim() || !novo.senha) { setErro("Preencha nome, e-mail e senha."); return; }
    if (novo.senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    setErro(""); setSucesso(""); setEnviando(true);
    await onCadastrar({ nome: novo.nome.trim(), cpf: novo.cpf.trim(), email: novo.email.trim(), senha: novo.senha, papel: novo.papel });
    setEnviando(false);
    setSucesso(`Funcionário "${novo.nome}" cadastrado como ${PAPEIS.find((p) => p.key === novo.papel)?.label || novo.papel}.`);
    setNovo({ nome: "", cpf: "", email: "", senha: "", papel: "tarm" });
  }

  return (
    <Panel title="Cadastrar Funcionário" icon={UserPlus}>
      <div style={{ padding: 14, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Nome completo"><input style={inputStyle} value={novo.nome} onChange={(e) => setNovo((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do funcionário" /></Field>
          <Field label="CPF"><input style={inputStyle} value={novo.cpf} onChange={(e) => setNovo((f) => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="E-mail"><input style={inputStyle} value={novo.email} onChange={(e) => setNovo((f) => ({ ...f, email: e.target.value }))} placeholder="funcionario@exemplo.com" /></Field>
          <Field label="Senha provisória"><input type="password" style={inputStyle} value={novo.senha} onChange={(e) => setNovo((f) => ({ ...f, senha: e.target.value }))} placeholder="mínimo 6 caracteres" /></Field>
        </div>
        <Field label="Função">
          <select style={inputStyle} value={novo.papel} onChange={(e) => setNovo((f) => ({ ...f, papel: e.target.value }))}>
            {PAPEIS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            {sessao?.papel === "admin" && <option value="admin">Administrador</option>}
          </select>
        </Field>
        {erro && <div style={{ color: COLORS.vermelho, fontSize: 13, marginBottom: 10 }}>{erro}</div>}
        {sucesso && <div style={{ color: COLORS.verde, fontSize: 13, marginBottom: 10 }}>{sucesso}</div>}
        <Btn kind="accent" onClick={cadastrar} disabled={enviando} style={{ width: "100%", justifyContent: "center" }}>
          <UserPlus size={16} /> {enviando ? "Cadastrando..." : "Cadastrar e liberar acesso"}
        </Btn>
        <div style={{ marginTop: 10, fontSize: 12, color: COLORS.textFaint }}>
          O funcionário poderá entrar com este e-mail e senha, e trocar a senha depois pelo link "Esqueci minha senha" na tela de login.
        </div>
      </div>

      <Field label="Buscar funcionário por nome, e-mail ou CPF"><input style={inputStyle} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para buscar" /></Field>
      <div style={{ display: "grid", gap: 8 }}>
        {resultados.map((u) => (
          <div key={u.id} onClick={() => abrirEdicao(u)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: u.papel === "inativo" ? COLORS.panel2 : COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 6, opacity: u.papel === "inativo" ? 0.6 : 1 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{u.nome || "(sem nome)"} {u.papel === "inativo" && <span style={{ color: COLORS.vermelho, fontSize: 11 }}>· DESATIVADO</span>}</div>
              <div style={{ fontSize: 12, color: COLORS.textFaint }}>CPF: {u.cpf || "não informado"} · {u.email}</div>
            </div>
            <span style={{ fontSize: 12, color: COLORS.accent2, fontFamily: FONT_MONO, fontWeight: 700 }}>{PAPEIS.find((p) => p.key === u.papel)?.label || u.papel}</span>
          </div>
        ))}
        {resultados.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 13.5 }}>Nenhum funcionário encontrado.</div>}
      </div>

      {editando && rascunho && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,23,31,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditando(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 100%)", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, textTransform: "uppercase" }}>Atualizar cadastro</div>
              <button onClick={() => setEditando(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.textFaint, marginBottom: 12 }}>E-mail de login: <b>{rascunho.email}</b> (não pode ser alterado por aqui)</div>
            <Field label="Nome completo"><input style={inputStyle} value={rascunho.nome} onChange={(e) => setRascunho((f) => ({ ...f, nome: e.target.value }))} /></Field>
            <Field label="CPF"><input style={inputStyle} value={rascunho.cpf || ""} onChange={(e) => setRascunho((f) => ({ ...f, cpf: e.target.value }))} /></Field>
            <Field label="Função"><select style={inputStyle} value={rascunho.papel} onChange={(e) => setRascunho((f) => ({ ...f, papel: e.target.value }))} disabled={rascunho.papel === "inativo"}>{PAPEIS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></Field>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Btn kind="accent" onClick={salvarEdicao} style={{ flex: 1, justifyContent: "center" }}><Save size={15} /> Salvar alterações</Btn>
              {rascunho.papel === "inativo" ? (
                <Btn onClick={() => { onDefinirAtivo(editando, true, rascunho.papel); setEditando(null); }} style={{ background: COLORS.verde, color: "#fff", border: `1px solid ${COLORS.verde}` }}>Reativar acesso</Btn>
              ) : (
                <Btn onClick={() => { onDefinirAtivo(editando, false, rascunho.papel); setEditando(null); }} style={{ background: COLORS.vermelho, color: "#fff", border: `1px solid ${COLORS.vermelho}` }}>Desativar acesso</Btn>
              )}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ============================================================
   VIEW: GESTÃO
   ============================================================ */
function GestaoView({ ocorrencias, veiculos, onAbrir, usuarios, sessao, onCadastrarFuncionario, onAtualizarFuncionario, onDefinirAtivoFuncionario, onRecarregarFuncionarios }) {
  const [aba, setAba] = useState("visao");
  const now = new Date();

  useEffect(() => { if (aba === "funcionarios" && onRecarregarFuncionarios) onRecarregarFuncionarios(); }, [aba]);

  const ocorrenciasHoje = ocorrencias.filter((o) => mesmaData(o.criadoEm, now));
  const statsHoje = computeStats(ocorrenciasHoje, veiculos);

  const [filtroIndicadores, setFiltroIndicadores] = useState({ dia: "", mes: "", ano: "" });
  const temFiltroIndicadores = filtroIndicadores.dia || filtroIndicadores.mes || filtroIndicadores.ano;
  const [ocorrenciasIndicadores, setOcorrenciasIndicadores] = useState([]);
  const [carregandoIndicadores, setCarregandoIndicadores] = useState(false);

  useEffect(() => {
    if (aba !== "indicadores") return;
    (async () => {
      setCarregandoIndicadores(true);
      const params = temFiltroIndicadores
        ? { p_dia: filtroIndicadores.dia ? Number(filtroIndicadores.dia) : null, p_mes: filtroIndicadores.mes ? Number(filtroIndicadores.mes) : null, p_ano: filtroIndicadores.ano ? Number(filtroIndicadores.ano) : null }
        : { p_dia: null, p_mes: now.getMonth() + 1, p_ano: now.getFullYear() };
      const { data, error } = await supabase.rpc("buscar_ocorrencias_por_periodo", params);
      setCarregandoIndicadores(false);
      setOcorrenciasIndicadores(error ? [] : (data || []).map(ocorrenciaDoBanco));
    })();
  }, [aba, filtroIndicadores.dia, filtroIndicadores.mes, filtroIndicadores.ano]);

  const statsIndicadores = computeStats(ocorrenciasIndicadores, veiculos);

  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");
  const [busca, setBusca] = useState("");
  const [buscaAtrasada, setBuscaAtrasada] = useState("");
  const [filtroData, setFiltroData] = useState({ dia: "", mes: "", ano: "" });
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [filtroDestino, setFiltroDestino] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("");
  const [filtroTipoViatura, setFiltroTipoViatura] = useState("");
  const [filtroViatura, setFiltroViatura] = useState("");
  const [filtroTipoClass, setFiltroTipoClass] = useState("");
  const [filtroMotivoClass, setFiltroMotivoClass] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroOrigemLigacao, setFiltroOrigemLigacao] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");

  const [pagina, setPagina] = useState(1);
  const tamanhoPagina = 30;
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [carregandoPesquisa, setCarregandoPesquisa] = useState(false);

  // Espera meio segundo sem digitar antes de buscar (evita disparar uma
  // busca no banco a cada letra digitada).
  useEffect(() => { const t = setTimeout(() => setBuscaAtrasada(busca), 400); return () => clearTimeout(t); }, [busca]);

  const filtrosPesquisa = [filtroPrioridade, filtroData.dia, filtroData.mes, filtroData.ano, filtroOrigem, filtroDestino, filtroMunicipio, filtroOrigemLigacao, filtroTipoViatura, filtroViatura, filtroTipoClass, filtroMotivoClass, filtroCategoria, horaInicio, horaFim, buscaAtrasada];

  useEffect(() => { setPagina(1); }, filtrosPesquisa);

  useEffect(() => {
    if (aba !== "pesquisa") return;
    (async () => {
      setCarregandoPesquisa(true);
      const { data, error } = await supabase.rpc("buscar_ocorrencias_paginado", {
        p_pagina: pagina, p_tamanho: tamanhoPagina,
        p_prioridade: filtroPrioridade !== "todas" ? filtroPrioridade : null,
        p_dia: filtroData.dia ? Number(filtroData.dia) : null,
        p_mes: filtroData.mes ? Number(filtroData.mes) : null,
        p_ano: filtroData.ano ? Number(filtroData.ano) : null,
        p_origem: filtroOrigem || null,
        p_destino: filtroDestino || null,
        p_municipio: filtroMunicipio || null,
        p_origem_ligacao: filtroOrigemLigacao || null,
        p_tipo_viatura: filtroTipoViatura || null,
        p_viatura: filtroViatura || null,
        p_tipo_classificacao: filtroTipoClass || null,
        p_motivo_classificacao: filtroMotivoClass || null,
        p_categoria: filtroCategoria || null,
        p_hora_inicio: horaInicio || null,
        p_hora_fim: horaFim || null,
        p_busca: buscaAtrasada || null,
      });
      setCarregandoPesquisa(false);
      if (error) { setListaFiltrada([]); setTotalResultados(0); return; }
      setListaFiltrada((data || []).map(ocorrenciaDoBanco));
      setTotalResultados(data?.[0]?.total_count || 0);
    })();
  }, [aba, pagina, ...filtrosPesquisa]);

  const totalPaginas = Math.max(1, Math.ceil(totalResultados / tamanhoPagina));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${COLORS.line}`, marginBottom: 2 }}>
        {[
          { key: "visao", label: "Visão Geral", icon: LayoutDashboard },
          { key: "indicadores", label: "Indicadores", icon: Gauge },
          { key: "pesquisa", label: "Pesquisa de ocorrências", icon: Search },
          { key: "funcionarios", label: "Cadastrar Funcionário", icon: UserPlus },
        ].map((a) => {
          const Icon = a.icon; const ativa = aba === a.key;
          return (
            <button key={a.key} onClick={() => setAba(a.key)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 15px", cursor: "pointer", background: "transparent", border: "none", borderBottom: ativa ? `2px solid ${COLORS.accent2}` : "2px solid transparent", color: ativa ? COLORS.text : COLORS.textFaint, fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 }}>
              <Icon size={15} /> {a.label}
            </button>
          );
        })}
      </div>

      {aba === "visao" && (
        <>
          <div style={{ fontSize: 13, color: COLORS.textFaint, marginBottom: -6 }}>Dados de hoje ({fmtData(now)}) — reiniciados automaticamente à meia-noite.</div>
          <DashboardBlock stats={statsHoje} totalVeiculos={veiculos.filter((v) => v.status !== "manutencao").length} />
        </>
      )}

      {aba === "indicadores" && (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: 12, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 600 }}>{temFiltroIndicadores ? "Período pesquisado:" : `Mês corrente (${MESES[now.getMonth()][1]}/${now.getFullYear()}) — reiniciado automaticamente no dia 1:`}</span>
            <FiltroDataBar filtro={filtroIndicadores} setFiltro={setFiltroIndicadores} />
            {carregandoIndicadores && <span style={{ fontSize: 12.5, color: COLORS.textFaint }}>Carregando...</span>}
          </div>
          <DashboardBlock stats={statsIndicadores} totalVeiculos={veiculos.filter((v) => v.status !== "manutencao").length} />
        </>
      )}

      {aba === "pesquisa" && (
        <Panel title="Pesquisa de ocorrências" icon={ClipboardList}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10, padding: 12, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 8 }}>
            <span style={{ fontSize: 12.5, color: COLORS.textDim, fontWeight: 600 }}>Data de registro:</span>
            <FiltroDataBar filtro={filtroData} setFiltro={setFiltroData} />
            <span style={{ fontSize: 12.5, color: COLORS.textDim, fontWeight: 600, marginLeft: 6 }}>Intervalo de horário:</span>
            <input type="time" style={{ ...smallSelectStyle, width: "auto" }} value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            <span style={{ color: COLORS.textFaint }}>até</span>
            <input type="time" style={{ ...smallSelectStyle, width: "auto" }} value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 5, padding: "6px 9px" }}>
              <Search size={13} color={COLORS.textFaint} />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nº, queixa, endereço, bairro" style={{ background: "transparent", border: "none", outline: "none", color: COLORS.text, fontSize: 13, width: 210 }} />
            </div>
            <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} style={{ ...smallSelectStyle, width: 175 }}>
              <option value="todas">Todas as prioridades</option>
              {PRIORIDADES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <select value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)} style={{ ...smallSelectStyle, width: 175 }}>
              <option value="">Todas — Unidade Origem</option>{UNIDADES_ORIGEM.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={filtroDestino} onChange={(e) => setFiltroDestino(e.target.value)} style={{ ...smallSelectStyle, width: 175 }}>
              <option value="">Todas — Unidade Destino</option>{UNIDADES_DESTINO.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={filtroMunicipio} onChange={(e) => setFiltroMunicipio(e.target.value)} style={{ ...smallSelectStyle, width: 175 }}>
              <option value="">Todos — Município</option>{MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filtroOrigemLigacao} onChange={(e) => setFiltroOrigemLigacao(e.target.value)} style={{ ...smallSelectStyle, width: 185 }}>
              <option value="">Todas — Origem da ligação</option>{ORIGEM_LIGACAO.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={filtroTipoViatura} onChange={(e) => setFiltroTipoViatura(e.target.value)} style={{ ...smallSelectStyle, width: 165 }}>
              <option value="">Todos — Tipo de Viatura</option>{Object.keys(TIPO_LABEL).map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </select>
            <select value={filtroViatura} onChange={(e) => setFiltroViatura(e.target.value)} style={{ ...smallSelectStyle, width: 165 }}>
              <option value="">Todas — Viaturas Selecionadas</option>{veiculos.map((v) => <option key={v.id} value={v.id}>{v.id}</option>)}
            </select>
            <select value={filtroTipoClass} onChange={(e) => { setFiltroTipoClass(e.target.value); setFiltroMotivoClass(""); }} style={{ ...smallSelectStyle, width: 175 }}>
              <option value="">Todos — Tipo da Classificação</option>{CLASSIFICACAO_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filtroMotivoClass} onChange={(e) => setFiltroMotivoClass(e.target.value)} style={{ ...smallSelectStyle, width: 190 }}>
              <option value="">Todos — Motivo da Classificação</option>
              {(filtroTipoClass ? (CLASSIFICACAO_MOTIVOS[filtroTipoClass] || []) : Array.from(new Set(Object.values(CLASSIFICACAO_MOTIVOS).flat()))).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ ...smallSelectStyle, width: 190 }}>
              <option value="">Categoria especial</option>{CATEGORIAS_ESPECIAIS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.accent2, marginLeft: "auto", fontWeight: 700 }}>
              {carregandoPesquisa ? "Buscando..." : `${totalResultados} resultado(s)`}
            </span>
          </div>

          <div style={{ display: "grid", gap: 7, minHeight: 200 }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 110px 140px", fontSize: 11.5, color: COLORS.textFaint, textTransform: "uppercase", padding: "0 10px", fontFamily: FONT_MONO, fontWeight: 700 }}>
              <span>Nº controle</span><span>Queixa / endereço</span><span>Prioridade</span><span>Status</span><span>Abertura</span>
            </div>
            {listaFiltrada.map((oc) => (
              <div key={oc.id} onClick={() => onAbrir(oc)} style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "100px 1fr 110px 110px 140px", alignItems: "center", padding: "9px 10px", background: COLORS.panel2, borderRadius: 5, fontSize: 13.5 }}>
                <span style={{ fontFamily: FONT_MONO, color: COLORS.textDim, fontWeight: 700 }}>{oc.numeroControle}</span>
                <span>{oc.tarm.queixa} <span style={{ color: COLORS.textFaint }}>— {enderecoResumo(oc.tarm)}</span></span>
                <PrioridadeChip cls={oc.regulacao?.classificacao} />
                <StatusChip status={oc.status} />
                <span style={{ fontFamily: FONT_MONO, color: COLORS.textFaint }}>{fmtDataHora(oc.criadoEm)}</span>
              </div>
            ))}
            {!carregandoPesquisa && listaFiltrada.length === 0 && <div style={{ color: COLORS.textFaint, fontSize: 14, padding: 10 }}>Nenhuma ocorrência encontrada para os critérios pesquisados.</div>}
          </div>

          {totalResultados > tamanhoPagina && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${COLORS.line}` }}>
              <Btn small kind="outline" disabled={pagina <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>Anterior</Btn>
              <span style={{ fontSize: 13, color: COLORS.textDim, fontFamily: FONT_MONO }}>Página {pagina} de {totalPaginas}</span>
              <Btn small kind="outline" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>Próxima</Btn>
            </div>
          )}
        </Panel>
      )}

      {aba === "funcionarios" && (
        <FuncionariosPanel usuarios={usuarios} sessao={sessao} onCadastrar={onCadastrarFuncionario} onAtualizar={onAtualizarFuncionario} onDefinirAtivo={onDefinirAtivoFuncionario} />
      )}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
/* ============================================================
   MAPEAMENTO: linhas do Supabase (snake_case) <-> objetos da UI
   ============================================================ */
function ocorrenciaDoBanco(r) {
  return {
    id: r.id,
    numeroControle: r.numero_controle,
    criadoEm: r.criado_em,
    tarm: r.tarm || {},
    status: r.status,
    regulacao: r.regulacao || {},
    despacho: r.despacho || {},
    obito: r.obito,
    justificativaCancelamento: r.justificativa_cancelamento,
    motivoCancelamentoTarm: r.motivo_cancelamento_tarm,
    precisaTrocarViatura: r.precisa_trocar_viatura,
    historico: r.historico || [],
  };
}
function veiculoDoBanco(r) {
  return { id: r.id, tipo: r.tipo, base: r.base, tripulantes: r.tripulantes, status: r.status };
}

/* Aplica um evento (INSERT/UPDATE/DELETE) diretamente na lista local,
   sem precisar buscar tudo de novo no banco — evita que uma resposta
   atrasada "sobrescreva" uma mais recente e faça algo sumir da tela. */
function mesclarOcorrencia(lista, payload) {
  const { eventType, new: novo, old } = payload;
  if (eventType === "DELETE") return lista.filter((o) => o.id !== old.id);
  const mapeada = ocorrenciaDoBanco(novo);
  const existe = lista.some((o) => o.id === mapeada.id);
  const atualizada = existe ? lista.map((o) => (o.id === mapeada.id ? mapeada : o)) : [mapeada, ...lista];
  return atualizada.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}
function mesclarVeiculo(lista, payload) {
  const { eventType, new: novo, old } = payload;
  if (eventType === "DELETE") return lista.filter((v) => v.id !== old.id);
  const mapeado = veiculoDoBanco(novo);
  const existe = lista.some((v) => v.id === mapeado.id);
  return existe ? lista.map((v) => (v.id === mapeado.id ? mapeado : v)) : [...lista, mapeado];
}

export default function App() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [adminVisao, setAdminVisao] = useState("tarm");
  useEffect(() => {
    if (sessao?.papel === "frota") setAdminVisao("frota");
    else if (sessao?.papel === "admin") setAdminVisao("tarm");
  }, [sessao?.id]);
  const [now, setNow] = useState(new Date());
  const [modalOc, setModalOc] = useState(null);
  const [toast, setToast] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroConexao, setErroConexao] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  function notificar(msg) { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); }
  function autorAtual(rotulo) { return `${rotulo} (${sessao?.nome || "desconhecido"})`; }

  /* ---- Autenticação (Supabase Auth) ---- */
  async function montarSessao(user) {
    const { data: perfil, error } = await supabase.from("perfis").select("*").eq("id", user.id).single();
    if (error || !perfil) { notificar("Não encontramos seu perfil de acesso. Fale com o administrador."); await supabase.auth.signOut(); setSessao(null); return; }
    if (perfil.papel === "inativo") { notificar("Este acesso foi desativado. Fale com o administrador."); await supabase.auth.signOut(); setSessao(null); return; }
    setSessao({ id: user.id, email: user.email, nome: perfil.nome || user.email, papel: perfil.papel, cpf: perfil.cpf });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) montarSessao(data.session.user);
      setVerificandoSessao(false);
    });

    const { data: assinatura } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { setModoRecuperacao(true); return; }
      if (event === "SIGNED_OUT") { setSessao(null); return; }
      if (session?.user) montarSessao(session.user);
    });

    return () => { assinatura.subscription.unsubscribe(); };
  }, []);

  async function sair() { await supabase.auth.signOut(); setSessao(null); }

  /* ---- Carga inicial + assinatura em tempo real (Supabase) ---- */
  async function recarregarOcorrencias() {
    const { data, error } = await supabase.from("ocorrencias").select("*").order("criado_em", { ascending: false });
    if (error) { setErroConexao(true); return; }
    setOcorrencias((data || []).map(ocorrenciaDoBanco));
  }
  async function recarregarVeiculos() {
    const { data, error } = await supabase.from("veiculos").select("*").order("id");
    if (error) { setErroConexao(true); return; }
    setVeiculos((data || []).map(veiculoDoBanco));
  }
  async function recarregarUsuarios() {
    const { data, error } = await supabase.from("perfis").select("*").order("nome");
    if (error) { notificar("Erro ao carregar funcionários: " + error.message); return; }
    setUsuarios(data || []);
  }

  useEffect(() => {
    if (!sessao) return;
    (async () => {
      setCarregando(true);
      await Promise.all([recarregarOcorrencias(), recarregarVeiculos()]);
      setCarregando(false);
    })();

    // Canal em tempo real: qualquer inserção/alteração em qualquer terminal
    // (TARM, Regulação ou Frota) atualiza automaticamente todas as telas.
    const canal = supabase
      .channel("samu-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ocorrencias" }, (payload) => setOcorrencias((prev) => mesclarOcorrencia(prev, payload)))
      .on("postgres_changes", { event: "*", schema: "public", table: "veiculos" }, (payload) => setVeiculos((prev) => mesclarVeiculo(prev, payload)))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setErroConexao(false);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setErroConexao(true);
      });

    return () => { supabase.removeChannel(canal); };
  }, [sessao?.id]);

  useEffect(() => { if (sessao?.papel === "gestao" || sessao?.papel === "admin") recarregarUsuarios(); }, [sessao]);

  /* ---- Ocorrências: TARM ---- */
  async function criarOcorrencia(dadosTarm) {
    const tarm = { ...dadosTarm, operador: sessao?.nome || "TARM em plantão" };
    const historico = [{ ts: agora(), autor: autorAtual("TARM"), evento: "Ocorrência registrada e enviada à regulação" }];
    const { data, error } = await supabase.from("ocorrencias").insert({ tarm, status: "aguardando_regulacao", regulacao: {}, despacho: {}, historico }).select().single();
    if (error) { notificar("Erro ao registrar ocorrência: " + error.message); return; }
    setOcorrencias((prev) => mesclarOcorrencia(prev, { eventType: "INSERT", new: data }));
    notificar(`Nova ocorrência Nº ${data.numero_controle} recebida pela regulação médica.`);
  }

  async function cancelarOcorrencia(dadosTarm, justificativa, motivo) {
    const tarm = { ...dadosTarm, operador: sessao?.nome || "TARM em plantão" };
    const historico = [{ ts: agora(), autor: autorAtual("TARM"), evento: `Ocorrência cancelada — Motivo: ${motivo}${motivo === "OUTROS" ? ` (${justificativa})` : ""}` }];
    const { data, error } = await supabase.from("ocorrencias").insert({
      tarm, status: "cancelado", justificativa_cancelamento: justificativa, motivo_cancelamento_tarm: motivo, regulacao: {}, despacho: {}, historico,
    }).select().single();
    if (error) { notificar("Erro ao cancelar ocorrência: " + error.message); return; }
    setOcorrencias((prev) => mesclarOcorrencia(prev, { eventType: "INSERT", new: data }));
    notificar(`Ocorrência Nº ${data.numero_controle} cancelada.`);
  }

  /* ---- helpers para atualizar uma ocorrência existente no banco ---- */
  function buscarOc(id) { return ocorrencias.find((o) => o.id === id); }
  async function atualizarOcorrencia(id, patch) {
    const { data, error } = await supabase.from("ocorrencias").update(patch).eq("id", id).select().single();
    if (error) { notificar("Erro ao salvar alteração: " + error.message); return false; }
    setOcorrencias((prev) => mesclarOcorrencia(prev, { eventType: "UPDATE", new: data }));
    return true;
  }

  /* ---- Regulação médica ---- */
  async function regular(id, dados) {
    const o = buscarOc(id); if (!o) return;
    const fim = agora();
    const indicaViatura = ["USA", "USB", "MOTOLANCIA"].includes(dados.conduta);
    const proximoStatus = indicaViatura ? "aguardando_veiculo" : "orientacao_dada";
    const evento = `Classificação: ${dados.classificacao} · Tipo: ${dados.tipoClassificacao} · Motivo: ${valorOutro(dados.motivoClassificacao, dados.motivoClassificacaoOutro)} · Conduta: ${CONDUTAS_MEDICAS.find((c) => c.key === dados.conduta)?.label || dados.conduta}`;
    await atualizarOcorrencia(id, {
      status: proximoStatus,
      regulacao: { ...dados, inicioRegulacao: o.criadoEm, fimRegulacao: fim },
      historico: [...o.historico, { ts: fim, autor: autorAtual("Regulação"), evento }],
    });
    notificar(`Ocorrência regulada — encaminhada para ${indicaViatura ? "frota" : "arquivo"}.`);
  }

  async function contraRegular(id, texto) {
    const o = buscarOc(id); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(id, { regulacao: { ...o.regulacao, contraRegulacao: texto }, historico: [...o.historico, { ts, autor: autorAtual("Regulação"), evento: `Contra-regulação: ${texto}` }] });
    notificar("Contra-regulação registrada.");
  }
  async function alterarClassificacao(id, novaClassificacao) {
    const o = buscarOc(id); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(id, {
      regulacao: { ...o.regulacao, classificacao: novaClassificacao },
      historico: [...o.historico, { ts, autor: autorAtual("Regulação"), evento: `Classificação de risco alterada para ${PRIORIDADES.find((p) => p.key === novaClassificacao)?.label || novaClassificacao}` }],
    });
    notificar("Classificação de risco atualizada.");
  }
  async function alterarViatura(id, novaConduta) {
    const o = buscarOc(id); if (!o) return;
    const ts = agora();
    const jaDespachada = !!o.despacho?.veiculoId && ["despachado", "em_atendimento"].includes(o.status);
    const eventoBase = `Viatura/conduta indicada alterada para ${CONDUTAS_MEDICAS.find((c) => c.key === novaConduta)?.label || novaConduta}`;
    await atualizarOcorrencia(id, {
      regulacao: { ...o.regulacao, conduta: novaConduta },
      precisa_trocar_viatura: jaDespachada ? true : o.precisaTrocarViatura || false,
      historico: [...o.historico, { ts, autor: autorAtual("Regulação"), evento: jaDespachada ? `${eventoBase} — nova viatura deve ser selecionada na frota` : eventoBase }],
    });
    notificar("Viatura/conduta indicada atualizada.");
  }
  async function adicionarInfoComplementar(id, texto) {
    const o = buscarOc(id); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(id, {
      regulacao: { ...o.regulacao, informacoesComplementares: [...(o.regulacao.informacoesComplementares || []), { ts, texto }] },
      historico: [...o.historico, { ts, autor: autorAtual("Regulação"), evento: "Informação complementar registrada" }],
    });
    notificar("Informação complementar adicionada.");
  }
  async function cancelarRegulada(id, justificativa) {
    const o = buscarOc(id); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(id, { status: "cancelado", justificativa_cancelamento: justificativa, historico: [...o.historico, { ts, autor: autorAtual("Regulação"), evento: `Ocorrência cancelada — Justificativa: ${justificativa}` }] });
    notificar("Ocorrência cancelada.");
  }
  async function definirUnidadeDestino(id, unidade, outro) {
    const o = buscarOc(id); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(id, {
      regulacao: { ...o.regulacao, unidadeDestino: unidade, unidadeDestinoOutro: outro },
      historico: [...o.historico, { ts, autor: autorAtual("Regulação"), evento: `Unidade Destino definida: ${valorOutro(unidade, outro)}` }],
    });
    notificar("Unidade Destino atualizada.");
  }

  /* ---- Frota ---- */
  async function atualizarVeiculoStatus(id, status) {
    const { data, error } = await supabase.from("veiculos").update({ status }).eq("id", id).select().single();
    if (!error) setVeiculos((prev) => mesclarVeiculo(prev, { eventType: "UPDATE", new: data }));
  }

  async function despachar(ocId, veiculoId) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    const destino = o.regulacao?.unidadeDestino ? valorOutro(o.regulacao.unidadeDestino, o.regulacao.unidadeDestinoOutro) : (o.tarm.destino ? valorOutro(o.tarm.destino, o.tarm.destinoOutro) : "Hospital de referência");
    await atualizarOcorrencia(ocId, {
      status: "despachado",
      despacho: { veiculoId, veiculosExtras: [], acionamento: ts, destino },
      historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: `Viatura ${veiculoId} acionada` }],
    });
    await atualizarVeiculoStatus(veiculoId, "em_deslocamento");
    notificar(`Viatura ${veiculoId} acionada.`);
  }

  async function marcarTempo(ocId, etapa) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    const label = { saidaBase: "Saída da base", chegadaLocal: "Chegada ao local", saidaLocal: "Saída do local", chegadaDestino: "Chegada ao destino" }[etapa];
    const despacho = { ...o.despacho, [etapa]: ts };
    let status = o.status;
    if (etapa === "chegadaLocal") status = "em_atendimento";
    await atualizarOcorrencia(ocId, { status, despacho, historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: label }] });
    if (etapa === "chegadaLocal" && o.despacho.veiculoId) await atualizarVeiculoStatus(o.despacho.veiculoId, "ocupado");
  }

  async function trocarViatura(ocId, novoVeiculoId) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    const veiculoAnterior = o.despacho?.veiculoId || null;
    await atualizarOcorrencia(ocId, {
      status: "despachado",
      precisa_trocar_viatura: false,
      despacho: { ...o.despacho, veiculoId: novoVeiculoId, acionamento: ts, saidaBase: undefined, chegadaLocal: undefined, saidaLocal: undefined, chegadaDestino: undefined },
      historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: `Viatura alterada${veiculoAnterior ? ` de ${veiculoAnterior}` : ""} para ${novoVeiculoId} por determinação médica` }],
    });
    await atualizarVeiculoStatus(novoVeiculoId, "em_deslocamento");
    if (veiculoAnterior) await atualizarVeiculoStatus(veiculoAnterior, "disponivel");
    notificar(`Viatura ${novoVeiculoId} designada em substituição.`);
  }

  async function adicionarViaturaExtra(ocId, veiculoId) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(ocId, {
      despacho: { ...o.despacho, veiculosExtras: [...(o.despacho.veiculosExtras || []), veiculoId] },
      historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: `Viatura adicional ${veiculoId} incluída na ocorrência` }],
    });
    await atualizarVeiculoStatus(veiculoId, "em_deslocamento");
    notificar(`Viatura ${veiculoId} adicionada à ocorrência.`);
  }

  async function removerViaturaDaOcorrencia(ocId, veiculoId) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    let despacho;
    if (o.despacho.veiculoId === veiculoId) {
      const extras = [...(o.despacho.veiculosExtras || [])];
      const novoPrincipal = extras.shift() || null;
      despacho = { ...o.despacho, veiculoId: novoPrincipal, veiculosExtras: extras };
    } else {
      despacho = { ...o.despacho, veiculosExtras: (o.despacho.veiculosExtras || []).filter((v) => v !== veiculoId) };
    }
    await atualizarOcorrencia(ocId, { despacho, historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: `Viatura ${veiculoId} removida da ocorrência` }] });
    await atualizarVeiculoStatus(veiculoId, "disponivel");
    notificar(`Viatura ${veiculoId} removida da ocorrência.`);
  }

  async function cancelarOcorrenciaFrota(ocId, justificativa) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    const veiculosParaLiberar = [o.despacho?.veiculoId, ...(o.despacho?.veiculosExtras || [])].filter(Boolean);
    await atualizarOcorrencia(ocId, { status: "cancelado", justificativa_cancelamento: justificativa, historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: `Ocorrência cancelada — Justificativa: ${justificativa}` }] });
    for (const vid of veiculosParaLiberar) await atualizarVeiculoStatus(vid, "disponivel");
    notificar("Ocorrência cancelada e viatura(s) liberada(s).");
  }

  async function registrarObito(ocId, tipo) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    await atualizarOcorrencia(ocId, { obito: tipo, historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: `Óbito registrado — ${tipo}` }] });
    notificar(`Óbito (${tipo}) registrado.`);
  }

  async function liberarViatura(ocId) {
    const o = buscarOc(ocId); if (!o) return;
    const ts = agora();
    const veiculosParaLiberar = [o.despacho?.veiculoId, ...(o.despacho?.veiculosExtras || [])].filter(Boolean);
    await atualizarOcorrencia(ocId, { status: "concluido", historico: [...o.historico, { ts, autor: autorAtual("Frota"), evento: "Viatura(s) liberada(s) — ocorrência finalizada" }] });
    for (const vid of veiculosParaLiberar) await atualizarVeiculoStatus(vid, "disponivel");
    notificar("Viatura(s) liberada(s) — QRV.");
  }

  /* ---- Quadro de frota (cadastro de viaturas) ---- */
  async function adicionarVeiculo(dados) {
    if (veiculos.some((v) => v.id === dados.id)) { notificar(`Já existe uma viatura com a nomenclatura ${dados.id}.`); return; }
    const { data, error } = await supabase.from("veiculos").insert({ id: dados.id, tipo: dados.tipo, base: dados.base, tripulantes: dados.tripulantes, status: "disponivel" }).select().single();
    if (error) { notificar("Erro ao incluir viatura: " + error.message); return; }
    setVeiculos((prev) => mesclarVeiculo(prev, { eventType: "INSERT", new: data }));
    notificar(`Viatura ${dados.id} incluída na frota.`);
  }
  async function removerVeiculo(id) {
    const { error } = await supabase.from("veiculos").delete().eq("id", id);
    if (error) { notificar("Erro ao remover viatura: " + error.message); return; }
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
    notificar(`Viatura ${id} removida da frota.`);
  }
  async function atualizarVeiculo(idOriginal, patch) {
    const { data, error } = await supabase.from("veiculos").update(patch).eq("id", idOriginal).select().single();
    if (error) { notificar("Erro ao atualizar viatura: " + error.message); return; }
    setVeiculos((prev) => mesclarVeiculo(prev.filter((v) => v.id !== idOriginal), { eventType: "INSERT", new: data }));
  }
  async function alternarStatusVeiculo(id) {
    const v = veiculos.find((x) => x.id === id); if (!v) return;
    const novoStatus = v.status === "disponivel" ? "manutencao" : v.status === "manutencao" ? "disponivel" : v.status;
    await atualizarVeiculoStatus(id, novoStatus);
  }

  /* ---- Funcionários (cadastro e atualização cadastral) ----
     O cadastro chama uma Edge Function do Supabase (com a chave
     mestra do banco protegida do lado do servidor), então continua
     seguro mesmo sendo feito direto pelo sistema. */
  async function cadastrarFuncionario(dados) {
    const { data, error } = await supabase.functions.invoke("criar-funcionario", { body: dados });
    if (error || data?.error) { notificar("Erro ao cadastrar funcionário: " + (data?.error || error.message)); return; }
    notificar(`Funcionário "${dados.nome}" cadastrado com sucesso.`);
    recarregarUsuarios();
  }
  async function atualizarFuncionario(id, dados) {
    const { error } = await supabase.from("perfis").update({ nome: dados.nome, cpf: dados.cpf, papel: dados.papel }).eq("id", id);
    if (error) { notificar("Erro ao atualizar cadastro: " + error.message); return; }
    notificar("Cadastro atualizado.");
    recarregarUsuarios();
  }
  async function definirAtivoFuncionario(id, ativo, papelAnterior) {
    const novoPapel = ativo ? (papelAnterior === "inativo" ? "tarm" : papelAnterior) : "inativo";
    const { error } = await supabase.from("perfis").update({ papel: novoPapel }).eq("id", id);
    if (error) { notificar("Erro ao atualizar acesso: " + error.message); return; }
    notificar(ativo ? "Acesso reativado — ajuste a função se necessário." : "Acesso desativado.");
    recarregarUsuarios();
  }

  if (modoRecuperacao) return <LoginScreen modoRecuperacao />;
  if (verificandoSessao) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, color: COLORS.textDim, fontFamily: FONT_BODY }}>Verificando sessão...</div>;
  if (!sessao) return <LoginScreen />;

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, color: COLORS.textDim, fontFamily: FONT_BODY }}>
        Carregando dados da Central de Regulação...
      </div>
    );
  }

  const isAdmin = sessao.papel === "admin";
  const isFrotaTarm = sessao.papel === "frota";
  const opcoesPapel = isAdmin ? PAPEIS : isFrotaTarm ? PAPEIS.filter((p) => ["frota", "tarm"].includes(p.key)) : null;
  const papelEfetivo = opcoesPapel ? adminVisao : sessao.papel;
  const papelInfo = PAPEIS.find((p) => p.key === papelEfetivo) || PAPEIS[0];
  const PapelIcon = papelInfo.icon;


  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: FONT_BODY }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(2.6); opacity: 0; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 5px; }
        select option { background: ${COLORS.panel}; color: ${COLORS.text}; }
      `}</style>

      <div style={{ borderBottom: `1px solid ${COLORS.line}`, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.panel, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Siren size={20} color="#FFFFFF" /></div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 0.5, textTransform: "uppercase" }}>Central de Regulação SAMU 192</div>
            <div style={{ fontSize: 12, color: COLORS.textFaint }}>Regional Centro Sul — painel integrado de regulação médica</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: COLORS.textDim, fontWeight: 600 }}>
            {erroConexao ? <><Wifi size={14} color={COLORS.vermelho} /> Falha de conexão com o servidor</> : <><Wifi size={14} color={COLORS.verde} /> Sincronizado em tempo real</>}
          </div>
          <ClockBadge now={now} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: `1px solid ${COLORS.line}`, paddingLeft: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{sessao.nome}</div>
              <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: "uppercase" }}>{papelInfo.label}</div>
            </div>
            <Btn small kind="ghost" onClick={sair}><LogOut size={14} /> Sair</Btn>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", minHeight: "calc(100vh - 69px)" }}>
        <div style={{ borderRight: `1px solid ${COLORS.line}`, padding: 16, background: COLORS.panel }}>
          <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10, fontFamily: FONT_MONO, fontWeight: 700 }}>Terminal / posto</div>
          {!opcoesPapel && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 11px", borderRadius: 6, background: COLORS.panel2, border: `1px solid ${COLORS.accent2}` }}>
              <PapelIcon size={17} color={COLORS.accent2} />
              <div><div style={{ fontSize: 14, fontWeight: 700 }}>{papelInfo.label}</div><div style={{ fontSize: 11, color: COLORS.textFaint }}>{papelInfo.desc}</div></div>
            </div>
          )}
          {opcoesPapel && (
            <div style={{ display: "grid", gap: 6 }}>
              {opcoesPapel.map((p) => {
                const Icon = p.icon; const ativa = papelEfetivo === p.key;
                return (
                  <button key={p.key} onClick={() => setAdminVisao(p.key)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "10px 11px", borderRadius: 6, cursor: "pointer", background: ativa ? COLORS.panel2 : "transparent", border: `1px solid ${ativa ? COLORS.accent2 : "transparent"}`, color: ativa ? COLORS.text : COLORS.textDim }}>
                    <Icon size={16} color={ativa ? COLORS.accent2 : COLORS.textFaint} />
                    <div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.label}</div><div style={{ fontSize: 10.5, color: COLORS.textFaint }}>{p.desc}</div></div>
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 24, padding: 11, background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 7 }}>
            <div style={{ fontSize: 11, color: COLORS.textFaint, textTransform: "uppercase", marginBottom: 6, fontFamily: FONT_MONO, fontWeight: 700 }}>Resumo agora</div>
            <div style={{ fontSize: 13, display: "grid", gap: 4 }}>
              <span>Fila regulação: <b style={{ color: COLORS.amarelo }}>{ocorrencias.filter((o) => o.status === "aguardando_regulacao").length}</b></span>
              <span>Aguard. viatura: <b style={{ color: COLORS.accent }}>{ocorrencias.filter((o) => o.status === "aguardando_veiculo").length}</b></span>
              <span>Em atendimento: <b style={{ color: COLORS.verde }}>{ocorrencias.filter((o) => ["despachado", "em_atendimento"].includes(o.status)).length}</b></span>
            </div>
          </div>
        </div>

        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: COLORS.textDim }}>
            <PapelIcon size={16} color={COLORS.accent2} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 }}>{papelInfo.label}</span>
          </div>

          {papelEfetivo === "tarm" && <TarmView ocorrencias={ocorrencias} onNovaOcorrencia={criarOcorrencia} onCancelarOcorrencia={cancelarOcorrencia} now={now} />}
          {papelEfetivo === "regulacao" && <RegulacaoView ocorrencias={ocorrencias} sessao={sessao} onRegular={regular} onAbrir={setModalOc} onContraRegulacao={contraRegular} onAlterarClassificacao={alterarClassificacao} onAlterarViatura={alterarViatura} onAdicionarInfoComplementar={adicionarInfoComplementar} onCancelarRegulada={cancelarRegulada} onDefinirUnidadeDestino={definirUnidadeDestino} />}
          {papelEfetivo === "frota" && <FrotaView ocorrencias={ocorrencias} veiculos={veiculos} onDespachar={despachar} onMarcarTempo={marcarTempo} onAbrir={setModalOc} onAddVeiculo={adicionarVeiculo} onRemoveVeiculo={removerVeiculo} onUpdateVeiculo={atualizarVeiculo} onToggleStatus={alternarStatusVeiculo} onTrocarViatura={trocarViatura} onAdicionarViaturaExtra={adicionarViaturaExtra} onRemoverViaturaOcorrencia={removerViaturaDaOcorrencia} onCancelarOcorrenciaFrota={cancelarOcorrenciaFrota} onRegistrarObito={registrarObito} onLiberarViatura={liberarViatura} />}
          {papelEfetivo === "gestao" && <GestaoView ocorrencias={ocorrencias} veiculos={veiculos} onAbrir={setModalOc} usuarios={usuarios} sessao={sessao} onCadastrarFuncionario={cadastrarFuncionario} onAtualizarFuncionario={atualizarFuncionario} onDefinirAtivoFuncionario={definirAtivoFuncionario} onRecarregarFuncionarios={recarregarUsuarios} />}
        </div>
      </div>

      {toast && <div style={{ position: "fixed", bottom: 20, right: 20, background: COLORS.panel, border: `1px solid ${COLORS.accent2}`, borderRadius: 7, padding: "11px 17px", fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(20,23,31,0.18)" }}><Radio size={15} color={COLORS.accent2} /> {toast}</div>}
      <OcorrenciaModal oc={modalOc} onClose={() => setModalOc(null)} />
    </div>
  );
}
