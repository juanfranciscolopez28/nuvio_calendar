class PalantirCalendarCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <style>
          :host {
            --bg-color: #0d1117;
            --border-color: #30363d;
            --header-color: #c9d1d9;
            --cell-bg: #161b22;
            --cell-hover: #21262d;
            --accent-trakt: #ed1c24;
            --accent-history: #58a6ff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: block;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            background: var(--bg-color);
            color: #fff;
          }
          .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: linear-gradient(180deg, rgba(22,27,34,1) 0%, rgba(13,17,23,1) 100%);
            border-bottom: 1px solid var(--border-color);
          }
          .calendar-header h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
          }
          .nav-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: #fff;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .nav-btn:hover {
            background: var(--cell-hover);
            border-color: #8b949e;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: var(--border-color);
          }
          .day-name {
            background: var(--bg-color);
            text-align: center;
            padding: 10px 0;
            font-size: 0.85rem;
            font-weight: 600;
            color: #8b949e;
            text-transform: uppercase;
          }
          .day-cell {
            background: var(--cell-bg);
            min-height: 120px;
            padding: 8px;
            position: relative;
            transition: background 0.3s ease;
          }
          .day-cell:hover {
            background: var(--cell-hover);
          }
          .day-cell.other-month {
            background: #090c10;
          }
          .day-cell.other-month .date-num {
            opacity: 0.4;
          }
          .day-cell.other-month .event-poster {
            opacity: 0.5;
            filter: grayscale(60%);
          }
          .day-cell.other-month .event-poster:hover {
            opacity: 1;
            filter: grayscale(0%);
          }
          .day-cell.today .date-num {
            background: var(--accent-history);
            color: #fff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .date-num {
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--header-color);
          }
          .events {
            display: flex;
            flex-wrap: wrap;
            gap: 16px 4px;
          }
          .event-poster {
            width: 40px;
            height: 60px;
            border-radius: 4px;
            background-size: cover;
            background-position: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
          }
          .event-poster:hover {
            transform: scale(1.15) translateY(-2px);
            z-index: 10;
            box-shadow: 0 8px 16px rgba(0,0,0,0.8);
          }
          .badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: var(--accent-trakt);
            color: #fff;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 25;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          }
          .type-badge {
            position: absolute;
            bottom: -13px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #8b949e;
            z-index: 15;
            white-space: nowrap;
            padding-bottom: 1px;
          }
          .event-poster.has-links .type-badge {
            border-bottom: 2px solid #2ea043;
            color: #c9d1d9;
          }
          .event-poster.no-links {
            /* no border */
          }
          .tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: #fff;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 20;
            margin-bottom: 8px;
            backdrop-filter: blur(4px);
            border: 1px solid var(--border-color);
          }
          .event-poster:hover .tooltip {
            opacity: 1;
          }
          .tabs-container {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            gap: 10px;
          }
          .tab-btn {
            background: #21262d;
            border: 1px solid var(--border-color);
            color: #c9d1d9;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
          }
          .tab-btn:hover {
            background: #30363d;
          }
          .tab-btn.active {
            background: var(--accent-trakt);
            color: #fff;
            border-color: var(--accent-trakt);
          }
          .tab-btn.active[data-tab="history"] {
            background: var(--accent-history);
            border-color: var(--accent-history);
          }
          .loading {
            padding: 40px;
            text-align: center;
            color: #8b949e;
          }
          .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
          }
          .modal-content {
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 12px 32px rgba(0,0,0,0.8);
          }
          .modal-header {
            display: flex;
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(180deg, rgba(22,27,34,1) 0%, rgba(13,17,23,1) 100%);
          }
          .modal-poster {
            width: 100px;
            height: 150px;
            border-radius: 6px;
            background-size: cover;
            background-position: center;
            margin-right: 20px;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          }
          .modal-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #fff;
          }
          .modal-overview {
            font-size: 0.85rem;
            color: #8b949e;
            line-height: 1.4;
          }
          .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: transparent;
            border: none;
            color: #8b949e;
            font-size: 1.5rem;
            cursor: pointer;
          }
          .modal-close:hover {
            color: #fff;
          }
          .modal-body {
            padding: 20px;
          }
          .modal-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .modal-item {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .modal-item:last-child {
            border-bottom: none;
          }
          .item-title {
            font-size: 0.9rem;
          }
          .item-status {
            font-size: 0.75rem;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: bold;
          }
          .status-ok {
            background: rgba(35, 134, 54, 0.2);
            color: #3fb950;
            border: 1px solid rgba(35, 134, 54, 0.4);
          }
          .status-no {
            background: rgba(237, 28, 36, 0.2);
            color: #ed1c24;
            border: 1px solid rgba(237, 28, 36, 0.4);
          }
        </style>
        <div class="tabs-container">
          <button class="tab-btn active" data-tab="trakt">🎬 Estrenos</button>
          <button class="tab-btn" data-tab="history">⏳ Mi Historial</button>
        </div>
        <div class="calendar-header">
          <button class="nav-btn" id="prevMonth">&lt; Ant</button>
          <div class="month-title" id="monthTitle"></div>
          <button class="nav-btn" id="nextMonth">Sig &gt;</button>
        </div>
        <div class="grid" id="dayNames"></div>
        <div class="grid" id="calendarGrid">
          <div class="loading">Sincronizando con Palantir...</div>
        </div>
        <div id="eventModal" class="modal">
          <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-header">
              <div class="modal-poster" id="modalPoster"></div>
              <div>
                <h3 class="modal-title" id="modalTitle"></h3>
                <div class="modal-overview" id="modalOverview"></div>
              </div>
            </div>
            <div class="modal-body">
              <ul class="modal-list" id="modalList"></ul>
            </div>
          </div>
        </div>
      `;
      this.content = this.querySelector('#calendarGrid');
      this.monthTitle = this.querySelector('#monthTitle');
      this.modal = this.querySelector('#eventModal');
      this.lang = hass.language || "es";
      this.activeTab = "trakt";
      
      this.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.activeTab = e.target.getAttribute('data-tab');
          this.renderCalendar();
        });
      });
      
      this.querySelector('#prevMonth').addEventListener('click', () => this.changeMonth(-1));
      this.querySelector('#nextMonth').addEventListener('click', () => this.changeMonth(1));
      this.querySelector('.modal-close').addEventListener('click', () => { this.modal.style.display = 'none'; });
      this.modal.addEventListener('click', (e) => { if(e.target === this.modal) this.modal.style.display = 'none'; });

      this.currentDate = new Date();
      this.eventsData = [];
      this.fetchData();
    }
    
    // Update language if it changes
    if (this.lang !== (hass.language || "es")) {
      this.lang = hass.language || "es";
      this.fetchData();
    }
  }

  setConfig(config) {
    if (!config.url) {
      throw new Error('Falta la URL de Palantir (ej. url: "http://192.168.18.118:7001")');
    }
    if (!config.token) {
      throw new Error('Falta el token de tu perfil (ej. token: "TU_TOKEN")');
    }
    this.config = config;
  }

  async fetchData() {
    try {
      let url = `${this.config.url}/api/calendar/events.json?token=${this.config.token}&lang=${this.lang}`;
      if (this.config.trakt_user) {
        url += `&trakt_user=${encodeURIComponent(this.config.trakt_user)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al conectar con Palantir');
      this.eventsData = await res.json();
      this.renderCalendar();
    } catch (e) {
      this.content.innerHTML = `<div class="loading" style="color: #ed1c24;">Error: ${e.message}</div>`;
    }
  }

  changeMonth(dir) {
    this.currentDate.setMonth(this.currentDate.getMonth() + dir);
    this.renderCalendar();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    this.monthTitle.innerText = `${monthNames[month]} ${year}`;

    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    this.querySelector('#dayNames').innerHTML = dayNames.map(d => `<div class="day-name">${d}</div>`).join('');

    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Start on Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    let html = '';
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      let d, isCurrentMonth = false;
      if (i < offset) {
        d = new Date(year, month - 1, prevDays - offset + i + 1);
      } else if (i < offset + daysInMonth) {
        d = new Date(year, month, i - offset + 1);
        isCurrentMonth = true;
      } else {
        d = new Date(year, month + 1, i - offset - daysInMonth + 1);
      }

      const dateStr = d.toISOString().split('T')[0];
      const isToday = isCurrentMonth && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      
      const filteredData = this.eventsData.filter(e => e.source === this.activeTab);
      const dayEvents = filteredData.filter(e => e.timestamp && e.timestamp.startsWith(dateStr));
      
      const grouped = {};
      dayEvents.forEach(ev => {
        let key = ev.uid;
        if (ev.type === 'show') {
          key = ev.poster_url || ev.title.split(' - S')[0];
        }
        if (!grouped[key]) {
          grouped[key] = { ...ev, episodes: [ev] };
        } else {
          grouped[key].episodes.push(ev);
        }
      });
      
      let eventsHtml = '<div class="events">';
      Object.values(grouped).forEach(ev => {
        const bg = ev.poster_url ? `url(${ev.poster_url})` : '#30363d';
        const badgeHtml = ev.episodes && ev.episodes.length > 1 ? `<div class="badge">${ev.episodes.length}</div>` : '';
        const tooltipText = ev.episodes ? ev.episodes.map(e => e.title).join('<br>') : ev.title;
        
        const typeBadgeHtml = ev.type === 'movie' ? `<div class="type-badge">PELI</div>` : `<div class="type-badge">SERIE</div>`;
        const groupHasLinks = ev.episodes ? ev.episodes.some(e => e.has_links) : ev.has_links;
        const availabilityClass = (groupHasLinks || ev.source === 'history') ? 'has-links' : 'no-links';
        
        // Escape JSON for onclick
        const evJson = JSON.stringify(ev).replace(/"/g, '&quot;');
        
        eventsHtml += `
          <div class="event-poster ${availabilityClass}" style="background-image: ${bg}" data-event="${evJson}">
            ${typeBadgeHtml}
            ${badgeHtml}
            <div class="tooltip">${tooltipText.replace(/"/g, '&quot;')}</div>
          </div>
        `;
      });
      eventsHtml += '</div>';

      html += `
        <div class="day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
          <div class="date-num">${d.getDate()}</div>
          ${eventsHtml}
        </div>
      `;
    }
    
    this.content.innerHTML = html;
    
    // Add click listeners to posters
    this.content.querySelectorAll('.event-poster').forEach(el => {
      el.addEventListener('click', () => {
        try {
          const ev = JSON.parse(el.getAttribute('data-event'));
          this.openModal(ev);
        } catch (e) {}
      });
    });
  }
  
  openModal(ev) {
    this.querySelector('#modalPoster').style.backgroundImage = ev.poster_url ? `url(${ev.poster_url})` : '#30363d';
    
    // Extract generic title for grouped episodes
    let mainTitle = ev.title;
    if (ev.type === 'show') {
       mainTitle = ev.title.split(' - S')[0];
    }
    
    this.querySelector('#modalTitle').innerText = mainTitle;
    this.querySelector('#modalOverview').innerText = ev.overview || "Sin información adicional.";
    
    let listHtml = '';
    const eps = ev.episodes || [ev];
    eps.forEach(item => {
        const hasLinks = item.has_links || item.source === 'history';
        let statusHtml = '';
        if (item.source === 'history') {
            statusHtml = `<span class="item-status status-ok">👁️ Visto</span>`;
        } else if (hasLinks && item.max_quality) {
            statusHtml = `<span class="item-status status-ok">${item.max_quality}</span>`;
        } else if (hasLinks) {
            statusHtml = `<span class="item-status status-ok">✅ Disponible</span>`;
        } else {
            statusHtml = `<span class="item-status status-no">❌ Próximamente</span>`;
        }
            
        listHtml += `
          <li class="modal-item">
            <span class="item-title">${item.title}</span>
            ${statusHtml}
          </li>
        `;
    });
    this.querySelector('#modalList').innerHTML = listHtml;
    
    this.modal.style.display = 'flex';
  }
}
customElements.define('palantir-calendar-card', PalantirCalendarCard);
