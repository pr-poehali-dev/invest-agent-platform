import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "contracts" | "investors" | "suppliers" | "portfolio" | "profile" | "support";

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "LayoutDashboard" },
  { id: "contracts", label: "Контракты", icon: "FileText" },
  { id: "investors", label: "Инвесторы", icon: "Users" },
  { id: "suppliers", label: "Поставщики", icon: "Building2" },
  { id: "portfolio", label: "Портфель", icon: "PieChart" },
  { id: "profile", label: "Профиль", icon: "UserCircle" },
  { id: "support", label: "Поддержка", icon: "LifeBuoy" },
];

const MOCK_INVESTORS = [
  { id: 1, name: "Алексей Петров", company: "InvestGroup LLC", amount: "₽12.4M", status: "verified", date: "15 апр 2026", risk: "Низкий" },
  { id: 2, name: "Марина Соколова", company: "Capital Partners", amount: "₽8.7M", status: "pending", date: "18 апр 2026", risk: "Средний" },
  { id: 3, name: "Дмитрий Волков", company: "FundTech", amount: "₽22.1M", status: "verified", date: "10 апр 2026", risk: "Низкий" },
  { id: 4, name: "Елена Новикова", company: "Sovereign Capital", amount: "₽5.3M", status: "rejected", date: "20 апр 2026", risk: "Высокий" },
  { id: 5, name: "Сергей Морозов", company: "Alpha Invest", amount: "₽17.9M", status: "pending", date: "21 апр 2026", risk: "Средний" },
];

const MOCK_SUPPLIERS = [
  { id: 1, name: "ТехноСтрой ГК", inn: "7701234567", category: "Строительство", contracts: 14, status: "verified", rating: 4.8 },
  { id: 2, name: "ЛогистикПро", inn: "7712345678", category: "Логистика", contracts: 8, status: "pending", rating: 4.2 },
  { id: 3, name: "АгроПромГрупп", inn: "7723456789", category: "АПК", contracts: 21, status: "verified", rating: 4.9 },
  { id: 4, name: "ЦифровойМир", inn: "7734567890", category: "IT", contracts: 6, status: "verified", rating: 4.6 },
  { id: 5, name: "МеталлТорг", inn: "7745678901", category: "Металлургия", contracts: 3, status: "rejected", rating: 3.1 },
];

