app.controller('cuantoTengoController', ['$scope', '$window', 'uuid', function($scope, $window, uuid) {
  $scope.url_base = $window.url_base;
  $scope.storage = window.localStorage;
  $scope.uuid = $scope.storage.getItem("uuid");
  if($scope.uuid == null){
    var hash = uuid.v4();
    $scope.storage.setItem("uuid", hash);
  }
}]);

app.controller('formController', ['$scope', '$http', 'fullwModalService', function($scope, $http, fullwModalService) {
  $scope.formData = {};
  $scope.actualizarCaptcha = function(){
    $("#captcha").prop("src", url_base + "/captcha.png?" + new Date().valueOf());
    $scope.formData.captcha = null;
  };
  $scope.processForm = function() {
    $http({
    method: "GET",
    crossDomain: true,
    withCredentials: true,
    url: url_base + "/rest/getSaldoCaptcha/" + $scope.formData.cardID + "/" + $scope.formData.captcha
   }).then(function successCallback(response) {
       if(response.data.error == "0"){
          if (!angular.isUndefined($scope.formData.cardName)){
            $scope.responseJSON = JSON.stringify($.extend(response.data, JSON.parse('{"nombre": "' + $scope.formData.cardName+'"}')));
          }else{
            $scope.responseJSON = JSON.stringify(response.data);
          }
          $scope.storage = window.localStorage;
          $scope.tarjeta_string = $scope.storage.getItem("tarjeta-"+response.data.nroExternoTarjeta);
          if($scope.tarjeta_string==null){
            $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON);
            var modalOptions = {
                closeButton: true,
                headerText: '¡Tarjeta cargada con éxito!',
                bodyText: 'El saldo en tu tarjeta es de:',
                aceptarText: 'Ir a lista de tarjetas',
                saldo: response.data.saldos[0].saldo
            };
          }else{
            $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON);
            var modalOptions = {
                closeButton: true,
                headerText: '¡Tarjeta actualizada con éxito!',
                bodyText: 'El saldo en tu tarjeta es de:',
                saldo: response.data.saldos[0].saldo
            };
          }

          fullwModalService.showModal({windowClass: 'modal-fullscreen success'}, modalOptions).then(function (result) {
          });
        }else{
          var errores = {1:"Captcha Incorrecto", 2:"Tarjeta Inexistente", 3:"Tarjeta Duplicada", 98:"Usuario o IP temporalmente suspendido", 99:"Sesión de usuario inexistente", 100:"Otro"}
          var modalOptions = {
              closeButton: false,
              headerText: '¡Error al cargar la tarjeta!',
              bodyText: 'Por favor, intenta nuevamente',
              saldo: 'Error: ' + errores[response.data.error]
          };
          fullwModalService.showModal({windowClass: 'modal-fullscreen error'}, modalOptions).then(function (result) {
          });
          $scope.actualizarCaptcha();
          $scope.formData.captcha = null;
        }


   }, function errorCallback(response) {
    var modalOptions = {
        closeButton: false,
        headerText: '¡Error al cargar la tarjeta!',
        bodyText: 'Por favor, intenta nuevamente',
        saldo: 'Error al conectarse con servidor'
    };
    fullwModalService.showModal({windowClass: 'modal-fullscreen error'}, modalOptions).then(function (result) {
    });
    $scope.actualizarCaptcha();
    $scope.formData.captcha = null;

    console.log("Error en server");
  });
  };
}]);


app.controller('formModificarController', ['$scope', '$http', 'fullwModalService', function($scope, $http, fullwModalService) {
  $scope.formData = {};
  $scope.processForm = function() {
    console.log($scope.formData);
    $scope.storage = window.localStorage;
    $scope.tarjeta_string = $scope.storage.getItem("tarjeta-"+$scope.formData.cardID);

    // $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON);
    $scope.datosTarjeta = JSON.parse($scope.tarjeta_string);
    $scope.datosTarjeta.nombre = $scope.formData.cardName;
    $scope.storage.setItem("tarjeta-"+$scope.formData.cardID, JSON.stringify($scope.datosTarjeta));
    var modalOptions = {
        closeButton: true,
        headerText: 'Nombre cambiado con éxito!',
        bodyText: 'El saldo en tu tarjeta es de:',
        aceptarText: 'Aceptar',
        saldo: $scope.datosTarjeta.saldos[0].saldo
    };
    fullwModalService.showModal({windowClass: 'modal-fullscreen success'}, modalOptions).then(function (result) {
    });
  }
}]);


app.controller('tarjetasController', ['$window','$scope', function($window, $scope) {
  var self = this;
  $scope.storage = window.localStorage;
  $scope.tarjetas = [];
  for (var i = 0; i < $scope.storage.length; i++){
    if($scope.storage.key(i).indexOf("tarjeta-") != -1){
      $scope.tarjeta_string = $scope.storage.getItem($scope.storage.key(i));
      $scope.tarjeta = JSON.parse($scope.tarjeta_string);
      $scope.tarjetas.push($scope.tarjeta);
    }
  }
  self.deleteTarjeta = function(id){
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
      })
    }
}]);

app.directive("modificar", ['modalModificarService', '$timeout', function(modalModificarService, $timeout){
 return function(scope, element, attrs) {
      element.bind("click", function(){
        var modalOptions = {
            headerText: 'Modificar el nombre de: '+attrs.nombre+'?',
            bodyText: '¿Estás seguro que querés eliminar esta tarjeta?',
            cardID: attrs.cardid
        };
        modalModificarService.showModal({}, modalOptions).then(function (result) {
          $timeout(function () {
              // console.log(attrs);
              // scope.$apply(attrs.modificar);
          }, 300);
        });
      })
    }
}]);


app.directive("actualizar", ['modalActualizarService', '$window', '$timeout', function(modalActualizarService, $window, $timeout){
 return function(scope, element, attrs) {
      scope.url_base = $window.url_base;
      element.bind("click", function(){
        var modalOptions = {
            headerText: 'Actualizar el saldo de: '+attrs.nombre+'?',
            bodyText: 'Complete el formulario para actualizar el saldo de su tarjeta.',
            cardID: attrs.cardid,
            cardName: attrs.nombre,
            urlBase: scope.url_base
        };
        modalActualizarService.showModal({}, modalOptions).then(function (result) {
          $timeout(function () {
              // console.log(attrs);
              // scope.$apply(attrs.actualizar);
          }, 300);
        });
      })
    }
}]);
