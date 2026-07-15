/**
 * Notensysteme – Single Source of Truth (Backend).
 * Werte sortiert von bester zur schlechtesten Note.
 * Muss mit GRADE_SYSTEMS in frontend/src/views/SessionResultsView.vue übereinstimmen.
 */
export const GRADE_SYSTEMS = {
  schulnoten: [1, 2, 3, 4, 5, 6],
  abitur:     [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  letter:     ['A', 'B', 'C', 'D', 'F'],
  percent:    [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
}

/**
 * Effektiver Notenbereich eines Systems, optional auf [min, max] eingeschränkt.
 * min/max sind Noten-WERTE (nicht Indizes). Ungültige/inkonsistente Angaben
 * fallen auf den vollen Bereich zurück.
 * @returns {Array|null} null wenn das System unbekannt ist
 */
export function effectiveRange(systemKey, range) {
  const grades = GRADE_SYSTEMS[systemKey]
  if (!grades) return null
  if (!range || range.min == null || range.max == null) return grades
  const minIdx = grades.indexOf(range.min)
  const maxIdx = grades.indexOf(range.max)
  if (minIdx < 0 || maxIdx < 0 || minIdx > maxIdx) return grades
  return grades.slice(minIdx, maxIdx + 1)
}

/** Ist `grade` eine gültige Note des Systems? */
export function isValidGrade(systemKey, grade) {
  const grades = GRADE_SYSTEMS[systemKey]
  return Array.isArray(grades) && grades.includes(grade)
}
