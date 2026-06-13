// ========================================================================
//  ToDo-Schule — Calendar View (monthly)
// ========================================================================
(function(){
const {useState,useMemo} = React;
const {createElement:h,Fragment} = React;
const {TEAMS} = window.ESG_DATA;

const MONTH_NAMES = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAY_NAMES   = ["Mo","Di","Mi","Do","Fr","Sa","So"];

function CalendarView({tasks, onOpen}){
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const days = useMemo(()=>{
    const first = new Date(year, month, 1);
    // Mon=0 … Sun=6 (ISO)
    const startDow = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    // leading days from prev month
    for(let i=startDow-1; i>=0; i--){
      cells.push({date:`${year}-${String(month).padStart(2,"0")}-${String(prevDays-i).padStart(2,"0")}`,outside:true});
    }
    for(let d=1; d<=daysInMonth; d++){
      cells.push({date:`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,outside:false});
    }
    // trailing days
    const rem = 7 - (cells.length % 7);
    if(rem<7){
      for(let d=1; d<=rem; d++){
        cells.push({date:`${year+Math.floor((month+1)/12)}-${String(((month+1)%12)+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,outside:true});
      }
    }
    return cells;
  },[year,month]);

  const tasksByDate = useMemo(()=>{
    const m = {};
    tasks.forEach(t=>{ if(t.due){ (m[t.due]||(m[t.due]=[])).push(t); } });
    return m;
  },[tasks]);

  function prev(){ if(month===0){ setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); }
  function next(){ if(month===11){ setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); }
  function goToday(){ setYear(today.getFullYear()); setMonth(today.getMonth()); }

  return h("div",{className:"cal"},
    /* Header */
    h("div",{className:"cal-head"},
      h("button",{className:"btn btn-ghost btn-sm",onClick:prev},h(Icon,{n:"chevronLeft",size:16})),
      h("h2",{className:"cal-title"},`${MONTH_NAMES[month]} ${year}`),
      h("button",{className:"btn btn-ghost btn-sm",onClick:next},h(Icon,{n:"chevronRight",size:16})),
      h("div",{className:"sp"}),
      h("button",{className:"btn btn-ghost btn-sm",onClick:goToday},"Heute")
    ),
    /* Day names */
    h("div",{className:"cal-grid cal-days"},
      DAY_NAMES.map(d=>h("div",{key:d,className:"cal-dayname"},d))
    ),
    /* Cells */
    h("div",{className:"cal-grid"},
      days.map(({date,outside})=>{
        const dayTasks = tasksByDate[date]||[];
        const isToday = date===todayStr;
        return h("div",{key:date,className:`cal-cell ${outside?"out":""} ${isToday?"today":""}`},
          h("div",{className:"cal-dn"},date.split("-")[2]),
          h("div",{className:"cal-chips"},
            dayTasks.slice(0,3).map(t=>{
              const team = TEAMS.find(x=>x.id===t.teamId);
              return h("button",{key:t.id,className:`cal-chip ${t.status==="done"?"done":""}`,
                style:{background:(team?.color||"#6178FE")+"22",color:team?.color||"#6178FE"},
                onClick:()=>onOpen(t),title:t.title
              }, t.title);
            }),
            dayTasks.length>3 && h("div",{className:"cal-more"},`+${dayTasks.length-3}`)
          )
        );
      })
    )
  );
}

Object.assign(window,{CalendarView});
})();
