export function render(container) {
  container.innerHTML = `
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
  `;

  // Smooth scroll for the "Workspace" style links (no route change)
  container.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = container.querySelector(`#${link.dataset.scroll}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}