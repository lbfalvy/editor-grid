export const TOP = 0;
export const LEFT = 1;
export const BOTTOM = 2;
export const RIGHT = 3;
export const DIRECTIONS = [TOP, LEFT, BOTTOM, RIGHT];

/** Get the opposite to a given direction
 * @param {Number} direction
 * @returns {Number} */
export const opposite = direction => (direction + 2) % 4;

/** Rotate counterclockwise
 * @param {Number} direction 
 * @returns {Number} */
export const ccw = direction => (direction + 1) % 4;

/** Rotate clockwise
 * @param {Number} direction
 * @returns {Number} */
export const cw = direction => (direction + 3) % 4;

/** Is the direction horizontal?
 * @param {Number} direction 
 * @returns {Boolean} */
export const isHorizontal = direction => direction % 2 == 1;
