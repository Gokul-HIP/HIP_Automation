<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign in · HealthinPocket</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root[data-theme="light"]{
    --bg: #f4f7fb;
    --panel: #ffffff;
    --panel-2: #f8fafc;
    --text: #0f172a;
    --text-soft: #64748b;
    --text-faint: #94a3b8;
    --border: #e2e8f0;
    --border-soft: #eef2f7;
    --accent-1: #0ea5e9;
    --accent-2: #2563eb;
    --accent-soft: #e0f2fe;
    --success: #16a34a;
    --success-soft: #dcfce7;
    --shadow: 0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.06);
    --shadow-lg: 0 20px 60px rgba(15,23,42,0.12);
    --input-bg: #ffffff;
    --hero-grad: linear-gradient(160deg, #eaf6ff 0%, #dbeeff 45%, #cfe7ff 100%);
  }
  :root[data-theme="dark"]{
    --bg: #0a0f1a;
    --panel: #111827;
    --panel-2: #0d1420;
    --text: #f1f5f9;
    --text-soft: #94a3b8;
    --text-faint: #64748b;
    --border: #1f2937;
    --border-soft: #182233;
    --accent-1: #38bdf8;
    --accent-2: #3b82f6;
    --accent-soft: rgba(56,189,248,0.12);
    --success: #4ade80;
    --success-soft: rgba(74,222,128,0.12);
    --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.35);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.5);
    --input-bg: #0b1220;
    --hero-grad: linear-gradient(165deg, #0c2f4a 0%, #0a2540 45%, #081b30 100%);
  }

  *{ box-sizing: border-box; }
  html,body{ height:100%; }
  body{
    margin:0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    transition: background 0.25s ease, color 0.25s ease;
  }

  a{ color: inherit; }

  /* ===== Theme toggle (top right, echoes dashboard header icon) ===== */
  .theme-toggle{
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--panel);
    color: var(--text-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow);
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .theme-toggle:hover{ color: var(--accent-1); }
  .theme-toggle svg{ width:18px; height:18px; }
  .theme-toggle .sun{ display:none; }
  :root[data-theme="dark"] .theme-toggle .moon{ display:none; }
  :root[data-theme="dark"] .theme-toggle .sun{ display:block; }

  /* ===== Layout ===== */
  .page{
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0,560px) 1fr;
  }
  @media (max-width: 940px){
    .page{ grid-template-columns: 1fr; }
    .brand-panel{ display: none; }
  }

  /* ===== Form panel ===== */
  .form-panel{
    display:flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px clamp(28px, 8vw, 96px);
  }
  .form-wrap{
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
  }
  .brand-row{
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom: 44px;
  }
  .brand-mark{
    width:36px; height:36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
    box-shadow: 0 4px 14px rgba(14,165,233,0.35);
  }
  .brand-mark svg{ width:19px; height:19px; }
  .brand-word{
    font-weight: 800;
    font-size: 19px;
    letter-spacing: -0.02em;
    line-height:1;
  }
  .brand-word span{ color: var(--accent-1); font-weight: 800; }

  .heading{
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
  }
  .subheading{
    font-size: 14.5px;
    color: var(--text-soft);
    margin: 0 0 32px;
    line-height:1.5;
  }

  .field{ margin-bottom: 18px; }
  .field label{
    display:block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 7px;
    color: var(--text);
  }
  .input-wrap{ position: relative; }
  .input-wrap svg.leading-icon{
    position:absolute;
    left:13px; top:50%;
    transform: translateY(-50%);
    width:16px; height:16px;
    color: var(--text-faint);
    pointer-events:none;
  }
  .field input{
    width:100%;
    padding: 11px 14px 11px 38px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    font-size: 14.5px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field input::placeholder{ color: var(--text-faint); }
  .field input:focus{
    border-color: var(--accent-1);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .toggle-visibility{
    position:absolute;
    right:12px; top:50%;
    transform: translateY(-50%);
    background:none; border:none;
    color: var(--text-faint);
    cursor:pointer;
    padding:4px;
    display:flex;
    border-radius: 6px;
  }
  .toggle-visibility:hover{ color: var(--text-soft); }
  .toggle-visibility svg{ width:16px; height:16px; }
  .toggle-visibility:focus-visible, .field input:focus-visible{ outline: 2px solid var(--accent-1); outline-offset:1px; }

  .row-between{
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin: 4px 0 26px;
  }
  .remember{
    display:flex;
    align-items:center;
    gap:8px;
    font-size: 13.5px;
    color: var(--text-soft);
    user-select:none;
  }
  .remember input{
    width:15px; height:15px;
    accent-color: var(--accent-1);
    cursor:pointer;
  }
  .forgot{
    font-size: 13.5px;
    font-weight: 600;
    color: var(--accent-2);
    text-decoration: none;
  }
  .forgot:hover{ text-decoration: underline; }

  .btn-primary{
    width:100%;
    padding: 12px 16px;
    border-radius: 10px;
    border:none;
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    color:#fff;
    font-size: 14.5px;
    font-weight: 700;
    font-family: inherit;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    box-shadow: 0 8px 20px rgba(14,165,233,0.28);
    transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
  }
  .btn-primary:hover{ filter: brightness(1.05); box-shadow: 0 10px 24px rgba(14,165,233,0.36); }
  .btn-primary:active{ transform: translateY(1px); }
  .btn-primary:focus-visible{ outline: 2px solid var(--accent-1); outline-offset:2px; }
  .btn-primary svg{ width:16px; height:16px; transition: transform 0.15s; }
  .btn-primary:hover svg{ transform: translateX(2px); }

  .divider{
    display:flex;
    align-items:center;
    gap:14px;
    margin: 26px 0;
    color: var(--text-faint);
    font-size: 12.5px;
  }
  .divider::before, .divider::after{
    content:"";
    flex:1;
    height:1px;
    background: var(--border);
  }

  .btn-oauth{
    width:100%;
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--panel);
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    transition: background 0.15s, border-color 0.15s;
  }
  .btn-oauth:hover{ background: var(--panel-2); }
  .btn-oauth:focus-visible{ outline: 2px solid var(--accent-1); outline-offset:2px; }
  .btn-oauth svg{ width:17px; height:17px; }

  .signup-line{
    text-align:center;
    font-size: 13.5px;
    color: var(--text-soft);
    margin-top: 30px;
  }
  .signup-line a{
    color: var(--accent-2);
    font-weight: 700;
    text-decoration: none;
  }
  .signup-line a:hover{ text-decoration: underline; }

  /* ===== Brand / hero panel ===== */
  .brand-panel{
    position: relative;
    overflow:hidden;
    background: var(--hero-grad);
    display:flex;
    flex-direction:column;
    justify-content: center;
    padding: 64px;
  }
  .deco-dot{
    position:absolute;
    border-radius:50%;
    background: var(--accent-1);
    opacity:0.55;
  }
  .deco-dot.d1{ width:8px; height:8px; top:14%; right:22%; }
  .deco-dot.d2{ width:6px; height:6px; top:22%; right:12%; }
  .deco-dot.d3{ width:5px; height:5px; top:9%; right:33%; }
  .deco-line{
    position:absolute;
    background: var(--accent-1);
    opacity:0.35;
    height:1px;
  }
  .deco-line.l1{ width:70px; top:16%; right:15%; transform: rotate(28deg); }
  .deco-line.l2{ width:50px; top:12%; right:29%; transform: rotate(-18deg); }

  .hero-copy{ max-width: 420px; position: relative; z-index:2; }
  .hero-eyebrow{
    display:inline-flex;
    align-items:center;
    gap:6px;
    font-size:12.5px;
    font-weight:700;
    color: var(--accent-2);
    background: var(--panel);
    border: 1px solid var(--border-soft);
    padding: 6px 12px;
    border-radius: 999px;
    box-shadow: var(--shadow);
    margin-bottom:22px;
  }
  .hero-title{
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height:1.2;
    margin: 0 0 14px;
  }
  .hero-sub{
    font-size: 15px;
    color: var(--text-soft);
    line-height:1.6;
    margin: 0 0 40px;
  }

  /* Vitals card — signature element */
  .vitals-card{
    position: relative;
    z-index: 2;
    background: var(--panel);
    border: 1px solid var(--border-soft);
    border-radius: 16px;
    padding: 22px 22px 18px;
    box-shadow: var(--shadow-lg);
    max-width: 400px;
  }
  .vitals-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom: 14px;
  }
  .vitals-label{
    font-size:11.5px;
    font-weight:700;
    letter-spacing:0.06em;
    text-transform:uppercase;
    color: var(--text-faint);
  }
  .vitals-live{
    display:flex;
    align-items:center;
    gap:6px;
    font-size:11.5px;
    font-weight:700;
    color: var(--success);
    background: var(--success-soft);
    padding: 4px 9px;
    border-radius: 999px;
  }
  .vitals-live .dot{
    width:6px; height:6px;
    border-radius:50%;
    background: var(--success);
    animation: pulseDot 1.6s ease-in-out infinite;
  }
  @keyframes pulseDot{
    0%,100%{ opacity:1; } 50%{ opacity:0.35; }
  }

  .vitals-graph{ width:100%; height:64px; display:block; margin-bottom: 10px; }
  .vitals-line{
    fill:none;
    stroke: var(--accent-1);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 340;
    stroke-dashoffset: 340;
    animation: draw 2.6s ease-out forwards, glide 3.2s linear 2.6s infinite;
  }
  @keyframes draw{ to{ stroke-dashoffset: 0; } }
  @keyframes glide{
    0%{ stroke-dashoffset: 0; }
    100%{ stroke-dashoffset: -340; }
  }
  .vitals-foot{
    display:flex;
    align-items:baseline;
    justify-content:space-between;
  }
  .vitals-number{ font-size: 26px; font-weight: 800; letter-spacing:-0.02em; }
  .vitals-delta{ font-size:12.5px; font-weight:700; color: var(--success); }
  .vitals-caption{ font-size:12px; color: var(--text-faint); margin-top:2px; }

  @media (prefers-reduced-motion: reduce){
    .vitals-line{ animation: none; stroke-dashoffset: 0; }
    .vitals-live .dot{ animation: none; }
  }
