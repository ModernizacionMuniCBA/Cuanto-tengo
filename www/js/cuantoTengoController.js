app.controller('cuantoTengoController', ['$scope', '$window', function($scope, $window) {
  $scope.url_base = $window.url_base;
}]);
// app.config(function ($httpProvider) {
//     $httpProvider.defaults.withCredentials = true;
// });
app.controller('formController', ['$scope', '$http', 'fullwModalService', function($scope, $http, fullwModalService) {
  // create a blank object to hold our form information
  // $scope will allow this to pass between controller and view
  $scope.formData = {};
  // process the form
  $scope.processForm = function() {
    // console.log($scope.formData.cardName);
    $http({
    method: "GET",
    crossDomain: true,
    withCredentials: true,
    url: url_base + "/rest/getSaldoCaptcha/" + $scope.formData.cardID + "/" + $scope.formData.captcha
   }).then(function successCallback(response) {
     //  console.log(url_base + "/rest/getSaldoCaptcha/" + $scope.formData.cardID + "/" + $scope.formData.captcha);
     //  console.log(response.data);
       if(response.data.error == "0"){
          if (!angular.isUndefined($scope.formData.cardName)){
            $scope.responseJSON = JSON.stringify($.extend(response.data, JSON.parse('{"nombre": "' + $scope.formData.cardName+'"}')));
          }else{
            $scope.responseJSON = JSON.stringify(response.data);
          }
          $scope.storage = window.localStorage;
          $scope.tarjeta_string = $scope.storage.getItem("tarjeta-"+response.data.nroExternoTarjeta);
          if($scope.tarjeta_string==null){
            $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON); // Pass a key name and its value to add or update that key.
            var modalOptions = {
                closeButton: true,
                headerText: '¡Tarjeta cargada con éxito!',
                bodyText: 'El saldo en tu tarjeta es de:',
                saldo: response.data.saldos[0].saldo
            };
          }else{
            $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON); // Pass a key name and its value to add or update that key.
            var modalOptions = {
                closeButton: true,
                headerText: '¡Tarjeta actualizada con éxito!',
                bodyText: 'El saldo en tu tarjeta es de:',
                saldo: response.data.saldos[0].saldo
            };
          }

          fullwModalService.showModal({windowClass: 'modal-fullscreen success'}, modalOptions).then(function (result) {
          });

          // $('#modal-fullscreen').addClass('success');
          // $('#modal-fullscreen').modal('show');
        }else{
          var modalOptions = {
              closeButton: false,
              headerText: '¡Error al cargar la tarjeta!',
              bodyText: 'Por favor, intenta nuevamente',
              saldo: ''
          };
          fullwModalService.showModal({windowClass: 'modal-fullscreen error'}, modalOptions).then(function (result) {
          });
        }


   }, function errorCallback(response) {

    var modalOptions = {
        closeButton: false,
        headerText: '¡Error al cargar la tarjeta!',
        bodyText: 'Por favor, intenta nuevamente',
        saldo: ''
    };
    fullwModalService.showModal({windowClass: 'modal-fullscreen error'}, modalOptions).then(function (result) {
    });

    console.log("Error en server");
  });
  };
}]);

app.controller('tarjetasController', ['$window','$scope', function($window, $scope) {
  // create a blank object to hold our form information
  // $scope will allow this to pass between controller and view
  // process the form
  var self = this;
  $scope.storage = window.localStorage;
  $scope.tarjetas = [];
  for (var i = 0; i < $scope.storage.length; i++){
    // do something with localStorage.getItem(localStorage.key(i));
    $scope.tarjeta_string = $scope.storage.getItem($scope.storage.key(i));
    $scope.tarjeta = JSON.parse($scope.tarjeta_string);
    $scope.tarjetas.push($scope.tarjeta);
  }
  // console.log($scope.tarjetas);
  self.deleteTarjeta = function(id){
    // alert(id);
    $scope.storage.removeItem('tarjeta-'+id);
    $window.location.reload();
  }

}]);

app.directive('tarjeta', ['$timeout', function($timeout) {
  return {
    templateUrl: 'angular-templates/template-tarjeta.html',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      $timeout(function() {
        initializeCircles();
      });
    }

  };
}]);

app.directive("borrar", ['modalService', '$timeout', function(modalService, $timeout){
 return function(scope, element, attrs) {
      element.bind("click", function(){
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar',
            headerText: 'Eliminar Tarjeta?',
            bodyText: '¿Estás seguro que querés eliminar esta tarjeta?'
        };
        modalService.showModal({}, modalOptions).then(function (result) {
          $timeout(function () {
              scope.$apply(attrs.borrar);
          }, 300);
        });
        // alert(borrar);
        // if(borrar){
        //   alert("A");
        //   scope.$apply(attrs.borrar);
        // }
        // if (confirm('¿Estás seguro que querés eliminar esta tarjeta?')) {
        //     // elelocalStorage.removeItem(key);
        //     // scope.tgCtrl.deleteTarjeta(2);
        //     scope.$apply(attrs.borrar);
        //     console.log(attrs);
        // } else {
        //     // Do nothing!
        // }
      })
    }
}]);
