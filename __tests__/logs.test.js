const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');

describe('logs routes', () => {
  let recipe;
  beforeEach(async() => {
    await pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
    recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
      ingredients: [
        {
          name: 'flour', 
          measurement: 'cup', 
          amount: 1
        }
      ]
    });
  });

  it.only('creates a new log via POST', async() => {
    const res = await request(app)
      .post('/api/v1/logs')
      .send(
        {
          dateOfEvent: '2020-12-15',
          notes: [
            'too much salt',
            'shorten cook time'
          ],
          rating: '3.0',
          recipeId: recipe.id  
        });

    expect(res.body).toEqual({
      id: '1',
      dateOfEvent: expect.any(String),
      notes: [
        'too much salt',
        'shorten cook time'
      ],
      rating: '3.0',
      recipeId: recipe.id  
    });
  });

});
