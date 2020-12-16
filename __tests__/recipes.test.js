const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');
const Log = require('../lib/models/Log');

describe('recipe-lab routes', () => {
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

  it('creates a recipe', async() => {
    const res = await request(app)
      .post('/api/v1/recipes')
      .send({
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
    expect(res.body).toEqual({
      id: expect.any(String),
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

  it('finds a recipe by id via GET with associated log', async() => {

    await Promise.all([
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
      },
    ].map(log => Log.insert(log)));

    const res = await request(app)
      .get(`/api/v1/recipes/${recipe.id}`);

    expect(res.body).toEqual({
      ...recipe,
      logs: expect.any(Array)
    });
  });

  it('gets all recipes', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [], ingredients: [] },
      { name: 'cake', directions: [], ingredients: [] },
      { name: 'pie', directions: [], ingredients: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toContainEqual(recipe);
        });
      });
  });

  it('updates a recipe by id', async() => {
    const recipe = await Recipe.insert({
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

    return request(app)
      .put(`/api/v1/recipes/${recipe.id}`)
      .send({
        name: 'good cookies',
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
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'good cookies',
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
  });

  it('removes a recipe via DELETE', async() => {
    const recipe = await Recipe.insert({
      name: 'good cookies',
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
    
    const response = await request(app)
      .delete(`/api/v1/recipes/${recipe.id}`);

    expect(response.body).toEqual(recipe);
  });
});
