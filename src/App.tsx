import { useState } from "react";
import Icon from "@/components/ui/icon";

type View = "investor" | "admin";

type Contract = {
  id: string;
  supplierName: string;
  supplierCategory: string;
  title: string;
  description: string;
  totalAmount: number;
  collected: number;
  minInvestment: number;
  returnRate: number;
  durationMonths: number;
  deadline: string;
  status: "open" | "funded" | "closed";
};

type Supplier = {
  id: string;
  name: string;
  category: string;
  description: string;
  verified: boolean;
};

const CATEGORIES = ["Все", "Строительство", "АПК", "IT", "Логистика", "Энергетика"];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "ТехноСтрой ГК", category: "Строительство", description: "Генподрядчик коммерческой недвижимости, 15 лет на рынке", verified: true },
  { id: "s2", name: "АгроПромГрупп", category: "АПК", description: "Поставки с/х техники и оборудования по всей России", verified: true },
  { id: "s3", name: "ЦифровойМир", category: "IT", description: "Разработка и внедрение IT-инфраструктуры для госсектора", verified: true },
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "c1", supplierName: "ТехноСтрой ГК", supplierCategory: "Строительство",
    title: "Строительство офисного центра в Москве",
    description: "Финансирование строительства 12-этажного офисного центра класса А. Объект уже согласован, аренда подтверждена на 80%.",
    totalAmount: 120_000_000, collected: 81_600_000, minInvestment: 100_000,
    returnRate: 18, durationMonths: 18, deadline: "30 июня 2026", status: "open",
  },
  {
    id: "c2", supplierName: "АгроПромГрупп", supplierCategory: "АПК",
    title: "Поставка комбайнов в Краснодарский край",
    description: "Закупка 24 зерноуборочных комбайнов по госконтракту. Оплата гарантирована Министерством сельского хозяйства РФ.",
    totalAmount: 48_000_000, collected: 48_000_000, minInvestment: 50_000,
    returnRate: 14, durationMonths: 9, deadline: "01 мая 2026", status: "funded",
  },
  {
    id: "c3", supplierName: "ЦифровойМир", supplierCategory: "IT",
    title: "IT-инфраструктура для региональных больниц",
    description: "Внедрение МИС в 18 больницах Поволжья. Контракт с Минздравом, поэтапные выплаты.",
    totalAmount: 32_000_000, collected: 9_600_000, minInvestment: 30_000,
    returnRate: 16, durationMonths: 12, deadline: "15 авг 2026", status: "open",
  },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `₽${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₽${(n / 1_000).toFixed(0)}K`;
  return `₽${n}`;
}

function pct(collected: number, total: number) {
  return Math.round((collected / total) * 100);
}

