// create angular controller and pass in $scope and $http
  function formController($scope, $http) {
    // create a blank object to hold our form information
    // $scope will allow this to pass between controller and view
    $scope.formData = {};
    // process the form
    $scope.processForm = function() {
      $http({
      method  : 'POST',
      url     : url_base + "/rest/getSaldoCaptcha/" + $scope.formData.cardID + "/" + $scope.formData.captcha,
      // data    : $.param($scope.formData),  // pass in data as strings
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
     })
      .success(function(data) {
        console.log(data);

        if (!data.success) {
          console.log("a");
          // if not successful, bind errors to error variables
          $scope.errorName = data.errors.name;
          $scope.errorSuperhero = data.errors.superheroAlias;
        } else {
          // if successful, bind success message to message
          console.log(data.message);
          $scope.message = data.message;
        }
      });
    };
  }
