module.exports = function(router, database) {

  router.get('/properties', (req, res) => {
    database.getAllProperties(req.query, 20)
    .then(properties => res.send({properties}))
    .catch(e => {
      console.error(e);
      res.send(e)
    }); 
  });

  router.get('/reservations', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.error("💩");
      return;
    }
    database.getFulfilledReservations(userId)
    .then(reservations => res.send({reservations}))
    .catch(e => {
      console.error(e);
      res.send(e)
    });
  });
  
  router.get('/reservations/upcoming', (req, res) => {
    const userId = req.session.userId;
    if(!userId) {
      res.error('Error on user ID');
      return;
    }
    database.getUpcomingReservations(userId)
      .then ((reservations) => {
        res.send({ reservations });
      })
      .catch ((err) => {
        console.log('Error: ', err);
        res.send(err);
      });
  });
  
  router.post('/properties', (req, res) => {
    const userId = req.session.userId;
    database.addProperty({...req.body, owner_id: userId})
      .then(property => {
        res.send(property);
      })
      .catch(e => {
        console.error(e);
        res.send(e)
      });
  });

  router.post('/reservations', (req, res) => {
    const userId = req.session.userId;
    if (userId) {
      database.addReservation({...req.body, guest_id: userId})
        .then((reservation) => {
          res.send(reservation);
        })
        .catch((err) => {
          console.log('Error: ', err.message);
          res.send(err);
        });
    }
  });

  router.get('/reservations/:reservation_id', (req, res) => {
    const reservationId = req.params.reservation_id;
    database.getIndividualReservation(reservationId)
      .then((reservation) => {
        res.send(reservation);
      })
      .catch((err) => {
        console.log('Error: ', err);
        res.send(err);
      });
  });

  router.post('/reservations/:reservation_id', (req, res) => {
    database.updateReservation(req.body)
      .then((reservation) => {
        res.send(reservation);
      })
      .catch((err) => {
        console.log('Error: ', err);
        res.send(err);
      });
  });

  router.delete(`/reservations/:reservation_id`, (req, res) => {
    const reservationId = req.params.reservation_id;
    database.deleteReservation(reservationId);
  });

  router.get('/reviews/:propertyId', (req, res) => {
    const propertyId = req.params.propertyId
    database.getReviewsByProperty(propertyId)
    .then(reviews => {
      res.send(reviews);
    })
    .catch((err) => {
      console.log('Error: ', err);
      res.send(err);
    });
  });

  router.post('/reviews/:reservationId', (req, res) => {
    const reservationId = req.params.reservationId;
    database.addReview({...req.body})
    .then(review => {
      res.send(review);
    })
    .catch((err) => {
      console.log('Error: ', err);
      res.send(err);
    });
  });

  return router; 
}

