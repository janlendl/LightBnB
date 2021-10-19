$(() => {
  window.propertyListing = {};
  
  function createListing(property, isReservation) {
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          <ul class="property-listing__details">
            <li>number_of_bedrooms: ${property.number_of_bedrooms}</li>
            <li>number_of_bathrooms: ${property.number_of_bathrooms}</li>
            <li>parking_spaces: ${property.parking_spaces}</li>
          </ul>
          ${isReservation ? 
            `<p>${moment(property.start_date).utc().format('ll')} - ${moment(property.end_date).utc().format('ll')}</p>` 
            : `<button id='reserve-property-${property.id}' class='reserve-button'>Reserve</button>`}
          <footer class="property-listing__footer">
            <div class="property-listing__price">$${property.cost_per_night/100.0}/night
            <div class="property-listing__rating">${Math.round(property.average_rating * 100) / 100}/5 stars</div>
          ${isReservation.upcoming ?
            `<button id='update-property-${property.id}' class='update-button'>Update</button>
            <button id='delete-reservation-${property.id}' class='delete-button'>Delete</button>
            `: ``
          }</div>
          ${(isReservation && !isReservation.upcoming) ? 
            `<button id='add-review-${property.id}' class='add-review-button'>Add a Review</button>` : ``
          }
          ${!isReservation ? `<span id="review-details-${property.id}" class="review_details">
          Browse ${property.review_count} reviews
            </span>` : ``}
          </footer>
        </section>
      </article>
    `
  }

  window.propertyListing.createListing = createListing;

});