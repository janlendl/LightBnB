$(() => {

  const $propertyListings = $(`
  <section class="property-listings" id="property-listings">
      <p>Loading...</p>
    </section>
  `);
  window.$propertyListings = $propertyListings;

  window.propertyListings = {};

  function addListing(listing) {
    $propertyListings.append(listing);
  }
  function clearListings() {
    $propertyListings.empty();
  }
  window.propertyListings.clearListings = clearListings;

  function addProperties(properties, isReservation = false) {
    if (!isReservation) {
      clearListings();
    }
    // check for user login
    getMyDetails()
    .then(() => {
      for (const propertyId in properties) {
        const property = properties[propertyId];
        const listing = propertyListing.createListing(property, isReservation);
        addListing(listing);
      }
      if (isReservation) {
        $('.update-button').on('click', function() {
          const idData = $(this).attr('id').substring(16);
          getIndividualReservation(idData)
            .then ((data) => {
              views_manager.show('updateReservation', data);
            });
          console.log(`update ${idData}`);          
        })

        $('.delete-button').on('click', function() {
          const idData = $(this).attr('id').substring(19);
          deleteReservation(idData)
          console.log(`delete ${idData}`); 
          $(this).closest('article').remove();   
        })

        $('.add-review-button').on('click', function() {
          const idData = $(this).attr('id').substring(11);
          views_manager.show("newReview", idData);
        })
      } else {
        $('.reserve-button').on('click', function() {
          const idData = $(this).attr('id').substring(17);
          views_manager.show('newReservation', idData);
        })
        $('.review_details').on('click', function() {
          const idData = $(this).attr('id').substring(15);
          views_manager.show('showReviews', idData);
        })
      } 
    })
    .catch((err) => {
      console.log('Error: ', err);
      return err.message;
    });
  }
  window.propertyListings.addProperties = addProperties;

});