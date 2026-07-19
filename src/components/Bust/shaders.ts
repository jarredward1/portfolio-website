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
  uniform vec2 uPulseOrigin;
  uniform float uPulseTime;
  uniform float uThemeMix;

  varying float vShade;
  varying float vLp;
  varying float vDisturb;
  varying float vRel;
  varying float vScan;

  // Tuning knobs for the two interactions.
  // Pivot x = measured head-run center. Pivot z sits at the SILHOUETTE's
  // depth (the inflation falls to ~-0.30 at the head's outline), not inside
  // the volume: the bust is a front shell with no back of head, so an axis
  // inside it swings the outline sideways and the head appears to slide off
  // the neck. Anchoring the axis at the outline's own depth pins the
  // silhouette (like a globe's edge staying put while it spins) and lets
  // the interior features (nose, eyes, beard) do the sweeping, which is how
  // a turning head actually reads.
  const vec3 HEAD_PIVOT = vec3(-0.016, 0.05, -0.30);
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
    // The head/torso boundary is not a horizontal line: the chin and beard
    // hang at the head's center BELOW the height of the collar's sides, so
    // a flat y cutoff either freezes the chin or frees the collar. The
    // boundary is a U: measured from the matte, the neck/jaw silhouette
    // extends to |dx| ~0.5, so the dip stays low across that full width
    // (the whole neck column turns) and rises only past it, where the
    // shoulders live. Bright fabric inside the dip (collar V, tie knot,
    // collar tips) is pinned by the fabric term below.
    float dxAxis = abs(formed.x + 0.016);
    float neckY = mix(-0.04, 0.26, smoothstep(0.42, 0.6, dxAxis));
    float w = smoothstep(neckY, neckY + 0.07, formed.y);
    // And the seam itself is depth-faded: weight eases out as points near
    // the silhouette's depth, so the turn dies off along the real 3D form
    // instead of cutting a visible line through the neck. Costs nothing
    // visually: near-silhouette depths are motion-pinned by the axis.
    w *= smoothstep(-0.3, -0.08, formed.z);
    // The collar rides up the neck above the flare line, so no y cutoff
    // alone can fence it out; but it is white fabric among skin and beard.
    // Pin bright points inside the collar zone, INCLUDING its shadowed
    // whites (down to ~0.5 luminance), or the collar's folds flash white
    // in a turn. The zone ends below y=0.3 (collar tops out ~0.24) so the
    // lip and mustache highlights just above it keep full weight.
    float fabric = smoothstep(0.5, 0.7, aShade) * (1.0 - smoothstep(0.22, 0.3, formed.y));
    w *= 1.0 - fabric;
    // The idle sway is gated off in the light theme: with the inflated depth,
    // a constant micro-yaw slides different-depth particles across each other
    // on screen, which normal-blended ink renders as mottle (additive embers
    // absorb it). Ink on paper holds still; the pointer-driven turn remains.
    float sway = sin(uTime * 0.22) * 0.035 * (1.0 - uReduced) * (1.0 - uThemeMix);
    float yaw = (uHeadYaw + sway) * w;
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

    // Periodic scan sweep: a thin band walks down the portrait every 20s
    // (first pass ~6s after load), flaring the embers it crosses. Negative
    // pre-roll times land late in the cycle, so nothing fires early.
    float scanCycle = mod(uTime - 6.0, 20.0);
    float scanPos = 1.9 - (scanCycle / 3.2) * 3.8;
    float scan = (1.0 - uReduced) * step(scanCycle, 3.2)
      * smoothstep(0.22, 0.0, abs(formed.y - scanPos));
    pos.z += scan * 0.09;
    vScan = scan;

    // Tap/click shockwave: an expanding ring that shoves embers outward
    // and decays over ~2.5s. uPulseTime idles at a large value.
    float pd = distance(pos.xy, uPulseOrigin);
    float waveR = uPulseTime * 2.6;
    float ring = smoothstep(0.6, 0.0, abs(pd - waveR)) * exp(-uPulseTime * 1.2);
    vec2 pdir = (pos.xy - uPulseOrigin) / max(pd, 1e-3);
    pos.xy += pdir * ring * 0.55;
    pos.z += ring * 0.4 * (aRandom - 0.3);
    vDisturb = max(vDisturb, ring * 1.2);

    // Flatten perspective for xy AFTER all rotation and displacement: scale
    // by this point's own depth factor so screen position is independent of
    // z (an orthographic view through the perspective camera). At rest the
    // portrait lands on the flat matte's exact raster, staying crisp, and a
    // turning head stays rigid; volume shows through the lateral sweep of
    // deep points, not through magnification. 5.0 = camera z in Bust.tsx.
    pos.xy *= (5.0 - pos.z) / 5.0;

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
  uniform float uThemeMix; // 0 = additive embers on dark, 1 = ink on paper
  uniform vec3 uColorHot;  // light-theme flush for agitated particles

  varying float vShade;
  varying float vLp;
  varying float vDisturb;
  varying float vRel;
  varying float vScan;

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

    // The scan line pushes crossed embers toward pale gold (dark theme only;
    // in light the agitation flush below takes over).
    col = mix(col, uColorD, vScan * 0.6 * (1.0 - uThemeMix));

    // Light theme: stirred, torn, or scanned ink flushes toward hot ember
    // instead of brightening, because added light just fades into the paper.
    float agitation = clamp(vDisturb * 0.7 + vRel * 0.9 + vScan * 0.8, 0.0, 1.0);
    col = mix(col, uColorHot, uThemeMix * agitation);

    // Stirred embers glow hotter while displaced by the cursor, flare
    // white-hot while torn away by the scroll dissolve, and flash as the
    // scan sweep crosses them. On paper the multiplier stays near 1.0 and
    // the tonal alpha inverts: ink shadows carry the image, not highlights.
    float brightDark = mix(0.42, 1.52, pow(t, 0.9)) + vDisturb * 0.55 + vRel * 1.1 + vScan * 1.6;
    float bright = mix(brightDark, mix(1.05, 0.9, t), uThemeMix);
    float alpha = mask * vLp * uOpacity * mix(mix(0.55, 1.0, t), mix(1.0, 0.5, t), uThemeMix);
    // Released sparks burn out late in their flight.
    alpha *= 1.0 - smoothstep(0.42, 0.92, vRel);

    gl_FragColor = vec4(col * bright, alpha);
  }
`
