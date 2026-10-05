(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const d of s)if(d.type==="childList")for(const v of d.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&n(v)}).observe(document,{childList:!0,subtree:!0});function a(s){const d={};return s.integrity&&(d.integrity=s.integrity),s.referrerPolicy&&(d.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?d.credentials="include":s.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function n(s){if(s.ep)return;s.ep=!0;const d=a(s);fetch(s.href,d)}})();const ue="vfms.access_token",me="vfms.refresh_token",fe="vfms.role";function qe(){return localStorage.getItem(ue)}function Be(){return localStorage.getItem(me)}function ee(){return localStorage.getItem(fe)}function ie(){return!!qe()}function Ae(e){localStorage.setItem(ue,e.access_token),localStorage.setItem(me,e.refresh_token),localStorage.setItem(fe,e.role)}async function Fe(e,t){const a=await fetch("/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})});if(!a.ok){const s=await a.json().catch(()=>({}));throw new Error(s.error||"Login failed. Check your email and password")}const n=await a.json();return Ae(n),n}async function He(){const e=Be();if(!e)return!1;const t=await fetch("/auth/refresh",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;const a=await t.json();return Ae(a),!0}function Ie(){localStorage.removeItem(ue),localStorage.removeItem(me),localStorage.removeItem(fe)}function ae(){return ie()?!0:(window.location.hash="#/login",!1)}function Ke(e){e.innerHTML=`
    <div class="lf">
      <header class="lf-top">
        <div class="lf-wrap lf-header">
          <div class="lf-brand">
            <span class="lf-logo">F</span>
            <span><strong>Fleetline</strong><small>FLEET OPERATIONS</small></span>
          </div>
          <nav class="lf-nav">
            <a href="#/home" data-scroll="lf-workspace">Workspace</a>
            <a href="#/home" data-scroll="lf-manage">What you can manage</a>
          </nav>
          <a class="lf-btn lf-right" href="#/login">Sign in</a>
        </div>
      </header>

      <main class="lf-wrap">
        <section class="lf-hero">
          <p class="lf-eyebrow"><i class="lf-dot"></i>VEHICLE FLEET MANAGEMENT</p>
          <h1>Keep every vehicle<br>and driver <span>accounted for.</span></h1>
          <p class="lf-sub">Track vehicle records, driver assignments, and service history in one place.</p>
          <div class="lf-actions">
            <a class="lf-btn" href="#/login">Sign in to continue</a>
            <a class="lf-link" href="#/home" data-scroll="lf-workspace">See the workspace</a>
          </div>
        </section>

        <section class="lf-preview" id="lf-workspace">
          <aside class="lf-side">
            <div class="lf-brand"><span class="lf-logo">F</span><strong>Fleetline</strong></div>
            <p class="lf-label">WORKSPACE</p>
            <span class="lf-item active"><b>OV</b>Overview</span>
            <span class="lf-item"><b>VH</b>Vehicles</span>
            <span class="lf-item"><b>DR</b>Drivers</span>
            <span class="lf-item"><b>SV</b>Maintenance</span>
            <div class="lf-user"><i>FO</i><span><strong>Fleet operations</strong><small>Sample workspace</small></span></div>
          </aside>
          <div class="lf-main">
            <div class="lf-main-head">
              <div>
                <p class="lf-label">SAMPLE WORKSPACE</p>
                <h2>Fleet overview</h2>
                <p class="lf-muted">Vehicles, drivers, and service records.</p>
              </div>
              <a class="lf-btn ghost" href="#/login">Sign in to manage</a>
            </div>
            <div class="lf-tiles">
              <div class="lf-tile"><p class="lf-label">VEHICLE RECORDS</p><strong>Cars, vans &amp; trucks</strong><span>Details and assignments</span></div>
              <div class="lf-tile"><p class="lf-label">DRIVER RECORDS</p><strong>People behind the wheel</strong><span>Profiles and licence dates</span></div>
              <div class="lf-tile"><p class="lf-label">MAINTENANCE</p><strong>Service history</strong><span>Costs and upcoming work</span></div>
            </div>
            <div class="lf-lower">
              <div class="lf-map">
                <p class="lf-label"><span>FLEET COVERAGE</span><em>Illustrative view</em></p>
                <svg viewBox="0 0 420 150" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrative route map">
                  <rect width="420" height="150" fill="#f1f4f8"/>
                  <g stroke="#e4e9ef" stroke-width="1">
                    <path d="M0 30H420M0 60H420M0 90H420M0 120H420M60 0V150M120 0V150M180 0V150M240 0V150M300 0V150M360 0V150"/>
                  </g>
                  <g stroke="#dde3ea" stroke-width="12" stroke-linecap="round">
                    <path d="M-10 20L110 150"/><path d="M110 -10L250 150"/><path d="M250 -10L420 130"/><path d="M-10 110L420 60" stroke-width="8"/>
                  </g>
                  <path d="M40 112C80 70 110 40 160 62S250 105 300 70S360 48 392 58" fill="none" stroke="#4f6d8f" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
                  <circle cx="40" cy="112" r="6" fill="#fff" stroke="#16181d" stroke-width="3"/>
                  <circle cx="160" cy="62" r="6" fill="#fff" stroke="#16181d" stroke-width="3"/>
                  <circle cx="270" cy="92" r="6" fill="#fff" stroke="#4f6d8f" stroke-width="3"/>
                  <circle cx="392" cy="58" r="6" fill="#fff" stroke="#16181d" stroke-width="3"/>
                  <g font-size="8" fill="#6b7686" letter-spacing="0.6">
                    <rect x="14" y="124" width="44" height="16" rx="4" fill="#fff" stroke="#e3e7ed"/><text x="21" y="135">DEPOT</text>
                    <rect x="136" y="38" width="48" height="16" rx="4" fill="#fff" stroke="#e3e7ed"/><text x="143" y="49">SERVICE</text>
                    <rect x="352" y="32" width="42" height="16" rx="4" fill="#fff" stroke="#e3e7ed"/><text x="359" y="43">ROUTE</text>
                  </g>
                </svg>
              </div>
              <div class="lf-assets">
                <p class="lf-label"><span>ASSET TYPES</span><em>Explore tools</em></p>
                <div class="lf-asset"><b>TR</b><span><strong>Trucks &amp; vans</strong><small>Assignments · documents</small></span></div>
                <div class="lf-asset"><b>CAR</b><span><strong>Cars &amp; light vehicles</strong><small>Records · status</small></span></div>
                <div class="lf-asset"><b>SV</b><span><strong>Service records</strong><small>History · costs</small></span></div>
              </div>
            </div>
          </div>
        </section>

        <section class="lf-features" id="lf-manage">
          <p class="lf-eyebrow">THE DETAILS THAT KEEP YOU MOVING</p>
          <h2>The records your team needs.</h2>
          <p class="lf-sub">Find vehicle, driver, and service information without switching systems.</p>
          <div class="lf-cards">
            <article class="lf-card"><span class="lf-num">01</span><p class="lf-big">FLEET</p><h3>Vehicles</h3><p>Keep car, van, and truck records, assignments, and status in one place.</p><a href="#/vehicles">Manage vehicles</a></article>
            <article class="lf-card"><span class="lf-num">02</span><p class="lf-big">PEOPLE</p><h3>Drivers</h3><p>Keep driver profiles and licence details close to the vehicles they operate.</p><a href="#/drivers">Manage drivers</a></article>
            <article class="lf-card"><span class="lf-num">03</span><p class="lf-big">SERVICE</p><h3>Maintenance</h3><p>Log servicing, review costs, and keep an eye on upcoming requirements.</p><a href="#/maintenance">Manage maintenance</a></article>
          </div>
        </section>
      </main>

      <footer class="lf-bottom">
        <div class="lf-wrap lf-footer">
          <div class="lf-brand"><span class="lf-logo">F</span><span><strong>Fleetline</strong><small>FLEET OPERATIONS</small></span></div>
          <small>Clearer fleet operations, every day.</small>
        </div>
      </footer>
    </div>
  `,e.querySelectorAll("[data-scroll]").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault();const n=e.querySelector(`#${t.dataset.scroll}`);n&&n.scrollIntoView({behavior:"smooth",block:"start"})})})}function je(e){if(ie()){window.location.hash="#/dashboard";return}e.innerHTML=`
    <div class="card login-card">
      <h1>VFMS Login</h1>
      <p class="muted">Vehicle Fleet Management System</p>
      <div class="message error hidden" data-error></div>
      <form data-form novalidate>
        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="username" required>
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <button type="submit" data-submit>Log in</button>
      </form>
    </div>
  `;const t=e.querySelector("[data-form]"),a=e.querySelector("[data-error]"),n=e.querySelector("[data-submit]");function s(d){a.textContent=d,a.classList.remove("hidden")}t.addEventListener("submit",async d=>{d.preventDefault(),a.classList.add("hidden");const v=t.email.value.trim(),p=t.password.value;if(!v||!p){s("Please enter your email and password.");return}n.disabled=!0,n.textContent="Logging in...";try{await Fe(v,p),window.location.hash="#/dashboard"}catch(u){s(u.message||"Login failed."),n.disabled=!1,n.textContent="Log in"}})}const Ue="/api/v1";class be extends Error{constructor(t,a){this.name="ApiError",this.status=a}}async function We(e){try{const t=await e.json();return t.detail||t.error||`Request failed(${e.status})`}catch{return`Request failed(${e.status})`}}async function oe(e,t={}){const a=()=>{const s=qe();return fetch(Ue+e,{...t,headers:{"Content-Type":"application/json",...s?{Authorization:`Bearer ${s}`}:{},...t.headers}})};let n=await a();if(n.status===401)if(await He())n=await a();else throw Ie(),window.location.hash="#/login",new be("Your session expired. Please log in again",401);if(!n.ok)throw new be(await We(n),n.status);return n.status===204?null:n.json()}function pe(e){return oe(e,{method:"GET"})}function te(e,t){return oe(e,{method:"POST",body:JSON.stringify(t)})}function Ye(e,t){return oe(e,{method:"PATCH",body:JSON.stringify(t)})}function Te(e){return oe(e,{method:"DELETE"})}const U="/vehicles";function Ge(e){const t=new URLSearchParams;Object.entries(e).forEach(([n,s])=>{s!=null&&s!==""&&t.set(n,s)});const a=t.toString();return a?`?${a}`:""}function he({search:e,status:t,skip:a=0,limit:n=50}={}){return pe(`${U}${Ge({search:e,status:t,skip:a,limit:n})}`)}function Ze(e){return te(U,e)}function Je(e,t){return Ye(`${U}/${e}`,t)}function Qe(e){return Te(`${U}/${e}`)}function ze(e,t){return te(`${U}/${e}/assign`,{driver_id:t})}function Xe(e){return te(`${U}/${e}/unassign`)}const De="/drivers";function et(e){const t=new URLSearchParams;Object.entries(e).forEach(([n,s])=>{s!=null&&s!==""&&t.set(n,s)});const a=t.toString();return a?`?${a}`:""}function ve({search:e,status:t,skip:a=0,limit:n=50}={}){return pe(`${De}${et({search:e,status:t,skip:a,limit:n})}`)}function tt(e){return te(De,e)}const ge="/maintenance";function at(e){const t=new URLSearchParams;Object.entries(e).forEach(([n,s])=>{s!=null&&s!==""&&t.set(n,s)});const a=t.toString();return a?`?${a}`:""}function Re({vehicleId:e,skip:t=0,limit:a=50}={}){return pe(`${ge}${at({vehicle_id:e,skip:t,limit:a})}`)}function nt(e){return te(ge,e)}function st(e){return Te(`${ge}/${e}`)}const Me="en-ZA",rt="ZAR";function Ve(e){if(e==null||e==="")return null;const t=e instanceof Date?e:new Date(e);return Number.isNaN(t.getTime())?null:t}function X(e){const t=Ve(e);return t?t.toLocaleDateString(Me,{day:"2-digit",month:"short",year:"numeric"}):"-"}function Pe(e){if(e==null||e==="")return"-";const t=Number(e);return Number.isNaN(t)?"-":new Intl.NumberFormat(Me,{style:"currency",currency:rt}).format(t)}function le(e){if(e==null||e==="")return"-";const t=String(e).replace(/[_-]+/g," ").trim().toLowerCase();return t.charAt(0).toUpperCase()+t.slice(1)}function re(e){const t=Ve(e);return t?t.toISOString():null}const ye=30,ce=200;function it(e){if(!e)return null;const t=new Date(e);return Number.isNaN(t.getTime())?null:Math.floor((t.getTime()-Date.now())/864e5)}function Ee(e,t){const a=document.createElement("span");return a.className=`badge ${t}`,a.textContent=e,a}function Se(e,t,a){const n=document.createElement("table"),s=document.createElement("thead"),d=document.createElement("tr");e.forEach(p=>{const u=document.createElement("th");u.textContent=p,d.append(u)}),s.append(d);const v=document.createElement("tbody");if(t.length===0){const p=document.createElement("tr"),u=document.createElement("td");u.colSpan=e.length,u.className="empty",u.textContent=a,p.append(u),v.append(p)}return t.forEach(p=>{const u=document.createElement("tr");p.forEach(S=>{const x=document.createElement("td");S instanceof Node?x.append(S):x.textContent=S??"",u.append(x)}),v.append(u)}),n.append(s,v),n}function K(e,t){const a=document.createElement("div");a.className="card";const n=document.createElement("p");n.className="lf-label",n.textContent=e;const s=document.createElement("div");return s.className="stat",s.textContent=t,a.append(n,s),a}async function ot(e){const t=ee(),a=t==="admin"||t==="manager";e.innerHTML=`
    <p class="lf-label">FLEET OPERATIONS</p>
    <h1>Fleet overview</h1>
    <div class="message hidden" data-message></div>
    <div class="loading" data-loading>Loading overview...</div>

    <div class="card-grid" data-stats></div>

    <h2>Expiry warnings</h2>
    <div class="table-wrap" data-warnings></div>

    <h2>Recent service</h2>
    <div class="table-wrap" data-recent></div>
  `;const n=e.querySelector("[data-message]"),s=e.querySelector("[data-loading]"),d=e.querySelector("[data-stats]"),v=e.querySelector("[data-warnings]"),p=e.querySelector("[data-recent]"),[u,S,x]=await Promise.allSettled([he({limit:ce}),ve({limit:ce}),Re({limit:ce})]);s.classList.add("hidden");const T=[["vehicles",u],["drivers",S],["service records",x]].filter(([,r])=>r.status==="rejected");if(T.length>0){const[r,y]=T[0];n.className="message error",n.textContent=`Could not load ${r}: ${y.reason.message}`}const f=u.status==="fulfilled"?u.value.items:[],D=S.status==="fulfilled"?S.value.items:[],h=x.status==="fulfilled"?x.value.items:[],w="-",b=(r,y)=>r.filter(y).length;d.append(K("VEHICLES",u.status==="fulfilled"?u.value.total:w),K("ACTIVE VEHICLES",u.status==="fulfilled"?b(f,r=>r.status==="active"):w),K("IN MAINTENANCE",u.status==="fulfilled"?b(f,r=>r.status==="in_maintenance"):w),K("UNASSIGNED VEHICLES",u.status==="fulfilled"?b(f,r=>!r.current_driver_id):w),K("DRIVERS",S.status==="fulfilled"?S.value.total:w),K("SERVICE RECORDS",x.status==="fulfilled"?x.value.total:w));const _=[];function L(r,y,$){const E=it($);E===null||E>ye||_.push({type:r,name:y,value:$,days:E})}f.forEach(r=>{L("Insurance",r.registration_number,r.insurance_expiry),L("Roadworthy",r.registration_number,r.roadworthy_expiry)}),a&&D.forEach(r=>{L("Driver licence",`${r.first_name} ${r.last_name}`,r.license_expiry)}),_.sort((r,y)=>r.days-y.days);const q=_.map(r=>[r.type,r.name,X(r.value),r.days<0?Ee("Expired","danger"):Ee(r.days===0?"Expires today":`In ${r.days} days`,"warning")]);v.append(Se(["Type","Item","Expiry date","Status"],q,`Nothing expires in the next ${ye} days.`));const o=new Map(f.map(r=>[r.id,r.registration_number])),l=[...h].sort((r,y)=>new Date(y.service_date)-new Date(r.service_date)).slice(0,5).map(r=>[X(r.service_date),o.get(r.vehicle_id)||`Vehicle #${r.vehicle_id}`,r.description,Pe(r.cost)]);p.append(Se(["Date","Vehicle","Description","Cost"],l,"No service records yet."))}const lt=["active","in_maintenance","retired"],Y=20;function O(e){const t=document.createElement("td");return t.textContent=e??"",t}function we(e,t){const a=document.createElement("span");return a.className=`badge ${t}`,a.textContent=e,a}function ne(e,t,a){const n=document.createElement("button");return n.type="button",n.className=t,n.textContent=e,n.addEventListener("click",a),n}function xe(e){const t=O(X(e));if(!e)return t;const a=new Date(e);if(Number.isNaN(a.getTime()))return t;const n=Math.floor((a.getTime()-Date.now())/864e5);return n<0?t.append(" ",we("Expired","danger")):n<=30&&t.append(" ",we("Expires soon","warning")),t}function M(e,t,a){if(!t){e.classList.add("hidden"),e.textContent="";return}e.className=`message ${a}`,e.textContent=t}function _e(e,t){if(e.replaceChildren(),t){const a=document.createElement("option");a.value="",a.textContent="All statuses",e.append(a)}lt.forEach(a=>{const n=document.createElement("option");n.value=a,n.textContent=le(a),e.append(n)})}function ke(e){return e?String(e).slice(0,10):""}async function dt(e){const t=ee(),a=t==="admin"||t==="manager",n=a||t==="staff";e.innerHTML=`
    <h1>Vehicles</h1>
    <div class="message hidden" data-message></div>

    <div class="card ${a?"":"hidden"}">
      <h2 data-form-title>Add vehicle</h2>
      <form class="inline-form" data-vehicle-form novalidate>
        <div><label for="registration_number">Registration number</label><input id="registration_number" name="registration_number" required></div>
        <div><label for="make">Make</label><input id="make" name="make" required></div>
        <div><label for="model">Model</label><input id="model" name="model" required></div>
        <div><label for="year">Year</label><input id="year" name="year" type="number" min="1950" max="2100" required></div>
        <div><label for="status">Status</label><select id="status" name="status" data-form-status></select></div>
        <div><label for="insurance_expiry">Insurance expiry</label><input id="insurance_expiry" name="insurance_expiry" type="date"></div>
        <div><label for="roadworthy_expiry">Roadworthy expiry</label><input id="roadworthy_expiry" name="roadworthy_expiry" type="date"></div>
        <button type="submit" data-save>Add vehicle</button>
        <button type="button" class="secondary hidden" data-cancel-edit>Cancel</button>
      </form>
    </div>

    <div class="card hidden" data-assign-card>
      <h2 data-assign-title>Assign driver</h2>
      <form class="inline-form" data-assign-form>
        <div><label for="driver_id">Driver</label><select id="driver_id" name="driver_id" data-driver-select></select></div>
        <button type="submit" data-assign-submit>Assign</button>
        <button type="button" class="secondary" data-assign-cancel>Cancel</button>
      </form>
    </div>

    <form class="inline-form" data-filter-form>
      <div><label for="search">Search</label><input id="search" name="search" placeholder="Registration, make or model"></div>
      <div><label for="status_filter">Status</label><select id="status_filter" name="status" data-filter-status></select></div>
      <button type="submit">Search</button>
    </form>

    <div class="loading hidden" data-loading>Loading vehicles...</div>
    <div class="table-wrap"><table data-table></table></div>
    <div class="inline-form">
      <button type="button" class="secondary" data-prev>Previous</button>
      <span class="muted" data-page-info></span>
      <button type="button" class="secondary" data-next>Next</button>
    </div>
  `;const s=e.querySelector("[data-message]"),d=e.querySelector("[data-vehicle-form]"),v=e.querySelector("[data-form-title]"),p=e.querySelector("[data-save]"),u=e.querySelector("[data-cancel-edit]"),S=e.querySelector("[data-assign-card]"),x=e.querySelector("[data-assign-title]"),T=e.querySelector("[data-assign-form]"),f=e.querySelector("[data-assign-submit]"),D=e.querySelector("[data-driver-select]"),h=e.querySelector("[data-filter-form]"),w=e.querySelector("[data-loading]"),b=e.querySelector("[data-table]"),_=e.querySelector("[data-prev]"),L=e.querySelector("[data-next]"),q=e.querySelector("[data-page-info]");_e(e.querySelector("[data-form-status]"),!1),_e(e.querySelector("[data-filter-status]"),!0);const o={search:"",status:"",skip:0,total:0,editingId:null,assigningId:null,drivers:[]};function i(c){if(c==null)return"Unassigned";const m=o.drivers.find(k=>k.id===c);return m?`${m.first_name} ${m.last_name}`:`Driver #${c}`}async function l(c,m){M(s,"");try{return await c(),m&&M(s,m,"success"),!0}catch(k){return M(s,k.message,"error"),!1}}function r(){d.reset(),o.editingId=null,v.textContent="Add vehicle",p.textContent="Add vehicle",u.classList.add("hidden")}function y(c){const m=d.elements;o.editingId=c.id,m.registration_number.value=c.registration_number,m.make.value=c.make,m.model.value=c.model,m.year.value=c.year,m.status.value=c.status,m.insurance_expiry.value=ke(c.insurance_expiry),m.roadworthy_expiry.value=ke(c.roadworthy_expiry),v.textContent="Edit vehicle",p.textContent="Save changes",u.classList.remove("hidden"),window.scrollTo(0,0)}function $(c){if(o.assigningId=c.id,x.textContent=`Assign driver to ${c.registration_number}`,D.replaceChildren(),o.drivers.forEach(m=>{const k=document.createElement("option");k.value=m.id,k.textContent=`${m.first_name} ${m.last_name}`,D.append(k)}),o.drivers.length===0){M(s,"There are no drivers to assign yet.","error");return}S.classList.remove("hidden"),window.scrollTo(0,0)}function E(){o.assigningId=null,S.classList.add("hidden")}function C(c){b.replaceChildren();const m=["Registration","Vehicle","Year","Status","Insurance","Roadworthy","Driver"];n&&m.push("Actions");const k=document.createElement("thead"),W=document.createElement("tr");m.forEach(g=>{const N=document.createElement("th");N.textContent=g,W.append(N)}),k.append(W);const H=document.createElement("tbody");if(c.length===0){const g=document.createElement("tr"),N=O("No vehicles found.");N.colSpan=m.length,N.className="empty",g.append(N),H.append(g)}c.forEach(g=>{const N=document.createElement("tr");if(N.append(O(g.registration_number),O(`${g.make} ${g.model}`),O(g.year),O(le(g.status)),xe(g.insurance_expiry),xe(g.roadworthy_expiry),O(i(g.current_driver_id))),n){const R=document.createElement("td");g.current_driver_id===null||g.current_driver_id===void 0?R.append(ne("Assign","secondary",()=>$(g))):R.append(ne("Unassign","secondary",async()=>{await l(()=>Xe(g.id),"Driver unassigned.")&&await A()})),a&&R.append(" ",ne("Edit","secondary",()=>y(g))," ",ne("Delete","danger",async()=>{if(!window.confirm(`Delete vehicle ${g.registration_number}?`))return;await l(()=>Qe(g.id),"Vehicle deleted.")&&await A()})),N.append(R)}H.append(N)}),b.append(k,H)}function F(){const c=o.total===0?0:o.skip+1,m=Math.min(o.skip+Y,o.total);q.textContent=`Showing ${c}-${m} of ${o.total}`,_.disabled=o.skip===0,L.disabled=o.skip+Y>=o.total}async function A(){w.classList.remove("hidden");try{const c=await he({search:o.search,status:o.status,skip:o.skip,limit:Y});o.total=c.total,C(c.items),F()}catch(c){M(s,c.message,"error")}finally{w.classList.add("hidden")}}h.addEventListener("submit",c=>{c.preventDefault(),M(s,""),o.search=h.elements.search.value.trim(),o.status=h.elements.status.value,o.skip=0,A()}),_.addEventListener("click",()=>{o.skip=Math.max(0,o.skip-Y),A()}),L.addEventListener("click",()=>{o.skip+=Y,A()}),u.addEventListener("click",r),e.querySelector("[data-assign-cancel]").addEventListener("click",E),d.addEventListener("submit",async c=>{c.preventDefault(),M(s,"");const m=d.elements,k=m.registration_number.value.trim(),W=m.make.value.trim(),H=m.model.value.trim(),g=Number(m.year.value);if(!k||!W||!H||!g){M(s,"Please fill in registration number, make, model and year.","error");return}const N={registration_number:k,make:W,model:H,year:g,status:m.status.value,insurance_expiry:re(m.insurance_expiry.value),roadworthy_expiry:re(m.roadworthy_expiry.value)},R=o.editingId!==null;p.disabled=!0,p.textContent="Saving...";const de=await l(()=>R?Je(o.editingId,N):Ze(N),R?"Vehicle updated.":"Vehicle added.");p.disabled=!1,de?(r(),o.skip=0,await A()):p.textContent=R?"Save changes":"Add vehicle"}),T.addEventListener("submit",async c=>{c.preventDefault();const m=Number(D.value);if(!m||o.assigningId===null)return;f.disabled=!0,f.textContent="Assigning...";const k=await l(()=>ze(o.assigningId,m),"Driver assigned.");f.disabled=!1,f.textContent="Assign",k&&(E(),await A())});try{const c=await ve({limit:200});o.drivers=c.items}catch{}await A()}const ct=["active","inactive","suspended"],G=20;function V(e){const t=document.createElement("td");return t.textContent=e??"",t}function Ce(e,t){const a=document.createElement("span");return a.className=`badge ${t}`,a.textContent=e,a}function ut(e){const t=new Date(e);if(Number.isNaN(t.getTime()))return null;const a=Math.floor((t.getTime()-Date.now())/864e5);return a<0?Ce("Expired","danger"):a<=30?Ce("Expires soon","warning"):null}function j(e,t,a){if(!t){e.classList.add("hidden"),e.textContent="";return}e.className=`message ${a}`,e.textContent=t}function Le(e,t){if(e.replaceChildren(),t){const a=document.createElement("option");a.value="",a.textContent="All statuses",e.append(a)}ct.forEach(a=>{const n=document.createElement("option");n.value=a,n.textContent=le(a),e.append(n)})}function mt(e){const t=ee(),a=t==="admin"||t==="manager";e.innerHTML=`
    <h1>Drivers</h1>
    <div class="message hidden" data-message></div>

    <div class="card ${a?"":"hidden"}" data-add-card>
      <h2>Add driver</h2>
      <form class="inline-form" data-add-form novalidate>
        <div><label for="first_name">First name</label><input id="first_name" name="first_name" required></div>
        <div><label for="last_name">Last name</label><input id="last_name" name="last_name" required></div>
        <div><label for="license_number">Licence number</label><input id="license_number" name="license_number" required></div>
        <div><label for="license_expiry">Licence expiry</label><input id="license_expiry" name="license_expiry" type="date" required></div>
        <div><label for="phone">Phone</label><input id="phone" name="phone"></div>
        <div><label for="email">Email</label><input id="email" name="email" type="email"></div>
        <div><label for="status">Status</label><select id="status" name="status" data-add-status></select></div>
        <button type="submit" data-add-submit>Add driver</button>
      </form>
    </div>

    <form class="inline-form" data-filter-form>
      <div><label for="search">Search</label><input id="search" name="search" placeholder="Name or licence number"></div>
      <div><label for="status_filter">Status</label><select id="status_filter" name="status" data-filter-status></select></div>
      <button type="submit">Search</button>
    </form>

    <div class="loading hidden" data-loading>Loading drivers...</div>
    <div class="table-wrap"><table data-table></table></div>
    <div class="inline-form">
      <button type="button" class="secondary" data-prev>Previous</button>
      <span class="muted" data-page-info></span>
      <button type="button" class="secondary" data-next>Next</button>
    </div>
  `;const n=e.querySelector("[data-message]"),s=e.querySelector("[data-add-form]"),d=e.querySelector("[data-add-submit]"),v=e.querySelector("[data-filter-form]"),p=e.querySelector("[data-loading]"),u=e.querySelector("[data-table]"),S=e.querySelector("[data-prev]"),x=e.querySelector("[data-next]"),T=e.querySelector("[data-page-info]");Le(e.querySelector("[data-add-status]"),!1),Le(e.querySelector("[data-filter-status]"),!0);const f={search:"",status:"",skip:0,total:0};function D(b){u.replaceChildren();const _=document.createElement("thead"),L=document.createElement("tr"),q=a?["Name","Licence number","Licence expiry","Phone","Email","Status"]:["Name","Status"];q.forEach(i=>{const l=document.createElement("th");l.textContent=i,L.append(l)}),_.append(L);const o=document.createElement("tbody");if(b.length===0){const i=document.createElement("tr"),l=V("No drivers found.");l.colSpan=q.length,l.className="empty",i.append(l),o.append(i)}b.forEach(i=>{const l=document.createElement("tr");if(l.append(V(`${i.first_name} ${i.last_name}`)),a){l.append(V(i.license_number));const r=V(X(i.license_expiry)),y=ut(i.license_expiry);y&&r.append(" ",y),l.append(r),l.append(V(i.phone||"-")),l.append(V(i.email||"-"))}l.append(V(le(i.status))),o.append(l)}),u.append(_,o)}function h(){const b=f.total===0?0:f.skip+1,_=Math.min(f.skip+G,f.total);T.textContent=`Showing ${b}-${_} of ${f.total}`,S.disabled=f.skip===0,x.disabled=f.skip+G>=f.total}async function w(){p.classList.remove("hidden");try{const b=await ve({search:f.search,status:f.status,skip:f.skip,limit:G});f.total=b.total,D(b.items),h()}catch(b){j(n,b.message,"error")}finally{p.classList.add("hidden")}}v.addEventListener("submit",b=>{b.preventDefault(),j(n,""),f.search=v.search.value.trim(),f.status=v.status.value,f.skip=0,w()}),S.addEventListener("click",()=>{f.skip=Math.max(0,f.skip-G),w()}),x.addEventListener("click",()=>{f.skip+=G,w()}),s.addEventListener("submit",async b=>{b.preventDefault(),j(n,"");const _=re(s.license_expiry.value);if(!s.first_name.value.trim()||!s.last_name.value.trim()||!s.license_number.value.trim()||!_){j(n,"Please fill in name, licence number and licence expiry.","error");return}const L={first_name:s.first_name.value.trim(),last_name:s.last_name.value.trim(),license_number:s.license_number.value.trim(),license_expiry:_,phone:s.phone.value.trim()||null,email:s.email.value.trim()||null,status:s.status.value};d.disabled=!0,d.textContent="Saving...";try{await tt(L),s.reset(),j(n,"Driver added.","success"),f.skip=0,await w()}catch(q){j(n,q.message,"error")}finally{d.disabled=!1,d.textContent="Add driver"}}),w()}const Z=20;function P(e){const t=document.createElement("td");return t.textContent=e??"",t}function ft(e,t,a){const n=document.createElement("button");return n.type="button",n.className=t,n.textContent=e,n.addEventListener("click",a),n}function I(e,t,a){if(!t){e.classList.add("hidden"),e.textContent="";return}e.className=`message ${a}`,e.textContent=t}async function pt(e){const t=ee(),a=t==="admin"||t==="manager";e.innerHTML=`
    <h1>Maintenance</h1>
    <div class="message hidden" data-message></div>

    <div class="card">
      <h2>Log service</h2>
      <form class="inline-form" data-log-form novalidate>
        <div><label for="vehicle_id">Vehicle</label><select id="vehicle_id" name="vehicle_id" data-log-vehicle></select></div>
        <div><label for="service_date">Service date</label><input id="service_date" name="service_date" type="date" required></div>
        <div><label for="description">Description</label><input id="description" name="description" required></div>
        <div><label for="cost">Cost (R)</label><input id="cost" name="cost" type="number" min="0" step="0.01" required></div>
        <div><label for="service_provider">Service provider</label><input id="service_provider" name="service_provider"></div>
        <button type="submit" data-log-submit>Log service</button>
      </form>
    </div>

    <form class="inline-form" data-filter-form>
      <div><label for="filter_vehicle">Vehicle</label><select id="filter_vehicle" name="vehicle_id" data-filter-vehicle></select></div>
      <button type="submit">Filter</button>
    </form>

    <div class="loading hidden" data-loading>Loading records...</div>
    <div class="table-wrap"><table data-table></table></div>
    <div class="inline-form">
      <button type="button" class="secondary" data-prev>Previous</button>
      <span class="muted" data-page-info></span>
      <button type="button" class="secondary" data-next>Next</button>
    </div>
  `;const n=e.querySelector("[data-message]"),s=e.querySelector("[data-log-form]"),d=e.querySelector("[data-log-submit]"),v=e.querySelector("[data-log-vehicle]"),p=e.querySelector("[data-filter-form]"),u=e.querySelector("[data-filter-vehicle]"),S=e.querySelector("[data-loading]"),x=e.querySelector("[data-table]"),T=e.querySelector("[data-prev]"),f=e.querySelector("[data-next]"),D=e.querySelector("[data-page-info]"),h={vehicleId:"",skip:0,total:0,vehicles:[]};function w(i){return`${i.registration_number} - ${i.make} ${i.model}`}function b(i){const l=h.vehicles.find(r=>r.id===i);return l?w(l):`Vehicle #${i}`}function _(){v.replaceChildren(),u.replaceChildren();const i=document.createElement("option");i.value="",i.textContent="All vehicles",u.append(i),h.vehicles.forEach(l=>{const r=document.createElement("option");r.value=l.id,r.textContent=w(l),v.append(r);const y=r.cloneNode(!0);u.append(y)})}function L(i){x.replaceChildren();const l=["Date","Vehicle","Description","Cost","Provider","Logged by"];a&&l.push("Actions");const r=document.createElement("thead"),y=document.createElement("tr");l.forEach(E=>{const C=document.createElement("th");C.textContent=E,y.append(C)}),r.append(y);const $=document.createElement("tbody");if(i.length===0){const E=document.createElement("tr"),C=P("No service records found.");C.colSpan=l.length,C.className="empty",E.append(C),$.append(E)}i.forEach(E=>{const C=document.createElement("tr");if(C.append(P(X(E.service_date)),P(b(E.vehicle_id)),P(E.description),P(Pe(E.cost)),P(E.service_provider||"-"),P(E.logged_by)),a){const F=document.createElement("td");F.append(ft("Delete","danger",async()=>{if(window.confirm("Delete this service record?")){I(n,"");try{await st(E.id),I(n,"Record deleted.","success"),await o()}catch(A){I(n,A.message,"error")}}})),C.append(F)}$.append(C)}),x.append(r,$)}function q(){const i=h.total===0?0:h.skip+1,l=Math.min(h.skip+Z,h.total);D.textContent=`Showing ${i}-${l} of ${h.total}`,T.disabled=h.skip===0,f.disabled=h.skip+Z>=h.total}async function o(){S.classList.remove("hidden");try{const i=await Re({vehicleId:h.vehicleId,skip:h.skip,limit:Z});h.total=i.total,L(i.items),q()}catch(i){I(n,i.message,"error")}finally{S.classList.add("hidden")}}p.addEventListener("submit",i=>{i.preventDefault(),I(n,""),h.vehicleId=p.elements.vehicle_id.value,h.skip=0,o()}),T.addEventListener("click",()=>{h.skip=Math.max(0,h.skip-Z),o()}),f.addEventListener("click",()=>{h.skip+=Z,o()}),s.addEventListener("submit",async i=>{i.preventDefault(),I(n,"");const l=s.elements,r=Number(l.vehicle_id.value),y=re(l.service_date.value),$=l.description.value.trim(),E=Number(l.cost.value);if(!r||!y||!$||l.cost.value===""||E<0){I(n,"Please choose a vehicle and fill in date, description and cost.","error");return}const C={vehicle_id:r,service_date:y,description:$,cost:E,service_provider:l.service_provider.value.trim()||null};d.disabled=!0,d.textContent="Saving...";try{await nt(C),s.reset(),I(n,"Service logged.","success"),h.skip=0,await o()}catch(F){I(n,F.message,"error")}finally{d.disabled=!1,d.textContent="Log service"}});try{const i=await he({limit:200});h.vehicles=i.items}catch(i){I(n,`Could not load vehicles: ${i.message}`,"error")}_(),await o()}const ht={"#/home":{render:Ke},"#/login":{render:je},"#/dashboard":{render:ot,guard:()=>ae()},"#/vehicles":{render:dt,guard:()=>ae()},"#/drivers":{render:mt,guard:()=>ae()},"#/maintenance":{render:pt,guard:()=>ae()}},vt=[{hash:"#/dashboard",label:"Overview",abbr:"OV"},{hash:"#/vehicles",label:"Vehicles",abbr:"VH"},{hash:"#/drivers",label:"Drivers",abbr:"DR"},{hash:"#/maintenance",label:"Maintenance",abbr:"SV"}],gt=document.querySelector("#app");let J,Q,z,se,B;function bt(){J=document.createElement("div"),J.className="app-shell",Q=document.createElement("aside"),Q.className="sidebar";const e=document.createElement("div");e.className="lf-brand";const t=document.createElement("span");t.className="lf-logo",t.textContent="F";const a=document.createElement("strong");a.textContent="Fleetline",e.append(t,a);const n=document.createElement("p");n.className="side-label",n.textContent="WORKSPACE",z=document.createElement("nav"),z.className="side-nav",vt.forEach(v=>{const p=document.createElement("a");p.href=v.hash;const u=document.createElement("b");u.textContent=v.abbr,p.append(u,v.label),z.append(p)}),se=document.createElement("span"),se.className="badge";const s=document.createElement("button");s.type="button",s.className="secondary",s.textContent="Log out",s.addEventListener("click",yt);const d=document.createElement("div");d.className="side-footer",d.append(se,s),Q.append(e,n,z,d),B=document.createElement("main"),B.className="content",J.append(Q,B),gt.replaceChildren(J)}function Ne(e){const t=ie(),a=e==="#/home";Q.classList.toggle("hidden",!t||a),J.classList.toggle("no-sidebar",!t||a),B.classList.toggle("content-landing",a),se.textContent=ee()||"",z.querySelectorAll("a").forEach(n=>{n.classList.toggle("active",n.getAttribute("href")===e)})}function yt(){Ie(),window.location.hash="#/login"}function $e(e,t){const a=document.createElement("div");a.className="message error",a.textContent=e,B.replaceChildren(a)}async function Oe(){const e=window.location.hash.split("?")[0];if(!e){window.location.hash=ie()?"#/dashboard":"#/home";return}const t=ht[e];if(!t){Ne(e),$e("Page not found.");return}if(t.guard){const a=window.location.hash;if(t.guard()===!1||window.location.hash!==a)return}Ne(e),B.replaceChildren();try{await t.render(B)}catch(a){$e(a.message||"Something went wrong.")}}function Et(){"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/service-worker.js").catch(()=>{})})}bt();window.addEventListener("hashchange",Oe);Et();Oe();
