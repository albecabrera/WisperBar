// ========================================================================
//  ToDo-Schule — Mock Data
// ========================================================================
(function(){

const USERS = [
  {id:1, name:"Anke Brandt",    initials:"AB", color:"#312F80", role:"Schulleitung",     email:"a.brandt@esg-bonn.de",   presence:"online"},
  {id:2, name:"Markus Vogel",   initials:"MV", color:"#3D7AD2", role:"Oberstufenkoord.", email:"m.vogel@esg-bonn.de",    presence:"online"},
  {id:3, name:"Lena Hoffmann",  initials:"LH", color:"#54B948", role:"Fachlehrerin Dt.", email:"l.hoffmann@esg-bonn.de", presence:"away"},
  {id:4, name:"Tobias Reich",   initials:"TR", color:"#E08A2B", role:"Fachlehrer Mathe", email:"t.reich@esg-bonn.de",    presence:"online"},
  {id:5, name:"Sandra Köhler",  initials:"SK", color:"#FD5266", role:"Klassenleitung 8b",email:"s.koehler@esg-bonn.de",  presence:"offline"},
  {id:6, name:"Yusuf Demir",    initials:"YD", color:"#5D44E0", role:"Fachlehrer Sport", email:"y.demir@esg-bonn.de",    presence:"online"},
  {id:7, name:"Claudia Neumann",initials:"CN", color:"#6178FE", role:"Beratungslehrerin",email:"c.neumann@esg-bonn.de",  presence:"away"},
  {id:8, name:"Jonas Wagner",   initials:"JW", color:"#D67930", role:"Fachlehrer Chem.", email:"j.wagner@esg-bonn.de",   presence:"offline"},
];
const ME = USERS[0]; // logged-in user

const TEAMS = [
  {id:0,  name:"Alle Aufgaben",           icon:"📋", color:"#312F80", members:[1,2,3,4,5,6,7,8]},
  {id:1,  name:"Schulleitung",            icon:"🏫", color:"#312F80", members:[1,2]},
  {id:2,  name:"Klasse 8b",              icon:"🎒", color:"#FD5266", members:[1,3,4,5]},
  {id:3,  name:"Fachschaft Deutsch",      icon:"📖", color:"#3D7AD2", members:[3,7,1]},
  {id:4,  name:"Fachschaft Mathematik",   icon:"📐", color:"#54B948", members:[4,2,6]},
  {id:5,  name:"Steuergruppe Digitalisierung", icon:"💻", color:"#5D44E0", members:[1,2,6,4]},
  {id:6,  name:"Elternsprechtag-Orga",    icon:"👥", color:"#E08A2B", members:[1,5,7,3]},
  {id:7,  name:"Jahrgangsstufe 5",        icon:"⭐", color:"#6178FE", members:[6,3,8,7]},
];

const now = new Date("2026-06-12T10:30:00");
function daysFrom(d){ return new Date(now.getTime()+d*86400000).toISOString().slice(0,10); }
function ago(h){ return new Date(now.getTime()-h*3600000).toISOString(); }

const COMMENTS = {
  1:[
    {id:101,user:2,text:"Ich habe schon mal die Raumübersicht vorbereitet. Bitte noch die Aufsichten einteilen.",ts:ago(5)},
    {id:102,user:3,text:"Danke @Markus Vogel! Ich kümmere mich um die Einladungen für die Eltern.",ts:ago(3)},
    {id:103,user:5,text:"Können wir den Termin noch mal verschieben? Nächste Woche wäre besser.",ts:ago(1)},
  ],
  2:[
    {id:201,user:4,text:"Vertretungsplan ist für Mo–Mi fertig. Do und Fr fehlen noch.",ts:ago(8)},
    {id:202,user:1,text:"Bitte bis Dienstag abschließen — der Druck braucht Vorlauf.",ts:ago(4)},
  ],
  5:[
    {id:501,user:6,text:"iPads sind bestellt. Lieferung voraussichtlich nächste Woche.",ts:ago(12)},
    {id:502,user:4,text:"Brauchen wir noch MDM-Lizenzen dazu?",ts:ago(6)},
    {id:503,user:6,text:"Ja, @Tobias Reich — ich habe das bereits beantragt.",ts:ago(2)},
  ],
  7:[
    {id:701,user:8,text:"Sicherheitsdatenblätter liegen alle vor. Bestellung kann raus.",ts:ago(2)},
  ],
};

const ACTIVITY = {
  1:[
    {type:"created",  user:1, ts:ago(48),  text:"hat die Aufgabe erstellt"},
    {type:"assigned", user:1, ts:ago(47),  text:"hat Sandra Köhler zugewiesen"},
    {type:"comment",  user:2, ts:ago(5),   text:"hat einen Kommentar hinzugefügt"},
    {type:"changed",  user:5, ts:ago(3),   text:"hat Status auf In Bearbeitung geändert"},
  ],
  5:[
    {type:"created",  user:6, ts:ago(72),  text:"hat die Aufgabe erstellt"},
    {type:"assigned", user:6, ts:ago(70),  text:"hat Tobias Reich zugewiesen"},
    {type:"changed",  user:4, ts:ago(24),  text:"hat Priorität auf Hoch geändert"},
  ],
};

const TASKS = [
  {id:1, title:"Elternsprechtag: Raumplan & Aufsichten",
    desc:"Den kompletten Raumplan für den kommenden Elternsprechtag erstellen. Aufsichten für alle Zeitslots einteilen und Kolleg:innen rechtzeitig informieren.",
    status:"in_progress", priority:"high", teamId:6,
    assignees:[5,7], due:daysFrom(3), createdBy:1, createdAt:ago(48),
    comments:3, watched:true},

  {id:2, title:"Vertretungsplan KW 25 finalisieren",
    desc:"Alle offenen Vertretungsstunden für KW 25 besetzt bestätigen und den fertigen Plan an das Kollegium versenden.",
    status:"in_progress", priority:"high", teamId:1,
    assignees:[2], due:daysFrom(1), createdBy:1, createdAt:ago(36),
    comments:2, watched:true},

  {id:3, title:"Zeugniskonferenz 8b vorbereiten",
    desc:"Notenlisten zusammenführen, Formular-Checkliste ausfüllen, Konferenzraum reservieren.",
    status:"todo", priority:"high", teamId:2,
    assignees:[5,3,4], due:daysFrom(8), createdBy:5, createdAt:ago(24),
    comments:0, watched:false},

  {id:4, title:"Projektwoche 'Nachhaltigkeit' – Konzept",
    desc:"Gemeinsam mit der Jahrgangsstufe 5 das pädagogische Konzept für die Projektwoche erarbeiten. Externe Referent:innen anfragen.",
    status:"todo", priority:"medium", teamId:7,
    assignees:[6,3], due:daysFrom(18), createdBy:6, createdAt:ago(20),
    comments:0, watched:false},

  {id:5, title:"Digitale Endgeräte Jg. 5 einrichten & verteilen",
    desc:"30 iPads konfigurieren (MDM-Profil, Apps, Schulnetz-WLAN) und an Klasse 5a und 5b ausgeben. Elterninfo-Zettel anhängen.",
    status:"in_progress", priority:"high", teamId:5,
    assignees:[6,4,2], due:daysFrom(5), createdBy:2, createdAt:ago(72),
    comments:3, watched:true},

  {id:6, title:"Schulkonferenz – Protokoll versenden",
    desc:"Protokoll der letzten Schulkonferenz final redigieren und per E-Mail an alle Konferenzmitglieder versenden.",
    status:"todo", priority:"medium", teamId:1,
    assignees:[1], due:daysFrom(2), createdBy:1, createdAt:ago(12),
    comments:0, watched:true},

  {id:7, title:"Chemie-Materialbestellung freigeben",
    desc:"Bestellliste von Herrn Wagner prüfen und Freigabe erteilen. Sicherheitsdatenblätter liegen vor.",
    status:"todo", priority:"medium", teamId:4,
    assignees:[1,8], due:daysFrom(4), createdBy:8, createdAt:ago(10),
    comments:1, watched:false},

  {id:8, title:"Förderpläne Jg. 8 aktualisieren",
    desc:"Förderpläne für alle Schüler:innen mit Förderbedarf in Jahrgang 8 auf den aktuellen Stand bringen.",
    status:"todo", priority:"low", teamId:2,
    assignees:[3,7], due:daysFrom(14), createdBy:3, createdAt:ago(6),
    comments:0, watched:false},

  {id:9, title:"Abiturprüfungen: Aufsichtsplan erstellen",
    desc:"Aufsichtsliste für alle schriftlichen Abiturprüfungen erstellen und mit betroffenen Kolleg:innen abstimmen.",
    status:"todo", priority:"medium", teamId:1,
    assignees:[2,1], due:daysFrom(22), createdBy:2, createdAt:ago(5),
    comments:0, watched:false},

  {id:10, title:"Wandertag Klasse 8b planen",
    desc:"Route, Verkehrsmittel, Kostenkalkulation und Einverständniserklärungen organisieren. Termin im Schulkalender eintragen.",
    status:"todo", priority:"low", teamId:2,
    assignees:[5,4], due:daysFrom(30), createdBy:5, createdAt:ago(3),
    comments:0, watched:false},

  {id:11, title:"Homepage-Eintrag: Tag der offenen Tür",
    desc:"Ankündigungstext und Programm auf der Schulhomepage veröffentlichen. Fotos aus dem letzten Jahr einbinden.",
    status:"done", priority:"low", teamId:1,
    assignees:[1], due:daysFrom(-3), createdBy:1, createdAt:ago(120),
    comments:0, watched:false},

  {id:12, title:"Lehrerzimmer-Drucker in Betrieb nehmen",
    desc:"Neuen Netzwerkdrucker installieren, Treiber verteilen und Toner nachbestellen.",
    status:"done", priority:"medium", teamId:5,
    assignees:[6], due:daysFrom(-1), createdBy:2, createdAt:ago(80),
    comments:0, watched:false},
];

const NOTIFICATIONS = [
  {id:"n1", type:"assigned",  read:false, actor:2, taskId:2, text:`hat dich bei <b>Vertretungsplan KW 25</b> als Verantwortliche eingetragen`, ts:ago(.5)},
  {id:"n2", type:"comment",   read:false, actor:5, taskId:1, text:`hat einen Kommentar bei <b>Elternsprechtag: Raumplan</b> hinterlassen`, ts:ago(1)},
  {id:"n3", type:"comment",   read:false, actor:3, taskId:1, text:`hat <b>Elternsprechtag</b> kommentiert: "Ich kümmere mich um die Einladungen…"`, ts:ago(3)},
  {id:"n4", type:"due",       read:false, actor:null, taskId:2, text:`<b>Vertretungsplan KW 25</b> ist morgen fällig`, ts:ago(3.5)},
  {id:"n5", type:"status",    read:true,  actor:5, taskId:1, text:`hat <b>Elternsprechtag: Raumplan</b> auf <em>In Bearbeitung</em> gesetzt`, ts:ago(6)},
  {id:"n6", type:"team",      read:true,  actor:6, taskId:5, text:`hat dich zum Team <b>Steuergruppe Digitalisierung</b> hinzugefügt`, ts:ago(12)},
  {id:"n7", type:"share",     read:true,  actor:4, taskId:7, text:`hat eine Aufgabe mit dir geteilt: <b>Chemie-Materialbestellung</b>`, ts:ago(24)},
  {id:"n8", type:"done",      read:true,  actor:1, taskId:11, text:`hat <b>Homepage: Tag der offenen Tür</b> als erledigt markiert`, ts:ago(30)},
];

// who's viewing a task right now (live presence simulation)
const VIEWERS = {1:[2,3], 5:[6], 2:[2]};

window.ESG_DATA = { USERS, ME, TEAMS, TASKS, COMMENTS, ACTIVITY, NOTIFICATIONS, VIEWERS };

})();

