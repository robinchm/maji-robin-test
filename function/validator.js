const parse = require('csv-parse/lib/sync')

/**
 * Parse the input string to csv rows.
 *
 * @param {string} s - input string.
 * @return {Object[]} - an array of object each representing one row.
 * @throws {Error} - when csv is invalid.
 */
function parseCsv(s) {
  const rows = parse(s, {
    columns: true,
  });
  for (const row of rows) {
    // validate latitude
    if (!row.latitude) {
      throw "Latitude does not exist.";
    }
    row.latitude = +row.latitude;
    if (row.latitude < -90 || row.latitude > 90) {
      throw "Latitude out of range.";
    }
    // validate longitude
    if (!row.longitude) {
      throw "Longitude does not exist.";
    }
    row.longitude = +row.longitude;
    if (row.longitude < 0 || row.longitude >= 360) {
      throw "Longitude out of range.";
    }
  }
  return rows;
}

exports.parseCsv = parseCsv;
