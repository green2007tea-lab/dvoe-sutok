// Living sky over Almaty, drawn in one WebGL fragment shader:
// day gradient, sun or moon on the arc of the day, twinkling stars, slow
// breathing clouds, a soft light that follows the cursor and two ridges of
// the Alatau with snow on the high peaks. CSS gradient is the fallback.
import type { Sky } from './daycycle';

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform float uStars;
uniform vec2 uBody;
uniform float uIsSun;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uVel;
uniform float uPulse;
uniform float uPx; // device pixels per CSS pixel

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

// Ridged noise: sharp crests instead of soft hills, so the far line reads as peaks.
float ridge(float x) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    float n = 1.0 - abs(noise(vec2(x, 3.1)) * 2.0 - 1.0);
    v += a * n * n;
    x = x * 2.1 + 5.3;
    a *= 0.45;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float aa = 1.5 * uPx / uRes.y; // one and a half screen pixels: crisp edges, no stairs
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Sky gradient: warm horizon low, deeper colour overhead.
  float g = smoothstep(0.02, 0.95, uv.y);
  vec3 col = mix(uHorizon, uTop, pow(g, 0.75));

  // Clouds that breathe: two slow layers, lit by the sun or moon.
  // A fast scroll is a time-lapse: clouds race and stretch along the wind.
  float band = smoothstep(0.32, 0.6, uv.y) * (1.0 - smoothstep(0.7, 1.05, uv.y));
  if (band > 0.0) {
    vec2 cp = vec2(p.x * 1.3 * (1.0 - uVel * 0.35) + uTime * 0.008 + uScroll * 2.4, uv.y * 3.2 - uTime * 0.002);
    float cloud = fbm(cp) * fbm(cp * 0.5 + 4.0);
    float breath = 0.85 + 0.15 * sin(uTime * 0.35);
    vec3 cloudCol = mix(mix(uHorizon, uTop, 0.3), uGlow, 0.45) + 0.08;
    col = mix(col, cloudCol, smoothstep(0.16, 0.42, cloud) * band * 0.42 * breath);
  }

  // Stars, only where the sky is high and dark enough.
  vec2 sp = gl_FragCoord.xy / (3.5 * uPx);
  vec2 cell = floor(sp);
  float h = hash(cell);
  if (h > 0.9965) {
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + h * 3.0) * (1.0 + uVel * 4.0) + h * 80.0);
    float star = (1.0 - smoothstep(0.0, 0.42, length(fract(sp) - 0.5)));
    col += star * twinkle * uStars * smoothstep(0.3, 0.75, uv.y);
  }

  // Sun or moon on the arc of the day.
  vec2 b = vec2(uBody.x * aspect, uBody.y);
  float d = distance(p, b);
  float radius = 0.052 * (1.0 + uPulse * 0.12);
  float disc = 1.0 - smoothstep(radius - aa, radius, d);
  float halo = (exp(-d * 5.0) * 0.5 + exp(-d * 16.0) * 0.45) * (1.0 + uPulse * 0.9);
  col += uGlow * halo * mix(0.35, 0.95, uIsSun);
  vec3 sunCol = mix(uGlow, vec3(1.0, 0.98, 0.9), 0.55);
  col = mix(col, sunCol, disc * uIsSun);
  float bite = 1.0 - smoothstep(radius - aa, radius, distance(p, b + vec2(0.022, 0.012)));
  col = mix(col, vec3(0.93, 0.95, 1.0), disc * (1.0 - bite) * (1.0 - uIsSun));

  // Cursor light: a soft warm pool that follows the visitor.
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  col += uGlow * exp(-distance(p, m) * 3.4) * 0.16;

  // Alatau: a far range of sharp peaks with snow, lost in haze, and low
  // foothills in deep green. Only the bottom of the screen holds mountains.
  if (uv.y < 0.4) {
    float x = uv.x * aspect;
    float rx = x * 0.9 + 3.7 + uScroll * 0.12;
    float rh = ridge(rx);
    float far = 0.12 + 0.24 * rh;
    float near = 0.03 + 0.06 * fbm(vec2(x * 1.7 + 11.0 + uScroll * 0.3, 7.0));
    float farMask = 1.0 - smoothstep(far - aa * 0.5, far + aa * 0.5, uv.y);
    float nearMask = 1.0 - smoothstep(near - aa * 0.5, near + aa * 0.5, uv.y);
    // one flank of every peak faces the sun or moon
    // (only near the crest: lower down the faces melt into one haze)
    float slope = ridge(rx + 0.03) - ridge(rx - 0.03);
    float crest = smoothstep(far - 0.09, far - 0.01, uv.y);
    float lit = mix(0.5, clamp(0.5 + slope * 5.0 * clamp((uBody.x * aspect - x) * 6.0, -1.0, 1.0), 0.0, 1.0), crest);
    vec3 farCol = mix(mix(uHorizon, uTop, 0.5), uHorizon, 0.45) * mix(0.72, 0.92, lit);
    float snow = smoothstep(0.6, 0.85, rh) * smoothstep(far - 0.07, far - 0.012, uv.y);
    vec3 snowCol = mix(vec3(0.95, 0.97, 1.0), uGlow, 0.3) * mix(0.55, 1.0, uIsSun) * mix(0.8, 1.05, lit);
    farCol = mix(farCol, snowCol, snow * 0.8);
    // haze gathers in the valley above the foothills
    farCol = mix(farCol, uHorizon, (1.0 - smoothstep(near + 0.01, far - 0.02, uv.y)) * 0.3);
    col = mix(col, farCol, farMask);
    vec3 nearCol = mix(vec3(0.06, 0.22, 0.18), uTop * 0.45, 0.35);
    col = mix(col, nearCol, nearMask);
  }

  // Fine grain keeps the gradients from banding.
  col += (hash(floor(gl_FragCoord.xy / uPx) + fract(uTime)) - 0.5) * 0.022;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SkyRenderer {
  setSky(sky: Sky): void;
  setMouse(x: number, y: number): void;
  setScroll(progress: number): void;
  /** 0..1: how fast the visitor scrolls; the sky turns into a time-lapse. */
  setVelocity(v: number): void;
  /** 0..1: a short flare of the sun or moon after a click. */
  setPulse(v: number): void;
  start(): void;
  stop(): void;
  renderOnce(): void;
}

