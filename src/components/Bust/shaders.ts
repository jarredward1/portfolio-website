export const bustVertex = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aRandom;
  attribute float aShade;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uReduced;

  varying float vShade;
  varying float vT;
  varying float vLp;

  void main() {
    // Per-point staggered assembly from scatter origin to formed position.
    float d = aRandom * 0.35;
    float lp = clamp((uProgress - d) / (1.0 - d + 1e-4), 0.0, 1.0);
    lp = lp * lp * (3.0 - 2.0 * lp);

    vec3 formed = position;

    // Idle drift (suppressed under reduced motion).
    float drift = (1.0 - uReduced) * 0.028;
    formed.x += sin(uTime * 0.55 + aRandom * 6.2831) * drift;
    formed.y += cos(uTime * 0.48 + aRandom * 6.2831) * drift;
    formed.z += sin(uTime * 0.7 + aRandom * 12.566) * drift * 0.6;

    vec3 pos = mix(position + aScatter, formed, lp);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float sizeFade = mix(0.35, 1.0, lp);
    gl_PointSize = uSize * sizeFade * (1.0 / -mv.z);

    // Gradient parameter: crimson high, amber low, nudged by depth + shading.
    vT = clamp(0.5 - position.y * 0.3 + position.z * 0.5 + (aShade - 0.5) * 0.25, 0.0, 1.0);
    vShade = aShade;
    vLp = lp;
  }
`

export const bustFragment = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA; // crimson
  uniform vec3 uColorB; // ember
  uniform vec3 uColorC; // amber
  uniform float uOpacity;

  varying float vShade;
  varying float vT;
  varying float vLp;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dsq = dot(uv, uv);
    if (dsq > 0.25) discard;
    float mask = smoothstep(0.25, 0.015, dsq);

    vec3 col = vT < 0.5
      ? mix(uColorA, uColorB, vT * 2.0)
      : mix(uColorB, uColorC, (vT - 0.5) * 2.0);

    float bright = mix(0.55, 1.2, vShade);
    float alpha = mask * vLp * uOpacity;

    gl_FragColor = vec4(col * bright, alpha);
  }
`
