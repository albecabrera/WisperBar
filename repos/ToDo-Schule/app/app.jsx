// ========================================================================
//  ToDo-Schule — Root App Component
// ========================================================================
(function(){
const {useState,useEffect,useMemo,useCallback,useRef} = React;
const {createElement:h,Fragment} = React;
const {TASKS:INIT_TASKS, TEAMS, NOTIFICATIONS:INIT_NOTIFS, USERS, ME} = window.ESG_DATA;
const {useTweaks,TweaksPanel,TweakSection,TweakToggle,TweakRadio,TweakSlider} = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme":"light","accent":"indigo","density":"default","defaultView":"list"
}/*EDITMODE-END*/;

/* ── Echtzeit & Push ─────────────────────────────────────────────────── */
const WS_URL = window.ESG_WS_URL || "ws://localhost:8090";

/* Service Worker registrieren (Basis für Push-Notifications). */
function registerServiceWorker(){
  if(!("serviceWorker" in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register("sw.js").catch(err=>{
    console.warn("Service Worker nicht registriert:", err);
    return null;
  });
}

/* System-Notification über den Service Worker anzeigen. */
function pushNotify(title, body, data){
  if(!("Notification" in window) || Notification.permission !== "granted") return;
  navigator.serviceWorker?.ready.then(reg=>{
    reg.showNotification(title, {
      body, data,
      icon: "assets/esg-mark.svg",
      badge: "assets/esg-mark.svg",
      tag: data && data.taskId ? `task-${data.taskId}` : undefined,
    });
  }).catch(()=>{});
}

/* ── Toast helper ────────────────────────────────────────────────────── */
let _addToast = ()=>{};
function useToasts(){
  const [list,setList] = useState([]);
  const add = useCallback((t)=>{
    const id = Date.now();
    setList(p=>[...p,{id,...t}]);
    setTimeout(()=>setList(p=>p.map(x=>x.id===id?{...x,out:true}:x)),4800);
    setTimeout(()=>setList(p=>p.filter(x=>x.id!==id)),5200);
  },[]);
  const dismiss = useCallback((id)=>{
    setList(p=>p.map(x=>x.id===id?{...x,out:true}:x));
    setTimeout(()=>setList(p=>p.filter(x=>x.id!==id)),300);
  },[]);
  useEffect(()=>{ _addToast = add; },[add]);
  return {list,add,dismiss};
}

/* ── Filter tasks by activeTeam ──────────────────────────────────────── */
function filterTasks(tasks, activeTeam){
  const today = "2026-06-12";
  if(activeTeam==="all")   return tasks;
  if(activeTeam==="mine")  return tasks.filter(t=>t.assignees.includes(ME.id));
  if(activeTeam==="today") return tasks.filter(t=>t.due===today&&t.status!=="done");
  if(activeTeam==="done")  return tasks.filter(t=>t.status==="done");
  if(typeof activeTeam==="number") return tasks.filter(t=>t.teamId===activeTeam);
  return tasks;
}

/* ── Team banner ─────────────────────────────────────────────────────── */
function TeamBanner({activeTeam, tasks}){
  const team = typeof activeTeam==="number" ? TEAMS.find(t=>t.id===activeTeam) : null;
  if(!team) return null;
  const tTasks = tasks.filter(t=>t.teamId===team.id);
  const done = tTasks.filter(t=>t.status==="done").length;
  const pct = tTasks.length ? Math.round(done/tTasks.length*100) : 0;
  const members = team.members.slice(0,5);
  return h("div",{className:"team-banner"},
    h("div",{className:"tic",style:{background:team.color+"22"}},
      h("span",{style:{fontSize:22}},team.icon)
    ),
    h("div",null,
      h("h2",null,team.name),
      h("div",{style:{display:"flex",alignItems:"center",gap:12,marginTop:5}},
        h("div",{className:"kbar",style:{width:120}},
          h("i",{style:{width:`${pct}%`,background:team.color}})
        ),
        h("span",{style:{fontSize:12.5,color:"var(--text-2)",fontWeight:600}},`${pct}% erledigt`)
      )
    ),
    h("div",{className:"sp"}),
    h("div",{className:"team-stats"},
      h("div",{className:"ts"},h("strong",null,tTasks.filter(t=>t.status!=="done").length),h("span",null,"Offen")),
      h("div",{className:"ts"},h("strong",null,done),h("span",null,"Erledigt")),
      h("div",{className:"ts"},h("strong",null,team.members.length),h("span",null,"Mitglieder"))
    ),
    h(AvatarStack,{userIds:members,size:"sm"}),
    h("button",{className:"btn btn-ghost btn-sm"},h(Icon,{n:"settings",size:15}))
  );
}

/* ── Main App ────────────────────────────────────────────────────────── */
function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(()=>{
    const root = document.documentElement;
    root.setAttribute("data-theme", t.theme==="dark"?"dark":"");
    root.setAttribute("data-accent", t.accent==="indigo"?"":t.accent);
    root.setAttribute("data-density", t.density==="default"?"":t.density);
  },[t.theme,t.accent,t.density]);
  // persist default view choice
  const [screen,setScreen] = useState("login");
  const [tasks, setTasks]          = useState(INIT_TASKS);
  const [notifs, setNotifs]        = useState(INIT_NOTIFS);
  const [activeTeam, setActiveTeam]= useState("all");
  const [view, setView]            = useState("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openTask, setOpenTask]    = useState(null);
  const [shareTask, setShareTask]  = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNotifs, setShowNotifs]= useState(false);
  const [searchVal, setSearchVal]  = useState("");
  const [filters, setFilters]      = useState({priority:null,status:null,overdue:null});
  const {list:toasts,add:addToast,dismiss:dismissToast} = useToasts();

  const unread = notifs.filter(n=>!n.read).length;

  // Filtered tasks for current view
  const visibleTasks = useMemo(()=>filterTasks(tasks, activeTeam),[tasks,activeTeam]);

  // Presence users for topbar
  const presenceUsers = useMemo(()=>USERS.filter(u=>u.presence==="online"&&u.id!==ME.id).map(u=>u.id),[]);

  // Toggle task done (persistiert ans Backend, optimistisches Update)
  function toggleDone(id){
    let nextStatus;
    setTasks(prev => prev.map(t => {
      if(t.id!==id) return t;
      nextStatus = t.status==="done"?"todo":"done";
      return {...t, status: nextStatus};
    }));
    if(window.ESG_API.hasSession() && nextStatus){
      window.ESG_API.updateTask(id,{status:nextStatus}).catch(()=>{
        setTasks(prev => prev.map(t => t.id===id ? {...t, status: nextStatus==="done"?"todo":"done"} : t));
        addToast({title:"Fehler",body:"Status konnte nicht gespeichert werden."});
      });
    }
  }

  // Add new task (über API, lokal als Fallback im Demo-Modus)
  function addTask(t){
    if(window.ESG_API.hasSession()){
      window.ESG_API.createTask(t)
        .then(saved=>{
          setTasks(prev=>[saved,...prev.filter(x=>x.id!==saved.id)]);
          addToast({title:"Aufgabe erstellt",body:`<b>${saved.title}</b> wurde hinzugefügt.`,icon:"checkCircle",color:"var(--st-done-bg)",iconColor:"var(--st-done)"});
        })
        .catch(err=>addToast({title:"Fehler",body:err.error||"Aufgabe konnte nicht erstellt werden."}));
      return;
    }
    setTasks(prev=>[t,...prev]);
    addToast({title:"Aufgabe erstellt",body:`<b>${t.title}</b> wurde hinzugefügt.`,icon:"checkCircle",color:"var(--st-done-bg)",iconColor:"var(--st-done)"});
  }

  // Service Worker einmalig registrieren
  useEffect(()=>{ registerServiceWorker(); },[]);

  // Nach Login: Notification-Erlaubnis anfragen
  useEffect(()=>{
    if(screen!=="app") return;
    if("Notification" in window && Notification.permission==="default"){
      Notification.requestPermission().catch(()=>{});
    }
  },[screen]);

  // Echte Aufgaben vom PHP-Backend laden (Demo-Modus behält Mock-Daten)
  useEffect(()=>{
    if(screen!=="app" || !window.ESG_API.hasSession()) return;
    window.ESG_API.getTasks()
      .then(setTasks)
      .catch(err=>{
        console.warn("Backend nicht erreichbar, Mock-Daten bleiben aktiv:", err);
        addToast({title:"Offline",body:"Backend nicht erreichbar — Demo-Daten werden angezeigt."});
      });
  },[screen]);

  // Echtzeit: WebSocket-Verbindung zum PHP-WS-Server (ws://localhost:8090)
  useEffect(()=>{
    if(screen!=="app" || !window.ESG_API.hasSession()) return;
    let ws, retryTimer, closed=false;

    const userName = id => (USERS.find(u=>u.id===id)||{}).name || "Jemand";

    function handleEvent(event, payload){
      switch(event){
        case "task:created":{
          const task = window.ESG_API.mapTask(payload.task);
          setTasks(prev => prev.some(t=>t.id===task.id) ? prev : [task,...prev]);
          break;
        }
        case "task:updated":{
          const task = window.ESG_API.mapTask(payload.task);
          setTasks(prev => prev.map(t=>t.id===task.id?{...t,...task}:t));
          break;
        }
        case "task:deleted":
          setTasks(prev => prev.filter(t=>t.id!==Number(payload.taskId)));
          break;
        case "comment:added":{
          const taskId = Number(payload.taskId);
          setTasks(prev => prev.map(t=>t.id===taskId?{...t,comments:(t.comments||0)+1}:t));
          setNotifs(prev=>[{id:`n${Date.now()}`,type:"comment",read:false,
            actor:Number(payload.comment?.user_id)||null,taskId,
            text:"hat einen Kommentar hinzugefügt",ts:new Date().toISOString()},...prev]);
          addToast({title:"Neuer Kommentar",body:payload.comment?.text||""});
          pushNotify("Neuer Kommentar", payload.comment?.text||"", {taskId});
          break;
        }
        case "user:assigned":{
          const taskId = Number(payload.taskId);
          setNotifs(prev=>[{id:`n${Date.now()}`,type:"assigned",read:false,
            actor:Number(payload.by)||null,taskId,
            text:`hat dich bei <b>${payload.title}</b> als Verantwortliche:n eingetragen`,
            ts:new Date().toISOString()},...prev]);
          addToast({title:"Neue Aufgabe",body:`<b>${payload.title}</b> wurde dir zugewiesen.`});
          pushNotify("Neue Aufgabe zugewiesen", `${userName(Number(payload.by))}: ${payload.title}`, {taskId});
          break;
        }
        case "team:member_added":
          addToast({title:"Team",body:"Du wurdest zu einem Team hinzugefügt."});
          break;
      }
    }

    function connect(){
      const token = localStorage.getItem("accessToken");
      if(!token) return;
      ws = new WebSocket(`${WS_URL}/?token=${encodeURIComponent(token)}`);
      ws.addEventListener("open", ()=>console.log("Echtzeit verbunden:", WS_URL));
      ws.addEventListener("message", e=>{
        try{
          const {event, payload} = JSON.parse(e.data);
          handleEvent(event, payload);
        }catch(err){ console.warn("WS-Nachricht ungültig:", err); }
      });
      // Re-Connect bei Verbindungsabbruch
      ws.addEventListener("close", ()=>{ if(!closed) retryTimer = setTimeout(connect, 2000); });
    }

    connect();
    return ()=>{ closed=true; clearTimeout(retryTimer); ws && ws.close(); };
  },[screen]);

  if(screen==="login") return h(Fragment,null,
    h(LoginScreen,{onLogin:()=>setScreen("app")}),
    h(ToastList,{toasts,dismiss:dismissToast})
  );

  return h(Fragment,null,
    // Sidebar mobile backdrop
    sidebarOpen && h("div",{className:"sb-backdrop open",onClick:()=>setSidebarOpen(false)}),

    h("div",{className:"app"},
      h(Sidebar,{
        activeTeam, setActiveTeam:(t)=>{setActiveTeam(t);setFilters({priority:null,status:null,overdue:null});},
        open:sidebarOpen, onClose:()=>setSidebarOpen(false),
        onNewTask:()=>setShowNewTask(true)
      }),

      h("div",{className:"main"},
        h(Topbar,{
          activeTeam, view, setView,
          notifCount:unread,
          onBell:()=>setShowNotifs(p=>!p),
          onMenuOpen:()=>setSidebarOpen(true),
          searchVal, setSearchVal,
          presenceUsers
        }),

        // Team banner
        h(TeamBanner,{activeTeam,tasks}),

        // Notification panel (positioned relative to main)
        showNotifs && h("div",{style:{position:"relative",zIndex:40}},
          h(NotificationPanel,{onClose:()=>setShowNotifs(false),notifs,setNotifs})
        ),

        h("div",{className:"content"},
          h("div",{className:"content-pad"},
            h(Subbar,{filters,setFilters,view,setView}),
            view==="list"
              ? h(ListView,{tasks:visibleTasks,onOpen:setOpenTask,onToggleDone:toggleDone,searchVal,filters})
              : h(BoardView,{tasks:visibleTasks,onOpen:setOpenTask,onNewTask:()=>setShowNewTask(true)})
          )
        ),

        // Mobile FAB
        h("button",{className:"fab","aria-label":"Neue Aufgabe",onClick:()=>setShowNewTask(true)},
          h(Icon,{n:"plus",size:26})
        )
      )
    ),

    // Drawer
    openTask && h(TaskDrawer,{
      task:openTask,
      onClose:()=>setOpenTask(null),
      onToggleDone:toggleDone,
      onShare:()=>{ setShareTask(openTask); setOpenTask(null); },
      onChange:()=>{}
    }),

    // Share modal
    shareTask && h(ShareModal,{task:shareTask,onClose:()=>setShareTask(null)}),

    // New task modal
    showNewTask && h(NewTaskModal,{onClose:()=>setShowNewTask(false),onAdd:addTask,defaultTeam:activeTeam}),

    // Toasts
    h(ToastList,{toasts,dismiss:dismissToast}),

    // Tweaks panel
    h(TweaksPanel,null,
      h(TweakSection,{label:"Erscheinungsbild"}),
      h(TweakToggle,{label:"Dunkelmodus",value:t.theme==="dark",onChange:v=>setTweak("theme",v?"dark":"light")}),
      h(TweakRadio,{label:"Akzentfarbe",value:t.accent,
        options:["indigo","blue","violet","coral"],
        onChange:v=>setTweak("accent",v)}),
      h(TweakSection,{label:"Layout"}),
      h(TweakRadio,{label:"Dichte",value:t.density,
        options:["compact","default","spacious"],
        onChange:v=>setTweak("density",v)}),
      h(TweakRadio,{label:"Standardansicht",value:t.defaultView,
        options:["list","board"],
        onChange:v=>{ setTweak("defaultView",v); setView(v); }})
    )
  );
}

window.App = App;
window._addToast = ()=>_addToast;
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
