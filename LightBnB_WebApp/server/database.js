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
        return null;
      }
      console.log(res.rows[0]);
      return res.rows[0];
    })
    .catch ((err) => {
      console.log('Error: ', err.message);
    });
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
const getFulfilledReservations = function(guest_id, limit = 10) {
  const allReservationsQuery = `
    SELECT properties.*, reservations.*, avg(property_reviews.rating) as average_rating 
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id 
    WHERE reservations.guest_id = $1
    AND reservations.start_date < now()::date
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2`;
  
  return pool
    .query (allReservationsQuery, [guest_id, limit])
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows;
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });

}
exports.getFulfilledReservations = getFulfilledReservations;

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
    JOIN property_reviews ON properties.id = property_id `;

  if (options.city || options.owner_id || options.minimum_price_per_night && options.maximum_price_per_night) {
    allPropertiesQuery += `WHERE `;
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    allPropertiesQuery += `city LIKE $${queryParams.length} `;
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

  allPropertiesQuery += `\nGROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    allPropertiesQuery += `\nHAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  allPropertiesQuery += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length}`;

  console.log(allPropertiesQuery, queryParams);

  return pool
    .query (allPropertiesQuery, queryParams)
    .then ((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const addPropertyQuery = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, 
  number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;

  return pool
    .query (addPropertyQuery, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, 
      property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code])
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      console.log(res.rows);
      return res.rows;
    })
    .catch ((err) => {
      console.log('Error: ', err.message);
    });
}
exports.addProperty = addProperty;


const addReservation = function(reservation) {
  const addReservationQuery = ` INSERT INTO reservations (start_date, end_date, property_id, guest_id)
    VALUES ($1, $2, $3, $4) RETURNING *`;

  return pool.query(addReservationQuery, [reservation.start_date, reservation.end_date, reservation.property_id, reservation.guest_id])
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0];
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });
}
exports.addReservation = addReservation;

//
// gets upcoming reservations
//
const getUpcomingReservations = function(guest_id, limit = 10) {
  const upcomingReservationsQuery = `
    SELECT properties.*, reservations.*, avg(property_reviews.rating) as average_rating 
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id 
    WHERE reservations.guest_id = $1
    AND reservations.start_date > now()::date
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2`;
  
  const queryParams = [guest_id, limit];

  return pool
    .query (upcomingReservationsQuery, queryParams)
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows;
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });

}
exports.getUpcomingReservations = getUpcomingReservations;

//
// updates an existing reservation with new information
//
const updateReservation = function(reservationData) {
  let updateReservationQuery = `UPDATE reservations SET `;
  const queryParams = [];

  if (reservationData.start_date) {
    queryParams.push(reservationData.start_date);
    updateReservationQuery += `start_date = $1`;
    if (reservationData.end_date) {
      queryParams.push(reservationData.end_date);
      updateReservationQuery += `, end_date = $2`;
    }
  } else {
    queryParams.push(reservationData.end_date);
    updateReservationQuery += `end_date = $1`;
  }
  updateReservationQuery += ` WHERE id = $${queryParams.length + 1} RETURNING *;`
  queryParams.push(reservationData.reservation_id);  
    
  return pool
    .query (updateReservationQuery, queryParams)
    .then ((res) => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0];
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });
}
exports.updateReservation = updateReservation;

//
// deletes an existing reservation
//
const deleteReservation = function(reservationId) {
  const queryParams = [reservationId];
  const deleteReservationQuery = `DELETE FROM reservations WhERE id = $1`;

  return pool
    .query (deleteReservationQuery, queryParams)
    .then (() => {
      console.log("Successfully deleted reservation!");  
    })
    .catch ((err) => {
      console.log('Error: ', err);
    });
}
exports.deleteReservation = deleteReservation;

const getIndividualReservation = function(reservationId) {
  const individualReservationQuery = `SELECT * FROM reservations WHERE reservations.id = $1`;

  return pool
    .query (individualReservationQuery, [reservationId])
    .then ((res) => {
      // if (res.rows.length === 0) {
      //   return null;
      // }
      console.log('getIndividual', res.rows[0]);
      console.log('LENGTH::: ', res.rows.length);
      return res.rows[0];
    })
    .catch((err) => {
      console.log('Error: ', err.message);
    });
}
exports.getIndividualReservation = getIndividualReservation;