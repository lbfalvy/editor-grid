import Cell from "./floating_block.mjs"
import Edge from "./edge.mjs"
import { TOP, LEFT, BOTTOM, RIGHT, isHorizontal, opposite } from "./directions.mjs";
import { MIN_CELL_SIZE, MOVE_OVERLAY_CLASS } from "./grid_constants.mjs";
import { isPointInRect, getClosestSide, removeAllChildrenOfClass } from "./helpers.mjs";

export default class Grid extends HTMLElement {
    constructor(...args) {
        const self = super(...args);
        this.style.position = "relative";
        this.addEventListener("mousedown", onGridGrab);
        return self;
    }

    /**
     * Get all cells
     * @returns {Array<Cell>}
     */
    get cells() {
        const cells = [];
        for (let i = 0; i < this.childNodes.length; i++) {
            const child = this.childNodes[i];
            if (child instanceof Cell) cells.push(child);
        }
        return cells;
    }

    /**
     * @property {[Number, Number]}
     */
    get size()
    {
        return [ this.clientWidth, this.clientHeight ];
    }

    get clientOffset()
    {
        const rect = this.getBoundingClientRect();
        return [ rect.left, rect.top ];
    }

    /**
     * Get all cells aligned on a given line
     * @param {Number} direction
     * @param {Number} position
     * @returns {Array<Cell>}
     */
    getAlignedCells(direction, position)
    {
        return this.cells.filter(c => Math.abs(c[direction] - position) < 0.00001);
    }

    addCell(top, left, bottom, right)
    {
        const cell = new Cell(top, left, right, bottom);
        this.appendChild(cell);
        return cell;
    }
}

/**
 * Prepare for dragging when the grid is clicked
 * @param {MouseEvent} ev
 */
function onGridGrab(ev) {
    const overlays = ev.currentTarget.getElementsByClassName(MOVE_OVERLAY_CLASS);
    if (overlays.length > 0) return;
    const move_callback = createMoveCallback(ev);
    if (move_callback)
    {
        ev.stopPropagation(); // Add this to containers too.
        ev.preventDefault();
        const move_filter = createResizeOverlay(move_callback);
        ev.currentTarget.appendChild(move_filter);
    }
}

/**
 * Build a context for the grid movement
 * @param {MouseEvent} ev 
 * @returns {EventHandlerNonNull|undefined}
 */
function createMoveCallback(ev) {
    const edge = getClickedEdge(ev);
    // Find the cells neighboring the line the user clicked
    var [higher_side, lower_side] = edge.getLine();
    // If one is empty, user clicked on the edge; don't do anything
    if (higher_side.length == 0 || lower_side.length == 0) 
    {
        return undefined;
    }
    const grabbed_side = edge.direction;
    // Ensure that they are in the right order.
    if (grabbed_side == BOTTOM || grabbed_side == RIGHT)
        [higher_side, lower_side] = [lower_side, higher_side];
    // Move as much code as possible out of the callback
    const is_horizontal = isHorizontal(grabbed_side);
    const get_size = is_horizontal ? (x) => x.clientWidth 
                                   : (x) => x.clientHeight;
    const negative_movement_direction = isHorizontal(grabbed_side) ? LEFT : TOP;
    return (ev) => {
        const delta = is_horizontal ? ev.movementX : ev.movementY;
        resize_dimension(lower_side, negative_movement_direction, higher_side, 
                         get_size, MIN_CELL_SIZE, delta);
    }
}

/**
 * Get the clicked edge from a mouse click event or point
 * @param { MouseEvent } x
 * @returns { Edge }
 */
function getClickedEdge(x)
{
    const grid = x.currentTarget;
    // These calculations are in grid space
    const point = [ x.clientX - grid.clientOffset[0], 
                    x.clientY - grid.clientOffset[1] ];
    const cell = grid.cells.find(cell => {
        const cell_rect = cell.getCornersPt();
        return isPointInRect(point, cell_rect);
    });
    const side = getClosestSide(point, cell.getCornersPt());
    return new Edge(cell, side);
}

function createResizeOverlay(move_callback) {
    const move_filter = document.createElement("div");
    move_filter.style.position = "absolute";
    move_filter.style.top = "0px";
    move_filter.style.left = "0px";
    move_filter.style.right = "0px";
    move_filter.style.bottom = "0px";
    move_filter.classList.add(MOVE_OVERLAY_CLASS);
    move_filter.addEventListener("mousemove", move_callback);
    move_filter.addEventListener("mouseup", onGridRelease);
    return move_filter;
}

function onGridRelease(ev) {
    removeAllChildrenOfClass(ev.currentTarget.parentElement, MOVE_OVERLAY_CLASS);
}

/**
 * Function with an unreasonable amount of arguments for doing the resizing in one dimension.
 * @param {Array<Cell>} negative_side Elements towards negative delta
 * @param {Number} lower_direction property name for distance from lower end
 * @param {Array<Cell>} positive_side Elements towards positive delta
 * @param {(x:Cell) => Number} get_current_size Function to get current size of an element
 * @param {Number} min_size The minimum size of any element
 * @param {Number} delta Resize amount
 */
function resize_dimension(negative_side, lower_direction, positive_side,
    get_current_size, min_size, delta) 
{
    const higher_direction = opposite(lower_direction);
    const squashed_side = delta < 0 ? negative_side : positive_side;
    const squashable_size = Math.abs(delta) + min_size;
    if (squashed_side.every(elem => get_current_size(elem) > squashable_size)) 
    {
        for (let cell of positive_side)
            cell.changeDistancePt(lower_direction, delta);
        for (let cell of negative_side)
            cell.changeDistancePt(higher_direction, -delta);
    }
}