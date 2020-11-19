const fs = require("fs");
const assert = require("assert");

const { parseCsv } = require("../validator.js");

(function testCorrectInput() {
  let rows = parseCsv(fs.readFileSync("./test-valid.csv"));
  assert.deepStrictEqual(rows, [{
    latitude: -40.0,
    longitude: 100.0,
    address: "Blok A, Street B",
  }, {
    latitude: 0.5,
    longitude: 270.0,
    address: "189 Block, District K.",
  }]);
}());

(function testOutOfRange() {
  assert.throws(
    () => {
      let rows = parseCsv(fs.readFileSync("./test-invalid-out-of-range.csv"));
    }
  );
}());

(function testLineMismatch() {
  assert.throws(
    () => {
      let rows = parseCsv(fs.readFileSync("./test-invalid-line-mismatch.csv"));
    }
  );
}());

(function testMissingColumn() {
  assert.throws(
    () => {
      let rows = parseCsv(fs.readFileSync("./test-invalid-missing-column.csv"));
    }
  );
}());
