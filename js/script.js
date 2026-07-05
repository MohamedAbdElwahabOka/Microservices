/* ============================================================
   MAIN JAVASCRIPT
   Handles: scroll animations, navbar, tabs, arch diagram SVG,
            interactive request simulator with animated packets
   ============================================================ */

// ─── NAVBAR SCROLL EFFECT ────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── REVEAL ON SCROLL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── SMOOTH SCROLL ────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
});

// ─── FAQ ACCORDION ────────────────────────────────────────────
function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
}

// ─── CODE TABS ───────────────────────────────────────────────
function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    event.target.classList.add('active');
}

// ─── DOCKERFILE TABS (Docker Section) ────────────────────────
function showDfTab(id) {
    document.querySelectorAll('.df-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.df-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    event.target.classList.add('active');
}

/* ============================================================
   ARCHITECTURE DIAGRAM — SVG LINES
   ============================================================ */
function drawArchLines() {
    const svg   = document.getElementById('archSvg');
    const wrap  = document.getElementById('archDiagram');
    if (!svg || !wrap) return;

    const wRect = wrap.getBoundingClientRect();

    const connections = [
        ['nodeClient',    'nodeGateway',   'var(--purple)'],
        ['nodeGateway',   'nodeAuth',      'var(--primary)'],
        ['nodeGateway',   'nodeOrders',    'var(--primary)'],
        ['nodeGateway',   'nodeInventory', 'var(--primary)'],
        ['nodeOrders',    'nodePayment',   '#F97316'],
        ['nodeOrders',    'nodeNotif',     '#F97316'],
        ['nodeAuth',      'dbAuth',        'var(--green)'],
        ['nodeOrders',    'dbOrders',      'var(--green)'],
        ['nodeInventory', 'dbInventory',   'var(--green)'],
        ['nodePayment',   'dbPayment',     'var(--green)'],
        ['nodeNotif',     'dbNotif',       'var(--green)'],
    ];

    svg.innerHTML = '';

    // gradient defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    svg.appendChild(defs);

    connections.forEach(([fromId, toId, color], i) => {
        const fromEl = document.getElementById(fromId);
        const toEl   = document.getElementById(toId);
        if (!fromEl || !toEl) return;

        const fR = fromEl.getBoundingClientRect();
        const tR = toEl.getBoundingClientRect();

        const x1 = fR.left + fR.width/2  - wRect.left;
        const y1 = fR.top  + fR.height/2 - wRect.top;
        const x2 = tR.left + tR.width/2  - wRect.left;
        const y2 = tR.top  + tR.height/2 - wRect.top;

        // gradient id
        const gid = `grad-${i}`;
        const grad = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
        grad.setAttribute('id', gid);
        grad.setAttribute('gradientUnits','userSpaceOnUse');
        grad.setAttribute('x1', x1); grad.setAttribute('y1', y1);
        grad.setAttribute('x2', x2); grad.setAttribute('y2', y2);
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
        stop1.setAttribute('offset','0%');   stop1.setAttribute('stop-color', color === 'var(--green)' ? '#10B981' : color === 'var(--primary)' ? '#3B82F6' : color === 'var(--purple)' ? '#8B5CF6' : '#F97316'); stop1.setAttribute('stop-opacity','0.8');
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
        stop2.setAttribute('offset','100%'); stop2.setAttribute('stop-color', color === 'var(--green)' ? '#10B981' : color === 'var(--primary)' ? '#3B82F6' : color === 'var(--purple)' ? '#8B5CF6' : '#F97316'); stop2.setAttribute('stop-opacity','0.2');
        grad.appendChild(stop1); grad.appendChild(stop2);
        defs.appendChild(grad);

        // Line
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('stroke', `url(#${gid})`);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', color === 'var(--green)' ? '4 6' : '0');
        svg.appendChild(line);

        // Animated dot moving along line
        if (color !== 'var(--green)') {
            const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', color === 'var(--primary)' ? '#3B82F6' : color === 'var(--purple)' ? '#8B5CF6' : '#F97316');
            circle.setAttribute('filter','url(#glowFilter)');
            circle.style.opacity = '.8';

            const anim = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
            anim.setAttribute('dur', (1.8 + i * 0.4) + 's');
            anim.setAttribute('repeatCount','indefinite');
            anim.setAttribute('path', `M${x1},${y1} L${x2},${y2}`);
            anim.setAttribute('keyTimes','0;1');
            anim.setAttribute('calcMode','linear');

            circle.appendChild(anim);
            svg.appendChild(circle);
        }
    });

    // glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filter.setAttribute('id','glowFilter');
    const feGaussian = document.createElementNS('http://www.w3.org/2000/svg','feGaussianBlur');
    feGaussian.setAttribute('stdDeviation','3');
    feGaussian.setAttribute('result','coloredBlur');
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg','feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg','feMergeNode');
    feMergeNode1.setAttribute('in','coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg','feMergeNode');
    feMergeNode2.setAttribute('in','SourceGraphic');
    feMerge.appendChild(feMergeNode1); feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussian); filter.appendChild(feMerge);
    defs.appendChild(filter);
}

