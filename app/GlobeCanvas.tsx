'use client'

import { useEffect, useRef } from 'react'

/* ─── Types ──────────────────────────────────────────── */
interface GlobeNode {
  lat: number   // radians
  lon: number   // radians
  size: number
  alpha: number
  pulsePhase: number
}

interface GlobeEdge {
  a: number     // index into nodes
  b: number
}

interface TravelPacket {
  edgeIndex: number
  t: number          // 0 → 1 progress along edge
  speed: number
  color: string
  trailLength: number
  trailPoints: { x: number; y: number }[]
}

/* ─── Config ─────────────────────────────────────────── */
const CONFIG = {
  NODE_COUNT     : 180,    // More nodes = denser network
  EDGE_MAX_DIST  : 0.65,   // Higher = longer edges
  EDGE_MAX_PER_NODE: 5,
  PACKET_COUNT   : 36,     // More travelling dots
  ROTATION_SPEED : 0.00012, // Slower globe spin
  TILT_X         : 0.36,   // Globe tilt angle (radians)
  TRAIL_LEN      : 14,     // Longer / shorter packet trail
  COLORS         : ['#00E5FF', '#00E5FF', '#00CFEE', '#55EEFF', '#00B8D9'],
  NODE_SIZE_MIN  : 1.4,
  NODE_SIZE_MAX  : 3.8,
}

/* ─── Math helpers ───────────────────────────────────── */
function latLonToXYZ(lat: number, lon: number): [number, number, number] {
  return [
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    Math.cos(lat) * Math.sin(lon),
  ]
}

function arcDist(a: GlobeNode, b: GlobeNode): number {
  const [ax, ay, az] = latLonToXYZ(a.lat, a.lon)
  const [bx, by, bz] = latLonToXYZ(b.lat, b.lon)
  const dot = Math.max(-1, Math.min(1, ax * bx + ay * by + az * bz))
  return Math.acos(dot)
}

function projectPoint(
  lat: number,
  lon: number,
  rotY: number,
  radius: number,
  cx: number,
  cy: number
): { x: number; y: number; z: number; visible: boolean } {
  let [x, y, z] = latLonToXYZ(lat, lon)

  // Rotate around Y axis (longitude spin)
  const cosR = Math.cos(rotY), sinR = Math.sin(rotY)
  const nx = x * cosR - z * sinR
  const nz = x * sinR + z * cosR
  x = nx; z = nz

  // Tilt around X axis
  const cosT = Math.cos(CONFIG.TILT_X), sinT = Math.sin(CONFIG.TILT_X)
  const ny = y * cosT - z * sinT
  const nz2 = y * sinT + z * cosT
  y = ny; z = nz2

  return {
    x: cx + x * radius,
    y: cy - y * radius,
    z,
    visible: z > -0.15,
  }
}

