/**
 * Benotung aus Drag & Drop Gruppen-Input.
 *
 * „Von oben beginnen" (CLAUDE.md): Solange genug Notenstufen vorhanden sind,
 * erhält jede Gruppe der Reihe nach eine Note ab der besten; überzählige
 * (schlechtere) Noten bleiben unbesetzt. Nur wenn es mehr Gruppen als
 * Notenstufen gibt, wird linear komprimiert.
 *
 * Muss identisch zu computeGrades in
 * frontend/src/views/SessionResultsView.vue bleiben.
 *
 * @param {Array<{label: string, projectIds: string[]}>} groups - sortiert von bester zur schlechtesten Gruppe
 * @param {Array} gradeRange - Notenwerte sortiert von bester zur schlechtesten Note, z.B. [1,2,3,4,5,6]
 * @returns {Array<{projectId: string, computedGrade: *}>}
 */
export function gradeFromGroups(groups, gradeRange) {
  const n = groups.length
  const len = gradeRange.length
  const result = []
  for (let i = 0; i < n; i++) {
    const gradeIndex = n <= len ? i : Math.round((i / (n - 1)) * (len - 1))
    const grade = gradeRange[gradeIndex]
    for (const projectId of groups[i].projectIds) {
      result.push({ projectId, computedGrade: grade })
    }
  }
  return result
}

/**
 * Benotung aus Paarvergleich Score-Input.
 * Getrennte Funktion – Eingabestruktur grundlegend verschieden von gradeFromGroups.
 *
 * @param {Array<{projectId: string, score: number}>} ranking - sortiert nach Punkten absteigend
 * @param {Array} gradeSystem - Notenwerte sortiert von bester zur schlechtesten Note
 * @returns {Array<{projectId: string, computedGrade: *}>}
 */
export function gradeFromScores(ranking, gradeSystem) {
  const n = ranking.length
  const result = []
  for (let i = 0; i < n; i++) {
    const gradeIndex = Math.round((i / (n - 1 || 1)) * (gradeSystem.length - 1))
    result.push({ projectId: ranking[i].projectId, computedGrade: gradeSystem[gradeIndex] })
  }
  return result
}
