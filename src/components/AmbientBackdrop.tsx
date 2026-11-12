import { motion } from 'motion/react';

export function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-ivory"
    >
      {/* Subtle warm linen gradient wash */}
      <motion.div
        className="absolute -top-40 -right-32 w-[620px] h-[620px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(199,187,168,0.45) 0%, rgba(246,242,233,0) 70%)',
        }}
        animate={{
          x: [0, -24, 12, 0],
          y: [0, 18, -10, 0],
          scale: [1, 1.04, 0.98, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-[42%] -left-48 w-[560px] h-[560px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(169,156,134,0.32) 0%, rgba(246,242,233,0) 72%)',
        }}
        animate={{
          x: [0, 22, -10, 0],
          y: [0, -20, 14, 0],
          scale: [1, 0.97, 1.03, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Fine architectural orbital hairline rings */}
      <motion.div
        className="absolute top-24 right-[8%] w-[380px] h-[380px] rounded-full border border-beige/30 hidden lg:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-24 left-[6%] w-[260px] h-[260px] rounded-full border border-taupe/20 hidden lg:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
