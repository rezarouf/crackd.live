import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_W = 400;
const CANVAS_H = 700;
const ROAD_LEFT = 60;
const ROAD_RIGHT = 340;
const ROAD_W = ROAD_RIGHT - ROAD_LEFT;
const LANE_W = ROAD_W / 3;
const PLAYER_W = 36;
const PLAYER_H = 60;
const TRAFFIC_W = 34;
const TRAFFIC_H = 58;
const ORB_R = 10;
const BASE_SPEED = 180; // px/sec
const MAX_SPEED = 420;
const SPEED_ACCEL = 4; // px/sec per second
const STEER_ACCEL = 600;
const STEER_FRICTION = 0.88;
const SMOOTHNESS_DECAY = 0.04;
const SMOOTHNESS_NEAR_MISS = 0.18;
const SMOOTHNESS_GAIN = 0.008;
const NEAR_MISS_DIST = 55;

const TRAFFIC_COLORS = ['#6b7280', '#4b5563', '#7c6f9b', '#5a7a8a', '#8a6a5a', '#6a8a6a'];
const TRAFFIC_LENGTHS = [52, 62, 70, 58];

function getDailyKey() {
  const today = new Date().toISOString().split('T')[0];
  return `crackd_zendrive_${today}`;
}

function loadDailyBest() {
  try { return parseInt(localStorage.getItem(getDailyKey()) || '0', 10); } catch { return 0; }
}

function saveDailyBest(dist) {
  try { localStorage.setItem(getDailyKey(), String(Math.floor(dist))); } catch {}
}

