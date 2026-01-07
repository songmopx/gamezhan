
export const generateNumericResult = (min: number, max: number, ms: number): number => {
  const entropy = (ms * 1337 + Math.floor(performance.now() * 100)) % 1000000;
  const range = max - min + 1;
  return min + (entropy % range);
};

export const generateOptionResult = (options: string[], ms: number): string => {
  if (options.length === 0) return "";
  const entropy = (ms * 997 + Math.floor(performance.now() * 150)) % 1000000;
  return options[entropy % options.length];
};

export const generateDivinationSeed = (ms: number) => {
  // Use performance.now and ms for high variance
  const t = performance.now();
  
  // Seed 1: Lower Trigram (3 bits)
  const seed1 = (Math.floor(ms * 1.5 + t) % 8).toString(2).padStart(3, '0');
  
  // Seed 2: Upper Trigram (3 bits)
  const seed2 = (Math.floor(ms * 2.7 + t * 0.5) % 8).toString(2).padStart(3, '0');
  
  // Seed 3: Target Line (1-6)
  const seed3 = (Math.floor(ms * 3.1 + t * 1.1) % 6) + 1;

  return { seed1, seed2, seed3 };
};
