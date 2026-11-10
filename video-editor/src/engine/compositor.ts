// Compositor WebGL2 da pré-visualização. Cada camada é um quad transformado com um
// shader que replica a cadeia de filtros da exportação FFmpeg (eq, temperatura,
// LUT do filtro, efeitos, desfoque/glitch animados, opacidade e fade para preto).
import { filterLut, DUOTONE } from '@shared/looks';

const VS = `#version 300 es
in vec2 a_pos;
uniform vec2 u_canvas;
uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_rot;
out vec2 v_uv;
void main() {
  vec2 local = (a_pos - 0.5) * u_size;
  float c = cos(u_rot), s = sin(u_rot);
  vec2 p = u_center + vec2(local.x * c - local.y * s, local.x * s + local.y * c);
  v_uv = a_pos;
  gl_Position = vec4(p.x / u_canvas.x * 2.0 - 1.0, 1.0 - p.y / u_canvas.y * 2.0, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform sampler2D u_lut;
uniform vec4 u_crop; // l t r b
uniform vec2 u_flip;
uniform vec2 u_layerPx;
uniform vec3 u_eq; // brilho, contraste, saturação
uniform vec3 u_gains;
uniform float u_useLut, u_fmono, u_fsat;
uniform float u_sharpen, u_bw, u_sepia, u_invert, u_vignette, u_grain;
uniform float u_blurS, u_blurA, u_blurW;
uniform float u_glitchPx, u_glitchW;
uniform float u_opacity, u_black, u_time;
uniform vec2 u_pixel;
uniform float u_white, u_mirror, u_poster, u_duo, u_chroma, u_glow, u_glowSigma, u_scan, u_scanP, u_bars;
uniform vec2 u_wipe0, u_wipe1; // (fração revelada, direção) — direção < 0 = sem máscara
uniform vec3 u_duoDark, u_duoLight;

vec2 mapUV(vec2 uv) {
  uv = mix(uv, 1.0 - uv, u_flip);
  uv = clamp(uv, 0.0, 1.0);
  return vec2(u_crop.x + uv.x * (1.0 - u_crop.x - u_crop.z), u_crop.y + uv.y * (1.0 - u_crop.y - u_crop.w));
}
vec4 tap(vec2 uv) { return texture(u_tex, mapUV(uv)); }
vec4 blurAt(vec2 uv, float sigma) {
  if (sigma < 0.3) return tap(uv);
  vec2 px = 1.0 / u_layerPx;
  vec4 acc = vec4(0.0); float wsum = 0.0;
  for (int i = -3; i <= 3; i++) for (int j = -3; j <= 3; j++) {
    vec2 o = vec2(float(i), float(j)) * sigma * 0.66;
    float w = exp(-dot(o, o) / (2.0 * sigma * sigma));
    acc += tap(uv + o * px) * w; wsum += w;
  }
  return acc / wsum;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

float wipeMask(vec2 w, vec2 uv) {
  if (w.y < 0.0) return 1.0;
  if (w.y < 0.5) return step(uv.x, w.x);
  if (w.y < 1.5) return step(1.0 - w.x, uv.x);
  if (w.y < 2.5) return step(uv.y, w.x);
  return step(1.0 - w.x, uv.y);
}

void main() {
  vec2 uv = v_uv;
  float reveal = wipeMask(u_wipe0, v_uv) * wipeMask(u_wipe1, v_uv);
  if (u_mirror > 0.5 && uv.x > 0.5) uv.x = 1.0 - uv.x;
  vec4 col;
  if (u_pixel.x > 0.0) {
    // mesma grelha de blocos que a exportação e cor média do bloco (scale flags=area)
    vec2 n = u_pixel;
    vec2 c0 = floor(uv * n) / n;
    col = vec4(0.0);
    for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) col += tap(c0 + (vec2(float(i), float(j)) + 0.5) / 4.0 / n);
    col /= 16.0;
    uv = c0 + 0.5 / n;
  } else col = blurAt(uv, u_blurS);
  if (u_chroma > 0.0) {
    vec2 sh = vec2(u_chroma / u_layerPx.x, 0.0);
    col.r = blurAt(uv + sh, u_blurS).r;
    col.b = blurAt(uv - sh, u_blurS).b;
  }
  if (u_blurW > 0.001) col = mix(col, blurAt(uv, sqrt(u_blurS * u_blurS + u_blurA * u_blurA)), u_blurW);
  if (u_glitchW > 0.001) {
    vec2 sh = vec2(u_glitchPx / u_layerPx.x, 0.0);
    vec4 g = vec4(tap(uv + sh).r, tap(uv - vec2(0.0, u_glitchPx / 3.0 / u_layerPx.y)).g, tap(uv - sh).b, col.a);
    col = mix(col, g, u_glitchW);
  }
  if (u_sharpen > 0.0) {
    vec2 px = 1.5 / u_layerPx;
    vec4 b = (tap(uv + vec2(px.x, 0)) + tap(uv - vec2(px.x, 0)) + tap(uv + vec2(0, px.y)) + tap(uv - vec2(0, px.y))) * 0.25;
    col.rgb = col.rgb + u_sharpen * (col.rgb - b.rgb);
  }
  vec3 c = clamp(col.rgb, 0.0, 1.0);
  // eq (YUV BT.601)
  float Y = dot(c, vec3(0.299, 0.587, 0.114));
  float U = (c.b - Y) * 0.565, V = (c.r - Y) * 0.713;
  Y = (Y - 0.5) * u_eq.y + 0.5 + u_eq.x;
  U *= u_eq.z; V *= u_eq.z;
  c = clamp(vec3(Y + 1.403 * V, Y - 0.344 * U - 0.714 * V, Y + 1.770 * U), 0.0, 1.0);
  c = clamp(c * u_gains, 0.0, 1.0);
  // filtro: mono → LUT → saturação
  if (u_fmono > 0.0) { float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(c, vec3(l), u_fmono); }
  if (u_useLut > 0.5) {
    c = vec3(texture(u_lut, vec2(c.r * 255.0 / 256.0 + 0.5 / 256.0, 0.5)).r,
             texture(u_lut, vec2(c.g * 255.0 / 256.0 + 0.5 / 256.0, 0.5)).g,
             texture(u_lut, vec2(c.b * 255.0 / 256.0 + 0.5 / 256.0, 0.5)).b);
  }
  if (u_fsat != 1.0) { float l = dot(c, vec3(0.299, 0.587, 0.114)); c = clamp(mix(vec3(l), c, u_fsat), 0.0, 1.0); }
  // efeitos pontuais
  if (u_bw > 0.0) { float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(c, vec3(l), u_bw); }
  if (u_sepia > 0.0) {
    vec3 s = vec3(dot(c, vec3(0.393, 0.769, 0.189)), dot(c, vec3(0.349, 0.686, 0.168)), dot(c, vec3(0.272, 0.534, 0.131)));
    c = clamp(mix(c, s, u_sepia), 0.0, 1.0);
  }
  if (u_invert > 0.0) c = c + (1.0 - 2.0 * c) * u_invert;
  if (u_poster > 1.0) c = floor(c * 255.0 * u_poster / 256.0) / (u_poster - 1.0);
  if (u_duo > 0.0) { float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(c, mix(u_duoDark, u_duoLight, l), u_duo); }
  if (u_glow > 0.0) { vec3 g = blurAt(uv, u_glowSigma).rgb; c = mix(c, 1.0 - (1.0 - c) * (1.0 - g), u_glow); }
  if (u_vignette > 0.0) {
    vec2 d = (uv - 0.5) * u_layerPx;
    float dn = length(d) / length(u_layerPx * 0.5);
    float k = cos(u_vignette * dn); k = k * k; k = k * k;
    c *= k;
  }
  if (u_scan > 0.0 && mod(v_uv.y * u_layerPx.y, u_scanP) < max(1.0, floor(u_scanP / 2.0 + 0.5))) c *= (1.0 - u_scan);
  if (u_grain > 0.0) c = clamp(c + (hash(uv * u_layerPx + u_time * 61.0) - 0.5) * 2.0 * u_grain / 255.0, 0.0, 1.0);
  if (u_bars > 0.0 && (v_uv.y < u_bars || v_uv.y > 1.0 - u_bars)) c = vec3(0.0);
  c = mix(c, vec3(1.0), u_white);
  c *= (1.0 - u_black);
  float a = col.a * u_opacity * reveal;
  outColor = vec4(c * a, a);
}`;