function ContractCard({ contract, onInvest }: { contract: Contract; onInvest: (c: Contract) => void }) {
  const progress = pct(contract.collected, contract.totalAmount);
  const statusColor = contract.status === "open" ? "#00d4ff" : contract.status === "funded" ? "#00e5a0" : "rgba(255,255,255,0.3)";
  const statusLabel = contract.status === "open" ? "Открыт" : contract.status === "funded" ? "Собрано" : "Закрыт";

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-white/15" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
              {contract.supplierCategory}
            </span>
            <span className="text-xs font-medium" style={{ color: statusColor }}>● {statusLabel}</span>
          </div>
          <h3 className="text-base font-semibold text-white leading-snug">{contract.title}</h3>
          <p className="text-xs text-white/40 mt-0.5">{contract.supplierName}</p>
        </div>
      </div>

      <p className="text-sm text-white/55 leading-relaxed">{contract.description}</p>

      <div>
        <div className="flex justify-between text-xs text-white/40 mb-1.5">
          <span>Собрано {fmt(contract.collected)} из {fmt(contract.totalAmount)}</span>
          <span className="font-mono" style={{ color: statusColor }}>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%`, background: contract.status === "funded" ? "var(--green)" : "var(--cyan)" }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Доходность", value: `${contract.returnRate}% год`, color: "#00e5a0" },
          { label: "Срок", value: `${contract.durationMonths} мес`, color: "#00d4ff" },
          { label: "Мин. взнос", value: fmt(contract.minInvestment), color: "#a78bfa" },
        ].map((m, i) => (
          <div key={i} className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="text-sm font-semibold font-mono" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-white/35 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-white/35">
          <Icon name="Clock" size={12} className="inline mr-1" />
          до {contract.deadline}
        </span>
        <button
          onClick={() => onInvest(contract)}
          disabled={contract.status !== "open"}
          className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
          style={contract.status === "open"
            ? { background: "var(--cyan)", color: "#070d18" }
            : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" }
          }
        >
          {contract.status === "open" ? "Вложить" : "Закрыт"}
        </button>
      </div>
    </div>
  );
}

function InvestModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [amount, setAmount] = useState(contract.minInvestment.toString());
  const [done, setDone] = useState(false);
  const num = parseInt(amount.replace(/\D/g, "")) || 0;
  const returnAmount = Math.round(num * (1 + (contract.returnRate / 100) * (contract.durationMonths / 12)));
  const profit = returnAmount - num;

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
        <div className="glass rounded-3xl p-8 max-w-sm w-full text-center animate-fade-in" style={{ border: "1px solid rgba(0,229,160,0.2)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,229,160,0.15)" }}>
            <Icon name="CheckCircle" size={32} style={{ color: "var(--green)" }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Заявка отправлена!</h3>
          <p className="text-sm text-white/50 mb-1">Сумма: <span className="text-white font-mono">{fmt(num)}</span></p>
          <p className="text-sm text-white/50 mb-6">Возврат через {contract.durationMonths} мес: <span className="font-mono" style={{ color: "var(--green)" }}>{fmt(returnAmount)}</span></p>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ background: "var(--cyan)", color: "#070d18" }}>
            Отлично
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
      <div className="glass rounded-3xl p-6 max-w-md w-full animate-fade-in" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Инвестировать</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="text-sm font-semibold text-white mb-0.5">{contract.title}</div>
          <div className="text-xs text-white/40">{contract.supplierName}</div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-white/45 mb-2 block">Сумма инвестиции</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">₽</span>
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ""))}
              className="w-full pl-8 pr-4 py-3 rounded-xl text-white text-sm outline-none font-mono"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
            />
          </div>
          <div className="text-xs text-white/30 mt-1.5">Минимум: {fmt(contract.minInvestment)}</div>
        </div>

        <div className="flex gap-2 mb-5">
          {[1, 5, 10].map(mult => {
            const v = contract.minInvestment * mult;
            return (
              <button key={mult} onClick={() => setAmount(v.toString())}
                className="flex-1 py-2 rounded-xl text-xs font-mono transition-colors"
                style={{ background: "rgba(0,212,255,0.1)", color: "var(--cyan)", border: "1px solid rgba(0,212,255,0.2)" }}>
                {fmt(v)}
              </button>
            );
          })}
        </div>

        {num > 0 && (
          <div className="rounded-xl p-4 mb-5 space-y-2" style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.12)" }}>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Вложите</span>
              <span className="font-mono text-white">{fmt(num)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Доход ({contract.returnRate}%/год × {contract.durationMonths} мес)</span>
              <span className="font-mono" style={{ color: "var(--green)" }}>+{fmt(profit)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-semibold" style={{ borderColor: "rgba(0,229,160,0.15)" }}>
              <span className="text-white/70">Итого через {contract.durationMonths} мес</span>
              <span className="font-mono text-white">{fmt(returnAmount)}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => num >= contract.minInvestment && setDone(true)}
          disabled={num < contract.minInvestment}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
          style={num >= contract.minInvestment
            ? { background: "var(--cyan)", color: "#070d18" }
            : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" }
          }
        >
          Отправить заявку
        </button>
      </div>
    </div>
  );
}

function InvestorView({ contracts }: { contracts: Contract[] }) {
  const [category, setCategory] = useState("Все");
  const [selected, setSelected] = useState<Contract | null>(null);

  const filtered = contracts.filter(c => category === "Все" || c.supplierCategory === category);
  const openCount = contracts.filter(c => c.status === "open").length;
  const totalOpen = contracts.filter(c => c.status === "open").reduce((s, c) => s + (c.totalAmount - c.collected), 0);

  return (
    <div className="min-h-screen" style={{ background: "#070d18" }}>
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4" style={{ background: "rgba(7,13,24,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,255,0.2)", border: "1px solid rgba(0,212,255,0.3)" }}>
            <Icon name="Zap" size={18} style={{ color: "var(--cyan)" }} />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none">FinVault</div>
            <div className="text-xs text-white/30 font-mono mt-0.5">Платформа инвестиций</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden sm:block">Открыто: <span className="text-white font-mono">{openCount}</span></span>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(0,212,255,0.12)", color: "var(--cyan)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Icon name="User" size={14} />
            Войти
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-5" style={{ background: "rgba(0,212,255,0.08)", color: "var(--cyan)", border: "1px solid rgba(0,212,255,0.18)" }}>
            <span className="status-dot verified" />
            Доступно для вложения: {fmt(totalOpen)}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Инвестируйте в реальные<br />бизнес-контракты
          </h1>
          <p className="text-white/45 text-base max-w-lg mx-auto leading-relaxed">
            Выберите контракт, укажите сумму и получите доход. Все поставщики верифицированы, контракты подтверждены документально.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-7">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={category === cat
                ? { background: "var(--cyan)", color: "#070d18" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Icon name="FolderOpen" size={40} className="mx-auto mb-3 opacity-30" />
            <p>Контрактов в этой категории пока нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(c => (
              <ContractCard key={c.id} contract={c} onInvest={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <InvestModal contract={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AdminView({ contracts, suppliers, onAddSupplier, onAddContract, onDeleteContract }: {
  contracts: Contract[];
  suppliers: Supplier[];
  onAddSupplier: (s: Supplier) => void;
  onAddContract: (c: Contract) => void;
  onDeleteContract: (id: string) => void;
}) {
  const [tab, setTab] = useState<"contracts" | "suppliers">("contracts");
  const [sForm, setSForm] = useState({ name: "", category: "Строительство", description: "" });
  const [sSaved, setSSaved] = useState(false);
  const [cForm, setCForm] = useState({ supplierId: suppliers[0]?.id || "", title: "", description: "", totalAmount: "", minInvestment: "", returnRate: "", durationMonths: "", deadline: "" });
  const [cSaved, setCSaved] = useState(false);

  function submitSupplier() {
    if (!sForm.name) return;
    onAddSupplier({ id: `s${Date.now()}`, ...sForm, verified: true });
    setSForm({ name: "", category: "Строительство", description: "" });
    setSSaved(true);
    setTimeout(() => setSSaved(false), 2000);
  }

  function submitContract() {
    if (!cForm.title || !cForm.totalAmount) return;
    const sup = suppliers.find(s => s.id === cForm.supplierId);
    if (!sup) return;
    onAddContract({
      id: `c${Date.now()}`,
      supplierName: sup.name,
      supplierCategory: sup.category,
      title: cForm.title,
      description: cForm.description,
      totalAmount: parseInt(cForm.totalAmount) || 0,
      collected: 0,
      minInvestment: parseInt(cForm.minInvestment) || 10_000,
      returnRate: parseInt(cForm.returnRate) || 12,
      durationMonths: parseInt(cForm.durationMonths) || 12,
      deadline: cForm.deadline || "—",
      status: "open",
    });
    setCForm({ supplierId: suppliers[0]?.id || "", title: "", description: "", totalAmount: "", minInvestment: "", returnRate: "", durationMonths: "", deadline: "" });
    setCSaved(true);
    setTimeout(() => setCSaved(false), 2000);
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none transition-all";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", colorScheme: "dark" as const };
  const labelCls = "text-xs text-white/40 mb-1.5 block";

  return (
    <div className="min-h-screen" style={{ background: "#070d18" }}>
      <header className="flex items-center justify-between px-5 py-4" style={{ background: "rgba(7,13,24,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,140,66,0.2)", border: "1px solid rgba(255,140,66,0.3)" }}>
            <Icon name="ShieldCheck" size={18} style={{ color: "#ff8c42" }} />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none">FinVault Admin</div>
            <div className="text-xs text-white/30 font-mono mt-0.5">Управление платформой</div>
          </div>
        </div>
        <div className="text-xs text-white/30 font-mono hidden sm:block">
          {suppliers.length} поставщ. · {contracts.length} контрактов
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["contracts", "suppliers"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={tab === t
                ? { background: "rgba(255,140,66,0.15)", color: "#ff8c42", border: "1px solid rgba(255,140,66,0.25)" }
                : { color: "rgba(255,255,255,0.4)" }
              }
            >
              {t === "contracts" ? "Контракты" : "Поставщики"}
            </button>
          ))}
        </div>

        {tab === "suppliers" && (
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-sm font-semibold text-white mb-4">Добавить поставщика</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Название компании</label>
                  <input value={sForm.name} onChange={e => setSForm({ ...sForm, name: e.target.value })}
                    placeholder="ООО «Название»" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls}>Категория</label>
                  <select value={sForm.category} onChange={e => setSForm({ ...sForm, category: e.target.value })}
                    className={inputCls} style={{ ...inputStyle, appearance: "none" as const }}>
                    {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Описание</label>
                  <textarea value={sForm.description} onChange={e => setSForm({ ...sForm, description: e.target.value })}
                    rows={2} placeholder="Кратко о компании"
                    className={inputCls} style={{ ...inputStyle, resize: "none" as const }} />
                </div>
                <button onClick={submitSupplier}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#ff8c42", color: "#070d18" }}>
                  {sSaved ? "✓ Добавлен!" : "Добавить поставщика"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {suppliers.map(s => (
                <div key={s.id} className="glass rounded-2xl px-5 py-4 flex items-center gap-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.15)" }}>
                    <Icon name="Building2" size={16} style={{ color: "#a78bfa" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{s.name}</div>
                    <div className="text-xs text-white/40 truncate">{s.category} · {s.description}</div>
                  </div>
                  {s.verified && <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(0,229,160,0.12)", color: "var(--green)" }}>✓ Верифицирован</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "contracts" && (
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-sm font-semibold text-white mb-4">Добавить контракт</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Поставщик</label>
                  <select value={cForm.supplierId} onChange={e => setCForm({ ...cForm, supplierId: e.target.value })}
                    className={inputCls} style={{ ...inputStyle, appearance: "none" as const }}>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Название контракта</label>
                  <input value={cForm.title} onChange={e => setCForm({ ...cForm, title: e.target.value })}
                    placeholder="Кратко и понятно" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls}>Описание для инвесторов</label>
                  <textarea value={cForm.description} onChange={e => setCForm({ ...cForm, description: e.target.value })}
                    rows={3} placeholder="Что это за контракт, почему он надёжный"
                    className={inputCls} style={{ ...inputStyle, resize: "none" as const }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Сумма сбора (₽)</label>
                    <input value={cForm.totalAmount} onChange={e => setCForm({ ...cForm, totalAmount: e.target.value.replace(/\D/g, "") })}
                      placeholder="10 000 000" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls}>Мин. взнос (₽)</label>
                    <input value={cForm.minInvestment} onChange={e => setCForm({ ...cForm, minInvestment: e.target.value.replace(/\D/g, "") })}
                      placeholder="50 000" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls}>Доходность (% в год)</label>
                    <input value={cForm.returnRate} onChange={e => setCForm({ ...cForm, returnRate: e.target.value.replace(/\D/g, "") })}
                      placeholder="14" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls}>Срок (месяцев)</label>
                    <input value={cForm.durationMonths} onChange={e => setCForm({ ...cForm, durationMonths: e.target.value.replace(/\D/g, "") })}
                      placeholder="12" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Дедлайн сбора</label>
                  <input value={cForm.deadline} onChange={e => setCForm({ ...cForm, deadline: e.target.value })}
                    placeholder="30 сентября 2026" className={inputCls} style={inputStyle} />
                </div>
                <button onClick={submitContract}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#ff8c42", color: "#070d18" }}>
                  {cSaved ? "✓ Добавлен!" : "Добавить контракт"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {contracts.map(c => {
                const progress = pct(c.collected, c.totalAmount);
                return (
                  <div key={c.id} className="glass rounded-2xl px-5 py-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{c.title}</div>
                        <div className="text-xs text-white/40 mt-0.5">{c.supplierName} · {fmt(c.totalAmount)} · {c.returnRate}% год</div>
                      </div>
                      <button onClick={() => onDeleteContract(c.id)}
                        className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%`, background: c.status === "funded" ? "var(--green)" : "var(--cyan)" }} />
                      </div>
                      <span className="text-xs font-mono text-white/45 flex-shrink-0">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("investor");
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  return (
    <div>
      {/* Переключатель вида */}
      <div className="fixed bottom-5 right-5 z-50 flex gap-1 p-1.5 rounded-2xl" style={{ background: "rgba(7,13,24,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
        <button onClick={() => setView("investor")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={view === "investor" ? { background: "rgba(0,212,255,0.15)", color: "var(--cyan)" } : { color: "rgba(255,255,255,0.4)" }}>
          <Icon name="Users" size={13} />
          Инвестор
        </button>
        <button onClick={() => setView("admin")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={view === "admin" ? { background: "rgba(255,140,66,0.15)", color: "#ff8c42" } : { color: "rgba(255,255,255,0.4)" }}>
          <Icon name="ShieldCheck" size={13} />
          Админ
        </button>
      </div>

      {view === "investor" && <InvestorView contracts={contracts} />}
      {view === "admin" && (
        <AdminView
          contracts={contracts}
          suppliers={suppliers}
          onAddSupplier={s => setSuppliers(prev => [...prev, s])}
          onAddContract={c => setContracts(prev => [...prev, c])}
          onDeleteContract={id => setContracts(prev => prev.filter(c => c.id !== id))}
        />
      )}
    </div>
  );
}
