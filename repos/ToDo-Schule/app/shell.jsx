// ========================================================================
//  ToDo-Schule — Sidebar + Topbar
// ========================================================================
(function(){
const {useState,useRef,useEffect} = React;
const {createElement:h} = React;
const {USERS, ME, TEAMS, TASKS, NOTIFICATIONS} = window.ESG_DATA;

function Sidebar({activeTeam, setActiveTeam, section, setSection, open, onClose, onNewTask, onRenameTeam, onDeleteTeam, onCreateTeam}){
  const [ctxMenu, setCtxMenu]   = useState(null); // {x,y,team}
  const [renaming, setRenaming] = useState(null); // teamId
  const [tmpName, setTmpName]   = useState("");
  const [creating, setCreating] = useState(false);

  // Kontextmenü bei Klick irgendwo schließen
  useEffect(()=>{
    if(!ctxMenu) return;
    const close = ()=>setCtxMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return ()=>{ window.removeEventListener("click", close); window.removeEventListener("contextmenu", close); };
  },[ctxMenu]);

  function startRename(team){
    setCtxMenu(null);
    setRenaming(team.id);
    setTmpName(team.name);
  }
  function commitRename(){
    if(renaming!=null && tmpName.trim()) onRenameTeam(renaming, tmpName);
    setRenaming(null);
  }
  function commitCreate(){
    if(tmpName.trim()) onCreateTeam(tmpName);
    setCreating(false);
    setTmpName("");
  }
  const navItems = [
    {id:"all",   icon:"inbox",    label:"Alle Aufgaben",   count: TASKS.filter(t=>t.status!=="done").length},
    {id:"mine",  icon:"user",     label:"Mir zugewiesen",  count: TASKS.filter(t=>t.assignees.includes(ME.id)&&t.status!=="done").length},
    {id:"today", icon:"star",     label:"Heute fällig",    count: TASKS.filter(t=>t.due==="2026-06-12"&&t.status!=="done").length},
    {id:"done",  icon:"checkCircle",label:"Erledigt",      count: TASKS.filter(t=>t.status==="done").length},
  ];
  const onlineCount = USERS.filter(u=>u.presence==="online").length;

  return h("aside",{className:`sidebar ${open?"open":""}`, id:"sidebar"},
    h("div",{className:"sb-brand"},
      h("div",{className:"brand-tile",style:{border:"1px solid var(--border)"}},
        h("img",{src:"assets/esg-mark.svg",alt:"ESG Logo"})
      ),
      h("div",null,
        h("div",{className:"brand-name"},"ToDo-Schule"),
        h("div",{className:"brand-sub"},"ESG Bonn")
      ),
      open && h("button",{className:"iconbtn",onClick:onClose,style:{marginLeft:"auto"}},
        h(Icon,{n:"x",size:17})
      )
    ),

    h("div",{className:"sb-new"},
      h("button",{className:"btn btn-primary btn-block",onClick:onNewTask},
        h(Icon,{n:"plus",size:17}), "Neue Aufgabe"
      )
    ),

    h("div",{className:"sb-scroll"},
      // nav
      navItems.map(it => h("button",{
        key:it.id, className:`navitem ${section==="tasks"&&activeTeam===it.id?"on":""}`,
        onClick:()=>{ setActiveTeam(it.id); onClose(); }
      },
        h(Icon,{n:it.icon,size:17}),
        h("span",{className:"grow"},it.label),
        it.count > 0 && h("span",{className:"ct"},it.count)
      )),

      h("div",{className:"sb-label"},h("span",null,"Kollegium")),
      h("button",{
        className:`navitem ${section==="notes"?"on":""}`,
        onClick:()=>{ setSection("notes"); onClose(); }
      },
        h(Icon,{n:"book",size:17}),
        h("span",{className:"grow"},"Notizen & Planungen")
      ),

      h("div",{className:"sb-label"},
        h("span",null,"Bereiche"),
        h("button",{title:"Bereich erstellen",onClick:()=>{ setCreating(true); setTmpName(""); }},
          h(Icon,{n:"plus",size:13}))
      ),

      TEAMS.filter(t=>t.id!==0).map(team => {
        const cnt = TASKS.filter(t=>t.teamId===team.id&&t.status!=="done").length;
        // Inline-Umbenennen (Rechtsklick -> Umbenennen, oder Kontextmenü)
        if(renaming===team.id){
          return h("div",{key:team.id,className:"navitem on",style:{cursor:"default"}},
            h(TagDot,{color:team.color,size:10}),
            h("input",{className:"sb-rename",value:tmpName,autoFocus:true,
              onChange:e=>setTmpName(e.target.value),
              onBlur:commitRename,
              onKeyDown:e=>{
                if(e.key==="Enter") commitRename();
                if(e.key==="Escape") setRenaming(null);
              }})
          );
        }
        return h("button",{
          key:team.id, className:`navitem ${section==="tasks"&&activeTeam===team.id?"on":""}`,
          onClick:()=>{ setActiveTeam(team.id); onClose(); },
          onContextMenu:e=>{ e.preventDefault(); e.stopPropagation(); setCtxMenu({x:e.clientX,y:e.clientY,team}); }
        },
          h(TagDot,{color:team.color,size:10}),
          h("span",{className:"grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}, team.name),
          cnt > 0 && h("span",{className:"ct"},cnt)
        );
      }),

      // Neuen Bereich anlegen (über das +)
      creating && h("div",{className:"navitem on",style:{cursor:"default"}},
        h(TagDot,{color:"#6178FE",size:10}),
        h("input",{className:"sb-rename",value:tmpName,autoFocus:true,placeholder:"Name des Bereichs…",
          onChange:e=>setTmpName(e.target.value),
          onBlur:commitCreate,
          onKeyDown:e=>{
            if(e.key==="Enter") commitCreate();
            if(e.key==="Escape"){ setCreating(false); setTmpName(""); }
          }})
      ),

      h("div",{className:"sb-label"},"Online"),
      h("div",{style:{padding:"4px 6px",display:"flex",flexDirection:"column",gap:4}},
        USERS.filter(u=>u.presence!=="offline").map(u =>
          h("div",{key:u.id,className:"row gap-8",style:{padding:"3px 4px"}},
            h(Avatar,{userId:u.id,size:"xs",showPresence:true}),
            h("div",null,
              h("div",{style:{fontSize:13,fontWeight:550,lineHeight:1.1}},u.name),
              h("div",{style:{fontSize:11,color:"var(--text-3)",display:"flex",alignItems:"center",gap:4}},
                h(PresenceDot,{status:u.presence}),
                u.presence==="online"?"Online":"Abwesend"
              )
            )
          )
        )
      )
    ),

    h("div",{className:"sb-foot"},
      h("button",{className:"userchip"},
        h(Avatar,{userId:ME.id,size:"sm",showPresence:true}),
        h("div",null,
          h("div",{className:"nm"},ME.name),
          h("div",{className:"rl"},ME.role)
        ),
        h("span",{className:"cog"},h(Icon,{n:"settings",size:15}))
      )
    ),

    // Kontextmenü für Bereiche (Rechtsklick)
    ctxMenu && h("div",{className:"ctx-menu",style:{left:ctxMenu.x,top:ctxMenu.y}},
      h("button",{onClick:()=>startRename(ctxMenu.team)},
        h(Icon,{n:"edit",size:14}),"Umbenennen"),
      h("button",{className:"danger",onClick:()=>{
        const t = ctxMenu.team;
        setCtxMenu(null);
        if(window.confirm(`Bereich „${t.name}" wirklich löschen?\nAufgaben und Notizen bleiben erhalten.`)) onDeleteTeam(t.id);
      }},
        h(Icon,{n:"trash",size:14}),"Löschen")
    )
  );
}

function Topbar({activeTeam, section, view, setView, notifCount, onBell, onMenuOpen, searchVal, setSearchVal, presenceUsers, theme, onToggleTheme, onQuickNote}){
  const isNotes = section === "notes";
  const team = !isNotes && typeof activeTeam === "number"
    ? TEAMS.find(t=>t.id===activeTeam)
    : null;

  const crumb = isNotes
    ? "Notizen & Planungen"
    : team ? [team.name] : {all:"Alle Aufgaben",mine:"Mir zugewiesen",today:"Heute fällig",done:"Erledigt"}[activeTeam];

  return h("header",{className:"topbar"},
    h("button",{className:"iconbtn menu-btn",onClick:onMenuOpen,"aria-label":"Menü"},
      h(Icon,{n:"menu",size:20})
    ),
    h("div",{className:"page-h"},
      team && h("div",{className:"crumb"},
        h(TagDot,{color:team.color,size:8}), team.name
      ),
      h("h1",null,
        typeof crumb === "string" ? crumb : (team ? team.name : "Alle Aufgaben")
      )
    ),

    h("div",{className:"sp"}),

    // live presence cluster
    presenceUsers.length > 0 && h("div",{className:"presence"},
      h("span",{className:"live-dot"}),
      h(AvatarStack,{userIds:presenceUsers.slice(0,4),size:"xs"}),
      h("span",{className:"lbl"},`${presenceUsers.length} aktiv`)
    ),

    h("div",{className:"topbar-tools"},
      // Roter Bugs-Button: minimalistisches Checklist-Popup
      h("button",{className:"btn btn-news",onClick:onQuickNote,title:"Bugs notieren"},
        h(Icon,{n:"alertCircle",size:15}), "Bugs"
      ),
      h("div",{className:"search"},
        h(Icon,{n:"search",size:16}),
        h("input",{placeholder:"Suchen…",value:searchVal,onChange:e=>setSearchVal(e.target.value),"aria-label":"Suchen"}),
        !searchVal && h("kbd",null,"⌘K")
      ),

      !isNotes && h("div",{className:"seg"},
        h("button",{className:view==="list"?"on":"",onClick:()=>setView("list"),title:"Listenansicht"},
          h(Icon,{n:"list",size:15}), "Liste"
        ),
        h("button",{className:view==="board"?"on":"",onClick:()=>setView("board"),title:"Board"},
          h(Icon,{n:"layout",size:15}), "Board"
        )
      ),

      // Hell-/Dunkelmodus
      h("button",{className:"iconbtn",onClick:onToggleTheme,"aria-label":"Theme wechseln",
        title:theme==="dark"?"Heller Modus":"Dunkler Modus"},
        h(Icon,{n:theme==="dark"?"sun":"moon",size:18})
      ),

      h("div",{style:{position:"relative"}},
        h("button",{className:"iconbtn",onClick:onBell,"aria-label":"Benachrichtigungen",title:"Benachrichtigungen"},
          h(Icon,{n:"bell",size:19}),
          notifCount > 0 && h("span",{className:"dot"})
        )
      ),

      h(Avatar,{userId:ME.id,size:"sm",showPresence:true,style:{cursor:"pointer"}})
    )
  );
}

Object.assign(window,{Sidebar, Topbar});
})();
