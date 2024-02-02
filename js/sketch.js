// turn the three js code into p5.js
//

// sorry i just like arrow functions and snake case

// import { $, button, div, eff, render, sig, monke_slider as slider, p } from "./solid_monke/solid_monke.js"

// variables
let grid, world, posterLayer;

const width = window.innerWidth;
const height = window.innerHeight;
const max_amt = 300;
const size_max = 20;
const size_min = 40;

// ----------------
// helpers or utils
// ----------------

/** will take a number and return an array of that length filled with 0s
 * @returns {array} The array of 0s. */
const list = (num) => new Array(num).fill(0);

/** will take a min and max and return a random number between them
 * @returns {number} The random number between min and max. */
const random = (min, max) => Math.random() * (max - min) + min;

/** will take a position and return a new position with a random offset, default is -400 and 400
 * @returns {array} The new position with the offset. */
const offset_position = (x, y, z = 0, [min, max] = [-400, 400]) => [
  x + random(min, max),
  y + random(min, max),
  z + random(min, max),
];

/** will take an id and remove the object with that id from the grid */
const remove_from_grid = (id) =>
  (grid.grid = grid.grid.filter((b) => b.three.id !== id));

/** will take an id and remove the object with that id from the scene and the grid */
const dispose = () => {
  // grid.grid.forEach((b) => {
  //   if (b.lifetime <= 0) {
  //     world.remove(b.instance);
  //   }
  // });
  grid.grid = grid.grid.filter((b) => b.lifetime > 0);
};

// ----------------
// Constructors of various things
// ----------------
//
//

/** will take a number and return a grid of that size, fills it with box_manager objects, inside a flattened grid
 * @returns {object} The grid object. */
const make_grid = (rows, cols) => {
  let grid = {};
  grid.grid = list(rows)
    .map((_, r) =>
      list(cols).map((_, c) => box_manager(...make_grid_position(r, c))),
    )
    .flat();
  grid.full = () => grid.grid.length >= max_amt;
  return grid;
};

/**
 * This is where we can add interesting things, right now it just has a lifetime
 * - We can make it change color based on lifetime
 * - Make it animate rotation, size, etc
 * -> stuff like that
 * */
const box_manager = (x, y, z) => {
  return {
    x,
    y,
    z,
    // instance: make_box_at(x, y, z),
    size: random(size_min, size_max),
    lifetime: Math.random() * 1000,

    // this is the tick function, it will run every frame
    // see it being called in the animate function
    tick: function () {
      // reduce lifetime
      this.lifetime -= 1;

      push();
      translate(this.x, this.y, this.z);
      sphere(this.size);
      pop();

      // if roll of die is greater than 0.99 and the grid is not full, add a new box
      if (Math.random() > 0.99 && !grid.full()) {
        const b = box_manager(...offset_position(this.x, this.y));

        // need to add to the scene and the grid array
        grid.grid.push(b);
      }
    },
  };
};

/** will take a row and col and return a position for that box by multiplying by 200
 * @returns {array} The position of the box.
 **/
const make_grid_position = (row, col) => {
  let x = row * 200;
  let y = col * 200;

  return [x, y, 0];
};

/** will take a position and return a box at that position
 * @returns {object} The box object. */
const make_box_at = (x, y, z) => {
  let s = random(size_min, size_max);

  // let sphere = new Sphere({
  //   x,
  //   y,
  //   z,
  //   scaleX: s,
  //   scaleY: s,
  //   scaleZ: s,
  //   red: 200,
  //   green: 200,
  //   blue: 200,
  // });
  //
  // world.add(sphere);
  //
  // return sphere;
};

function setup() {
  let w = 900;
  let h = w * 1.4145;
  createCanvas(w, h, WEBGL);
  pixelDensity(1);

  grid = make_grid(10, 10);
  posterLayer = createGraphics(
    width,
    height,
    P2D,
    document.getElementById("canvas"),
  );
  // print(txts.length)
}

function draw() {
  // background(0, 255, 0);
  noStroke();

  let dirX = (mouseX / width - 0.5) * 2;
  let dirY = (mouseY / height - 0.5) * 2;
  directionalLight(250, 250, 250, -dirX, -dirY, -1);

  emissiveMaterial(200, 200, 200);

  grid.grid.forEach((b) => b.tick());
  dispose();

  posterLayer.image(
    get(0, 0, width, height),
    0,
    0,
    posterLayer.width,
    posterLayer.height,
  );
}
