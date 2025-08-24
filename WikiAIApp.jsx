import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search, Filter, Settings, Plus, Upload, Download, Trash2, Edit,
  X, Save, Link as LinkIcon, Star, Globe, Tag, Sparkles, Database,
  ArrowUpDown, ChevronRight, LayoutGrid, FolderPlus, Eye, LogIn, LogOut
} from "lucide-react";

/**
 * WIKI AI — Single-file React app (Tailwind + shadcn/ui) that:
 * 1) Lists & filters AI tools
 * 2) Has bilingual tool pages (EN primary + FA paragraphs with Vazir)
 * 3) Includes a lightweight CMS (localStorage) with import/export & moderation
 * 4) Is fully previewable here
 */

// ---- Fonts (Vazir for Persian paragraphs) ----
const VazirFont = () => (
  <style>{`
  @font-face {font-family: 'Vazir'; src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/Vazir.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap;}
  @font-face {font-family: 'Vazir'; src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/Vazir-Bold.woff2') format('woff2'); font-weight: 700; font-style: bold; font-display: swap;}
  .font-vazir { font-family: 'Vazir', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; }
  [lang='fa'] { direction: rtl; }
  `}</style>
);

// ---- Types (informal JSDoc) ----
/** @typedef {Object} Tool */
/** @typedef {Object} ToolFeature */

/** @type {Array<{value:string,label:string}>} */
const PRICING = [
  { value: "free", label: "Free" },
  { value: "limited", label: "Limited" },
  { value: "unlimited", label: "Unlimited" },
];

/** @type {string[]} */
const DEFAULT_CATEGORIES = [
  "LLM",
  "TTS",
  "Image",
  "Video",
  "Audio",
  "Agents",
  "Productivity",
  "DevTools",
  "No-code",
  "Data",
  "Research",
  "Marketing",
];

