/**
 * Transform an input string by replacing expressions that start with a given marker,
 * by that expression wrapped within a given prefix and suffix.
 * For example "transformString('Hello _world', '_', '[', ']') returns "Hello [world]".
 */
export function transformString(input: string, marker: string, prefix: string, suffix: string): string {
  let temp = input;

  // Each step of the loop replaces one occurrence of the marker
  while (true) {
    const start = temp.lastIndexOf(marker); // Start position of the marker
    if (start < 0) break;
    const ends = [' ', '.', ',']
      .map(pattern => temp.indexOf(pattern, start))
      .filter(position => position >= start);
    const end = ends.length <= 0 ? temp.length : Math.min(...ends); // End position of the expression

    let next: string;
    if (end === start + marker.length) {
      // Discard empty blocs
      next = temp.substring(0, start) + temp.substring(end, temp.length);
    }
    else {
      next = temp.substring(0, start) + prefix + temp.substring(start + marker.length, end) + suffix + temp.substring(end, temp.length);
    }

    temp = next;
  }

  return temp;
}
