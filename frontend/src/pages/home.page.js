export function render(container) {
  container.innerHTML = `
    <div class="lf">
      <header class="lf-top">
        <div class="lf-wrap lf-header">
          <div class="lf-brand">
            <img class="lf-logo lf-brand-image" src="/images/vehicle-mark.png" alt="" />
            <span><strong>Vehicle Fleet</strong><small>MANAGEMENT SYSTEM</small></span>
          </div>
          <nav class="lf-nav">
            <a href="#/home" data-scroll="lf-about">About</a>
            <a href="#/home" data-scroll="lf-workspace">Fleet workspace</a>
            <a href="#/home" data-scroll="lf-manage">Features</a>
          </nav>
          <a class="lf-btn lf-right" href="#/login">Log in</a>
        </div>
      </header>

      <main class="lf-wrap">
        <section class="lf-hero">
          <div class="lf-hero-copy">
            <p class="lf-eyebrow"><i class="lf-dot"></i>VEHICLE FLEET MANAGEMENT SYSTEM</p>
            <h1>Every vehicle.<br>One clear <span>overview.</span></h1>
            <p class="lf-sub">Manage cars, vans, and trucks with connected vehicle records, driver assignments, and maintenance history.</p>
            <div class="lf-actions">
              <a class="lf-btn" href="#/login">Open your workspace</a>
              <a class="lf-link" href="#/home" data-scroll="lf-about">About the system</a>
            </div>
          </div>
          <figure class="lf-hero-image">
            <img src="/images/vehicle.jpg" alt="A fleet of trucks ready for operation" />
            <figcaption><span>VEHICLE FLEET MANAGEMENT</span><strong>Records that keep work moving.</strong></figcaption>
          </figure>
        </section>

        <section class="lf-about" id="lf-about">
          <div class="lf-about-copy">
            <p class="lf-eyebrow">ABOUT THE SYSTEM</p>
            <h2>A practical workspace for managing your fleet.</h2>
            <p>Vehicle Fleet Management System is a web application for teams responsible for company vehicles. It brings vehicle records, driver profiles and assignments, and maintenance logs together. Staff can add and update fleet information, review service costs, and keep upcoming maintenance visible across trucks, vans, and cars.</p>
          </div>
          <div class="lf-about-visual" aria-label="Vehicles managed by the system">
            <img src="/images/AdobeStock_1305301275-scaled.jpeg" alt="Trucks in a fleet at dusk" />
            <img src="/images/images.jpeg" alt="A lineup of fleet trucks" />
          </div>
        </section>

        <section class="lf-preview" id="lf-workspace">
          <aside class="lf-side">
            <div class="lf-brand"><img class="lf-logo lf-brand-image" src="/images/vehicle-mark.png" alt="" /><strong>Vehicle Fleet</strong></div>
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
                <div class="lf-map-canvas">
                  <iframe
                    class="lf-google-map"
                    title="Google Maps route from Cape Town to Gqeberha via Johannesburg and Durban"
                    src="https://maps.google.com/maps?q=South%20Africa&z=5&output=embed"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen
                  ></iframe>
                  <svg class="lf-map-route" viewBox="0 0 420 180" preserveAspectRatio="none" aria-hidden="true">
                    <path id="lf-route-path" class="lf-route-line" d="M46 145 C90 128 123 89 174 65 S238 56 275 86 S324 107 367 132" />
                    <g class="lf-route-stop"><circle cx="46" cy="145" r="5"/><text x="54" y="163">Cape Town</text></g>
                    <g class="lf-route-stop"><circle cx="174" cy="65" r="5"/><text x="181" y="57">Johannesburg</text></g>
                    <g class="lf-route-stop"><circle cx="275" cy="86" r="5"/><text x="282" y="80">Durban</text></g>
                    <g class="lf-route-stop"><circle cx="367" cy="132" r="5"/><text x="306" y="155">Gqeberha</text></g>
                    <g class="lf-moving-vehicle" aria-hidden="true">
                      <animateMotion dur="18s" repeatCount="indefinite" rotate="0">
                        <mpath href="#lf-route-path" />
                      </animateMotion>
                      <rect x="-9" y="-5" width="12" height="8" rx="2" />
                      <path d="M3 -3h5l3 3v3H3z" />
                      <circle cx="-5" cy="4" r="2" />
                      <circle cx="7" cy="4" r="2" />
                    </g>
                  </svg>
                </div>
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
            <article class="lf-card"><span class="lf-num">04</span><p class="lf-big">OVERVIEW</p><h3>Fleet dashboard</h3><p>See active, unassigned, and in-maintenance vehicles alongside driver and service totals.</p><a href="#/dashboard">View dashboard</a></article>
            <article class="lf-card"><span class="lf-num">05</span><p class="lf-big">REMINDERS</p><h3>Expiry monitoring</h3><p>Spot insurance, roadworthy, and driver licence dates that are expired or coming due.</p><a href="#/dashboard">Review expiry warnings</a></article>
            <article class="lf-card"><span class="lf-num">06</span><p class="lf-big">FIND RECORDS</p><h3>Search and filters</h3><p>Find vehicles by registration, make, model, or status, and narrow lists to the records you need.</p><a href="#/vehicles">Search fleet records</a></article>
          </div>
        </section>
      </main>

      <footer class="lf-bottom">
        <div class="lf-wrap lf-footer">
          <div class="lf-brand"><img class="lf-logo lf-brand-image" src="/images/vehicle-mark.png" alt="" /><span><strong>Vehicle Fleet</strong><small>MANAGEMENT SYSTEM</small></span></div>
          <small>Vehicle records, driver assignments, and maintenance in one place.</small>
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