// ---- Seed dataset ----
const seedTools = /** @type {any[]} */ ([
  {
    id: cryptoRandomId(),
    name: "ChatGPT",
    slug: "chatgpt",
    url: "https://chat.openai.com",
    logo: "https://seeklogo.com/images/C/chatgpt-logo-02AFA704B5-seeklogo.com.png",
    short: "General-purpose conversational AI by OpenAI.",
    categories: ["LLM", "Productivity"],
    pricing: "limited",
    tags: ["Web", "API"],
    features: ["GPT-4 class models", "Assistants & Tools", "Plugins / browsing"],
    lang_support: ["EN", "FA", "AR"],
    trending: 93,
    created_at: "2023-03-14",
    updated_at: todayStr(),
    description_en: "ChatGPT helps you reason, write, and build workflows with natural language. It supports multimodal inputs and can integrate with tools.",
    description_fa: "چت‌جی‌پی‌تی یک دستیار هوش مصنوعی چندمنظوره است که برای نوشتن، ایده‌پردازی و ساخت جریان‌کار با زبان طبیعی استفاده می‌شود.",
  },
  {
    id: cryptoRandomId(),
    name: "Claude",
    slug: "claude",
    url: "https://claude.ai",
    logo: "https://avatars.githubusercontent.com/u/125704493?s=200&v=4",
    short: "Helpful, harmless, honest assistant by Anthropic.",
    categories: ["LLM", "Research"],
    pricing: "limited",
    tags: ["Web"],
    features: ["Great at analysis", "Long context", "Safe by design"],
    lang_support: ["EN", "FA"],
    trending: 88,
    created_at: "2023-03-14",
    updated_at: todayStr(),
    description_en: "Claude is a capable assistant focused on reliability and long-context reasoning.",
    description_fa: "کلود یک دستیار قدرتمند با تمرکز بر دقت و توان تحلیل متن‌های طولانی است.",
  },
  {
    id: cryptoRandomId(),
    name: "Midjourney",
    slug: "midjourney",
    url: "https://www.midjourney.com",
    logo: "https://seeklogo.com/images/M/midjourney-logo-7B71F9A8F2-seeklogo.com.png",
    short: "Text-to-image model with artistic flair.",
    categories: ["Image"],
    pricing: "unlimited",
    tags: ["Discord"],
    features: ["Artistic render", "Extensive styles"],
    lang_support: ["EN"],
    trending: 85,
    created_at: "2022-07-01",
    updated_at: todayStr(),
    description_en: "Midjourney turns prompts into striking images, great for concept art and design.",
    description_fa: "میدجرنی با دریافت پرامپت به سرعت تصاویر چشمگیر تولید می‌کند و برای کانسپت‌آرت عالی است.",
  },
  {
    id: cryptoRandomId(),
    name: "Runway",
    slug: "runway",
    url: "https://runwayml.com",
    logo: "https://seeklogo.com/images/R/runway-ml-logo-9DB3B640D3-seeklogo.com.png",
    short: "Video generation & editing tools.",
    categories: ["Video", "Image"],
    pricing: "limited",
    tags: ["Web"],
    features: ["Gen-3 Alpha", "Green screen", "Motion brush"],
    lang_support: ["EN"],
    trending: 77,
    created_at: "2023-06-01",
    updated_at: todayStr(),
    description_en: "Runway offers AI-first video generation and creative editing tools.",
    description_fa: "رانوی مجموعه‌ای از ابزارهای هوش مصنوعی برای ویدیو و ادیت خلاقانه ارائه می‌دهد.",
  },
  {
    id: cryptoRandomId(),
    name: "ElevenLabs",
    slug: "elevenlabs",
    url: "https://elevenlabs.io",
    logo: "https://seeklogo.com/images/E/eleven-labs-logo-3E47CDA180-seeklogo.com.png",
    short: "Realistic text-to-speech & voice cloning.",
    categories: ["TTS", "Audio"],
    pricing: "limited",
    tags: ["Web", "API"],
    features: ["Voice cloning", "Multilingual TTS"],
    lang_support: ["EN", "FA"],
    trending: 72,
    created_at: "2023-02-01",
    updated_at: todayStr(),
    description_en: "ElevenLabs provides high-quality voices and cloning capabilities for content and apps.",
    description_fa: "اله‌ون‌لبز صداهای طبیعی و امکان کلون‌کردن صدا را برای تولید محتوا و اپلیکیشن‌ها فراهم می‌کند.",
  },
  {
    id: cryptoRandomId(),
    name: "Notion AI",
    slug: "notion-ai",
    url: "https://notion.so/ai",
    logo: "https://seeklogo.com/images/N/notion-logo-4CE8FBF5DB-seeklogo.com.png",
    short: "Writing & knowledge workflows inside Notion.",
    categories: ["Productivity"],
    pricing: "limited",
    tags: ["Web"],
    features: ["Summarize", "Brainstorm", "Translate"],
    lang_support: ["EN"],
    trending: 66,
    created_at: "2023-03-01",
    updated_at: todayStr(),
    description_en: "AI features embedded in Notion for writing and docs.",
    description_fa: "نوشن AI امکانات نگارشی و کمکی را مستقیم داخل نوشن ارائه می‌دهد.",
  },
  {
    id: cryptoRandomId(),
    name: "Poe",
    slug: "poe",
    url: "https://poe.com",
    logo: "https://avatars.githubusercontent.com/u/12012625?s=200&v=4",
    short: "Multi-bot chat hub by Quora.",
    categories: ["LLM"],
    pricing: "limited",
    tags: ["Web"],
    features: ["Multiple models", "Shareable bots"],
    lang_support: ["EN"],
    trending: 61,
    created_at: "2023-02-15",
    updated_at: todayStr(),
    description_en: "Poe lets you chat with many AI models in one place.",
    description_fa: "پو امکان گفتگو با مدل‌های متنوع را در یک پلتفرم می‌دهد.",
  },
  {
    id: cryptoRandomId(),
    name: "ComfyUI",
    slug: "comfyui",
    url: "https://github.com/comfyanonymous/ComfyUI",
    logo: "https://raw.githubusercontent.com/comfyanonymous/ComfyUI/master/web/assets/favicon.png",
    short: "Node-based Stable Diffusion GUI.",
    categories: ["Image", "DevTools"],
    pricing: "free",
    tags: ["Desktop"],
    features: ["Visual graph", "Extensible nodes"],
    lang_support: ["EN"],
    trending: 58,
    created_at: "2023-01-20",
    updated_at: todayStr(),
    description_en: "A powerful visual interface to build custom Stable Diffusion pipelines.",
    description_fa: "یک رابط بصری گره‌محور برای ساخت پایپ‌لاین‌های استیبل‌دیفیوشن.",
  },
]);

