import { motion } from 'framer-motion';
import { getLevelInfo, getXpForNextLevel } from '../../lib/utils.js';

export default function XPBar({ xp, showLabel = true, height = 6 }) {
  const level = getLevelInfo(xp);
  const nextXp = getXpForNextLevel(xp);
  const progress = nextXp ? Math.min(((xp - level.min) / (nextXp - level.min)) * 100, 100) : 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold" style={{ color: level.color }}>
            {level.title}
          </span>
          <span className="text-xs text-muted">
            {xp.toLocaleString()} {nextXp ? `/ ${nextXp.toLocaleString()} XP` : 'XP · Max'}
          </span>
        </div>
      )}
      <div
        className="w-full bg-white/[0.06] rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #F5A623, #FFD166)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
