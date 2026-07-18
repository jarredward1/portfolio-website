export const bustVertex = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aRandom;
  attribute float aShade;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uReduced;
  uniform float uHeadYaw;
  uniform float uHeadPitch;
  uniform vec2 uPointer;
  uniform float uForce;
  uniform float uExit;

  varying float vShade;
  varying float vLp;
  varying float vDisturb;
  varying float vRel;

  // Tuning knobs for the two interactions.
  const vec3 HEAD_PIVOT = vec3(0.0, 0.05, 0.0); // neck joint, world units (measured from the matte)
  const float POINTER_RADIUS = 0.42;            // base size of the break-apart zone
  const float POINTER_STRENGTH = 0.44;          // how far particles flee

  // Cheap value noise: spatially coherent, so the break-apart tears in
  // clumps and shards instead of forming a clean circle.
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

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

    // Head-only rotation, soft-skinned around the neck pivot. The weight
    // ramps from 0 at the shoulders to 1 at the face, so the neck twists
    // instead of the head shearing off the torso. A faint time-based sway
    // keeps the head alive when the cursor is still.
    // Measured from the silhouette: the head's constant-width region ends
    // ~y=+0.30 and the collar flare starts ~y=+0.08, so the weight is fully
    // zero before any shirt or jacket pixels. Only the head and beard turn.
    float w = smoothstep(0.02, 0.28, formed.y);
    float yaw = (uHeadYaw + sin(uTime * 0.22) * 0.035 * (1.0 - uReduced)) * w;
    float pitch = uHeadPitch * w;
    vec3 p = formed - HEAD_PIVOT;
    float cy = cos(yaw);
    float sy = sin(yaw);
    p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
    float cpx = cos(pitch);
    float spx = sin(pitch);
    p = vec3(p.x, cpx * p.y - spx * p.z, spx * p.y + cpx * p.z);
    formed = p + HEAD_PIVOT;

    vec3 pos = mix(position + aScatter, formed, lp);

    // Pointer repulsion: an ABSTRACT break, not a clean circle. Coherent
    // noise makes the reach ragged (clumps tear away while neighbors hold),
    // slowly crawls over time, and bends each shard's escape direction away
    // from pure radial. Gating by lp stops it fighting the assembly.
    vec2 dp = pos.xy - uPointer;
    float dist = length(dp);
    float n = vnoise(formed.xy * 3.2 + uTime * 0.18);
    float reach = POINTER_RADIUS * (0.55 + n * 1.15);
    float influence = uForce * lp * smoothstep(reach, reach * 0.1, dist) * (0.45 + n);
    float str = influence * influence * (0.5 + aRandom * 0.8);
    float ang = (n - 0.5) * 2.2 + (aRandom - 0.5) * 1.1;
    vec2 dirR = dp / max(dist, 1e-3);
    float ca = cos(ang);
    float sa = sin(ang);
    vec2 dir = vec2(ca * dirR.x - sa * dirR.y, sa * dirR.x + ca * dirR.y);
    pos.xy += dir * str * POINTER_STRENGTH;
    pos.z += str * POINTER_STRENGTH * 0.6 * (aRandom - 0.35);
    vDisturb = influence;

    // Scroll dissolve: as the hero scrolls away the embers are RIPPED
    // upward in turbulent, noise-driven gusts, then reassemble on the way
    // back. uExit is 0 at the top of the page and 1 once the hero is
    // mostly gone. Wide per-point speed variance plus coherent gusts make
    // the tear-off violent instead of a gentle drift.
    float rel = uExit * (0.2 + aRandom * 0.9);
    float gust = vnoise(formed.xy * 1.7 + uTime * 0.45);
    float rAng = aRandom * 6.2831 + gust * 3.5;
    pos.y += rel * rel * (3.4 + gust * 2.4);
    pos.x += cos(rAng) * rel * (1.7 + gust * 1.5);
    pos.z += sin(rAng * 1.3) * rel * 1.7;
    pos.y += sin(uTime * 2.2 + aRandom * 40.0) * rel * 0.3;
    vRel = rel;

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
  varying float vDisturb;
  varying float vRel;

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

    // Stirred embers glow hotter while displaced by the cursor, and flare
    // white-hot while being torn away by the scroll dissolve.
    float bright = mix(0.42, 1.52, pow(t, 0.9)) + vDisturb * 0.55 + vRel * 1.1;
    float alpha = mask * vLp * uOpacity * mix(0.55, 1.0, t);
    // Released sparks burn out late in their flight.
    alpha *= 1.0 - smoothstep(0.42, 0.92, vRel);

    gl_FragColor = vec4(col * bright, alpha);
  }
`