const MOCK_CONTRACTS = [
  { id: "CNT-2026-001", name: "Строительство офисного центра", supplier: "ТехноСтрой ГК", value: "₽340M", progress: 68, status: "active", deadline: "30 сен 2026" },
  { id: "CNT-2026-002", name: "Поставка с/х оборудования", supplier: "АгроПромГрупп", value: "₽89M", progress: 100, status: "completed", deadline: "01 апр 2026" },
  { id: "CNT-2026-003", name: "Разработка IT-инфраструктуры", supplier: "ЦифровойМир", value: "₽56M", progress: 32, status: "active", deadline: "15 дек 2026" },
  { id: "CNT-2026-004", name: "Логистика и дистрибуция", supplier: "ЛогистикПро", value: "₽23M", progress: 15, status: "review", deadline: "01 авг 2026" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; dot: string }> = {
    verified: { label: "Верифицирован", bg: "rgba(0,229,160,0.15)", dot: "verified" },
    pending: { label: "На проверке", bg: "rgba(255,140,66,0.15)", dot: "pending" },
    rejected: { label: "Отклонён", bg: "rgba(255,71,87,0.15)", dot: "rejected" },
    active: { label: "Активен", bg: "rgba(0,212,255,0.15)", dot: "" },
    completed: { label: "Завершён", bg: "rgba(0,229,160,0.15)", dot: "verified" },
    review: { label: "На рассмотрении", bg: "rgba(255,140,66,0.15)", dot: "pending" },
    open: { label: "Открыт", bg: "rgba(0,212,255,0.15)", dot: "" },
  };
  const s = map[status] || { label: status, bg: "rgba(255,255,255,0.1)", dot: "" };
  return (
    <span style={{ background: s.bg }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white/80">
      {s.dot && <span className={`status-dot ${s.dot}`} />}
      {s.label}
    </span>
  );
}

function MiniLineChart({ values, color = "#00d4ff" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 120, h = 40, pad = 4;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const gradId = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const r = 52, cx = 64, cy = 64, stroke = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const pct = s.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const rot = (offset / total) * 360 - 90;
          offset += s.value;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="round"
              style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="600" fontFamily="IBM Plex Mono">
          {total}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
          распред.
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-white/60">{s.label}</span>
            <span className="text-xs font-mono text-white/80 ml-2">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const barData = [
    { label: "Янв", value: 42, color: "rgba(0,212,255,0.5)" },
    { label: "Фев", value: 58, color: "rgba(0,212,255,0.5)" },
    { label: "Мар", value: 51, color: "rgba(0,212,255,0.5)" },
    { label: "Апр", value: 73, color: "#00d4ff" },
    { label: "Май", value: 66, color: "rgba(0,212,255,0.5)" },
    { label: "Июн", value: 82, color: "rgba(0,212,255,0.5)" },
  ];
  const portfolio = [
    { label: "Строительство", value: 38, color: "#00d4ff" },
    { label: "АПК", value: 24, color: "#00e5a0" },
    { label: "IT", value: 21, color: "#ff8c42" },
    { label: "Логистика", value: 17, color: "#a78bfa" },
  ];
  const maxBar = Math.max(...barData.map(d => d.value));
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Обзор платформы</h1>
          <p className="text-sm text-white/40 mt-0.5">21 апреля 2026 · Все системы работают</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono" style={{ borderColor: "rgba(0,212,255,0.3)", color: "var(--cyan)" }}>
          <span className="status-dot verified" />
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Активных инвесторов", value: "247", delta: "+12", icon: "Users", color: "#00d4ff", spark: [40,55,48,62,58,71,68] },
          { label: "Объём портфеля", value: "₽4.2B", delta: "+8.3%", icon: "TrendingUp", color: "#00e5a0", spark: [30,42,38,55,51,64,72] },
          { label: "Активных контрактов", value: "38", delta: "+3", icon: "FileText", color: "#a78bfa", spark: [20,25,22,30,28,35,38] },
          { label: "Верифицировано", value: "89%", delta: "+2%", icon: "ShieldCheck", color: "#ff8c42", spark: [75,80,78,84,82,87,89] },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                <Icon name={kpi.icon} size={18} style={{ color: kpi.color }} />
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--green)" }}>{kpi.delta}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold text-white font-mono">{kpi.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{kpi.label}</div>
              </div>
              <MiniLineChart values={kpi.spark} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Инвестиционный поток</h3>
            <span className="text-xs text-white/30 font-mono">млн ₽</span>
          </div>
          <div className="flex items-end gap-3 h-32 w-full">
            {barData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-mono text-white/40">{d.value}</span>
                <div className="w-full rounded-t-sm" style={{ height: `${(d.value / maxBar) * 100}px`, background: d.color }} />
                <span className="text-xs text-white/40">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-5">Структура портфеля</h3>
          <DonutChart segments={portfolio} />
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Последние операции</h3>
          <button className="text-xs" style={{ color: "var(--cyan)" }}>Все операции</button>
        </div>
        <div className="space-y-1">
          {[
            { op: "Новый инвестор", name: "Сергей Морозов", amount: "+₽17.9M", time: "2 мин назад", icon: "UserPlus", color: "#00d4ff" },
            { op: "Контракт подписан", name: "CNT-2026-004", amount: "₽23M", time: "18 мин назад", icon: "FileCheck", color: "#00e5a0" },
            { op: "Верификация пройдена", name: "АгроПромГрупп", amount: "Поставщик", time: "1 ч назад", icon: "ShieldCheck", color: "#a78bfa" },
            { op: "Платёж выполнен", name: "CNT-2026-001", amount: "₽12M", time: "3 ч назад", icon: "ArrowUpRight", color: "#ff8c42" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}20` }}>
                <Icon name={t.icon} size={15} style={{ color: t.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 font-medium">{t.op}</div>
                <div className="text-xs text-white/35">{t.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-white/80">{t.amount}</div>
                <div className="text-xs text-white/30">{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContractsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Контракты</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--cyan)", color: "#070d18" }}>
          <Icon name="Plus" size={16} />
          Новый контракт
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Активных", value: "24", color: "#00d4ff" },
          { label: "Завершённых", value: "14", color: "#00e5a0" },
          { label: "На рассмотрении", value: "6", color: "#ff8c42" },
        ].map((s, i) => (
          <div key={i} className="kpi-card text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">ID</th>
                <th className="text-left">Название</th>
                <th className="text-left">Поставщик</th>
                <th className="text-left">Стоимость</th>
                <th className="text-left">Прогресс</th>
                <th className="text-left">Срок</th>
                <th className="text-left">Статус</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTRACTS.map((c) => (
                <tr key={c.id} className="cursor-pointer">
                  <td className="font-mono text-xs" style={{ color: "var(--cyan)" }}>{c.id}</td>
                  <td className="text-white/80">{c.name}</td>
                  <td className="text-white/55">{c.supplier}</td>
                  <td className="font-mono text-white">{c.value}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.progress === 100 ? "var(--green)" : "var(--cyan)" }} />
                      </div>
                      <span className="text-xs font-mono text-white/50 w-8">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="text-white/45 text-xs">{c.deadline}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvestorsPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_INVESTORS.filter(inv =>
    inv.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.company.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Инвесторы</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--cyan)", color: "#070d18" }}>
          <Icon name="UserPlus" size={16} />
          Добавить
        </button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени или компании..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm text-white/80 placeholder-white/25 outline-none focus:ring-1 transition-all"
            style={{ colorScheme: "dark" }}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm text-white/60">
          <Icon name="Filter" size={16} />
          Фильтр
        </button>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Инвестор</th>
                <th className="text-left">Компания</th>
                <th className="text-left">Сумма</th>
                <th className="text-left">Риск</th>
                <th className="text-left">Дата заявки</th>
                <th className="text-left">Верификация</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="cursor-pointer">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(0,212,255,0.15)", color: "var(--cyan)" }}>
                        {inv.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-white/85">{inv.name}</span>
                    </div>
                  </td>
                  <td className="text-white/55">{inv.company}</td>
                  <td className="font-mono text-white">{inv.amount}</td>
                  <td>
                    <span className="text-xs" style={{ color: inv.risk === "Низкий" ? "var(--green)" : inv.risk === "Высокий" ? "var(--red)" : "var(--orange)" }}>
                      ● {inv.risk}
                    </span>
                  </td>
                  <td className="text-white/45 text-xs">{inv.date}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 transition-colors">
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SuppliersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Поставщики</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--cyan)", color: "#070d18" }}>
          <Icon name="Plus" size={16} />
          Добавить
        </button>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Компания</th>
                <th className="text-left">ИНН</th>
                <th className="text-left">Категория</th>
                <th className="text-left">Контракты</th>
                <th className="text-left">Рейтинг</th>
                <th className="text-left">Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SUPPLIERS.map((s) => (
                <tr key={s.id} className="cursor-pointer">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.15)" }}>
                        <Icon name="Building2" size={14} style={{ color: "#a78bfa" }} />
                      </div>
                      <span className="font-medium text-white/85">{s.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-white/45 text-xs">{s.inn}</td>
                  <td>
                    <span className="px-2 py-1 rounded-lg text-xs bg-white/6 text-white/60">{s.category}</span>
                  </td>
                  <td className="font-mono text-white/70">{s.contracts}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="font-mono text-sm text-white/80">{s.rating}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 transition-colors">
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PortfolioPage() {
  const allocation = [
    { label: "Строительство", value: 38, color: "#00d4ff", amount: "₽1.60B" },
    { label: "АПК", value: 24, color: "#00e5a0", amount: "₽1.01B" },
    { label: "IT", value: 21, color: "#a78bfa", amount: "₽882M" },
    { label: "Логистика", value: 17, color: "#ff8c42", amount: "₽714M" },
  ];
  const perf = [
    { month: "Окт", val: 3.8 }, { month: "Ноя", val: 2.1 }, { month: "Дек", val: 4.5 },
    { month: "Янв", val: 1.9 }, { month: "Фев", val: 5.2 }, { month: "Мар", val: 3.7 }, { month: "Апр", val: 6.1 },
  ];
  const maxPerf = Math.max(...perf.map(p => p.val));
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-white">Портфель</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Общий объём", value: "₽4.21B", color: "#00d4ff" },
          { label: "Доходность (год)", value: "+24.8%", color: "#00e5a0" },
          { label: "IRR", value: "18.3%", color: "#a78bfa" },
          { label: "Инвесторов", value: "247", color: "#ff8c42" },
        ].map((m, i) => (
          <div key={i} className="kpi-card text-center py-5">
            <div className="text-2xl font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-white/40 mt-1">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-5">Аллокация по секторам</h3>
          <DonutChart segments={allocation} />
          <div className="mt-5 space-y-2">
            {allocation.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-1.5 rounded-full flex-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${a.value}%`, background: a.color }} />
                </div>
                <span className="text-xs font-mono text-white/50 w-20 text-right">{a.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-5">Доходность по месяцам (%)</h3>
          <div className="flex items-end gap-2 h-36">
            {perf.map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-mono" style={{ color: p.val > 4 ? "var(--green)" : "var(--cyan)" }}>{p.val}</span>
                <div className="w-full rounded-t-sm" style={{
                  height: `${(p.val / maxPerf) * 120}px`,
                  background: p.val > 4 ? "rgba(0,229,160,0.6)" : "rgba(0,212,255,0.5)"
                }} />
                <span className="text-xs text-white/35">{p.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const docs = [
    { name: "Паспорт", status: "verified", updated: "10 апр 2026" },
    { name: "ИНН / СНИЛС", status: "verified", updated: "10 апр 2026" },
    { name: "Справка о доходах", status: "pending", updated: "19 апр 2026" },
    { name: "Лицензия инвестора", status: "verified", updated: "01 мар 2026" },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-white">Профиль</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3" style={{ background: "rgba(0,212,255,0.15)", color: "var(--cyan)" }}>
            АП
          </div>
          <div className="font-semibold text-white text-lg">Алексей Петров</div>
          <div className="text-sm text-white/40 mt-1">Аккредитованный инвестор</div>
          <div className="mt-3">
            <StatusBadge status="verified" />
          </div>
          <div className="w-full mt-5 space-y-2 text-left">
            {[
              { label: "Email", value: "a.petrov@invest.ru" },
              { label: "Телефон", value: "+7 (495) 123-45-67" },
              { label: "Регион", value: "Москва" },
            ].map((f, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-white/5">
                <div className="text-xs text-white/30">{f.label}</div>
                <div className="text-sm text-white/70 mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Верификация документов</h3>
              <span className="text-xs font-mono" style={{ color: "var(--green)" }}>3/4 пройдено</span>
            </div>
            <div className="space-y-3">
              {docs.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Icon name="FileText" size={16} className="text-white/40" />
                    <span className="text-sm text-white/75">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30">{d.updated}</span>
                    <StatusBadge status={d.status} />
                    {d.status === "pending" && (
                      <button className="text-xs" style={{ color: "var(--cyan)" }}>Загрузить</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Уровень верификации</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Прогресс верификации</span>
                  <span className="font-mono" style={{ color: "var(--cyan)" }}>75%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: "75%", background: "linear-gradient(90deg, #00d4ff, #60a5fa)" }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Базовый", active: true },
                { label: "Стандарт", active: true },
                { label: "Полный", active: false },
              ].map((lvl, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: lvl.active ? "rgba(0,229,160,0.1)" : "rgba(255,255,255,0.04)" }}>
                  <Icon name={lvl.active ? "CheckCircle" : "Circle"} size={14} style={{ color: lvl.active ? "var(--green)" : "rgba(255,255,255,0.2)" }} />
                  <span className="text-xs" style={{ color: lvl.active ? "var(--green)" : "rgba(255,255,255,0.3)" }}>{lvl.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportPage() {
  const tickets = [
    { id: "TKT-001", subject: "Проблема с верификацией документа", status: "open", priority: "high", date: "20 апр" },
    { id: "TKT-002", subject: "Запрос на изменение реквизитов", status: "pending", priority: "medium", date: "18 апр" },
    { id: "TKT-003", subject: "Вопрос по условиям контракта", status: "verified", priority: "low", date: "15 апр" },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Поддержка</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--cyan)", color: "#070d18" }}>
          <Icon name="Plus" size={16} />
          Новый тикет
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Мои обращения</h3>
          {tickets.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono" style={{ color: "var(--cyan)" }}>{t.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: t.priority === "high" ? "rgba(255,71,87,0.15)" : t.priority === "medium" ? "rgba(255,140,66,0.15)" : "rgba(255,255,255,0.08)",
                      color: t.priority === "high" ? "var(--red)" : t.priority === "medium" ? "var(--orange)" : "rgba(255,255,255,0.4)"
                    }}>
                      {t.priority === "high" ? "Высокий" : t.priority === "medium" ? "Средний" : "Низкий"}
                    </span>
                  </div>
                  <div className="text-sm text-white/80">{t.subject}</div>
                  <div className="text-xs text-white/35 mt-1">{t.date}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Быстрая связь</h3>
            <div className="space-y-2">
              {[
                { label: "Чат поддержки", icon: "MessageCircle", color: "#00d4ff", sub: "Ответ за 5 мин" },
                { label: "Telegram", icon: "Send", color: "#a78bfa", sub: "@finvault_support" },
                { label: "Телефон", icon: "Phone", color: "#00e5a0", sub: "+7 495 000-00-00" },
              ].map((c, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}20` }}>
                    <Icon name={c.icon} size={16} style={{ color: c.color }} />
                  </div>
                  <div>
                    <div className="text-sm text-white/80 font-medium">{c.label}</div>
                    <div className="text-xs text-white/35">{c.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Статистика поддержки</h3>
            <div className="space-y-2">
              {[
                { label: "Среднее время ответа", value: "4 мин", color: "#00e5a0" },
                { label: "Решено сегодня", value: "12", color: "#00d4ff" },
                { label: "Рейтинг", value: "4.9 ★", color: "#fbbf24" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
                  <span className="text-xs text-white/45">{s.label}</span>
                  <span className="text-sm font-mono font-medium" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "contracts": return <ContractsPage />;
      case "investors": return <InvestorsPage />;
      case "suppliers": return <SuppliersPage />;
      case "portfolio": return <PortfolioPage />;
      case "profile": return <ProfilePage />;
      case "support": return <SupportPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#070d18" }}>
      <aside className={`
        fixed lg:relative z-40 inset-y-0 left-0 w-60 flex flex-col
        border-r transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} style={{ background: "rgba(7,13,24,0.98)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,255,0.2)", border: "1px solid rgba(0,212,255,0.3)" }}>
            <Icon name="Zap" size={18} style={{ color: "var(--cyan)" }} />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight">FinVault</div>
            <div className="text-xs text-white/30 font-mono">v2.4.1</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`nav-item w-full ${page === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
              {item.id === "investors" && (
                <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,140,66,0.2)", color: "var(--orange)" }}>2</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(0,212,255,0.2)", color: "var(--cyan)" }}>АП</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/70 truncate">Алексей Петров</div>
              <div className="text-xs text-white/30">Инвестор</div>
            </div>
            <button className="text-white/25 hover:text-white/60 transition-colors">
              <Icon name="Settings" size={14} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-4 px-5 py-3.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,13,24,0.8)", backdropFilter: "blur(20px)" }}>
          <button className="lg:hidden text-white/40 hover:text-white/70" onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl glass">
              <Icon name="Bell" size={17} className="text-white/50" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--cyan)" }} />
            </button>
            <button className="p-2 rounded-xl glass">
              <Icon name="Search" size={17} className="text-white/50" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-5">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}