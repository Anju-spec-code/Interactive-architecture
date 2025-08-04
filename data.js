const diagram = {
  title: "Context Engineering for AI Support",
  subtitle: "Real-time, governed, enterprise-scale",
  footer: "© Innominds • Demo",
  showGrid: false,

  groups: [
    { id:"client",  label:"Client",        x:40,  y:60,  w:360, h:300 },
    { id:"control", label:"Orchestration", x:440, y:60,  w:520, h:560 },
    { id:"data",    label:"Data Plane",    x:980, y:60,  w:600, h:560 },
    { id:"observ",  label:"Observability", x:40,  y:380, w:360, h:240 }
  ],

  nodes: [
    // Client
    { id:"app",   label:"User / Channels",    sub:"Web, Mobile, WhatsApp", x:70,  y:110, w:300, h:70, group:"client" },
    { id:"hitl",  label:"Human Agent Desk",   sub:"Context handoff",       x:70,  y:210, w:300, h:70, group:"client" },

    // Orchestration
    { id:"api",   label:"API Gateway",        sub:"Auth, Rate-limit",      x:470, y:110, w:240, h:70, group:"control" },
    { id:"orch",  label:"Agent Orchestrator", sub:"Routing, Tools, Memory",x:740, y:110, w:200, h:70, group:"control" },
    { id:"guard", label:"Input Guardrails",   sub:"PII, Safety, Policies", x:470, y:210, w:240, h:70, group:"control" },
    { id:"retr",  label:"Retriever",          sub:"Top-k, Filters",        x:740, y:210, w:200, h:70, group:"control" },
    { id:"llm",   label:"LLM Service",        sub:"Generation, Tools",     x:560, y:300, w:320, h:70, group:"control" },
    { id:"og",    label:"Output Guardrails",  sub:"Toxicity, PII, Policy", x:560, y:390, w:320, h:70, group:"control" },
    { id:"mem",   label:"Session Memory",     sub:"User & thread state",   x:470, y:490, w:240, h:70, group:"control" },

    // Data Plane
    { id:"vdb",   label:"Vector DB",          sub:"Embeddings, HNSW",      x:1010, y:110, w:260, h:80, group:"data" },
    { id:"kb",    label:"Knowledge Store",    sub:"Docs, Policies",        x:1290, y:110, w:260, h:80, group:"data" },
    { id:"dl",    label:"Data Lake",          sub:"Logs, Images, JSON",    x:1010, y:220, w:260, h:80, group:"data" },
    { id:"rank",  label:"Re-ranker",          sub:"Cross-encoder",         x:1290, y:220, w:260, h:80, group:"data" },
    { id:"embed", label:"Embedding Service",  sub:"Batch/Stream",          x:1010, y:330, w:260, h:80, group:"data" },
    { id:"ingest",label:"Ingestion & Connectors", sub:"ETL, Webhooks, SaaS", x:1290, y:330, w:260, h:80, group:"data" },

    // Observability
    { id:"mon",   label:"Telemetry",          sub:"Traces, Metrics",       x:70,  y:430, w:300, h:70, group:"observ" },
    { id:"audit", label:"Audit & Governance", sub:"Prompts, Outputs",      x:70,  y:520, w:300, h:70, group:"observ" }
  ],

  edges: [
    // Client → Gateway + Telemetry/Desk
    { from:"app",  to:"api",   label:"request",   animated:true, route:"hv", vx:450, label_dx:-8 },
    { from:"api",  to:"mon",   label:"trace",     route:"vh", vy:365, label_dx:-8 },
    { from:"api",  to:"hitl",  label:"escalate",  route:"vh", vy:205, label_dx:-8 },

    // Input safety → Orchestration
    { from:"api",   to:"guard", label:"sanitize",  animated:true, route:"vh", vy:170 },
    { from:"guard", to:"orch",  label:"route",     route:"hv", vx:730, label_dx:-6 },

    // Retrieval (RAG) — route edges through clean vertical spines
    { from:"orch",  to:"retr",  label:"retrieve",  route:"vh", vy:210 },
    { from:"retr",  to:"vdb",   label:"search",    animated:true, route:"hv", vx:980, label_dx:-6 },
    { from:"vdb",   to:"retr",  label:"hits",      route:"hv", vx:980, label_dx:-6, label_dy:12 },
    { from:"retr",  to:"kb",    label:"lookup",    route:"hv", vx:980 },
    { from:"retr",  to:"rank",  label:"re-rank",   route:"hv", vx:980 },
    { from:"rank",  to:"orch",  label:"ranked ctx",route:"hv", vx:980, label_dx:10 },

    // Generation + output guardrails
    { from:"orch",  to:"llm",   label:"tools+prompt", route:"vh", vy:300 },
    { from:"llm",   to:"og",    label:"filter",     animated:true, route:"vh", vy:385, label_dx:-10 },
    { from:"og",    to:"api",   label:"respond",    animated:true, route:"vh", vy:170, label_dx:12, label_dy:-14 },

    // Memory + HITL
    { from:"orch",  to:"mem",   label:"update",     route:"vh", vy:520 },
    { from:"mem",   to:"orch",  label:"recall",     route:"vh", vy:520, label_dx:16, label_dy:14 },
    { from:"orch",  to:"hitl",  label:"handoff packet", route:"vh", vy:240, label_dx:8 },

    // Ingestion & indexing
    { from:"ingest", to:"dl",    label:"land",         route:"vh", vy:260 },
    { from:"ingest", to:"kb",    label:"docs",         route:"vh", vy:150 },
    { from:"ingest", to:"embed", label:"chunk+embed",  route:"vh", vy:360 },
    { from:"embed",  to:"vdb",   label:"index",        route:"vh", vy:150 },

    // Governance storage & feedback
    { from:"orch",  to:"audit", label:"log",     route:"vh", vy:560 },
    { from:"llm",   to:"audit", label:"store",   route:"vh", vy:560, label_dx:10 },
    { from:"retr",  to:"audit", label:"store",   route:"vh", vy:560, label_dx:-10 },
    { from:"audit", to:"dl",    label:"feedback",route:"hv", vx:980 },
    { from:"vdb",   to:"dl",    label:"ingest",  route:"vh", vy:260 }
  ]
};