export interface LayerParams {
  center: [number, number];
  size: [number, number];
  rotation: number; // rad
  crop: { l: number; t: number; r: number; b: number };
  flipH: boolean; flipV: boolean;
  eq: [number, number, number];
  gains: [number, number, number];
  filter: { id: string; intensity: number; mono: number; sat: number } | null;
  sharpen: number; bw: number; sepia: number; invert: number; vignette: number; grain: number;
  blurS: number; blurA: number; blurW: number;
  glitchPx: number; glitchW: number;
  opacity: number; black: number; time: number;
  white: number; mirror: boolean; pixel: [number, number]; poster: number; duo: number; chroma: number; glow: number; glowSigma: number;
  scan: number; scanP: number; bars: number; wipes: { p: number; dir: number }[];
}

export class Compositor {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  loc: Record<string, WebGLUniformLocation | null> = {};
  textures = new Map<string, { tex: WebGLTexture; version: string }>();
  luts = new Map<string, WebGLTexture>();
  W = 1; H = 1;

  constructor(public canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: false, antialias: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 não disponível');
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    this.prog = p;
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, 'a_pos');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i)!;
      this.loc[info.name] = gl.getUniformLocation(p, info.name);
    }
    gl.uniform1i(this.loc.u_tex, 0);
    gl.uniform1i(this.loc.u_lut, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  }

  resize(w: number, h: number) {
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.W = w; this.H = h;
    this.gl.viewport(0, 0, w, h);
  }

  clear(color: string) {
    const gl = this.gl;
    const n = parseInt((color || '#000000').replace('#', '').padEnd(6, '0').slice(0, 6), 16);
    gl.clearColor(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  private texture(key: string, version: string, src: TexImageSource): WebGLTexture {
    const gl = this.gl;
    let t = this.textures.get(key);
    if (!t) {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      t = { tex, version: '' };
      this.textures.set(key, t);
    }
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (version !== 'keep' && (t.version !== version || version === 'live')) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      t.version = version;
    }
    return t.tex;
  }

  dropTexture(key: string) {
    const t = this.textures.get(key);
    if (t) { this.gl.deleteTexture(t.tex); this.textures.delete(key); }
  }

  private lut(id: string, intensity: number): WebGLTexture {
    const key = `${id}:${Math.round(intensity)}`;
    let t = this.luts.get(key);
    if (t) return t;
    const gl = this.gl;
    t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, filterLut(id, intensity));
    this.luts.set(key, t);
    return t;
  }

  draw(src: TexImageSource, key: string, version: string, p: LayerParams) {
    const gl = this.gl;
    const L = this.loc;
    gl.activeTexture(gl.TEXTURE1);
    if (p.filter) gl.bindTexture(gl.TEXTURE_2D, this.lut(p.filter.id, p.filter.intensity));
    gl.activeTexture(gl.TEXTURE0);
    try { this.texture(key, version, src); } catch { return; }
    gl.uniform2f(L.u_canvas, this.W, this.H);
    gl.uniform2f(L.u_center, p.center[0], p.center[1]);
    gl.uniform2f(L.u_size, p.size[0], p.size[1]);
    gl.uniform1f(L.u_rot, p.rotation);
    gl.uniform4f(L.u_crop, p.crop.l, p.crop.t, p.crop.r, p.crop.b);
    gl.uniform2f(L.u_flip, p.flipH ? 1 : 0, p.flipV ? 1 : 0);
    gl.uniform2f(L.u_layerPx, Math.max(1, Math.abs(p.size[0])), Math.max(1, Math.abs(p.size[1])));
    gl.uniform3f(L.u_eq, ...p.eq);
    gl.uniform3f(L.u_gains, ...p.gains);
    gl.uniform1f(L.u_useLut, p.filter ? 1 : 0);
    gl.uniform1f(L.u_fmono, p.filter?.mono ?? 0);
    gl.uniform1f(L.u_fsat, p.filter?.sat ?? 1);
    gl.uniform1f(L.u_sharpen, p.sharpen);
    gl.uniform1f(L.u_bw, p.bw);
    gl.uniform1f(L.u_sepia, p.sepia);
    gl.uniform1f(L.u_invert, p.invert);
    gl.uniform1f(L.u_vignette, p.vignette);
    gl.uniform1f(L.u_grain, p.grain);
    gl.uniform1f(L.u_blurS, p.blurS);
    gl.uniform1f(L.u_blurA, p.blurA);
    gl.uniform1f(L.u_blurW, p.blurW);
    gl.uniform1f(L.u_glitchPx, p.glitchPx);
    gl.uniform1f(L.u_glitchW, p.glitchW);
    gl.uniform1f(L.u_opacity, p.opacity);
    gl.uniform1f(L.u_black, p.black);
    gl.uniform1f(L.u_time, p.time);
    gl.uniform1f(L.u_white, p.white);
    gl.uniform1f(L.u_mirror, p.mirror ? 1 : 0);
    gl.uniform2f(L.u_pixel, p.pixel[0], p.pixel[1]);
    gl.uniform1f(L.u_poster, p.poster);
    gl.uniform1f(L.u_duo, p.duo);
    gl.uniform3f(L.u_duoDark, ...(DUOTONE.dark.map((v) => v / 255) as [number, number, number]));
    gl.uniform3f(L.u_duoLight, ...(DUOTONE.light.map((v) => v / 255) as [number, number, number]));
    gl.uniform1f(L.u_chroma, p.chroma);
    gl.uniform1f(L.u_glow, p.glow);
    gl.uniform1f(L.u_glowSigma, p.glowSigma);
    gl.uniform1f(L.u_scan, p.scan);
    gl.uniform1f(L.u_scanP, p.scanP);
    gl.uniform1f(L.u_bars, p.bars);
    const w0 = p.wipes[0], w1 = p.wipes[1];
    gl.uniform2f(L.u_wipe0, w0?.p ?? 0, w0 ? w0.dir : -1);
    gl.uniform2f(L.u_wipe1, w1?.p ?? 0, w1 ? w1.dir : -1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
