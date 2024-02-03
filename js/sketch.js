// turn the three js code into p5.js
//

// sorry i just like arrow functions and snake case

// import { $, button, div, eff, render, sig, monke_slider as slider, p } from "./solid_monke/solid_monke.js"

// variables
let grid, world, posterLayer;

const max_amt = 300;
const size_max = 0.009;
const size_min = 0.04;

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
const offset_position = (x, y, z = 0, [min, max] = [-10, 10]) => [
  x + random(min, max),
  y + random(min, max),
  z + random(min, max),
];

/** will take an id and remove the object with that id from the grid */
const remove_from_grid = (id) =>
  (grid.grid = grid.grid.filter((b) => b.three.id !== id));

/** will take an id and remove the object with that id from the scene and the grid */
const dispose = () => {
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
  let r_index = Math.floor(Math.random() * imgs.length);
  let img = imgs[r_index];
  return {
    x,
    y,
    z,
    texture: img,
    size: random(size_min * width, size_max * width),
    lifetime: Math.random() * 1000,

    // this is the tick function, it will run every frame
    // see it being called in the animate function
    tick: function() {
      // reduce lifetime
      this.lifetime -= 1;
      // if (this.x > width || this.x < 0 || this.y > height || this.y < 0) {
      //   [this.x, this.y] = offset_position(this.x, this.y, 0, [
      //     0,
      //     width - width / 6,
      //   ]);
      // }

      push();
      translate(this.x, this.y, this.z);

      texture(this.texture);
      sphere(this.size);
      pop();

      // if roll of die is greater than 0.99 and the grid is not full, add a new box
      if (Math.random() > 0.99 && !grid.full()) {
        const b = box_manager(...offset_position(this.x, this.y));

        let r_index = Math.floor(Math.random() * imgs.length);
        let img = imgs[r_index];

        this.texture = img;
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
  let x = row * (height / 10);
  let y = col * (width / 10);

  return [x, y, 0];
};
let imgs;
function preload() {
  imgs = [];
  for (let i = 0; i <= 8; i++) {
    imgs.push(loadImage("./back/back-" + i + ".jpeg"));
  }
}

function setup() {
  let w = 2000;
  let h = w * 1.414;
  // let h = w;
  // h = 1700;
  createCanvas(w, h, WEBGL);
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
  background(255);
  noStroke();
  camera(width / 4, height / 2, 3000, width / 4, height / 2, 0, 0, 1, 0);

  grid.grid.forEach((b) => b.tick());
  dispose();

  let cut = get(0, 0, width, height);

  posterLayer.image(cut, 0, 0, posterLayer.width, posterLayer.height);
}
