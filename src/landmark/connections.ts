/**
 * Standard MediaPipe Hand Skeleton Bone Connectors (21 Landmarks)
 * Pairs of landmark indices [start, end]
 */
export const HAND_CONNECTIONS: [number, number][] = [
  // Palm Base Connectors
  [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],     // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm Closure
];
