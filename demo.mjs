import Grid from "./grid.mjs";
import Cell from "./floating_block.mjs";
import Edge from "./edge.mjs";
import { TOP, LEFT, BOTTOM, RIGHT } from "./directions.mjs"

customElements.define("editor-grid", Grid);
customElements.define("grid-cell", Cell);

var grid = new Grid();
document.body.appendChild(grid);
var main = new Cell(0,0,0,0);
grid.appendChild(main);
var actions = Edge.split(main, RIGHT, 0.3);
var properties = Edge.split(actions, BOTTOM, 0.5);
var log = Edge.split(main, BOTTOM, 0.3);
var tree = Edge.split(main, LEFT, 0.3);