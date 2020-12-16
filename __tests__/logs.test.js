const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');
const Log = require('../lib/models/Log');

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

  it.only('finds a log by id via GET', async() => {
    const log = await Log.insert({
      dateOfEvent: '2020-12-15',
      notes: [
        'too much salt',
        'shorten cook time'
      ],
      rating: '3.0',
      recipeId: recipe.id  
    });

    const res = await request(app)
      .get(`/api/v1/logs/${log.id}`);

    expect(res.body).toEqual(log);
  });

  it.only('finds all logs via GET', async() => {
    const logs = await Promise.all([
      { dateOfEvent: '2020-12-03',
        notes: [
          'cook time just right'
        ],
        rating: '4.0',
        recipeId: recipe.id 
      },
      { dateOfEvent: '2020-12-15',
        notes: [
          'too much salt',
          'shorten cook time'
        ],
        rating: '3.0',
        recipeId: recipe.id  
      },
      { dateOfEvent: '2020-12-18',
        notes: [
          'increase salt',
          'lengthen cook time'
        ],
        rating: '3.5',
        recipeId: recipe.id  
      }
    ].map(log => Log.insert(log)));

    const res = await request(app)
      .get('/api/v1/logs');
    
    expect(res.body).toEqual(expect.arrayContaining(logs));
    expect(res.body).toHaveLength(logs.length);
  });

  it.only('updates a log via PUT', async() => {
    const log = await log.insert({
      dateOfEvent: '2020-12-15',
      notes: [
        'too much salt',
        'shorten cook time'
      ],
      rating: '3.0',
      recipeId: recipe.id  
    });

    const res = await request(app)
      .put(`/api/v1/logs/${log.id}`)
      .send({
        dateOfEvent: '2020-12-15',
        notes: [
          'too much salt',
          'shorten cook time'
        ],
        rating: '3.5',
        recipeId: recipe.id  
      });
    
    expect(res.body).toEqual({
      id: log.id,
      dateOfEvent: expect.any(String),
      notes: [
        'too much salt',
        'shorten cook time'
      ],
      rating: '3.5',
      recipeId: recipe.id  
    });

  });
});
