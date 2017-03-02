app.controller('cuantoTengoController', ['$scope', '$window', function($scope, $window) {
  $scope.url_base = $window.url_base;
}]);
// app.config(function ($httpProvider) {
//     $httpProvider.defaults.withCredentials = true;
// });
app.controller('formController', ['$scope', '$http', function($scope, $http) {
  // create a blank object to hold our form information
  // $scope will allow this to pass between controller and view
  $scope.formData = {};
  // process the form
  $scope.processForm = function() {
    $http({
    method: "GET",
    crossDomain: true,
    withCredentials: true,
    url: url_base + "/rest/getSaldoCaptcha/" + $scope.formData.cardID + "/" + $scope.formData.captcha
   }).then(function successCallback(response) {
     console.log(url_base + "/rest/getSaldoCaptcha/" + $scope.formData.cardID + "/" + $scope.formData.captcha);
     console.log(response.data);
    //  $scope.message = data.message;
   }, function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
    console.log("a");
    // if not successful, bind errors to error variables
    // $scope.errorName = data.errors.name;
    // $scope.errorSuperhero = data.errors.superheroAlias;
  });
  };
}]);
