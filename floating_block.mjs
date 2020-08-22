import {TOP, LEFT, RIGHT, BOTTOM, isHorizontal} from "./directions.mjs";

const default_css_edge_properties = {
    [TOP]: "top", 
    [LEFT]: "left", 
    [RIGHT]: "right", 
    [BOTTOM]: "bottom"
};

export default class extends HTMLElement
{
    /**
     * Create a custom floating block
     * @param top Distance from the top of the grid
     * @param left Distance from the left side of the grid
     * @param right Distance from the right side of the grid
     * @param bottom Distance from the bottom of the grid
     */
    constructor(top, left, right, bottom, 
                  target_properties=default_css_edge_properties, ...args)
    {
        const self = super(...args);
        this.style.position = "absolute";
        this.targetProperties = target_properties;
        this[TOP] = top;
        this[LEFT] = left;
        this[RIGHT] = right;
        this[BOTTOM] = bottom;
        return self;
    }

    /**
     * This is a property because this enables more efficient implementations to just
     * define it at construction time.
     * @property {[ Number, Number ]} parentSize
     * @readonly
     */
    get parentSize() 
    { 
        return [ 
            this.parentElement.clientWidth, 
            this.parentElement.clientHeight
        ];
    }

    get [TOP]() { return this._top; }
    get [LEFT]() { return this._left; }
    get [BOTTOM]() { return this._bottom; }
    get [RIGHT]() { return this._right; }
    set [TOP](value)
    {
        this._top = value;
        this.style.setProperty(this.targetProperties[TOP], value*100+"%");
    }
    set [LEFT](value)
    {
        this._left = value;
        this.style.setProperty(this.targetProperties[LEFT], value*100+"%");
    }
    set [BOTTOM](value)
    {
        this._bottom = value;
        this.style.setProperty(this.targetProperties[BOTTOM], value*100+"%");
    }
    set [RIGHT](value)
    {
        this._right = value;
        this.style.setProperty(this.targetProperties[RIGHT], value*100+"%");
    }

    /**
     * @param {Number} direction
     * @return {Number} 
     */
    getDistancePt(direction)
    {
        return this[direction] * this.parentSize[isHorizontal(direction) ? 0 : 1];
    }

    /**
     * Get the top left and bottom right corners of a grid cell
     * @returns {[[Number, Number], [Number, Number]]}
     */
    getCornersPt() {
        return [[ 
            this.getDistancePt(LEFT), 
            this.getDistancePt(TOP) 
        ], [
            this.parentSize[0] - this.getDistancePt(RIGHT),
            this.parentSize[1] - this.getDistancePt(BOTTOM),
        ]];
    }

    /**
     * @param {Number} direction 
     * @param {Number} value 
     */
    setDistancePt(direction, value)
    {
        this[direction] = value / this.parentSize[isHorizontal(direction) ? 0 : 1];
    }

    /**
     * Increase/decrease the distance in a given direction
     * @param {Number} direction 
     * @param {Number} delta
     */
    changeDistancePt(direction, delta)
    {
        this.setDistancePt( direction, this.getDistancePt(direction) + delta );
    }

    /**
     * @param {Number} direction
     * @return {Number} 
     */
    getDistancePercent(direction)
    {
        return this[direction] * 100;
    }

    /**
     * @param {Number} direction 
     * @param {Number} value 
     */
    setDistancePercent(direction, value)
    {
        this[direction] = value / 100;
    }

    getIdString()
    {
        return [this[TOP],this[LEFT],this[BOTTOM],this[RIGHT]].join(";");
    }
}