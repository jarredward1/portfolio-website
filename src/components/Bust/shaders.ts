export const bustVertex = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aRandom;
  attribute float aShade;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uReduced;

  varying float vShade;
  varying float vLp;

  void main() {
    // Per-point staggered assembly from scatter origin to formed position.
    float d = aRandom * 0.35;
    float lp = clamp((uProgress - d) / (1.0 - d + 1e-4), 0.0, 1.0);
    lp = lp * lp * (3.0 - 2.0 * lp);

    vec3 formed = position;

    // Idle drift, small enough to keep the portrait sharp (off when reduced).
    float drift = (1.0 - uReduced) * 0.014;
    formed.x += sin(uTime * 0.55 + aRandom * 6.2831) * drift;
    formed.y += cos(uTime * 0.48 + aRandom * 6.2831) * drift;
    formed.z += sin(uTime * 0.7 + aRandom * 12.566) * drift * 0.6;

    vec3 pos = mix(position + aScatter, formed, lp);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float sizeFade = mix(0.35, 1.0, lp);
    gl_PointSize = uSize * sizeFade * (1.0 / -mv.z);

    // Tonal parameter: the photo's luminance drives everything. A tiny
    // per-point nudge breaks up flat regions so they shimmer like embers.
    vShade = clamp(aShade + (aRandom - 0.5) * 0.06, 0.0, 1.0);
    vLp = lp;
  }
`

export const bustFragment = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA; // deep crimson (shadows)
  uniform vec3 uColorB; // ember (low mids)
  uniform vec3 uColorC; // amber (high mids)
  uniform vec3 uColorD; // pale gold (highlights)
  uniform float uOpacity;

  varying float vShade;
  varying float vLp;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dsq = dot(uv, uv);
    if (dsq > 0.25) discard;
    float mask = smoothstep(0.25, 0.02, dsq);

    // Four-stop tonal ramp: the portrait reads because color AND brightness
    // both follow the photograph's tones.
    float t = vShade;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.38, t));
    col = mix(col, uColorC, smoothstep(0.38, 0.72, t));
    col = mix(col, uColorD, smoothstep(0.72, 0.96, t));

    float bright = mix(0.42, 1.52, pow(t, 0.9));
    float alpha = mask * vLp * uOpacity * mix(0.55, 1.0, t);

    gl_FragColor = vec4(col * bright, alpha);
  }
`