// ---- Utilities ----
function todayStr(){ return new Date().toISOString().slice(0,10); }
function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""); }
function cryptoRandomId(){ try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2); } }

const STORAGE_KEY = "wiki-ai.tools.v1";
const SUBMIT_KEY = "wiki-ai.submissions.v1";
const CFG_KEY = "wiki-ai.config.v1";

function useLocalState(key, initial){
  const [state, setState] = useState(()=>{
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(()=>{ try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

// ---- Main App ----
export default function WikiAIApp(){
  const [tools, setTools] = useLocalState(STORAGE_KEY, seedTools);
  const [submissions, setSubmissions] = useLocalState(SUBMIT_KEY, /** @type {any[]} */([]));
  const [cfg, setCfg] = useLocalState(CFG_KEY, { categories: DEFAULT_CATEGORIES, brand: { title: "Wiki AI", tagline: "Discover, compare, and track AI tools." } });

  const [query, setQuery] = useState("");
  const [pricing, setPricing] = useState(""); // '', 'free', 'limited', 'unlimited'
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("trending"); // trending | newest | name
  const [adminOpen, setAdminOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [langUI, setLangUI] = useState("en");

  const filtered = useMemo(()=>{
    /** @type {any[]} */
    let arr = [...tools];
    if(query){
      const q = query.toLowerCase();
      arr = arr.filter(t => [t.name, t.short, t.description_en, t.description_fa, (t.tags||[]).join(" "), (t.categories||[]).join(" ")].join(" ").toLowerCase().includes(q));
    }
    if(pricing){ arr = arr.filter(t => t.pricing === pricing); }
    if(category){ arr = arr.filter(t => (t.categories||[]).includes(category)); }
    if(sort === "trending"){ arr.sort((a,b)=> (b.trending||0)-(a.trending||0)); }
    if(sort === "newest"){ arr.sort((a,b)=> (new Date(b.updated_at) - new Date(a.updated_at))); }
    if(sort === "name"){ arr.sort((a,b)=> a.name.localeCompare(b.name)); }
    return arr;
  }, [tools, query, pricing, category, sort]);

  const stats = useMemo(()=>({
    total: tools.length,
    categories: new Set(tools.flatMap(t=>t.categories||[])).size,
    free: tools.filter(t=>t.pricing==='free').length,
  }), [tools]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <VazirFont />
      <TooltipProvider>
      <Header
        brand={cfg.brand}
        stats={stats}
        query={query}
        onQuery={setQuery}
        onOpenFilters={()=>setFiltersOpen(true)}
        langUI={langUI}
        setLangUI={setLangUI}
        onOpenAdmin={()=>setAdminOpen(true)}
      />

      {/* Filters bar (compact) */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2">
          <Select value={category || ""} onValueChange={v => setCategory(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All categories"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {cfg.categories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={pricing || ""} onValueChange={v => setPricing(v === "__any__" ? "" : v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Any pricing"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">Any</SelectItem>
              {PRICING.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sort by"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">A → Z</SelectItem>
            </SelectContent>
          </Select>
          <div className="ms-auto flex items-center gap-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm"><Filter className="me-2 h-4 w-4"/>Filters</Button>
              </SheetTrigger>
              <FilterSheet cfg={cfg} setCfg={setCfg} />
            </Sheet>
            <SubmitToolDialog onSubmit={(payload)=>{
              setSubmissions([...submissions, {...payload, id: cryptoRandomId(), created_at: new Date().toISOString()}]);
              toast.success("Submitted! Your tool is pending review.");
            }} />
            <Sheet open={adminOpen} onOpenChange={setAdminOpen}>
              <SheetTrigger asChild>
                <Button variant="default" size="sm"><Settings className="me-2 h-4 w-4"/>Admin</Button>
              </SheetTrigger>
              <AdminPanel
                tools={tools} setTools={setTools}
                submissions={submissions} setSubmissions={setSubmissions}
                cfg={cfg} setCfg={setCfg}
              />
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} onOpen={()=>setDetail(tool)} />
          ))}
        </div>

        {filtered.length===0 && (
          <EmptyState onReset={()=>{ setQuery(""); setCategory(""); setPricing(""); setSort("trending"); }} />
        )}
      </main>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open)=>!open && setDetail(null)}>
        <DialogContent className="max-w-3xl">
          {detail && <ToolDetail tool={detail} onOpenLink={()=>window.open(detail.url, "_blank")}/>}        
        </DialogContent>
      </Dialog>

      <Footer />
      </TooltipProvider>
    </div>
  );
}

function Header({ brand, stats, query, onQuery, onOpenFilters, langUI, setLangUI, onOpenAdmin }){
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-slate-900"/>
        <div>
          <div className="text-xl font-semibold tracking-tight">{brand.title}</div>
          <div className="text-xs text-slate-500">{brand.tagline}</div>
        </div>
        <Separator orientation="vertical" className="mx-2 hidden sm:block"/>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Badge variant="secondary">{stats.total} tools</Badge>
          <Badge variant="secondary">{stats.categories} categories</Badge>
          <Badge variant="secondary">{stats.free} free</Badge>
        </div>
        <div className="ms-auto flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
            <Input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search tools (e.g., LLM, TTS, design)" className="pl-9" />
          </div>
        </div>
        <div className="ms-3 flex items-center gap-2">
          <Select value={langUI} onValueChange={setLangUI}>
            <SelectTrigger className="w-28"><SelectValue placeholder="EN"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN (UI)</SelectItem>
              <SelectItem value="fa">FA (UI)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onOpenFilters}><Filter className="h-4 w-4"/></Button>
          <Button variant="ghost" size="icon" onClick={onOpenAdmin}><Settings className="h-5 w-5"/></Button>
        </div>
      </div>
    </header>
  );
}

function FilterSheet({ cfg, setCfg }){
  const [newCat, setNewCat] = useState("");
  return (
    <SheetContent side="left" className="w-[320px]">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2"><Filter className="h-4 w-4"/>Filters & Taxonomy</SheetTitle>
      </SheetHeader>
      <div className="mt-4 space-y-6">
        <div>
          <Label>Categories</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {cfg.categories.map((c, i)=> (
              <Badge key={c} variant="secondary" className="flex items-center gap-2">
                {c}
                <button onClick={()=>{ const next=[...cfg.categories]; next.splice(i,1); setCfg({...cfg, categories: next}); }} className="opacity-60 hover:opacity-100">
                  <X className="h-3 w-3"/>
                </button>
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Add category"/>
            <Button onClick={()=>{
              const v = newCat.trim();
              if(!v) return;
              if(cfg.categories.includes(v)) { toast.error("Category exists"); return; }
              setCfg({...cfg, categories: [...cfg.categories, v]}); setNewCat("");
            }}><FolderPlus className="h-4 w-4 me-2"/>Add</Button>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label>Brand</Label>
          <Input value={cfg.brand.title} onChange={e=>setCfg({...cfg, brand: {...cfg.brand, title: e.target.value}})} placeholder="Site title"/>
          <Input value={cfg.brand.tagline} onChange={e=>setCfg({...cfg, brand: {...cfg.brand, tagline: e.target.value}})} placeholder="Tagline"/>
          <p className="text-xs text-slate-500">Use your Wiki AI name & slogan here.</p>
        </div>
      </div>
    </SheetContent>
  );
}

function ToolCard({ tool, onOpen }){
  const price = PRICING.find(p=>p.value===tool.pricing)?.label || tool.pricing;
  return (
    <Card className="group hover:shadow-md transition overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <img src={tool.logo} alt="logo" className="h-10 w-10 rounded-md object-contain bg-white border p-1"/>
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{tool.name}</CardTitle>
            <CardDescription className="truncate">{tool.short}</CardDescription>
          </div>
          <div className="ms-auto flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{price}</Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">{tool.trending ?? 0}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {(tool.categories||[]).map((c)=> (
            <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
          ))}
          {(tool.tags||[]).map((t)=> (
            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Button size="sm" variant="default" onClick={onOpen}>
            View details <ChevronRight className="h-4 w-4 ms-1"/>
          </Button>
          <Button size="sm" variant="ghost" onClick={()=> window.open(tool.url, "_blank")}>Visit <LinkIcon className="h-4 w-4 ms-1"/></Button>
        </div>
      </CardContent>
    </Card>
  );
}
