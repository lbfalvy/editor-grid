import { TOP, LEFT, BOTTOM, RIGHT } from "./directions.mjs"

/**
 * Remove all children of a specific class
 * @param {HTMLElement} element 
 * @param {String} class_name 
 */
function removeAllChildrenOfClass(element, class_name)
{
    const children = element.getElementsByClassName(class_name);
    for (let i = 0; i < children.length; i++)
        element.removeChild(children.item(i));
}

/**
 * Checks whether a point is within a rectangle
 * @param {[Number, Number]} point 
 * @param {[[Number, Number], [Number, Number]]} rect 
 * @returns {Bool}
 */
function isPointInRect(point, rect)
{
    return (rect[0][0] < point[0] && point[0] < rect[1][0] &&
            rect[0][1] < point[1] && point[1] < rect[1][1]);
}

/**
 * Get the side of the rect closest to an inner point
 * @param { [ Number, Number ] | { x:Number, y:Number } } point inside rect
 * @param { [ [ Number, Number ], [ Number, Number ] ] | \
 * { left:Number, right:Number, top:Number, bottom:Number } } rect 
 * @returns { Number }
 */
function getClosestSide(point, rect)
{
    const point_x = point.x || point[0];
    const point_y = point.y || point[1];
    const rect_left = rect.left || rect[0][0];
    const rect_top = rect.top || rect[0][1];
    const rect_right = rect.right || rect[1][0];
    const rect_bottom = rect.bottom || rect[1][1];
    const l_dist = point_x - rect_left;
    const r_dist = rect_right - point_x;
    const [h_closest, h_min] = l_dist < r_dist ? 
                               [LEFT, l_dist] : 
                               [RIGHT, r_dist];
    const t_dist = point_y - rect_top;
    const b_dist = rect_bottom - point_y;
    const [v_closest, v_min] = t_dist < b_dist ?
                               [TOP, t_dist] :
                               [BOTTOM, b_dist];
    return h_min < v_min ? h_closest : v_closest;
}

/**
 * Separates the value from the unit
 * @param {String} text 
 * @returns {{number:Number, unit:String}}
 */
function splitValueUnit(text)
{
    const codeOf0 = "0".charCodeAt(0);
    const codeOf9 = "9".charCodeAt(0);
    var i = text.length-1;
    while ( codeOf0 <= text.charCodeAt(i) && text.charCodeAt(i) <= codeOf9 ) i--;
    const number = Number(text.slice(0, i+1));
    const unit = text.slice(i+1);
    return { number, unit };
}

export { 
    isPointInRect, getClosestSide, // Rectangle operations
    splitValueUnit, // String manipulation
    removeAllChildrenOfClass, // Page manipulation
};