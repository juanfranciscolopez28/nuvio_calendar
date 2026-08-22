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
            gap: 4px;
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
            width: 20px;
            height: 20px;
            font-size: 0.75rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            z-index: 15;
          }
          .event-poster.trakt {
            border-bottom: 3px solid var(--accent-trakt);
          }
          .event-poster.history {
            border-bottom: 3px solid var(--accent-history);
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
          .loading {
            padding: 40px;
            text-align: center;
            color: #8b949e;
          }
        </style>
        <div class="calendar-header">
          <button class="nav-btn" id="prevMonth">&lt; Ant</button>
          <h2 id="monthTitle">Cargando...</h2>
          <button class="nav-btn" id="nextMonth">Sig &gt;</button>
        </div>
        <div class="grid" id="dayNames"></div>
        <div class="grid" id="calendarGrid">
          <div class="loading">Sincronizando con Palantir...</div>
        </div>
      `;
      this.content = this.querySelector('#calendarGrid');
      this.monthTitle = this.querySelector('#monthTitle');
      
      this.querySelector('#prevMonth').addEventListener('click', () => this.changeMonth(-1));
      this.querySelector('#nextMonth').addEventListener('click', () => this.changeMonth(1));

      this.currentDate = new Date();
      this.eventsData = [];
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
      const res = await fetch(`${this.config.url}/api/calendar/events.json?token=${this.config.token}`);
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
      
      const dayEvents = this.eventsData.filter(e => e.timestamp && e.timestamp.startsWith(dateStr));
      
      const grouped = {};
      dayEvents.forEach(ev => {
        let key = ev.uid;
        if (ev.type === 'show') {
          key = ev.poster_url || ev.title.split(' - S')[0];
        }
        if (!grouped[key]) {
          grouped[key] = { ...ev, episodes: [ev.title] };
        } else {
          grouped[key].episodes.push(ev.title);
        }
      });
      
      let eventsHtml = '<div class="events">';
      Object.values(grouped).forEach(ev => {
        const bg = ev.poster_url ? `url(${ev.poster_url})` : '#30363d';
        const badgeHtml = ev.episodes && ev.episodes.length > 1 ? `<div class="badge">${ev.episodes.length}</div>` : '';
        const tooltipText = ev.episodes ? ev.episodes.join('<br>') : ev.title;
        eventsHtml += `
          <div class="event-poster ${ev.source}" style="background-image: ${bg}">
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
  }
}
customElements.define('palantir-calendar-card', PalantirCalendarCard);
