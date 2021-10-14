const properties = require('./json/properties.json');
const users = require('./json/users.json');

// Pool initialization 
const { Pool } = require('pg');

pool = new Pool({
  username: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const getUserEmailQuery = `SELECT * FROM users WHERE users.email = $1`
  return pool
    .query (getUserEmailQuery, [email])
    .then ((res) => {
      if (res.rows.length === 0) {
        console.log('null');
        return null;
      }
      console.log(res.rows[0]);
      return res.rows[0];
    })
    .catch ((err) => {
      console.log('Error: ', err.message);
    });
  // let user;
  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  // return Promise.resolve(user);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const getUserIdQuery = `SELECT name FROM users where users.id = $1`;
  return pool
    .query (getUserIdQuery, [id])
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0];
    })
    .catch ((err) => {
      console.log('Error: ', err.message);
    });
  // return Promise.resolve(users[id]);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const addUserQuery = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
  return pool
    .query (addUserQuery, [user.name, user.email, user.password])
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      console.log(res.rows[0]);
      return res.rows[0];
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const getReservationsQuery = `
    SELECT properties.*, reservations.* 
    FROM properties 
    JOIN reservations ON properties.id = property_id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2`;
  
  return pool
    .query (getReservationsQuery, [guest_id, limit])
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows;
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });
  // return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let allPropertiesQuery = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_review ON properties.id = property_id`;

  if (options.city || options.owner_id || options.minimum_price_per_night && options.maximum_price_per_night) {
    allPropertiesQuery += `WHERE `;
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    allPropertiesQuery += ` properties.city LIKE $${queryParams.length}; `
  }

  if (options.owner_id) {
    if (options.city) {
      allPropertiesQuery += `AND `;
    }
    queryParams.push(`${options.owner_id}`);
    allPropertiesQuery += `owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    if (options.city || options.owner_id) {
      allPropertiesQuery += `AND `;
    }
    let minPrice = options.minimum_price_per_night * 100;
    let maxPrice = options.maximum_price_per_night * 100;

    queryParams.push(`${minPrice}`);
    queryParams.push(`${maxPrice}`);

    allPropertiesQuery += `(properties.cost_per_night > $${queryParams.length - 1} AND properties.cost_per_night < $${queryParams.length})`;
  }

  allPropertiesQuery += `GROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    allPropertiesQuery += `HAVING avg(property_reviews_rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  allPropertiesQuery += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length}`;

  return pool
    .query (allPropertiesQuery, queryParams)
    .then ((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });











  return pool
    .query (allPropertiesQuery, [limit])
    .then ((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch ((err) => {
    console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