export function useZenDrive() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef(new Set());
  const touchRef = useRef(null); // 'left' | 'right' | null

  const [phase, setPhase] = useState('idle'); // idle | playing | ended
  const [stats, setStats] = useState({ distance: 0, orbs: 0, smoothness: 1, score: 0 });
  const [dailyBest, setDailyBest] = useState(loadDailyBest);

  function initState() {
    return {
      player: { x: CANVAS_W / 2, y: CANVAS_H - 120, vx: 0 },
      traffic: [],
      orbs: [],
      scrollY: 0,
      speed: BASE_SPEED,
      distance: 0,
      score: 0,
      orbCount: 0,
      smoothness: 1,
      dashOffset: 0,
      scenery: generateScenery(),
      spawnTimer: 0,
      orbTimer: 0,
      nearMissTimer: 0,
      speedLines: [],
      lastTime: null,
    };
  }

  function generateScenery() {
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        x: Math.random() < 0.5 ? Math.random() * 45 + 5 : Math.random() * 45 + 355,
        y: Math.random() * CANVAS_H * 3,
        r: Math.random() * 18 + 8,
        opacity: Math.random() * 0.25 + 0.05,
      });
    }
    return items;
  }

  const draw = useCallback((ctx, s) => {
    // Background
    ctx.fillStyle = '#0E0E14';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Side scenery
    s.scenery.forEach(item => {
      const sy = ((item.y - s.scrollY * 0.3) % (CANVAS_H * 3) + CANVAS_H * 3) % (CANVAS_H * 3) - CANVAS_H;
      ctx.beginPath();
      ctx.arc(item.x, sy, item.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20, 28, 45, ${item.opacity + 0.1})`;
      ctx.fill();
    });

    // Road surface
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_W, CANVAS_H);

    // Road edges
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ROAD_LEFT, 0); ctx.lineTo(ROAD_LEFT, CANVAS_H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ROAD_RIGHT, 0); ctx.lineTo(ROAD_RIGHT, CANVAS_H); ctx.stroke();

    // Lane dashes
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([28, 22]);
    for (let lane = 1; lane <= 2; lane++) {
      const lx = ROAD_LEFT + lane * LANE_W;
      ctx.lineDashOffset = -s.dashOffset;
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, CANVAS_H); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Speed lines on edges when fast
    const speedFactor = (s.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
    if (speedFactor > 0.2) {
      const alpha = speedFactor * 0.5;
      for (let i = 0; i < 6; i++) {
        const ly = ((i * 120 + s.scrollY * 1.5) % CANVAS_H);
        const len = 40 + speedFactor * 60;
        ctx.strokeStyle = `rgba(200, 245, 90, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ROAD_LEFT - 8, ly); ctx.lineTo(ROAD_LEFT - 8, ly + len); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ROAD_RIGHT + 8, ly); ctx.lineTo(ROAD_RIGHT + 8, ly + len); ctx.stroke();
      }
    }

    // Orbs
    s.orbs.forEach(orb => {
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 400 + orb.phase);
      const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, ORB_R * 2.5 * pulse);
      grd.addColorStop(0, 'rgba(166,124,255,0.9)');
      grd.addColorStop(0.4, 'rgba(166,124,255,0.4)');
      grd.addColorStop(1, 'rgba(166,124,255,0)');
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, ORB_R * 2.5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, ORB_R * pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#A67CFF';
      ctx.fill();
    });

    // Traffic cars
    s.traffic.forEach(car => {
      const cw = TRAFFIC_W;
      const ch = car.length || TRAFFIC_H;
      const rx = car.x - cw / 2;
      const ry = car.y - ch / 2;
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.roundRect(rx, ry, cw, ch, 6);
      ctx.fill();
      // windshield
      ctx.fillStyle = 'rgba(180,220,255,0.2)';
      ctx.fillRect(rx + 4, ry + 8, cw - 8, 12);
      ctx.fillRect(rx + 4, ry + ch - 20, cw - 8, 12);
    });

    // Player car glow trail
    for (let t = 1; t <= 5; t++) {
      const alpha = (1 - t / 5) * 0.25;
      const trailY = s.player.y + t * 12;
      ctx.beginPath();
      ctx.ellipse(s.player.x, trailY, PLAYER_W / 2 - 2, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,245,90,${alpha})`;
      ctx.fill();
    }

    // Player car
    const px = s.player.x - PLAYER_W / 2;
    const py = s.player.y - PLAYER_H / 2;
    ctx.save();
    // Slight tilt based on velocity
    ctx.translate(s.player.x, s.player.y);
    ctx.rotate(s.player.vx * 0.0012);
    ctx.translate(-s.player.x, -s.player.y);

    // Glow
    ctx.shadowColor = '#C8F55A';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#C8F55A';
    ctx.beginPath();
    ctx.roundRect(px, py, PLAYER_W, PLAYER_H, 7);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Windshield
    ctx.fillStyle = 'rgba(14,14,20,0.55)';
    ctx.fillRect(px + 5, py + 10, PLAYER_W - 10, 14);
    ctx.fillRect(px + 5, py + PLAYER_H - 22, PLAYER_W - 10, 12);
    ctx.restore();

    // Near-miss flash
    if (s.nearMissTimer > 0) {
      ctx.fillStyle = `rgba(239,68,68,${s.nearMissTimer * 0.18})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  }, []);

  const gameLoop = useCallback((timestamp) => {
    const s = stateRef.current;
    if (!s) return;

    if (s.lastTime === null) { s.lastTime = timestamp; }
    const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05);
    s.lastTime = timestamp;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Input
    const left = keysRef.current.has('ArrowLeft') || keysRef.current.has('a') || keysRef.current.has('A') || touchRef.current === 'left';
    const right = keysRef.current.has('ArrowRight') || keysRef.current.has('d') || keysRef.current.has('D') || touchRef.current === 'right';

    if (left) s.player.vx -= STEER_ACCEL * dt;
    if (right) s.player.vx += STEER_ACCEL * dt;
    s.player.vx *= Math.pow(STEER_FRICTION, dt * 60);

    // Clamp to road
    const halfW = PLAYER_W / 2;
    s.player.x += s.player.vx * dt;
    s.player.x = Math.max(ROAD_LEFT + halfW + 2, Math.min(ROAD_RIGHT - halfW - 2, s.player.x));
    if (s.player.x <= ROAD_LEFT + halfW + 2 || s.player.x >= ROAD_RIGHT - halfW - 2) {
      s.player.vx *= -0.3;
    }

    // Speed ramp
    s.speed = Math.min(MAX_SPEED, s.speed + SPEED_ACCEL * dt);
    s.scrollY += s.speed * dt;
    s.dashOffset += s.speed * dt * 0.5;
    s.distance += s.speed * dt / 100; // distance in km

    // Smoothness
    s.smoothness = Math.max(0, Math.min(1, s.smoothness - SMOOTHNESS_DECAY * dt));

    // Spawn traffic
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const laneIdx = Math.floor(Math.random() * 3);
      const lx = ROAD_LEFT + laneIdx * LANE_W + LANE_W / 2;
      s.traffic.push({
        x: lx,
        y: -TRAFFIC_H,
        speed: s.speed * (0.35 + Math.random() * 0.35),
        color: TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)],
        length: TRAFFIC_LENGTHS[Math.floor(Math.random() * TRAFFIC_LENGTHS.length)],
      });
      s.spawnTimer = 0.7 + Math.random() * 0.8 - (s.speed - BASE_SPEED) / MAX_SPEED * 0.4;
    }

    // Move traffic
    s.traffic.forEach(car => { car.y += car.speed * dt; });
    s.traffic = s.traffic.filter(car => car.y < CANVAS_H + 100);

    // Collision / near-miss detection
    s.traffic.forEach(car => {
      const dx = Math.abs(s.player.x - car.x);
      const dy = Math.abs(s.player.y - car.y);
      const carH = car.length || TRAFFIC_H;
      const hitX = dx < (PLAYER_W + TRAFFIC_W) / 2 - 4;
      const hitY = dy < (PLAYER_H + carH) / 2 - 4;

      if (hitX && hitY) {
        // Gentle bounce — no game over
        s.player.vx += (s.player.x > car.x ? 1 : -1) * 250;
        s.smoothness = Math.max(0, s.smoothness - SMOOTHNESS_NEAR_MISS * 2);
        s.nearMissTimer = 0.3;
      } else if (hitX && dy < (PLAYER_H + carH) / 2 + NEAR_MISS_DIST) {
        // Near miss — drain smoothness, gain a bit of score
        s.smoothness = Math.max(0, s.smoothness - SMOOTHNESS_NEAR_MISS * dt * 4);
        s.nearMissTimer = Math.max(0, s.nearMissTimer - dt);
      } else {
        s.nearMissTimer = Math.max(0, s.nearMissTimer - dt);
        // Clean driving gains smoothness
        s.smoothness = Math.min(1, s.smoothness + SMOOTHNESS_GAIN * dt);
      }
    });
    if (s.traffic.length === 0) s.smoothness = Math.min(1, s.smoothness + SMOOTHNESS_GAIN * dt);

    // Spawn orbs
    s.orbTimer -= dt;
    if (s.orbTimer <= 0) {
      s.orbs.push({
        x: ROAD_LEFT + 20 + Math.random() * (ROAD_W - 40),
        y: -20,
        phase: Math.random() * Math.PI * 2,
      });
      s.orbTimer = 1.8 + Math.random() * 1.2;
    }

    // Move orbs
    s.orbs.forEach(orb => { orb.y += s.speed * 0.55 * dt; });

    // Orb collection
    const collected = [];
    s.orbs.forEach(orb => {
      const dx = s.player.x - orb.x;
      const dy = s.player.y - orb.y;
      if (Math.sqrt(dx * dx + dy * dy) < PLAYER_W / 2 + ORB_R + 4) {
        s.orbCount++;
        s.score += Math.round(50 * (1 + s.smoothness));
        s.smoothness = Math.min(1, s.smoothness + 0.12);
      } else {
        collected.push(orb);
      }
    });
    s.orbs = collected.filter(orb => orb.y < CANVAS_H + 30);

    // Score from distance + orbs
    s.score = Math.round(s.distance * 10 + s.orbCount * 50 * (1 + s.smoothness));

    draw(ctx, s);

    // Update React state at lower rate
    if (Math.floor(s.distance * 10) % 3 === 0) {
      setStats({
        distance: s.distance,
        orbs: s.orbCount,
        smoothness: s.smoothness,
        score: s.score,
      });
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const start = useCallback(() => {
    stateRef.current = initState();
    setPhase('playing');
    setStats({ distance: 0, orbs: 0, smoothness: 1, score: 0 });
  }, []);

  const end = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    if (!s) return;
    const finalStats = {
      distance: s.distance,
      orbs: s.orbCount,
      smoothness: s.smoothness,
      score: s.score,
    };
    setStats(finalStats);
    const best = loadDailyBest();
    if (Math.floor(s.distance) > best) {
      saveDailyBest(s.distance);
      setDailyBest(Math.floor(s.distance));
    }
    setPhase('ended');
  }, []);

  // Start RAF when playing
  useEffect(() => {
    if (phase !== 'playing') return;
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, gameLoop]);

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
      if ((e.key === 'Escape' || e.key === 'x' || e.key === 'X') && phase === 'playing') end();
    };
    const up = (e) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [phase, end]);

  function smoothnessRating(s) {
    if (s >= 0.85) return 'A+';
    if (s >= 0.7) return 'A';
    if (s >= 0.55) return 'B+';
    if (s >= 0.4) return 'B';
    if (s >= 0.25) return 'C+';
    return 'C';
  }

  const share = useCallback(() => {
    const rating = smoothnessRating(stats.smoothness);
    const text = `Zen Drive on Crackd.live\n🛣️ ${stats.distance.toFixed(1)} km | ✨ ${stats.orbs} orbs | ${rating} smoothness\nScore: ${stats.score}\ncrackd.live`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [stats]);

  return {
    canvasRef,
    phase,
    stats,
    dailyBest,
    start,
    end,
    share,
    smoothnessRating,
    touchRef,
    CANVAS_W,
    CANVAS_H,
  };
}