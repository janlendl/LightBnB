function getMyDetails() {
  console.log("getMyDetails");
  return $.ajax({
    url: "/users/me",
  });
}

function logOut() {
  return $.ajax({
    method: "POST",
    url: "/users/logout",
  })
}

function logIn(data) {
  return $.ajax({
    method: "POST",
    url: "/users/login",
    data
  });
}

function signUp(data) {
  return $.ajax({
    method: "POST",
    url: "/users",
    data
  });
}

function getAllListings(params) {
  let url = "/api/properties";
  if (params) {
    url += "?" + params;
  }
  return $.ajax({
    url,
  });
}

function getFulfilledReservations() {
  let url = "/api/reservations";
  return $.ajax({
    url,
  });
}

function getUpcomingReservations() {
  let url = '/api/reservations/upcoming';
  return $.ajax({
    url,
  });
}

function getIndividualReservation(reservationId) {
  let url = `/api/reservations/${reservationId}`;
  return $.ajax({
    url,
  });
}

const submitProperty = function(data) {
  return $.ajax({
    method: "POST",
    url: "/api/properties",
    data,
  });
}

const submitReservation = function(data) {
  return $.ajax({
    method: "POST",
    url: "/api/reservations",
    data,
  });
}

const updateReservation = function(data) {
  return $.ajax({
    method: "POST",
    url: `/api/reservations/${data.reservation_id}`,
    data,
  });
}

const deleteReservation = function(data) {
  return $.ajax({
    method: "DELETE",
    url: `/api/reservations/${data}`
  });
}

const getReviewsByProperty = function(propertyId) {
  const url = `api/reviews/${propertyId}`;
  return $.ajax({
    url,
  });
}

const submitReview = function(data) {
  return $.ajax({
    method: "POST",
    url: `api/reviews/${data.reservationId}`,
    data,
  });
}