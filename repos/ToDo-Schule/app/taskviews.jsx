// ========================================================================
//  ToDo-Schule — List View & Board View
// ========================================================================
(function(){
const {useState,useMemo} = React;
const {createElement:h,Fragment} = React;
const {TASKS, TEAMS} = window.ESG_DATA;

/* ── Filter bar ──────────────────────────────────────────────────────── */
function FilterBar({filters, setFilters}){
  const opts = [
    {k:"priority",v:"high",   label:"Priorität: Hoch"},
    {k:"priority",v:"medium", label:"Priorität: Mittel"},
    {k:"status",  v:"in_progress",label:"In Bearbeitung"},
    {k:"overdue", v:true,     label:"Überfällig"},
  ];
  function toggle(k,v){
    setFilters(prev => {
      const cur = prev[k];
      if(cur===v) return {...prev,[k]:null};
      return {...prev,[k]:v};
    });
  }
  return h("div",{className:"filterpills"},
    h("span",{style:{fontSize:12.5,fontWeight:600,color:"var(--text-3)",marginRight:4,display:"flex",alignItems:"center",gap:5}},
      h(Icon,{n:"filter",size:13}),"Filter"
    ),
    opts.map(o => {
      const on = filters[o.k]===o.v;
      return h("button",{key:`${o.k}-${o.v}`,className:`fpill ${on?"on":""}`,onClick:()=>toggle(o.k,o.v)},
        on && h(Icon,{n:"x",size:12,className:"x"}),
        o.label
      );
    })
  );
}

/* ── Task row (list view) ────────────────────────────────────────────── */
function TaskRow({task, onOpen, onToggleDone}){
  const team = TEAMS.find(t=>t.id===task.teamId);
  return h("div",{className:`trow ${task.status==="done"?"done":""}`,onClick:()=>onOpen(task)},
    h(PriEdge,{priority:task.priority}),
    h("button",{className:`check ${task.status==="done"?"on":""}`,
      onClick:e=>{e.stopPropagation();onToggleDone(task.id)},
      "aria-label":"Erledigt markieren"},
      h(Icon,{n:"check",size:13,strokeWidth:2.5})
    ),
    h("div",{className:"tbody"},
      h("div",{className:"tt"},task.title),
      h("div",{className:"tmeta"},
        h(StatusChip,{status:task.status}),
        h(PriorityChip,{priority:task.priority}),
        h(DueChip,{due:task.due}),
        team && h("span",{className:"chip chip-ghost"},
          h(TagDot,{color:team.color,size:8}),team.name
        )
      )
    ),
    h("div",{className:"tright"},
      task.comments > 0 && h("div",{className:"cmt"},
        h(Icon,{n:"messageCircle",size:14}), task.comments
      ),
      task.assignees.length > 0 && h(AvatarStack,{userIds:task.assignees,size:"xs"})
    )
  );
}

/* ── Skeleton row ────────────────────────────────────────────────────── */
function SkeletonRow(){
  return h("div",{className:"trow",style:{pointerEvents:"none"}},
    h("div",{className:"skel-line",style:{width:20,height:20,borderRadius:99,flex:"none"}}),
    h("div",{className:"tbody",style:{gap:8}},
      h("div",{className:"skel-line",style:{width:"60%",height:15}}),
      h("div",{className:"skel-line",style:{width:"35%",height:12}})
    )
  );
}

/* ── List View ───────────────────────────────────────────────────────── */
function ListView({tasks, onOpen, onToggleDone, searchVal, filters, loading}){
  const today = "2026-06-12";
  const filtered = useMemo(()=>{
    let t = [...tasks];
    if(searchVal) t = t.filter(tk=>tk.title.toLowerCase().includes(searchVal.toLowerCase()));
    if(filters.priority) t = t.filter(tk=>tk.priority===filters.priority);
    if(filters.status) t = t.filter(tk=>tk.status===filters.status);
    if(filters.overdue) t = t.filter(tk=>tk.due && tk.due < today && tk.status!=="done");
    return t;
  },[tasks,searchVal,filters]);

  const inProg = filtered.filter(t=>t.status==="in_progress");
  const todo   = filtered.filter(t=>t.status==="todo");
  const done   = filtered.filter(t=>t.status==="done");

  if(loading) return h("div",{className:"tasklist"},
    [1,2,3,4,5].map(i=>h(SkeletonRow,{key:i}))
  );

  if(!filtered.length) return h("div",{className:"empty"},
    h("div",{className:"ic"},h(Icon,{n:"checkCircle",size:28})),
    h("h3",null,"Alles erledigt!"),
    h("p",null,"Keine Aufgaben entsprechen deinen Filtern.")
  );

  function Group({label, items, dot}){
    if(!items.length) return null;
    return h(Fragment,null,
      h("div",{className:"group-h"},
        h("span",{className:"tick",style:{width:8,height:8,borderRadius:99,background:dot,display:"inline-block"}}),
        h("span",null,label),
        h("span",{className:"ct"},items.length),
        h("div",{className:"ln"})
      ),
      items.map(t=>h(TaskRow,{key:t.id,task:t,onOpen,onToggleDone}))
    );
  }

  return h("div",{className:"tasklist"},
    h(Group,{label:"In Bearbeitung",items:inProg,dot:"var(--st-prog)"}),
    h(Group,{label:"Offen",         items:todo,  dot:"var(--st-todo)"}),
    done.length > 0 && h(Group,{label:"Erledigt",items:done,dot:"var(--st-done)"})
  );
}

/* ── Board card ──────────────────────────────────────────────────────── */
function BoardCard({task, onOpen}){
  const team = TEAMS.find(t=>t.id===task.teamId);
  return h("div",{className:`bcard ${task.status==="done"?"done":""}`,onClick:()=>onOpen(task)},
    h("div",{className:"bc-top"},
      h(PriorityChip,{priority:task.priority}),
      team && h("span",{className:"chip chip-ghost",style:{fontSize:11.5,height:22,padding:"0 8px"}},
        h(TagDot,{color:team.color,size:7}),team.name
      )
    ),
    h("div",{className:"bc-t"},task.title),
    h("div",{className:"bc-foot"},
      h(DueChip,{due:task.due}),
      h("div",{className:"sp"}),
      task.comments > 0 && h("span",{style:{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"var(--text-3)",fontWeight:600}},
        h(Icon,{n:"messageCircle",size:13}),task.comments
      ),
      task.assignees.length > 0 && h(AvatarStack,{userIds:task.assignees,size:"xs"})
    )
  );
}

/* ── Board View ──────────────────────────────────────────────────────── */
const COLS = [
  {key:"todo",        label:"Offen",         dot:"var(--st-todo)"},
  {key:"in_progress", label:"In Bearbeitung",dot:"var(--st-prog)"},
  {key:"done",        label:"Erledigt",      dot:"var(--st-done)"},
];

function BoardView({tasks, onOpen, onNewTask}){
  return h("div",{className:"board"},
    COLS.map(col => {
      const cards = tasks.filter(t=>t.status===col.key);
      return h("div",{key:col.key,className:"bcol"},
        h("div",{className:"bcol-h"},
          h("span",{className:"tick",style:{background:col.dot}}),
          h("span",{className:"nm"},col.label),
          h("span",{className:"ct"},cards.length),
          h("button",{className:"add iconbtn btn-sm",onClick:onNewTask,title:"Aufgabe hinzufügen"},
            h(Icon,{n:"plus",size:14})
          )
        ),
        h("div",{className:"bcol-body"},
          cards.length === 0
            ? h("div",{style:{padding:"14px 4px",color:"var(--text-3)",fontSize:13,textAlign:"center"}},
                "Keine Aufgaben"
              )
            : cards.map(t=>h(BoardCard,{key:t.id,task:t,onOpen}))
        ),
        h("button",{className:"bcard-add",onClick:onNewTask},
          h(Icon,{n:"plus",size:14}),"Aufgabe hinzufügen"
        )
      );
    })
  );
}

/* ── Subbar wrapper (filters + new task) ─────────────────────────────── */
function Subbar({filters, setFilters, view, setView}){
  return h("div",{className:"subbar"},
    h(FilterBar,{filters,setFilters}),
    h("div",{className:"sp"})
  );
}

Object.assign(window,{ListView, BoardView, Subbar, FilterBar});
})();
