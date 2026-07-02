// sync-dashboard — Real-time dashboard generation from Windsor.ai data
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const defaultWindsorKey = "a16202f8be838a76e15250a00c3722d3f517";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const clientName = (body.client || "ingresarios").toLowerCase();
    const product = (body.product || "launch").toLowerCase();
    const projectDate = (body.project_date || "ago26").toLowerCase();
    const startDate = body.start_date || "2026-06-30";
    const endDate = body.end_date || "2026-07-31";
    const currency = body.currency || "COP";
    
    // Brand colors customization
    const brandColors = body.brand_colors || {
      purpleLight: "#7F77DD",
      purpleDark: "#534AB7",
      navyBg: "#0E1024",
      navyCard: "#171A38",
      navyCard2: "#1E2246"
    };

    const windsorKey = Deno.env.get("WINDSOR_API_KEY") || defaultWindsorKey;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!windsorKey) {
      return new Response(
        JSON.stringify({ error: "Windsor.ai API key is missing." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch data from Windsor.ai in parallel
    const fbFields = [
      "campaign_name", "adset_name", "ad_name", "spend", "impressions", "clicks", "ctr", "frequency", "cpm",
      "instagram_profile_visits", "video_thruplay_watched_actions_video_view",
      "video_p50_watched_actions_video_view", "video_p75_watched_actions_video_view", "video_p95_watched_actions_video_view",
      "unique_actions_lead", "unique_actions_purchase", "converted_product_value_omni_purchase", "purchase_roas_omni_purchase"
    ].join(",");
    
    const googFields = [
      "campaign", "adgroup", "spend", "impressions", "clicks", "ctr", "cpm", "conversions", "conversions_value"
    ].join(",");

    const fbUrl = `https://connectors.windsor.ai/facebook?api_key=${windsorKey}&date_from=${startDate}&date_to=${endDate}&fields=${fbFields}&format=json`;
    const googUrl = `https://connectors.windsor.ai/google_ads?api_key=${windsorKey}&date_from=${startDate}&date_to=${endDate}&fields=${googFields}&format=json`;

    console.log(`Fetching from Meta Ads: ${fbUrl}`);
    console.log(`Fetching from Google Ads: ${googUrl}`);

    const [fbRes, googRes] = await Promise.all([
      fetch(fbUrl).then(res => res.ok ? res.json() : { data: [] }).catch(() => ({ data: [] })),
      fetch(googUrl).then(res => res.ok ? res.json() : { data: [] }).catch(() => ({ data: [] }))
    ]);

    const fbItems = fbRes.data || fbRes || [];
    const googItems = googRes.data || googRes || [];

    // 2. Process Campaign Taxonomy
    const rlvData: any[] = [];
    const adqData: any[] = [];
    const salesData: any[] = [];

    const parseCountry = (campaignName: string) => {
      const name = campaignName.toLowerCase();
      if (name.includes("-co-")) return "Colombia";
      if (name.includes("-mx-")) return "México";
      if (name.includes("-usa-")) return "Estados Unidos";
      if (name.includes("-ca-")) return "Canadá";
      return "Sin clasificar";
    };

    const parseCountryCode = (campaignName: string) => {
      const name = campaignName.toLowerCase();
      if (name.includes("-co-")) return "co";
      if (name.includes("-mx-")) return "mx";
      if (name.includes("-usa-")) return "usa";
      if (name.includes("-ca-")) return "ca";
      return "sc";
    };

    const parseStage = (campaignName: string) => {
      const name = campaignName.toLowerCase();
      if (name.includes("-rlv-")) return "Relevancia";
      if (name.includes("-adq-")) return "Adquisición";
      if (name.includes("sales") || name.includes("-sales-")) return "Venta";
      return "Sin clasificar";
    };

    const parseTemp = (adsetName: string) => {
      const name = adsetName.toLowerCase();
      if (name.includes("warm")) return "Warm";
      if (name.includes("int")) return "Intereses";
      if (name.includes("lal")) return "Lookalike";
      return "Sin clasificar";
    };

    // Filter and map Facebook data
    for (const item of fbItems) {
      const campaign = item.campaign_name || "";
      if (!campaign.toLowerCase().includes(product) || !campaign.toLowerCase().includes(projectDate)) {
        continue; // Filter by product + project date
      }

      const country = parseCountry(campaign);
      const countryCode = parseCountryCode(campaign);
      const stage = parseStage(campaign);
      const temp = parseTemp(item.adset_name || "");

      const common = {
        platform: "Meta",
        country,
        countryCode,
        campaign,
        adset: item.adset_name || "—",
        ad: item.ad_name || "—",
        temp,
        spend: parseFloat(item.spend || 0),
        impressions: parseInt(item.impressions || 0),
        clicks: parseInt(item.clicks || 0),
        ctr: parseFloat(item.ctr || 0) * 100, // Windsor may return decimals
        freq: parseFloat(item.frequency || 0) || 1,
        cpm: parseFloat(item.cpm || 0)
      };

      if (stage === "Relevancia") {
        rlvData.push({
          ...common,
          igVisits: parseInt(item.instagram_profile_visits || 0),
          costPerIg: item.instagram_profile_visits ? common.spend / item.instagram_profile_visits : 0,
          thruplay: parseInt(item.video_thruplay_watched_actions_video_view || 0),
          costPerThruplay: item.video_thruplay_watched_actions_video_view ? common.spend / item.video_thruplay_watched_actions_video_view : 0,
          vtr50: parseFloat(item.video_p50_watched_actions_video_view || 0) / (common.impressions || 1) * 100,
          vtr75: parseFloat(item.video_p75_watched_actions_video_view || 0) / (common.impressions || 1) * 100,
          vtr95: parseFloat(item.video_p95_watched_actions_video_view || 0) / (common.impressions || 1) * 100
        });
      } else if (stage === "Adquisición") {
        adqData.push({
          ...common,
          leads: parseInt(item.unique_actions_lead || 0),
          cpl: item.unique_actions_lead ? common.spend / item.unique_actions_lead : 0
        });
      } else if (stage === "Venta") {
        salesData.push({
          ...common,
          sales: parseInt(item.unique_actions_purchase || 0),
          costPerSale: item.unique_actions_purchase ? common.spend / item.unique_actions_purchase : 0,
          revenue: parseFloat(item.converted_product_value_omni_purchase || 0),
          roas: parseFloat(item.purchase_roas_omni_purchase || 0)
        });
      }
    }

    // Filter and map Google Ads data
    for (const item of googItems) {
      const campaign = item.campaign || "";
      if (!campaign.toLowerCase().includes(product) || !campaign.toLowerCase().includes(projectDate)) {
        continue;
      }

      const country = parseCountry(campaign);
      const countryCode = parseCountryCode(campaign);
      const stage = parseStage(campaign);
      const temp = parseTemp(item.adgroup || "");

      const common = {
        platform: "Google",
        country,
        countryCode,
        campaign,
        adset: item.adgroup || "—",
        ad: "—",
        temp,
        spend: parseFloat(item.spend || 0),
        impressions: parseInt(item.impressions || 0),
        clicks: parseInt(item.clicks || 0),
        ctr: parseFloat(item.ctr || 0) * 100,
        freq: 1, // Google Ads doesn't report standard frequency at campaign/adgroup level in the same way
        cpm: parseFloat(item.cpm || 0)
      };

      if (stage === "Relevancia") {
        rlvData.push({
          ...common,
          igVisits: 0,
          costPerIg: 0,
          thruplay: 0,
          costPerThruplay: 0,
          vtr50: 0,
          vtr75: 0,
          vtr95: 0
        });
      } else if (stage === "Adquisición") {
        adqData.push({
          ...common,
          leads: parseInt(item.conversions || 0),
          cpl: item.conversions ? common.spend / item.conversions : 0
        });
      } else if (stage === "Venta") {
        salesData.push({
          ...common,
          sales: parseInt(item.conversions || 0),
          costPerSale: item.conversions ? common.spend / item.conversions : 0,
          revenue: parseFloat(item.conversions_value || 0),
          roas: item.spend ? parseFloat(item.conversions_value || 0) / parseFloat(item.spend) : 0
        });
      }
    }

    // 3. Generate HTML Content
    const generationTime = new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
    const clientDisplayName = clientName.charAt(0).toUpperCase() + clientName.slice(1);
    
    // We dynamically build the HTML page
    const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Dashboard ${clientDisplayName} — ${product.toUpperCase()} ${projectDate.toUpperCase()}</title>
<style>
  :root {
    --purple-light: ${brandColors.purpleLight};
    --purple-dark: ${brandColors.purpleDark};
    --navy: ${brandColors.navyBg};
    --navy-card: ${brandColors.navyCard};
    --navy-card-2: ${brandColors.navyCard2};
    --text-main: #F1F1FA;
    --text-muted: #A6A9C8;
    --green: #4CD787;
    --red: #FF6B6B;
    --amber: #FFC24C;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--navy);
    color: var(--text-main);
    padding: 24px 32px 60px;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  header h1 {
    margin: 0 0 6px;
    font-size: 26px;
    background: linear-gradient(90deg, var(--purple-light), var(--purple-dark));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  header .meta { color: var(--text-muted); font-size: 13px; line-height: 1.6; }
  .badge {
    display: inline-block;
    background: var(--purple-dark);
    color: #fff;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    margin-right: 8px;
  }
  .notice {
    background: rgba(255, 194, 76, 0.1);
    border: 1px solid rgba(255, 194, 76, 0.4);
    color: var(--amber);
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 24px;
  }
  .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .tab-btn {
    background: var(--navy-card);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-muted);
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }
  .tab-btn.active {
    background: linear-gradient(90deg, var(--purple-light), var(--purple-dark));
    color: #fff;
    border-color: transparent;
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .kpi-card {
    background: var(--navy-card);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 16px 18px;
  }
  .kpi-card .label { color: var(--text-muted); font-size: 12px; margin-bottom: 6px; }
  .kpi-card .value { font-size: 22px; font-weight: 700; }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
    background: var(--navy-card);
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .filters label { display: flex; flex-direction: column; font-size: 11px; color: var(--text-muted); gap: 4px; }
  .filters select {
    background: var(--navy-card-2);
    color: var(--text-main);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 7px 10px;
    font-size: 13px;
    min-width: 150px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--navy-card);
    border-radius: 14px;
    overflow: hidden;
    font-size: 13px;
  }
  thead th {
    background: var(--navy-card-2);
    color: var(--text-muted);
    text-align: left;
    padding: 10px 12px;
    font-weight: 600;
    white-space: nowrap;
    position: sticky;
    top: 0;
  }
  tbody td {
    padding: 9px 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
    white-space: nowrap;
  }
  tbody tr:hover { background: rgba(127, 119, 221, 0.08); }
  .table-wrap { overflow-x: auto; border-radius: 14px; }
  .country-pill {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: rgba(127,119,221,0.18);
    color: var(--purple-light);
  }
  .plat-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    background: rgba(255,255,255,0.08);
  }
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
    background: var(--navy-card);
    border-radius: 14px;
    border: 1px dashed rgba(255,255,255,0.15);
  }
  .cpl-good { color: var(--green); font-weight: bold; }
  .cpl-bad { color: var(--red); font-weight: bold; }
  .cpl-neutral { color: var(--amber); font-weight: bold; }
</style>
</head>
<body>

<header style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
  <div>
    <h1>${clientDisplayName} — Dashboard de Tráfico Pago</h1>
    <div class="meta">
      <span class="badge">Cliente: ${clientDisplayName}</span>
      <span class="badge">Producto: ${product}</span>
      <span class="badge">Proyecto: ${projectDate}</span><br>
      Rango solicitado: ${startDate} a ${endDate} · Moneda: ${currency}<br>
      Generado: <span>${generationTime}</span> · Fuente: Windsor.ai (Meta & Google Ads)
    </div>
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
    <button id="btn-sync-now" style="
      background: linear-gradient(90deg, var(--purple-light), var(--purple-dark));
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s;
    ">🔄 Sincronizar en Vivo</button>
    <span id="sync-status" style="font-size: 12px; color: var(--text-muted); text-align: right; max-width: 300px;"></span>
  </div>
</header>

<div class="tabs">
  <button class="tab-btn active" data-tab="rlv">Relevancia</button>
  <button class="tab-btn" data-tab="adq">Adquisición</button>
  <button class="tab-btn" data-tab="sales">Venta</button>
</div>

<!-- RELEVANCIA TAB -->
<div id="tab-rlv" class="tab-content">
  <div class="kpi-grid" id="kpi-rlv"></div>
  <div class="filters" id="filters-rlv"></div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Plataforma</th>
          <th>País</th>
          <th>Campaña</th>
          <th>Ad set / Grupo</th>
          <th>Ad</th>
          <th>Temperatura</th>
          <th>Gasto (${currency})</th>
          <th>Impresiones</th>
          <th>CTR</th>
          <th>Frecuencia</th>
          <th>Visitas IG</th>
          <th>Costo/Visita</th>
          <th>ThruPlay</th>
          <th>Costo/ThruPlay</th>
          <th>VTR 50%</th>
          <th>VTR 75%</th>
          <th>VTR 95%</th>
        </tr>
      </thead>
      <tbody id="rlv-body"></tbody>
    </table>
  </div>
</div>

<!-- ADQUISICION TAB -->
<div id="tab-adq" class="tab-content" style="display:none">
  <div class="kpi-grid" id="kpi-adq"></div>
  <div class="filters" id="filters-adq"></div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Plataforma</th>
          <th>País</th>
          <th>Campaña</th>
          <th>Ad set / Grupo</th>
          <th>Gasto (${currency})</th>
          <th>Impresiones</th>
          <th>CTR</th>
          <th>CPM</th>
          <th>Leads</th>
          <th>CPL (${currency})</th>
        </tr>
      </thead>
      <tbody id="adq-body"></tbody>
    </table>
  </div>
</div>

<!-- VENTA TAB -->
<div id="tab-sales" class="tab-content" style="display:none">
  <div class="kpi-grid" id="kpi-sales"></div>
  <div class="filters" id="filters-sales"></div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Plataforma</th>
          <th>País</th>
          <th>Campaña</th>
          <th>Ad set / Grupo</th>
          <th>Gasto (${currency})</th>
          <th>Impresiones</th>
          <th>CTR</th>
          <th>Ventas</th>
          <th>Costo/Venta</th>
          <th>Facturación (${currency})</th>
          <th>ROAS</th>
        </tr>
      </thead>
      <tbody id="sales-body"></tbody>
    </table>
  </div>
</div>

<script>
const RLV_DATA = ${JSON.stringify(rlvData)};
const ADQ_DATA = ${JSON.stringify(adqData)};
const SALES_DATA = ${JSON.stringify(salesData)};
const REPORT_CURRENCY = "${currency}";

function fmtCur(n) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}
function fmtPct(n) {
  return (n || 0).toFixed(2) + "%";
}
function fmtNum(n) {
  return Math.round(n || 0).toLocaleString("es-CO");
}

// CPL benchmarks in COP for target evaluations
const CPL_TARGETS = {
  "Colombia": 11000,
  "México": 9000,
  "Argentina": 9000,
  "Perú": 9000,
  "Estados Unidos": 20000,
  "Canadá": 20000
};

// Simple currency conversion rate to COP (approximations if currency is not COP)
function getCplInCop(cpl, countryCurrency) {
  if (countryCurrency === "COP") return cpl;
  if (countryCurrency === "USD") return cpl * 4000;
  if (countryCurrency === "MXN") return cpl * 220;
  return cpl; // default
}

function getCplClass(cpl, country) {
  const target = CPL_TARGETS[country];
  if (!target) return "";
  const cplCop = getCplInCop(cpl, REPORT_CURRENCY);
  if (cplCop <= target) return "cpl-good";
  if (cplCop <= target * 1.2) return "cpl-neutral";
  return "cpl-bad";
}

// Generate selectors dynamically for a tab
function initTabFilters(tabId, data, onFilterChange) {
  const container = document.getElementById("filters-" + tabId);
  if (data.length === 0) {
    container.style.display = "none";
    return;
  }

  const unique = (key) => [...new Set(data.map(r => r[key]))].sort();
  
  container.innerHTML = \`
    <label>Plataforma
      <select id="f-\${tabId}-platform"><option value="">Todas</option></select>
    </label>
    <label>País
      <select id="f-\${tabId}-country"><option value="">Todos</option></select>
    </label>
    <label>Campaña
      <select id="f-\${tabId}-campaign"><option value="">Todas</option></select>
    </label>
    <label>Grupo / Adset
      <select id="f-\${tabId}-adset"><option value="">Todos</option></select>
    </label>
  \`;

  const populate = (selId, vals) => {
    const sel = document.getElementById(selId);
    vals.forEach(v => {
      if (!v || v === "—") return;
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  };

  populate("f-" + tabId + "-platform", unique("platform"));
  populate("f-" + tabId + "-country", unique("country"));
  populate("f-" + tabId + "-campaign", unique("campaign"));
  populate("f-" + tabId + "-adset", unique("adset"));

  ["platform", "country", "campaign", "adset"].forEach(field => {
    document.getElementById("f-" + tabId + "-" + field).addEventListener("change", onFilterChange);
  });
}

function getFilterValues(tabId) {
  return {
    platform: document.getElementById("f-" + tabId + "-platform")?.value || "",
    country: document.getElementById("f-" + tabId + "-country")?.value || "",
    campaign: document.getElementById("f-" + tabId + "-campaign")?.value || "",
    adset: document.getElementById("f-" + tabId + "-adset")?.value || ""
  };
}

// Render Relevance Tab
function renderRlv() {
  const container = document.getElementById("tab-rlv");
  if (RLV_DATA.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay campañas de Relevancia (token <code>-rlv-</code>) encontradas.</div>';
    return;
  }

  const filterData = () => {
    const f = getFilterValues("rlv");
    const filtered = RLV_DATA.filter(r =>
      (!f.platform || r.platform === f.platform) &&
      (!f.country || r.country === f.country) &&
      (!f.campaign || r.campaign === f.campaign) &&
      (!f.adset || r.adset === f.adset)
    );

    // Compute KPIs
    const spend = filtered.reduce((s, r) => s + r.spend, 0);
    const impressions = filtered.reduce((s, r) => s + r.impressions, 0);
    const clicks = filtered.reduce((s, r) => s + r.clicks, 0);
    const igVisits = filtered.reduce((s, r) => s + r.igVisits, 0);
    const thruplay = filtered.reduce((s, r) => s + r.thruplay, 0);
    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    const cpm = impressions ? (spend / impressions) * 1000 : 0;
    const freq = impressions ? filtered.reduce((s, r) => s + r.freq * r.impressions, 0) / impressions : 1;
    const costPerIg = igVisits ? spend / igVisits : 0;
    const costPerThruplay = thruplay ? spend / thruplay : 0;

    document.getElementById("kpi-rlv").innerHTML = \`
      <div class="kpi-card"><div class="label">Gasto Total</div><div class="value">\${fmtCur(spend)}</div></div>
      <div class="kpi-card"><div class="label">Impresiones</div><div class="value">\${fmtNum(impressions)}</div></div>
      <div class="kpi-card"><div class="label">CTR Promedio</div><div class="value">\${fmtPct(ctr)}</div></div>
      <div class="kpi-card"><div class="label">Frecuencia</div><div class="value">\${freq.toFixed(2)}</div></div>
      <div class="kpi-card"><div class="label">Visitas Perfil IG</div><div class="value">\${fmtNum(igVisits)}</div></div>
      <div class="kpi-card"><div class="label">Costo/Visita IG</div><div class="value">\${fmtCur(costPerIg)}</div></div>
      <div class="kpi-card"><div class="label">ThruPlays</div><div class="value">\${fmtNum(thruplay)}</div></div>
      <div class="kpi-card"><div class="label">Costo/ThruPlay</div><div class="value">\${fmtCur(costPerThruplay)}</div></div>
    \`;

    document.getElementById("rlv-body").innerHTML = filtered.map(r => \`
      <tr>
        <td><span class="plat-pill">\${r.platform}</span></td>
        <td><span class="country-pill">\${r.country}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">\${r.campaign}</td>
        <td>\${r.adset}</td>
        <td>\${r.ad}</td>
        <td>\${r.temp}</td>
        <td>\${fmtCur(r.spend)}</td>
        <td>\${fmtNum(r.impressions)}</td>
        <td>\${fmtPct(r.ctr)}</td>
        <td>\${r.freq.toFixed(2)}</td>
        <td>\${fmtNum(r.igVisits)}</td>
        <td>\${fmtCur(r.costPerIg)}</td>
        <td>\${fmtNum(r.thruplay)}</td>
        <td>\${fmtCur(r.costPerThruplay)}</td>
        <td>\${fmtPct(r.vtr50)}</td>
        <td>\${fmtPct(r.vtr75)}</td>
        <td>\${fmtPct(r.vtr95)}</td>
      </tr>
    \`).join("");
  };

  initTabFilters("rlv", RLV_DATA, filterData);
  filterData();
}

// Render Acquisition Tab
function renderAdq() {
  const container = document.getElementById("tab-adq");
  if (ADQ_DATA.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay campañas de Adquisición (token <code>-adq-</code>) encontradas.</div>';
    return;
  }

  const filterData = () => {
    const f = getFilterValues("adq");
    const filtered = ADQ_DATA.filter(r =>
      (!f.platform || r.platform === f.platform) &&
      (!f.country || r.country === f.country) &&
      (!f.campaign || r.campaign === f.campaign) &&
      (!f.adset || r.adset === f.adset)
    );

    const spend = filtered.reduce((s, r) => s + r.spend, 0);
    const impressions = filtered.reduce((s, r) => s + r.impressions, 0);
    const clicks = filtered.reduce((s, r) => s + r.clicks, 0);
    const leads = filtered.reduce((s, r) => s + r.leads, 0);
    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    const cpm = impressions ? (spend / impressions) * 1000 : 0;
    const cpl = leads ? spend / leads : 0;

    document.getElementById("kpi-adq").innerHTML = \`
      <div class="kpi-card"><div class="label">Gasto Total</div><div class="value">\${fmtCur(spend)}</div></div>
      <div class="kpi-card"><div class="label">Impresiones</div><div class="value">\${fmtNum(impressions)}</div></div>
      <div class="kpi-card"><div class="label">CTR Promedio</div><div class="value">\${fmtPct(ctr)}</div></div>
      <div class="kpi-card"><div class="label">CPM Promedio</div><div class="value">\${fmtCur(cpm)}</div></div>
      <div class="kpi-card"><div class="label">Leads</div><div class="value">\${fmtNum(leads)}</div></div>
      <div class="kpi-card"><div class="label">CPL Promedio</div><div class="value">\${fmtCur(cpl)}</div></div>
    \`;

    document.getElementById("adq-body").innerHTML = filtered.map(r => \`
      <tr>
        <td><span class="plat-pill">\${r.platform}</span></td>
        <td><span class="country-pill">\${r.country}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">\${r.campaign}</td>
        <td>\${r.adset}</td>
        <td>\${fmtCur(r.spend)}</td>
        <td>\${fmtNum(r.impressions)}</td>
        <td>\${fmtPct(r.ctr)}</td>
        <td>\${fmtCur(r.cpm)}</td>
        <td>\${fmtNum(r.leads)}</td>
        <td class="\${getCplClass(r.cpl, r.country)}">\${fmtCur(r.cpl)}</td>
      </tr>
    \`).join("");
  };

  initTabFilters("adq", ADQ_DATA, filterData);
  filterData();
}

// Render Sales Tab
function renderSales() {
  const container = document.getElementById("tab-sales");
  if (SALES_DATA.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay campañas de Ventas (token <code>sales</code>) encontradas.</div>';
    return;
  }

  const filterData = () => {
    const f = getFilterValues("sales");
    const filtered = SALES_DATA.filter(r =>
      (!f.platform || r.platform === f.platform) &&
      (!f.country || r.country === f.country) &&
      (!f.campaign || r.campaign === f.campaign) &&
      (!f.adset || r.adset === f.adset)
    );

    const spend = filtered.reduce((s, r) => s + r.spend, 0);
    const impressions = filtered.reduce((s, r) => s + r.impressions, 0);
    const clicks = filtered.reduce((s, r) => s + r.clicks, 0);
    const sales = filtered.reduce((s, r) => s + r.sales, 0);
    const revenue = filtered.reduce((s, r) => s + r.revenue, 0);
    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    const costPerSale = sales ? spend / sales : 0;
    const roas = spend ? revenue / spend : 0;

    document.getElementById("kpi-sales").innerHTML = \`
      <div class="kpi-card"><div class="label">Gasto Total</div><div class="value">\${fmtCur(spend)}</div></div>
      <div class="kpi-card"><div class="label">Impresiones</div><div class="value">\${fmtNum(impressions)}</div></div>
      <div class="kpi-card"><div class="label">CTR Promedio</div><div class="value">\${fmtPct(ctr)}</div></div>
      <div class="kpi-card"><div class="label">Ventas</div><div class="value">\${fmtNum(sales)}</div></div>
      <div class="kpi-card"><div class="label">Costo/Venta</div><div class="value">\${fmtCur(costPerSale)}</div></div>
      <div class="kpi-card"><div class="label">Facturación</div><div class="value">\${fmtCur(revenue)}</div></div>
      <div class="kpi-card"><div class="label">ROAS Promedio</div><div class="value">\${roas.toFixed(2)}</div></div>
    \`;

    document.getElementById("sales-body").innerHTML = filtered.map(r => \`
      <tr>
        <td><span class="plat-pill">\${r.platform}</span></td>
        <td><span class="country-pill">\${r.country}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">\${r.campaign}</td>
        <td>\${r.adset}</td>
        <td>\${fmtCur(r.spend)}</td>
        <td>\${fmtNum(r.impressions)}</td>
        <td>\${fmtPct(r.ctr)}</td>
        <td>\${fmtNum(r.sales)}</td>
        <td>\${fmtCur(r.costPerSale)}</td>
        <td>\${fmtCur(r.revenue)}</td>
        <td>\${r.roas.toFixed(2)}</td>
      </tr>
    \`).join("");
  };

  initTabFilters("sales", SALES_DATA, filterData);
  filterData();
}

// Tab Switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    ["rlv", "adq", "sales"].forEach(t => {
      document.getElementById("tab-" + t).style.display = (t === btn.dataset.tab) ? "block" : "none";
    });
  });
});

// Initialize all tabs
renderRlv();
renderAdq();
renderSales();

// Live Sync Action
document.getElementById("btn-sync-now").addEventListener("click", async () => {
  const btn = document.getElementById("btn-sync-now");
  const status = document.getElementById("sync-status");
  btn.disabled = true;
  status.innerHTML = "Sincronizando datos con Windsor.ai...";
  
  // Check if the current page is local file
  const isLocal = window.location.protocol === "file:";
  
  try {
    const res = await fetch("${supabaseUrl}/functions/v1/sync-dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "${supabaseAnonKey}",
        "Authorization": "Bearer ${supabaseAnonKey}"
      },
      body: JSON.stringify({
        client: "${clientName}",
        product: "${product}",
        project_date: "${projectDate}",
        start_date: "${startDate}",
        end_date: "${endDate}",
        currency: "${currency}"
      })
    });
    
    const data = await res.json();
    if (data.success) {
      if (isLocal) {
        status.innerHTML = "¡Actualizado! Ejecuta <code>python3 sync.py</code> para descargar el archivo.";
      } else {
        status.innerHTML = "¡Dashboard actualizado! Recargando...";
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } else {
      status.innerHTML = "Error: " + (data.error || "Fallo en sincronización.");
      btn.disabled = false;
    }
  } catch (err) {
    status.innerHTML = "Error de red al conectar con Supabase.";
    btn.disabled = false;
  }
});
</script>

</body>
</html>
`;

    // 4. Upload to Supabase Storage if credentials are valid
    let publicUrl = "";
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      const filePath = `${clientName}/dashboard_${product}_${projectDate}_${startDate}_${endDate}.html`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("dashboards")
        .upload(filePath, htmlTemplate, {
          contentType: "text/html",
          upsert: true
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
      } else {
        const { data: urlData } = supabase.storage.from("dashboards").getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
        console.log(`Uploaded dashboard successfully to Storage: ${publicUrl}`);
      }
    } catch (err) {
      console.error("Failed to connect to Supabase Storage:", err);
    }

    // 5. Response back
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Dashboard generated successfully.", 
        fileName: `dashboard_${product}_${projectDate}_${startDate}_${endDate}.html`,
        publicUrl, 
        html: htmlTemplate 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Dashboard synchronization error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
