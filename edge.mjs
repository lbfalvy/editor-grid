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
        const facing_position = 1 - this.position;
        console.log(this.grid);
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

    findAlignedAcross() {
        const neighbors = this.getLine();
        // If there are no aligned cells in this direction, 
        // it is a sole edge.
        if (neighbors[0].length == 1) return neighbors[1];
        // Failing that, make sure there are aligned cells
        // on both sides
        const clock = cw(this.direction);
        const counterclock = ccw(this.direction);
        const alignedCWEdge = neighbors[1].find(n => n[clock] == this.cell[clock])
        const alignedCCWEdge = neighbors[1].find(n => n[counterclock] == this.cell[counterclock])
        if(alignedCWEdge && alignedCCWEdge) {
            // Then return that range
            return neighbors[1].filter(n => {
                if (n[clock] < this.cell[clock])
                    return false;
                if (n[counterclock] < this.cell[counterclock])
                    return false;
                return true;
            })
        }
        return [];
    }

    static getAligned(cell)
    {
        for (const side of DIRECTIONS) {
            const edge = new Edge(cell, side);
            const aligned = edge.findAlignedAcross();
            if (aligned.length) 
                return [side, aligned];
        }
    }

    static deleteCell(cell)
    {
        const aligned = this.getAligned(cell);
        if (aligned) {
            const side = aligned[0];
            const neighbors = aligned[1];
            const width = 1 - cell[side] - cell[opposite(side)];
            for (const neighbor of neighbors) {
                neighbor[opposite(side)] -= width;
            }
            cell.remove();
        }
        else throw new RangeError("The grid layout makes filling the gap impossible");
    }
}