// Draw after layout is stable
window.addEventListener('load', () => {
    setTimeout(drawArchLines, 300);
});
window.addEventListener('resize', drawArchLines);

/* ============================================================
   SIMULATOR — INTERACTIVE REQUEST ANIMATION
   ============================================================ */
let simRunning = false;

const SIM_STEPS = [
    {
        label: '📱 Client → API Gateway',
        fromId: 'simClient',
        toId:   'simGateway',
        log:    ['📱 [Client] POST /api/orders → http://gateway:8080', '🛡️ [Gateway] الطلب واصل، بيشوف يروح فين...'],
        logType: ['log-info','log-info'],
        activateFrom: 'simClient',
        activateTo:   'simGateway',
        delay: 1200,
    },
    {
        label: '🛡️ Gateway → Auth Service (تحقق من الهوية)',
        fromId: 'simGateway',
        toId:   'simAuth',
        log:    ['🔑 [Gateway → Auth] التحقق من الـ JWT Token...', '✅ [Auth] التوكن صح، المستخدم Ahmed ID: 42'],
        logType: ['log-step','log-success'],
        activateFrom: 'simGateway',
        activateTo:   'simAuth',
        delay: 1400,
    },
    {
        label: '🛡️ Gateway → Orders Service',
        fromId: 'simGateway',
        toId:   'simOrders',
        log:    ['🛒 [Gateway → Orders] توجيه الطلب لـ Orders Service...', '🛒 [Orders] وصلني الطلب. productId=7, qty=2'],
        logType: ['log-step','log-info'],
        activateFrom: 'simGateway',
        activateTo:   'simOrders',
        delay: 1300,
    },
    {
        label: '🛒 Orders → Inventory (فيه بضاعة؟)',
        fromId: 'simOrders',
        toId:   'simInventory',
        log:    ['📦 [Orders → Inventory] GET /api/stock/7', '📦 [Inventory] المنتج موجود: 15 قطعة بـ 250 جنيه'],
        logType: ['log-step','log-success'],
        activateFrom: 'simOrders',
        activateTo:   'simInventory',
        delay: 1500,
    },
    {
        label: '🛒 Orders → Payment (اخصم الفلوس)',
        fromId: 'simOrders',
        toId:   'simPayment',
        log:    ['💳 [Orders → Payment] POST /api/charge { amount: 500 }', '💳 [Payment] تم الخصم من البطاقة بنجاح! txID: tx_9921'],
        logType: ['log-step','log-success'],
        activateFrom: 'simOrders',
        activateTo:   'simPayment',
        delay: 1600,
    },
    {
        label: '🛒 Orders → Notification (ابعت إشعار)',
        fromId: 'simOrders',
        toId:   'simNotif',
        log:    ['🔔 [Orders → Notif] POST /api/notify (fire & forget)', '🔔 [Notif] تم إرسال الإشعار على الموبايل! 🎉'],
        logType: ['log-step','log-success'],
        activateFrom: 'simOrders',
        activateTo:   'simNotif',
        delay: 1200,
    },
    {
        label: '✅ Response يرجع للـ Client',
        fromId: 'simGateway',
        toId:   'simClient',
        log:    ['✅ [Orders → Gateway] { success: true, orderId: 1337 }', '🎉 [Gateway → Client] HTTP 201 — تم الطلب بنجاح!'],
        logType: ['log-success','log-success'],
        activateFrom: 'simGateway',
        activateTo:   'simClient',
        delay: 1400,
        isReturn: true,
    },
];

function getNodeCenter(nodeId, parent) {
    const node = document.getElementById(nodeId);
    const pRect = parent.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();
    return {
        x: nRect.left - pRect.left + nRect.width / 2,
        y: nRect.top  - pRect.top  + nRect.height / 2,
    };
}

