// ========================================================================
//  ToDo-Schule — Task Detail Drawer
// ========================================================================
(function(){
const {useState,useEffect,useRef} = React;
const {createElement:h,Fragment} = React;
const {USERS, ME, TEAMS, COMMENTS, ACTIVITY, VIEWERS} = window.ESG_DATA;
const ST_LABELS = window.ST_LABELS;
const PRI_LABELS = window.PRI_LABELS;

/* ── Assignee / Status / Priority pickers ─────────────────────────────── */
function PickerPopup({items, selected, onToggle, onClose}){
  const ref = useRef();
  useEffect(()=>{
    function h2(e){ if(ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown",h2); return ()=>document.removeEventListener("mousedown",h2);
  },[]);
  return h("div",{ref,className:"pick"},
    items.map(it => h("div",{key:it.id,className:`pick-item ${selected.includes(it.id)?"on":""}`,onClick:()=>onToggle(it.id)},
      it.av ? h(Avatar,{userId:it.id,size:"xs"}) : h("span",{className:"chip-st-circle",style:{width:11,height:11,borderRadius:99,background:it.color,display:"inline-block"}}),
      h("span",{className:"grow"},it.label),
      selected.includes(it.id) && h(Icon,{n:"check",size:14,className:"ck"})
    ))
  );
}

/* ── Main Drawer ──────────────────────────────────────────────────────── */
function TaskDrawer({task, onClose, onToggleDone, onShare, onChange}){
  const [localTask, setLocalTask] = useState(task);
  const [tab, setTab] = useState("comments"); // comments | activity
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(COMMENTS[task.id]||[]);
  const [activity] = useState(ACTIVITY[task.id]||[]);
  const [typing, setTyping] = useState(false);
  const [picker, setPicker] = useState(null); // "assignees"|"status"|"priority"
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const taRef = useRef();
  const viewers = VIEWERS[task.id]||[];

  // simulate someone typing occasionally
  useEffect(()=>{
    const t = setTimeout(()=>setTyping(true), 3500);
    const t2 = setTimeout(()=>setTyping(false), 6500);
    return ()=>{clearTimeout(t);clearTimeout(t2)};
  },[]);

  function update(k,v){ setLocalTask(prev=>({...prev,[k]:v})); }

  function sendComment(){
    if(!commentText.trim()) return;
    const nc = {id:Date.now(),user:ME.id,text:commentText,ts:new Date().toISOString()};
    setLocalComments(prev=>[...prev,nc]);
    setCommentText("");
  }

  const team = TEAMS.find(t=>t.id===localTask.teamId);

  return h(Fragment,null,
    h("div",{className:"scrim",onClick:onClose}),
    h("div",{className:"drawer","aria-modal":"true",role:"dialog"},
      // HEAD
      h("div",{className:"drawer-head"},
        h("button",{className:"btn btn-ghost btn-sm",onClick:onClose},
          h(Icon,{n:"chevronRight",size:16}),"Schließen"
        ),
        h("div",{className:"sp"}),
        // viewers
        viewers.length > 0 && h("div",{className:"row gap-6",style:{padding:"0 6px"}},
          h(AvatarStack,{userIds:viewers,size:"xs"}),
          h("span",{style:{fontSize:12,color:"var(--text-3)",fontWeight:600}},
            `${viewers.length} sieht gerade zu`
          ),
          h("span",{className:"live-dot",style:{marginLeft:4}})
        ),
        h("button",{className:"btn btn-soft btn-sm",onClick:onShare},
          h(Icon,{n:"share",size:15}),"Teilen"
        ),
        h("div",{style:{position:"relative"}},
          h("button",{className:"iconbtn btn-sm",title:"Mehr Optionen"},h(Icon,{n:"moreV",size:16}))
        )
      ),

      // BODY
      h("div",{className:"drawer-body"},
        // Title + done toggle
        h("div",{className:"dr-title-row"},
          h("button",{className:`check ${localTask.status==="done"?"on":""}`,
            onClick:()=>{ update("status", localTask.status==="done"?"todo":"done"); onToggleDone(task.id); },
            "aria-label":"Status"},
            h(Icon,{n:"check",size:14,strokeWidth:2.5})
          ),
          h("textarea",{
            className:`dr-title ${localTask.status==="done"?"done":""}`,
            value:localTask.title,rows:2,
            onChange:e=>update("title",e.target.value)
          })
        ),

        // Properties
        h("div",{className:"dr-props"},
          // Status
          h("div",{className:"dr-prop"},
            h("div",{className:"k"},h(Icon,{n:"activity",size:15}),"Status"),
            h("div",{className:"v",style:{position:"relative"}},
              h("button",{className:"propbtn",onClick:()=>setPicker(picker==="status"?null:"status")},
                h(StatusChip,{status:localTask.status})
              ),
              picker==="status" && h(PickerPopup,{
                items:[
                  {id:"todo",        label:ST_LABELS.todo,        color:"var(--st-todo)"},
                  {id:"in_progress", label:ST_LABELS.in_progress, color:"var(--st-prog)"},
                  {id:"done",        label:ST_LABELS.done,        color:"var(--st-done)"},
                ],
                selected:[localTask.status],
                onToggle:v=>{ update("status",v); setPicker(null); },
                onClose:()=>setPicker(null)
              })
            )
          ),
          // Priority
          h("div",{className:"dr-prop"},
            h("div",{className:"k"},h(Icon,{n:"flag",size:15}),"Priorität"),
            h("div",{className:"v",style:{position:"relative"}},
              h("button",{className:"propbtn",onClick:()=>setPicker(picker==="priority"?null:"priority")},
                h(PriorityChip,{priority:localTask.priority})
              ),
              picker==="priority" && h(PickerPopup,{
                items:[
                  {id:"high",  label:PRI_LABELS.high,  color:"var(--pri-high)"},
                  {id:"medium",label:PRI_LABELS.medium, color:"var(--pri-med)"},
                  {id:"low",   label:PRI_LABELS.low,   color:"var(--pri-low)"},
                ],
                selected:[localTask.priority],
                onToggle:v=>{ update("priority",v); setPicker(null); },
                onClose:()=>setPicker(null)
              })
            )
          ),
          // Due date
          h("div",{className:"dr-prop"},
            h("div",{className:"k"},h(Icon,{n:"calendar",size:15}),"Fällig am"),
            h("div",{className:"v"},
              h("input",{type:"date",className:"input btn-sm",value:localTask.due||"",
                style:{width:"auto"},onChange:e=>update("due",e.target.value)})
            )
          ),
          // Bereich
          h("div",{className:"dr-prop"},
            h("div",{className:"k"},h(Icon,{n:"users",size:15}),"Bereich"),
            h("div",{className:"v"},
              team ? h("span",{className:"chip chip-ghost"},h(TagDot,{color:team.color,size:8}),team.name)
                   : h("span",{className:"chip chip-ghost",style:{color:"var(--text-3)"}},"Kein Bereich")
            )
          ),
          // Assignees
          h("div",{className:"dr-prop"},
            h("div",{className:"k"},h(Icon,{n:"user",size:15}),"Zugewiesen"),
            h("div",{className:"v",style:{position:"relative"}},
              localTask.assignees.length > 0
                ? h(AvatarStack,{userIds:localTask.assignees,size:"sm"})
                : null,
              h("button",{
                className:`propbtn ${localTask.assignees.length===0?"placeholder":""}`,
                onClick:()=>setPicker(picker==="assignees"?null:"assignees")
              },
                h(Icon,{n:"plus",size:14}),
                localTask.assignees.length===0 ? "Zuweisen" : ""
              ),
              picker==="assignees" && h(PickerPopup,{
                items: USERS.map(u=>({id:u.id,label:u.name,av:true})),
                selected: localTask.assignees,
                onToggle: id => update("assignees",
                  localTask.assignees.includes(id)
                    ? localTask.assignees.filter(x=>x!==id)
                    : [...localTask.assignees,id]
                ),
                onClose:()=>setPicker(null)
              })
            )
          ),
          // Created by
          h("div",{className:"dr-prop"},
            h("div",{className:"k"},h(Icon,{n:"sparkle",size:15}),"Erstellt von"),
            h("div",{className:"v"},
              h(Avatar,{userId:localTask.createdBy,size:"xs"}),
              h("span",{style:{fontSize:13.5,color:"var(--text-2)",marginLeft:6}},userName(localTask.createdBy)),
              h("span",{style:{fontSize:12,color:"var(--text-3)",marginLeft:6}},relTime(localTask.createdAt))
            )
          )
        ),

        // Description
        localTask.desc && h(Fragment,null,
          h("div",{className:"dr-section-h"},h("div",{className:"ln"}),h("span",null,"Beschreibung"),h("div",{className:"ln"})),
          h("div",{className:"dr-desc"},localTask.desc)
        ),

        // Comments / Activity tabs
        h("div",{className:"dr-section-h"},
          h("div",{className:"ln"}),
          h("div",{className:"row gap-8"},
            ["comments","activity"].map(t2 =>
              h("button",{key:t2,className:`btn btn-ghost btn-sm ${tab===t2?"btn-soft":""}`,
                onClick:()=>setTab(t2)},
                t2==="comments"
                  ? h(Fragment,null,h(Icon,{n:"messageCircle",size:14}),"Kommentare")
                  : h(Fragment,null,h(Icon,{n:"activity",size:14}),"Aktivität")
              )
            )
          ),
          h("div",{className:"ln"})
        ),

        tab==="comments" && h("div",{className:"stream"},
          localComments.length===0
            ? h("div",{style:{padding:"14px 0",color:"var(--text-3)",fontSize:13.5}},
                "Noch keine Kommentare. Füge den ersten hinzu."
              )
            : localComments.map(c => h("div",{key:c.id,className:"cmt-item"},
                h(Avatar,{userId:c.user,size:"sm"}),
                h("div",{className:"body"},
                  h("div",{className:"hd"},
                    h("span",{className:"nm"},userName(c.user)),
                    h("span",{className:"tm"},relTime(c.ts))
                  ),
                  h("div",{className:"txt"},
                    c.text.split(/(@\w[\w\s]+\w)/).map((part,i) =>
                      part.startsWith("@")
                        ? h("span",{key:i,className:"men"},part)
                        : part
                    )
                  )
                )
              )),
          typing && h("div",{className:"typing"},
            h(Avatar,{userId:2,size:"xs"}),
            h("span",null,userName(2)," tippt"),
            h("span",{className:"d"},h("i"),h("i"),h("i"))
          )
        ),

        tab==="activity" && h("div",{className:"stream"},
          activity.length===0
            ? h("div",{style:{padding:"14px 0",color:"var(--text-3)",fontSize:13.5}},"Keine Aktivitäten.")
            : [...activity].reverse().map((a,i) => h("div",{key:i,className:"act"},
                h("div",{className:"ic"},h(Icon,{n:a.type==="comment"?"messageCircle":a.type==="assigned"?"user":"activity",size:13})),
                h("div",null,
                  h("b",null,userName(a.user))," ",a.text,
                  h("div",{className:"tm"},relTime(a.ts))
                )
              ))
        )
      ),

      // FOOTER composer
      h("div",{className:"drawer-foot"},
        h("div",{className:"composer"},
          h(Avatar,{userId:ME.id,size:"sm"}),
          h("textarea",{
            ref:taRef,className:"ta",rows:1,
            placeholder:"Kommentar schreiben… (@Name zum Erwähnen)",
            value:commentText, onChange:e=>setCommentText(e.target.value),
            onKeyDown:e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendComment(); } }
          }),
          h("button",{className:"send",onClick:sendComment,disabled:!commentText.trim(),"aria-label":"Senden"},
            h(Icon,{n:"send",size:16,strokeWidth:2})
          )
        )
      )
    )
  );
}

Object.assign(window,{TaskDrawer});
})();