const MAX_DPR = 2; // full resolution: stars, moon and ridges stay sharp
// Phones have dense screens and small GPUs: 1.5x is sharp there and saves battery.
const MAX_DPR_TOUCH = 1.5;
const MOUSE_EASE = 0.06;
const VEL_EASE = 0.08;
const IDLE_MS = 600; // after this long without input the sky breathes at half rate

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[sky] shader error', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const painted: Record<string, string> = {};

/** Writes the same colours as CSS variables: fallback and UI tinting. */
function paintCss(sky: Sky): void {
  const css = (c: readonly number[]) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`;
  const root = document.documentElement.style;
  const next: Record<string, string> = {
    '--sky-top': css(sky.top),
    '--sky-horizon': css(sky.horizon),
    '--sky-glow': css(sky.glow),
  };
  // Writing to :root restyles the whole page: only write what changed.
  for (const [name, value] of Object.entries(next)) {
    if (painted[name] === value) continue;
    painted[name] = value;
    root.setProperty(name, value);
  }
}

/** No WebGL: the same day, painted only as the CSS gradient behind the page. */
export function cssSky(canvas: HTMLCanvasElement): SkyRenderer {
  canvas.hidden = true;
  return {
    setSky: (next) => paintCss(next),
    setMouse: () => undefined,
    setScroll: () => undefined,
    setVelocity: () => undefined,
    setPulse: () => undefined,
    start: () => undefined,
    stop: () => undefined,
    renderOnce: () => undefined,
  };
}

export function createSky(canvas: HTMLCanvasElement, options: { reduce: boolean }): SkyRenderer {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  let sky: Sky | null = null;
  let scroll = 0;
  let vel = 0;
  let velTarget = 0;
  let pulse = 0;
  let lastInput = 0;
  let tick = 0;
  const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 };
  let frame = 0;
  let running = false;
  const startTime = performance.now();

  if (!gl) return cssSky(canvas);

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) throw new Error('[sky] WebGL program could not be created');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`[sky] WebGL program failed to link: ${gl.getProgramInfoLog(program) ?? ''}`);
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = {
    res: u('uRes'), time: u('uTime'), top: u('uTop'), horizon: u('uHorizon'), glow: u('uGlow'),
    stars: u('uStars'), body: u('uBody'), isSun: u('uIsSun'), mouse: u('uMouse'), scroll: u('uScroll'),
    vel: u('uVel'), pulse: u('uPulse'), px: u('uPx'),
  };

  let scale = 1;
  const resize = (): void => {
    const cap = window.matchMedia('(pointer: coarse)').matches ? MAX_DPR_TOUCH : MAX_DPR;
    scale = Math.min(window.devicePixelRatio || 1, cap);
    canvas.width = Math.round(window.innerWidth * scale);
    canvas.height = Math.round(window.innerHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  // Resizing clears the buffer: redraw at once so no blank frame shows.
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  window.addEventListener('resize', () => {
    const minor = window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120;
    if (minor) return; // a mobile URL bar sliding, not a real resize
    lastW = window.innerWidth;
    lastH = window.innerHeight;
    resize();
    draw();
  });

  const draw = (): void => {
    if (!sky) return;
    mouse.x += (mouse.tx - mouse.x) * MOUSE_EASE;
    mouse.y += (mouse.ty - mouse.y) * MOUSE_EASE;
    vel += (velTarget - vel) * VEL_EASE;
    gl.uniform2f(loc.res, canvas.width, canvas.height);
    gl.uniform1f(loc.time, (performance.now() - startTime) / 1000);
    gl.uniform3fv(loc.top, sky.top);
    gl.uniform3fv(loc.horizon, sky.horizon);
    gl.uniform3fv(loc.glow, sky.glow);
    gl.uniform1f(loc.stars, sky.stars);
    gl.uniform2f(loc.body, sky.body[0], sky.body[1]);
    gl.uniform1f(loc.isSun, sky.isSun);
    gl.uniform2f(loc.mouse, mouse.x, mouse.y);
    gl.uniform1f(loc.scroll, scroll);
    gl.uniform1f(loc.vel, vel);
    gl.uniform1f(loc.pulse, pulse);
    gl.uniform1f(loc.px, scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (): void => {
    frame = requestAnimationFrame(loop);
    // Idle: clouds move at 0.008/s, so skipping every other frame is invisible.
    const idle = performance.now() - lastInput > IDLE_MS && vel < 0.01 && pulse === 0;
    if (idle && tick++ % 2) return;
    draw();
  };
  const wake = (): void => {
    lastInput = performance.now();
  };

  const stop = (): void => {
    running = false;
    cancelAnimationFrame(frame);
  };
  const start = (): void => {
    if (running || document.hidden || options.reduce) return;
    running = true;
    frame = requestAnimationFrame(loop);
  };

  // The sky stops breathing when nobody is looking.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
    canvas.hidden = true;
  });

  return {
    setSky(next) {
      sky = next;
      paintCss(next);
      if (!running) draw();
    },
    setMouse(x, y) {
      mouse.tx = x;
      mouse.ty = y;
      wake();
    },
    setScroll(progress) {
      scroll = progress;
      wake();
    },
    setVelocity(v) {
      velTarget = options.reduce ? 0 : v;
      if (v > 0) wake();
    },
    setPulse(v) {
      pulse = v;
      wake();
      if (!running) draw();
    },
    start,
    stop,
    renderOnce: draw,
  };
}
