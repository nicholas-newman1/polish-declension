export default function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function balancedShuffle<T>(
  array: T[],
  getType: (item: T) => string,
  maxConsecutive = 2
): T[] {
  const shuffled = [...array];

  const reshuffle = () => {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  };

  reshuffle();

  for (let attempts = 0; attempts < 10; attempts++) {
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < shuffled.length; i++) {
      if (getType(shuffled[i]) === getType(shuffled[i - 1])) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    if (maxStreak <= maxConsecutive) {
      return shuffled;
    }

    reshuffle();
  }

  return shuffled;
}