</style>
</head>
<body>

  <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode">
    <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
    <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
  </button>

  <div class="page">

    <!-- FORM PANEL -->
    <section class="form-panel">
      <div class="form-wrap">

        <div class="brand-row">
          <div class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div class="brand-word">Healthin<span>Pocket</span></div>
        </div>

        <h1 class="heading">Welcome back</h1>
        <p class="subheading">Sign in to keep an eye on today's pipeline, conversations, and reports.</p>

        <form onsubmit="return false;">

          <div class="field">
            <label for="email">Email address</label>
            <div class="input-wrap">
              <svg class="leading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6 12 13 2 6"/><path d="M2 6h20v12H2Z"/></svg>
              <input id="email" type="email" placeholder="alex.morgan@healthinpocket.com" autocomplete="email">
            </div>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="input-wrap">
              <svg class="leading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
              <input id="password" type="password" placeholder="Enter your password" autocomplete="current-password">
              <button type="button" class="toggle-visibility" onclick="togglePw()" aria-label="Show password">
                <svg id="eyeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div class="row-between">
            <label class="remember">
              <input type="checkbox">
              Remember me
            </label>
            <a href="#" class="forgot">Forgot password?</a>
          </div>

          <button type="submit" class="btn-primary">
            Sign in
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>

        </form>

        <div class="divider">OR CONTINUE WITH</div>

        <button type="button" class="btn-oauth">
          <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.68v3h3.87c2.27-2.09 3.55-5.17 3.55-8.92Z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"/></svg>
          Continue with Google
        </button>

        <p class="signup-line">Don't have an account? <a href="#">Contact your admin</a></p>

      </div>
    </section>

    <!-- BRAND / HERO PANEL -->
    <aside class="brand-panel">
      <span class="deco-dot d1"></span>
      <span class="deco-dot d2"></span>
      <span class="deco-dot d3"></span>
      <span class="deco-line l1"></span>
      <span class="deco-line l2"></span>

      <div class="hero-copy">
        <span class="hero-eyebrow">✳ Good afternoon</span>
        <h2 class="hero-title">Your whole clinic pipeline, at a glance.</h2>
        <p class="hero-sub">Track contacts, conversations, and revenue in one dashboard built for healthcare teams.</p>
      </div>

      <div class="vitals-card">
        <div class="vitals-head">
          <span class="vitals-label">Pipeline Health</span>
          <span class="vitals-live"><span class="dot"></span>Live</span>
        </div>
        <svg class="vitals-graph" viewBox="0 0 340 64" preserveAspectRatio="none">
          <path class="vitals-line" d="M0,40 L40,40 L52,40 L60,12 L70,54 L80,40 L110,40 L122,40 L130,20 L140,44 L150,40 L200,40 L212,40 L220,10 L230,54 L240,40 L270,40 L282,40 L290,24 L300,40 L340,40" />
        </svg>
        <div class="vitals-foot">
          <div>
            <div class="vitals-number">94%</div>
            <div class="vitals-caption">+4.2% vs last week</div>
          </div>
          <div class="vitals-delta">↗ Stable</div>
        </div>
      </div>
    </aside>

  </div>

<script>
  function toggleTheme(){
    var root = document.documentElement;
    var current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
  function togglePw(){
    var input = document.getElementById('password');
    var isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    document.getElementById('eyeIcon').innerHTML = isPw
      ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.4 21.4 0 0 1 5.06-6.06M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 7 11 7a21.3 21.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>'
      : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>';
  }
</script>

</body>
</html>