// Draw the static connector lines in the simulator
function drawSimLines() {
    const svg    = document.getElementById('simSvg');
    const parent = document.getElementById('simDiagram');
    if (!svg || !parent) return;

    svg.innerHTML = '';

    const connections = [
        ['simClient',    'simGateway'],
        ['simGateway',   'simAuth'],
        ['simGateway',   'simOrders'],
        ['simGateway',   'simInventory'],
        ['simOrders',    'simPayment'],
        ['simOrders',    'simNotif'],
    ];

    connections.forEach(([fromId, toId]) => {
        const f = getNodeCenter(fromId, parent);
        const t = getNodeCenter(toId, parent);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', f.x); line.setAttribute('y1', f.y);
        line.setAttribute('x2', t.x); line.setAttribute('y2', t.y);
        line.setAttribute('stroke', 'rgba(100,116,139,0.35)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '5 7');
        svg.appendChild(line);
    });
}

// Animate a glowing packet from one node to another
function animatePacket(fromId, toId, parentEl, isReturn = false) {
    return new Promise(resolve => {
        const parent = parentEl || document.getElementById('simDiagram');
        const f = getNodeCenter(fromId, parent);
        const t = getNodeCenter(toId, parent);

        const packet = document.createElement('div');
        packet.classList.add('packet');
        if (isReturn) packet.classList.add('return');
        packet.style.left = f.x + 'px';
        packet.style.top  = f.y + 'px';
        packet.style.transform = 'translate(-50%,-50%)';
        parent.appendChild(packet);

        const dx = t.x - f.x;
        const dy = t.y - f.y;
        const duration = 700;
        let start = null;

        function step(ts) {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / duration, 1);
            const ease = prog < 0.5
                ? 2 * prog * prog
                : -1 + (4 - 2 * prog) * prog;

            packet.style.left = (f.x + dx * ease) + 'px';
            packet.style.top  = (f.y + dy * ease) + 'px';

            if (prog < 1) {
                requestAnimationFrame(step);
            } else {
                parent.removeChild(packet);
                resolve();
            }
        }

        requestAnimationFrame(step);
    });
}

function addLog(text, type = 'log-info') {
    const body = document.getElementById('simLogBody');
    const div  = document.createElement('div');
    div.className = `log-line ${type}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function highlightNode(id, isReturn = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add(isReturn ? 'active-green' : 'active');
}
function unhighlightNode(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'active-green');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sendRequest() {
    if (simRunning) return;
    simRunning = true;

    const btn      = document.getElementById('btnSendRequest');
    const btnReset = document.getElementById('btnReset');
    const logBody  = document.getElementById('simLogBody');
    const parent   = document.getElementById('simDiagram');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
    logBody.innerHTML = '';

    addLog('🚀 [System] بدء معالجة الـ Request...', 'log-step');
    addLog('', '');

    drawSimLines();

    for (const step of SIM_STEPS) {
        highlightNode(step.activateFrom, step.isReturn);

        // Log messages
        step.log.forEach((msg, i) => {
            setTimeout(() => addLog(msg, step.logType[i]), i * 300);
        });

        await sleep(400);

        // Animate packet
        await animatePacket(step.fromId, step.toId, parent, step.isReturn);
        highlightNode(step.activateTo, step.isReturn);

        await sleep(step.delay);
        unhighlightNode(step.activateFrom);
        unhighlightNode(step.activateTo);
        addLog('', '');
    }

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'log-step');
    addLog('🎉 [Done] الـ Request اتشال بنجاح في 1.8 ثانية!', 'log-success');
    addLog('📊 Total Services Called: 4', 'log-info');
    addLog('🗄️  Databases Touched: Auth DB + Orders DB + Inventory DB + Payment DB', 'log-info');
    addLog('🔔  Notification sent async (fire & forget)', 'log-warn');

    btn.style.display = 'none';
    btnReset.style.display = 'inline-flex';
    simRunning = false;
}

function resetSim() {
    const btn      = document.getElementById('btnSendRequest');
    const btnReset = document.getElementById('btnReset');
    const logBody  = document.getElementById('simLogBody');
    const svg      = document.getElementById('simSvg');

    logBody.innerHTML = '<div class="log-line log-info">⏳ انتظر... ابعت Request عشان تشوف السحر!</div>';
    if (svg) { svg.innerHTML = ''; drawSimLines(); }

    document.querySelectorAll('.sim-node').forEach(n => n.classList.remove('active','active-green'));
    document.querySelectorAll('.packet').forEach(p => p.remove());

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ابعت Request (شراء منتج)';
    btn.style.display = 'inline-flex';
    btnReset.style.display = 'none';
    simRunning = false;
}

// Initial draw of sim lines when DOM ready
window.addEventListener('load', () => {
    setTimeout(() => {
        drawSimLines();
    }, 500);
});
window.addEventListener('resize', () => {
    drawSimLines();
    drawArchLines();
});