/* ─── Component ──────────────────────────────────────── */
export default function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas  = canvasRef.current
    if (!canvas) return
    const ctxOrNull = canvas.getContext('2d')
    if (!ctxOrNull) return
    const ctx: CanvasRenderingContext2D = ctxOrNull

    /* ── Sizing ───────────────────────────────────────── */
    let W = 0, H = 0, R = 0, CX = 0, CY = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx!.scale(dpr, dpr)

      // Radius: covers screen on mobile, contained on large screens
      const short = Math.min(W, H)
      const long  = Math.max(W, H)
      R  = W < 768
           ? short * 0.88          // mobile: tighter fit
           : Math.min(long * 0.52, W * 0.46)
      CX = W * 0.5
      CY = H * 0.5
    }

    /* ── Build graph ──────────────────────────────────── */
    const nodes: GlobeNode[] = Array.from({ length: CONFIG.NODE_COUNT }, () => ({
      lat       : (Math.random() - 0.5) * Math.PI,
      lon       : Math.random() * Math.PI * 2,
      size      : CONFIG.NODE_SIZE_MIN + Math.random() * (CONFIG.NODE_SIZE_MAX - CONFIG.NODE_SIZE_MIN),
      alpha     : 0.4 + Math.random() * 0.6,
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    // Build edges (nearest neighbours, cap per node)
    const edges: GlobeEdge[] = []
    const degree = new Array(nodes.length).fill(0)

    for (let i = 0; i < nodes.length; i++) {
      if (degree[i] >= CONFIG.EDGE_MAX_PER_NODE) continue

      const dists = nodes
        .map((n, j) => ({ j, d: j === i ? Infinity : arcDist(nodes[i], n) }))
        .sort((a, b) => a.d - b.d)

      for (const { j, d } of dists) {
        if (d > CONFIG.EDGE_MAX_DIST) break
        if (degree[i] >= CONFIG.EDGE_MAX_PER_NODE) break
        if (degree[j] >= CONFIG.EDGE_MAX_PER_NODE) continue
        // avoid duplicate
        if (!edges.find(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
          edges.push({ a: i, b: j })
          degree[i]++
          degree[j]++
        }
      }
    }

    /* ── Packets ──────────────────────────────────────── */
    function makePacket(edgeIndex?: number): TravelPacket {
      const ei = edgeIndex ?? Math.floor(Math.random() * edges.length)
      return {
        edgeIndex  : ei,
        t          : 0,
        speed      : 0.0006 + Math.random() * 0.0012,
        color      : CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)],
        trailLength: CONFIG.TRAIL_LEN + Math.floor(Math.random() * 8),
        trailPoints: [],
      }
    }

    const packets: TravelPacket[] = Array.from({ length: CONFIG.PACKET_COUNT }, () => ({
      ...makePacket(),
      t: Math.random(),  // stagger starts
    }))

    /* ── Animation loop ───────────────────────────────── */
    let rotY    = 0
    let lastTs  = 0

    function lerp(a: GlobeNode, b: GlobeNode, t: number): [number, number] {
      // spherical interpolation between two node positions
      const [ax, ay, az] = latLonToXYZ(a.lat, a.lon)
      const [bx, by, bz] = latLonToXYZ(b.lat, b.lon)
      const dot = Math.max(-1, Math.min(1, ax * bx + ay * by + az * bz))
      const theta = Math.acos(dot)
      if (theta < 0.001) return [a.lat, a.lon]
      const sinT = Math.sin(theta)
      const fa = Math.sin((1 - t) * theta) / sinT
      const fb = Math.sin(t * theta) / sinT
      const ix = fa * ax + fb * bx
      const iy = fa * ay + fb * by
      const iz = fa * az + fb * bz
      return [Math.asin(iy), Math.atan2(iz, ix)]
    }

    function draw(ts: number) {
      const dt = lastTs ? ts - lastTs : 16
      lastTs = ts

      ctx.clearRect(0, 0, W, H)

      rotY += CONFIG.ROTATION_SPEED * dt

      const now = ts * 0.001

      /* ── Globe base glow ──────────────────────────── */
      const grd = ctx.createRadialGradient(CX, CY, 0, CX, CY, R)
      grd.addColorStop(0,   'rgba(0, 229, 255, 0.035)')
      grd.addColorStop(0.7, 'rgba(0, 229, 255, 0.012)')
      grd.addColorStop(1,   'rgba(0, 229, 255, 0)')
      ctx.beginPath()
      ctx.arc(CX, CY, R, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      /* ── Latitudes ───────────────────────────────── */
      const latLines = 7
      for (let li = 1; li < latLines; li++) {
        const lat = -Math.PI / 2 + (li / latLines) * Math.PI
        ctx.beginPath()
        let started = false
        for (let step = 0; step <= 120; step++) {
          const lon = (step / 120) * Math.PI * 2
          const pt  = projectPoint(lat, lon, rotY, R, CX, CY)
          if (!pt.visible) { started = false; continue }
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true }
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.04})`
        ctx.lineWidth   = 0.5
        ctx.stroke()
      }

      /* ── Meridians ───────────────────────────────── */
      const merLines = 12
      for (let mi = 0; mi < merLines; mi++) {
        const lon = (mi / merLines) * Math.PI * 2
        ctx.beginPath()
        let started = false
        for (let step = 0; step <= 80; step++) {
          const lat = -Math.PI / 2 + (step / 80) * Math.PI
          const pt  = projectPoint(lat, lon, rotY, R, CX, CY)
          if (!pt.visible) { started = false; continue }
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true }
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.strokeStyle = `rgba(255,255,255,0.035)`
        ctx.lineWidth   = 0.5
        ctx.stroke()
      }

      /* ── Edges ───────────────────────────────────── */
      for (const edge of edges) {
        const na = nodes[edge.a]
        const nb = nodes[edge.b]
        const pa = projectPoint(na.lat, na.lon, rotY, R, CX, CY)
        const pb = projectPoint(nb.lat, nb.lon, rotY, R, CX, CY)
        if (!pa.visible && !pb.visible) continue

        const z   = (pa.z + pb.z) * 0.5
        const vis = Math.max(0, z + 0.15) * 0.85

        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.strokeStyle = `rgba(0, 229, 255, ${vis * 0.18})`
        ctx.lineWidth   = 0.7
        ctx.stroke()
      }

      /* ── Packets / travelling nodes ──────────────── */
      for (const pkt of packets) {
        pkt.t += pkt.speed
        if (pkt.t >= 1) {
          // arrive — bounce to a connected edge from this node
          const arrivedNode = edges[pkt.edgeIndex].b
          const connected   = edges
            .map((e, i) => ({ e, i }))
            .filter(({ e }) => e.a === arrivedNode || e.b === arrivedNode)
          const next = connected[Math.floor(Math.random() * connected.length)]
          pkt.edgeIndex = next ? next.i : Math.floor(Math.random() * edges.length)
          pkt.t = 0
          pkt.trailPoints = []
          pkt.speed = 0.0006 + Math.random() * 0.0012
          pkt.color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)]
          continue
        }

        const edge = edges[pkt.edgeIndex]
        const na   = nodes[edge.a]
        const nb   = nodes[edge.b]
        const [lat, lon] = lerp(na, nb, pkt.t)
        const pt = projectPoint(lat, lon, rotY, R, CX, CY)

        if (!pt.visible) continue

        // track trail
        pkt.trailPoints.push({ x: pt.x, y: pt.y })
        if (pkt.trailPoints.length > pkt.trailLength) pkt.trailPoints.shift()

        // draw trail
        if (pkt.trailPoints.length > 1) {
          for (let ti = 1; ti < pkt.trailPoints.length; ti++) {
            const frac = ti / pkt.trailPoints.length
            ctx.beginPath()
            ctx.moveTo(pkt.trailPoints[ti - 1].x, pkt.trailPoints[ti - 1].y)
            ctx.lineTo(pkt.trailPoints[ti].x,     pkt.trailPoints[ti].y)
            ctx.strokeStyle = pkt.color.replace(')', `, ${frac * 0.75})`)
              .replace('rgb(', 'rgba(')
              .replace('#', '')
            // Hex to rgba shortcut
            ctx.strokeStyle = hexAlpha(pkt.color, frac * 0.75)
            ctx.lineWidth   = frac * 2.2
            ctx.stroke()
          }
        }

        // draw head glow
        const headGrd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 7)
        headGrd.addColorStop(0,   hexAlpha(pkt.color, 0.9))
        headGrd.addColorStop(0.4, hexAlpha(pkt.color, 0.35))
        headGrd.addColorStop(1,   hexAlpha(pkt.color, 0))
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = headGrd
        ctx.fill()

        // draw head dot
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = pkt.color
        ctx.fill()
      }

      /* ── Nodes ───────────────────────────────────── */
      for (let ni = 0; ni < nodes.length; ni++) {
        const n  = nodes[ni]
        const pt = projectPoint(n.lat, n.lon, rotY, R, CX, CY)
        if (!pt.visible) continue

        const depthFade = Math.max(0, pt.z + 0.1)
        const pulse     = 0.7 + 0.3 * Math.sin(now * 1.8 + n.pulsePhase)
        const alpha     = n.alpha * depthFade * pulse

        // Glow
        const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, n.size * 3)
        grd.addColorStop(0,   `rgba(0, 229, 255, ${alpha * 0.4})`)
        grd.addColorStop(1,   `rgba(0, 229, 255, 0)`)
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, n.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, n.size * depthFade, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`
        ctx.fill()
      }

      /* ── Equator rim highlight ────────────────────── */
      const rimGrd = ctx.createRadialGradient(CX, CY, R * 0.92, CX, CY, R)
      rimGrd.addColorStop(0,   'rgba(0, 229, 255, 0)')
      rimGrd.addColorStop(0.6, 'rgba(0, 229, 255, 0.015)')
      rimGrd.addColorStop(1,   'rgba(0, 229, 255, 0.055)')
      ctx.beginPath()
      ctx.arc(CX, CY, R, 0, Math.PI * 2)
      ctx.strokeStyle = rimGrd as unknown as string
      ctx.lineWidth   = R * 0.06
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    /* ── Hex → rgba helper ────────────────────────────── */
    function hexAlpha(hex: string, a: number): string {
      const h = hex.replace('#', '')
      const r = parseInt(h.slice(0, 2), 16)
      const g = parseInt(h.slice(2, 4), 16)
      const b = parseInt(h.slice(4, 6), 16)
      return `rgba(${r},${g},${b},${a})`
    }

    /* ── Mouse parallax tilt (reserved for future use) ── */
    function onMouseMove(_e: MouseEvent) {
      // Mouse position captured here; parallax tilt wired in future update
    }
    window.addEventListener('mousemove', onMouseMove)

    /* ── Kick off ─────────────────────────────────────── */
    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position       : 'absolute',
        inset          : 0,
        width          : '100%',
        height         : '100%',
        display        : 'block',
        pointerEvents  : 'none',
      }}
      aria-hidden="true"
    />
  )
}