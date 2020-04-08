import { TOP, BOTTOM, LEFT, RIGHT, DIRECTIONS, opposite, isHorizontal } from "./directions.mjs";
import Grid from "./grid.mjs"
import Cell from "./floating_block.mjs";
import { ccw } from "./directions.mjs";
import { cw } from "./directions.mjs";

export default class Edge
{
    /**
     * Specifies an element (a rect) and a side.
     * @param {Cell} cell 
     * @param {Number} direction 
     */
    constructor(cell, direction)
    {
        this.cell = cell;
        this.direction = direction;
    }

    /** @returns {Grid} */
    get grid() 
    { 
        return this.cell.parentElement; 
    }

    /** @returns {Number} */
    get position()
    {
        return this.cell[this.direction];
    }

    /** @returns {Number} */
    get length()
    {
        const one_side = this.cell[cw(this.direction)];
        const other_side = this.cell[ccw(this.direction)];
        return 1 - one_side - other_side;
    }

    /** @returns {Number} */
    get normalLength()
    {
        return 1 -  this.position - this.cell[opposite(this.direction)];
    }

    /** @returns {String} */
    toIdString()
    {
        return this.cell.getIdString()+";"+this.direction;
    }

    /**
     * Get both sides of the line which this edge is part of
     * @returns {[Array<Cell>, Array<Cell>]}
     */
    getLine() {
        const facing = opposite(this.direction);
        //const grid_size = this.grid.size[isHorizontal(this.direction) ? 0 : 1];
        //const facing_position = grid_size - this.position;
        const facing_position = 1 - this.position;
        return [
            this.grid.getAlignedCells(this.direction, this.position),
            this.grid.getAlignedCells(facing, facing_position)
        ];
    }

    /**
     * Insert a new cell on this edge
     * @param { Number } ratio
     * @returns { Cell }
     */
    split(ratio = 0.5)
    {
        var inset = [];
        DIRECTIONS.forEach(side => {
            inset[side] = this.cell[side];
        });
        const size = this.normalLength;
        this.cell[this.direction] += size * ratio;
        inset[opposite(this.direction)] += size * (1 - ratio);
        return this.grid.addCell(...inset);
    }

    /**
     * Split the specified cell by creating a new cell on the specified edge
     * @param { Cell } cell 
     * @param { Number } direction 
     * @param { Number } ratio 
     * @returns { Cell }
     */
    static split(cell, direction, ratio)
    {
        return (new Edge(cell, direction)).split(ratio);
    }
}
