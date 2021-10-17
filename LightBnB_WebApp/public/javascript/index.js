$(() => {
  getAllListings().then(function( json ) {
    propertyListings.addProperties(json.properties);
    views_manager.show('listings');

    $('body').on('click', '.reserve-button', function() {
      const idData = $(this).attr('id').substring(17);
      views_manager.show('newReservation', idData);
    });
    $('.review_details').on('click', function() {
      const idData = $(this).attr('id').substring(15);
      views_manager.show('showReviews', idData);
      console.log(idData);  
    });
  });
});