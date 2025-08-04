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
    { id:"app",   label:"User / Channels", sub:"Web, Mobile, WhatsApp", x:70,  y:110, w:300, h:70, group:"client", link:"https://example.com/app" },
    { id:"api",   label:"API Gateway",     sub:"Auth, Rate-limit",      x:480, y:110, w:220, h:70, group:"control", link:"https://example.com/api" },
    { id:"orch",  label:"Agent Orchestrator", sub:"Routing, Tools, Memory", x:730, y:110, w:180, h:70, group:"control" },
    { id:"guard", label:"Guardrails",      sub:"PII, Safety, Policies", x:480, y:210, w:220, h:70, group:"control" },
    { id:"retr",  label:"Retriever",       sub:"Top-k, Rerank",         x:730, y:210, w:180, h:70, group:"control" },
    { id:"llm",   label:"LLM Service",     sub:"Generation, Tools",     x:610, y:310, w:300, h:70, group:"control" },

    { id:"vdb",   label:"Vector DB",       sub:"Embeddings, HNSW",      x:1020, y:110, w:240, h:80, group:"data", link:"https://example.com/vdb" },
    { id:"kb",    label:"Knowledge Store", sub:"Docs, Policies",        x:1290, y:110, w:240, h:80, group:"data" },
    { id:"dl",    label:"Data Lake",       sub:"Logs, Images, JSON",    x:1020, y:220, w:240, h:80, group:"data" },
    { id:"rank",  label:"Re-ranker",       sub:"Cross-encoder",         x:1290, y:220, w:240, h:80, group:"data" },

    { id:"mon",   label:"Telemetry",       sub:"Traces, Metrics",       x:70,  y:410, w:300, h:70, group:"observ" },
    { id:"audit", label:"Audit & Governance", sub:"Prompts, Outputs",   x:70,  y:510, w:300, h:70, group:"observ" }
  ],

  edges: [
    { from:"app",  to:"api",   label:"request",   animated:true },
    { from:"api",  to:"guard", label:"sanitize",  animated:true },
    { from:"guard",to:"orch",  label:"route" },
    { from:"orch", to:"retr",  label:"retrieve" },
    { from:"retr", to:"vdb",   label:"search",    animated:true },
    { from:"retr", to:"kb",    label:"lookup" },
    { from:"retr", to:"rank",  label:"rerank" },
    { from:"orch", to:"llm",   label:"tools+prompt" },
    { from:"llm",  to:"api",   label:"response",  animated:true },

    { from:"api",  to:"mon",   label:"trace" },
    { from:"orch", to:"audit", label:"log" },
    { from:"llm",  to:"audit", label:"store" },
    { from:"retr", to:"audit", label:"store" },
    { from:"vdb",  to:"dl",    label:"ingest" }
  ]
};
