const diagram = {
  title: "Context Engineering for AI Support",
  subtitle: "Real-time, governed, enterprise-scale",
  footer: "© Innominds • Demo",
  showGrid: false,

  groups: [
    { id:"client",  label:"Client",        x:40,  y:60,  w:360, h:280 },
    { id:"control", label:"Orchestration", x:440, y:60,  w:500, h:540 },
    { id:"data",    label:"Data Plane",    x:980, y:60,  w:580, h:540 },
    { id:"observ",  label:"Observability", x:40,  y:360, w:360, h:240 }
  ],

  nodes: [
    { id:"app",   label:"User / Channels", sub:"Web, Mobile, WhatsApp", x:70,  y:110, w:300, h:70, group:"client" },
    { id:"hitl",  label:"Human Agent Desk", sub:"Context handoff",      x:70,  y:200, w:300, h:70, group:"client" },

    { id:"api",   label:"API Gateway",     sub:"Auth, Rate-limit",      x:480, y:110, w:220, h:70, group:"control" },
    { id:"orch",  label:"Agent Orchestrator", sub:"Routing, Tools, Memory", x:730, y:110, w:180, h:70, group:"control" },
    { id:"guard", label:"Input Guardrails", sub:"PII, Safety, Policies", x:480, y:210, w:220, h:70, group:"control" },
    { id:"retr",  label:"Retriever",       sub:"Top-k, Filters",        x:730, y:210, w:180, h:70, group:"control" },
    { id:"llm",   label:"LLM Service",     sub:"Generation, Tools",     x:610, y:310, w:300, h:70, group:"control" },
    { id:"og",    label:"Output Guardrails", sub:"Toxicity, PII, Policy", x:610, y:400, w:300, h:70, group:"control" },
    { id:"mem",   label:"Session Memory",  sub:"User, thread state",    x:480, y:410, w:220, h:70, group:"control" },

    { id:"vdb",   label:"Vector DB",       sub:"Embeddings, HNSW",      x:1020, y:110, w:240, h:80, group:"data" },
    { id:"kb",    label:"Knowledge Store", sub:"Docs, Policies",        x:1290, y:110, w:240, h:80, group:"data" },
    { id:"dl",    label:"Data Lake",       sub:"Logs, Images, JSON",    x:1020, y:220, w:240, h:80, group:"data" },
    { id:"rank",  label:"Re-ranker",       sub:"Cross-encoder",         x:1290, y:220, w:240, h:80, group:"data" },
    { id:"embed", label:"Embedding Service", sub:"Batch/Stream",        x:1020, y:330, w:240, h:80, group:"data" },
    { id:"ingest",label:"Ingestion & Connectors", sub:"ETL, Webhooks, SaaS", x:1290, y:330, w:240, h:80, group:"data" },

    { id:"mon",   label:"Telemetry",       sub:"Traces, Metrics",       x:70,  y:410, w:300, h:70, group:"observ" },
    { id:"audit", label:"Audit & Governance", sub:"Prompts, Outputs",   x:70,  y:510, w:300, h:70, group:"observ" }
  ],

  edges: [
    // client flow
    { from:"app",  to:"api",   label:"request",   animated:true },
    { from:"api",  to:"guard", label:"sanitize",  animated:true },
    { from:"guard",to:"orch",  label:"route" },

    // retrieval
    { from:"orch", to:"retr",  label:"retrieve" },
    { from:"retr", to:"vdb",   label:"search",    animated:true },
    { from:"vdb",  to:"retr",  label:"hits" },
    { from:"retr", to:"kb",    label:"lookup" },
    { from:"retr", to:"rank",  label:"re-rank" },
    { from:"rank", to:"orch",  label:"ranked ctx" },

    // generation + output safety
    { from:"orch", to:"llm",   label:"tools+prompt" },
    { from:"llm",  to:"og",    label:"filter",     animated:true },
    { from:"og",   to:"api",   label:"respond",    animated:true },

    // memory + hitl
    { from:"orch", to:"mem",   label:"update" },
    { from:"mem",  to:"orch",  label:"recall" },
    { from:"api",  to:"hitl",  label:"escalate" },
    { from:"orch", to:"hitl",  label:"handoff packet" },

    // ingestion/indexing
    { from:"ingest", to:"dl",   label:"land" },
    { from:"ingest", to:"kb",   label:"docs" },
    { from:"ingest", to:"embed",label:"chunk+embed" },
    { from:"embed",  to:"vdb",  label:"index" },

    // observability & governance
    { from:"api",  to:"mon",   label:"trace" },
    { from:"orch", to:"audit", label:"log" },
    { from:"llm",  to:"audit", label:"store" },
    { from:"retr", to:"audit", label:"store" },
    { from:"audit",to:"dl",    label:"feedback" },
    { from:"vdb",  to:"dl",    label:"ingest" }
  ]
};
