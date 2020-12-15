const pool = require('../utils/pool');

module.exports = class Log {
  recipeId;
  dateOfEvent;
  notes;
  rating;

  constructor(row) {
    this.recipeId = row.recipe_id;
    this.dateOfEvent = row.date_of_event;
    this.notes = row.notes;
    this.rating = row.rating;
  }

  static async insert(log) {
    const { rows } = await pool.query(
      'INSERT into log (recipe_id, date_of_event, notes, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [log.recipeId, log.directions, log.dateOfEvent, log.notes, log.rating]
    );

    return new Log(rows[0]);
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM logs WHERE id=$1',
      [id]
    );

    if(!rows[0]) return null;
    else return new Log(rows[0]);
  }
};