// ========================================================================
//  ToDo-Schule — API-Client (PHP-Backend)
// ========================================================================
(function(){

const API_BASE_URL = window.ESG_API_BASE || "http://localhost:8080";

let accessToken  = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");

function setTokens(t){
  accessToken  = t.accessToken;
  refreshToken = t.refreshToken;
  localStorage.setItem("accessToken",  accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}
function clearTokens(){
  accessToken = refreshToken = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
function hasSession(){ return !!localStorage.getItem("accessToken"); }

/* Zentraler fetch-Wrapper: hängt den Access-Token an und erneuert ihn
   bei 401 einmalig über /api/auth/refresh (Token-Rotation). */
async function apiFetch(path, options = {}){
  const opts = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
    },
  };

  let res = await fetch(API_BASE_URL + path, opts);

  if(res.status === 401 && refreshToken){
    const r = await fetch(API_BASE_URL + "/api/auth/refresh", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({refreshToken}),
    });
    if(r.ok){
      setTokens(await r.json()); // Rotation: immer das NEUE Paar speichern
      opts.headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(API_BASE_URL + path, opts);
    }else{
      clearTokens();
      throw new Error("Sitzung abgelaufen, bitte erneut anmelden.");
    }
  }

  if(!res.ok) throw await res.json().catch(()=>({error:res.statusText, code:res.status}));
  return res.status === 204 ? null : res.json();
}

/* Backend (snake_case) -> Frontend-Shape (siehe ESG_DATA.TASKS) */
function mapTask(t){
  return {
    id:        Number(t.id),
    title:     t.title,
    desc:      t.description || "",
    status:    t.status,
    priority:  t.priority,
    teamId:    t.team_id != null ? Number(t.team_id) : null,
    assignees: (t.assignees || []).map(Number),
    due:       t.due_date ? String(t.due_date).slice(0,10) : null,
    createdBy: Number(t.created_by),
    createdAt: t.created_at,
    comments:  t.comments != null ? Number(t.comments) : 0,
    watched:   false,
  };
}

const ESG_API = {
  BASE: API_BASE_URL,
  hasSession, setTokens, clearTokens, mapTask, fetch: apiFetch,

  // --- Auth ---------------------------------------------------------------
  async register(name, email, password){
    const data = await apiFetch("/api/auth/register", {method:"POST", body:JSON.stringify({name, email, password})});
    setTokens(data);
    return data.user;
  },
  async login(email, password){
    const data = await apiFetch("/api/auth/login", {method:"POST", body:JSON.stringify({email, password})});
    setTokens(data);
    return data.user;
  },
  async logout(){
    try{ await apiFetch("/api/auth/logout", {method:"POST", body:JSON.stringify({refreshToken})}); }
    finally{ clearTokens(); }
  },

  // --- Profil ---------------------------------------------------------------
  me:       ()     => apiFetch("/api/users/me"),
  updateMe: (data) => apiFetch("/api/users/me", {method:"PATCH", body:JSON.stringify(data)}),

  // --- Aufgaben ---------------------------------------------------------------
  async getTasks(filters = {}){
    const q = new URLSearchParams(Object.entries(filters).filter(([,v])=>v!=null)).toString();
    const {tasks} = await apiFetch("/api/tasks" + (q ? `?${q}` : ""));
    return tasks.map(mapTask);
  },
  async createTask({title, desc, status, priority, due, teamId, assignees}){
    const {task} = await apiFetch("/api/tasks", {method:"POST", body:JSON.stringify({
      title, description:desc, status, priority, dueDate:due,
      teamId: typeof teamId==="number" ? teamId : null, // Sidebar-Filter ("all"/"mine") ist kein Team
      assignees,
    })});
    return mapTask(task);
  },
  async updateTask(id, patch){
    const body = {};
    if("title"    in patch) body.title       = patch.title;
    if("desc"     in patch) body.description = patch.desc;
    if("status"   in patch) body.status      = patch.status;
    if("priority" in patch) body.priority    = patch.priority;
    if("due"      in patch) body.dueDate     = patch.due;
    if("teamId"   in patch) body.teamId      = patch.teamId;
    if("assignees"in patch) body.assignees   = patch.assignees;
    const {task} = await apiFetch(`/api/tasks/${id}`, {method:"PATCH", body:JSON.stringify(body)});
    return mapTask(task);
  },
  deleteTask: (id) => apiFetch(`/api/tasks/${id}`, {method:"DELETE"}),
  assign:   (id, userIds) => apiFetch(`/api/tasks/${id}/assign`,   {method:"PATCH", body:JSON.stringify({userIds})}),
  unassign: (id, userIds) => apiFetch(`/api/tasks/${id}/unassign`, {method:"PATCH", body:JSON.stringify({userIds})}),

  // --- Kommentare ---------------------------------------------------------------
  getComments:   (taskId)       => apiFetch(`/api/tasks/${taskId}/comments`),
  addComment:    (taskId, text) => apiFetch(`/api/tasks/${taskId}/comments`, {method:"POST", body:JSON.stringify({text})}),
  deleteComment: (taskId, id)   => apiFetch(`/api/tasks/${taskId}/comments/${id}`, {method:"DELETE"}),

  // --- Teams / Share / Audit ------------------------------------------------------
  createTeam: (name)        => apiFetch("/api/teams", {method:"POST", body:JSON.stringify({name})}),
  getTeam:    (id)          => apiFetch(`/api/teams/${id}`),
  invite:     (id, email)   => apiFetch(`/api/teams/${id}/invite`, {method:"POST", body:JSON.stringify({email})}),
  share:      (taskId, opt) => apiFetch(`/api/tasks/${taskId}/share`, {method:"POST", body:JSON.stringify(opt||{})}),
  unshare:    (taskId)      => apiFetch(`/api/tasks/${taskId}/share`, {method:"DELETE"}),
  publicTask: (token)       => apiFetch(`/api/share/${token}`),
  getAudit:   (taskId)      => apiFetch(`/api/tasks/${taskId}/audit`),
};

window.ESG_API = ESG_API;

})();
