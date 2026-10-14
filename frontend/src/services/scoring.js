// ClearBuild (SAQ QURYLYS) — Scoring Service
// Codemasters Hackathon 8.0 (Ust-Kamenogorsk)

export const WEIGHTS = {
  R1: 35, // Отсутствие правового основания (UNVERIFIED = 0 б., КЖК = 0 б.)
  R2: 25, // Прямое предложение внести деньги до ДДУ
  R3: 10, // Реклама строящегося жилья до ввода
  R4: 15, // Коллективное обращение граждан
  R5: 10, // Расхождение готовности >= 20 п.п.
  R6: 5   // Простой или значимая просрочка
};

export const FACTOR_NAMES = {
  R1: 'Отсутствие правового основания',
  R2: 'Прямое предложение внести деньги до ДДУ',
  R3: 'Реклама строящегося жилья до ввода',
  R4: 'Коллективное обращение граждан',
  R5: 'Расхождение заявленной и фактической готовности ≥20 п.п.',
  R6: 'Подтверждённый простой или просрочка строительства'
};

/**
 * Детерминированный расчёт балла риска и цветовой зоны.
 * @param {string[]} confirmedFactors - список подтверждённых кодов факторов
 * @param {string[]} hypotheticalFactors - список кодов гипотез ИИ (не подтверждённых человеком)
 * @returns {object} { score, potentialScore, zone, zoneLabel, zoneReason, hasR1, hasR2, confirmedFactors, hypotheticalFactors }
 */
export function calculateRisk(confirmedFactors = [], hypotheticalFactors = []) {
  const confirmed = Array.isArray(confirmedFactors) ? [...new Set(confirmedFactors)] : [];
  const hypothetical = Array.isArray(hypotheticalFactors)
    ? [...new Set(hypotheticalFactors)].filter(code => !confirmed.includes(code))
    : [];

  let confirmedScore = 0;
  for (const factor of confirmed) {
    confirmedScore += (WEIGHTS[factor] || 0);
  }
  confirmedScore = Math.min(100, confirmedScore);

  let potentialScore = confirmedScore;
  for (const factor of hypothetical) {
    potentialScore += (WEIGHTS[factor] || 0);
  }
  potentialScore = Math.min(100, potentialScore);

  const hasR1 = confirmed.includes('R1');
  const hasR2 = confirmed.includes('R2');

  let zone = 'GREEN';
  let zoneLabel = 'Зелёная';
  let zoneReason = 'Балл 0–24: существенных подтверждённых рисков не выявлено.';

  if (confirmedScore >= 60 && hasR1 && hasR2) {
    zone = 'RED';
    zoneLabel = 'Красная';
    zoneReason = `Балл ${confirmedScore} (≥60) и одновременно подтверждены R1 (нет основания) + R2 (сбор денег).`;
  } else if (confirmedScore >= 25) {
    zone = 'YELLOW';
    zoneLabel = 'Жёлтая';
    if (confirmedScore >= 60) {
      zoneReason = `Балл ${confirmedScore} (≥60), но отсутствует одновременная комбинация подтверждённых R1+R2 — Жёлтая зона.`;
    } else {
      zoneReason = `Балл ${confirmedScore} в диапазоне 25–59 баллов.`;
    }
  }

  return {
    score: confirmedScore,
    potentialScore,
    zone,
    zoneLabel,
    zoneReason,
    hasR1,
    hasR2,
    confirmedFactors: confirmed,
    hypotheticalFactors: hypothetical
  };
}
