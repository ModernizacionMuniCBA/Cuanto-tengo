app.controller('cuantoTengoController', ['$scope', '$window', 'uuid', function($scope, $window, uuid) {
  $scope.url_base = $window.url_base;
  $scope.storage = window.localStorage;
  $scope.uuid = $scope.storage.getItem("uuid");
  if($scope.uuid == null){
    var hash = uuid.v4();
    $scope.storage.setItem("uuid", hash);
  }
}]);

app.controller('versionController', ['$scope', '$window', 'uuid', '$http', 'fullwModalVersionService', function($scope, $window, uuid, $http, fullwModalVersionService) {
  $scope.url_base = $window.url_base;
  $scope.storage = window.localStorage;
  $scope.check = function(response){
    if(response.data.version_minima > cordova_app_version){
      var modalOptions = {
          closeButton: false,
          headerText:  response.data.txt_sino_hay_version_minima,
      };
      fullwModalVersionService.showModal({windowClass: 'modal-fullscreen version'}, modalOptions).then(function (result) {
      });
    }else{
      if(response.data.version_recomendada > cordova_app_version){
        var modalOptions = {
            closeButton: true,
            headerText:  response.data.txt_sino_hay_version_recomendada,
        };
        fullwModalVersionService.showModal({windowClass: 'modal-fullscreen version'}, modalOptions).then(function (result) {
        $scope.storage.setItem('lastChecked', new Date());
        });
      }else{
        $scope.storage.setItem('lastChecked', new Date());
      }
    }
  }
  $scope.checkVersion = function(){
    $http({
      method: 'GET',
      crossDomain: true,
      withCredentials: true,
      url: url_destino+"/v2/redbus-data/app-redbus/1/",
    }).then(function successCallback(response) {
        var lastChecked = $scope.storage.getItem('lastChecked')
        if(lastChecked == null){
          $scope.check(response);
        }else{
          if((new Date(lastChecked).getTime() + 86400) < new Date().getTime()){
            $scope.check(response);
          }
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log('Error al conectar!')
      });
  }
  $scope.checkVersion();
}]);

app.filter('renderHTMLCorrectly', function($sce)
{
	return function(stringToParse)
	{
		return $sce.trustAsHtml(stringToParse);
	}
});

app.controller('aboutController', ['$scope', '$window', '$sce', '$http', function($scope, $window, $sce, $http) {
  $scope.url_base = $window.url_base;
  $scope.storage = window.localStorage;

  $http({
    method: 'GET',
    crossDomain: true,
    withCredentials: true,
    url: url_destino+"/v2/redbus-data/app-redbus/1/",
  }).then(function successCallback(response) {
      $scope.aboutApp = response.data.about_app;
      $scope.aboutPriv = response.data.politica_de_privacidad;
      $scope.aboutTyC = response.data.terminos_y_condiciones;

    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      console.log('Error al conectar!')
    });

}]);



app.run(function($http) {
  // $http.defaults.headers.common.Authorization = 'Token ' + tokenAuth; //Setea Header a "Authorization: Token XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
});

app.controller('formController', ['$scope', '$http', 'fullwModalService', '$filter', function($scope, $http, fullwModalService, $filter) {
  $scope.formData = {};
  $scope.storage = window.localStorage;
  $scope.saveConsulta = function(cardID, uid, date, balance, nombre){
    // POST require fields:
    //      - nombre_tarjeta.tarjeta.codigo: codigo de la tarjeta RedBus (numero)
    //      - nombre_tarjeta.uid: Identificador único de la app instalada. Debe tener el prefijo CT- (identifica a la app Cuanto Tengo)
    //      - momento_dato: Fecha que RedBus informa como la del dato tomado
    //      - saldo: $ de saldo informado por RedBus
    if(nombre==""){
      nombre = "-";
    }
    var data = {
        'nombre_tarjeta.tarjeta.codigo': cardID.toString(),
        'nombre_tarjeta.uid': "CT-"+uid,
        'momento_dato': date,
        'saldo': balance.toString(),
        'nombre_tarjeta.nombre': nombre
    };
    $http({
      method: 'POST',
      crossDomain: true,
      withCredentials: true,
      url: url_destino+"/v2/redbus-data/saldo-tarjeta-redbus/",
      data: JSON.stringify(data),//assuming you have the JSON library linked.
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        // console.log('dato guardado!');
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log('Error al guardar!')
      });
  }

  $scope.saveError = function(cardID, uid, error_code, error_details, error_redbus_code, name){
    // POST require fields:
    //  - nombre_tarjeta.tarjeta.codigo: codigo de la tarjeta RedBus (numero)
    //  - nombre_tarjeta.uid: Identificador único de la app instalada. Debe tener el prefijo CT- (identifica a la app Cuanto Tengo)
    //  - error_code: Codigo de error HTTP que devolvio Redus
    //  - error_details: Detalles del error
    //  - error_redbus_code: Codigo de error de RedBus

    var data = {
        'nombre_tarjeta.tarjeta.codigo': cardID,
        'nombre_tarjeta.uid': "CT-"+uid,
        'error_code': error_code,
        'error_details': error_details,
        'error_redbus_code': error_redbus_code,
        'nombre_tarjeta.nombre': name
    };

    // console.log(data);
    $http({
      method: 'POST',
      crossDomain: true,
      withCredentials: true,
      url: url_destino+"/v2/redbus-data/error-saldo-redbus/",
      data: JSON.stringify(data),//assuming you have the JSON library linked.
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        console.log('Guardado!');
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log('Error al guardar!')
      });
  }

  $scope.about_data = "";
  // $http({
  //   method: 'GET',
  //   crossDomain: true,
  //   withCredentials: true,
  //   url: url_destino+"/v2/redbus-data/app-redbus/1/",
  // }).then(function successCallback(resp) {
  //     $scope.about_data = resp.data.about_data;
  //     // $scope.obtenerDataHTMLAPI = function() {
  //     //   return $sce.trustAsHtml(about_data);
  //     // };
  //   }, function errorCallback(response) {
  //     // called asynchronously if an error occurs
  //     // or server returns response with an error status.
  //     console.log('Error al conectar!')
  //   });

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
          var cardID = $scope.formData.cardID;
          var uid = $scope.storage.getItem("uuid");
          var date="";
          var balance="";
          var name="";
          if (!angular.isUndefined($scope.formData.cardName)){
            name = $scope.formData.cardName;
            $scope.responseJSON = JSON.stringify($.extend(response.data, JSON.parse('{"nombre": "' + $scope.formData.cardName+'"}')));
          }else{
            $scope.responseJSON = JSON.stringify(response.data);
          }
          date = $filter('date')(response.data.fechaSaldo, 'yyyy-MM-dd HH:mm');
          // dateOnly = $filter('date')(response.data.fechaSaldo, 'dd-MM-yyyy');
          // timeOnly = $filter('date')(response.data.fechaSaldo, 'HH:mm');
          balance = $filter('number')(response.data.saldos[0].saldo, 2);

          // $scope.saveConsulta(cardID, uid, date, balance, name);

          $scope.storage = window.localStorage;
          $scope.tarjeta_string = $scope.storage.getItem("tarjeta-"+response.data.nroExternoTarjeta);

          if($scope.tarjeta_string==null){
            $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON);
            var modalOptions = {
                closeButton: true,
                addNew: true,
                headerText: '¡Tarjeta leída con éxito!',
                bodyText: 'El saldo en tu tarjeta es de:',
                aceptarText: 'Ir a lista de tarjetas',
                saldo: balance,
                date: date,
                aboutData: $scope.about_data,
                showDate: true
            };
          }else{
            $scope.storage.setItem("tarjeta-"+response.data.nroExternoTarjeta, $scope.responseJSON);
            var modalOptions = {
                closeButton: true,
                headerText: '¡Tarjeta actualizada con éxito!',
                bodyText: 'El saldo en tu tarjeta es de:',
                saldo: balance,
                date: date,
                aboutData: $scope.about_data,
                showDate: true
            };
          }

          fullwModalService.showModal({windowClass: 'modal-fullscreen success'}, modalOptions).then(function (result) {
          });
        }else{
          var errores = {1:"Captcha Incorrecto", 2:"Tarjeta Inexistente", 3:"Tarjeta Duplicada", 98:"Usuario o IP temporalmente suspendido", 99:"Sesión de usuario inexistente", 100:"Otro"}
          var cardID = $scope.formData.cardID;
          var uid = $scope.storage.getItem("uuid");
          var error_code = response.status;
          var error_details = errores[response.data.error];
          var error_redbus_code = response.data.error;
          var name = "";
          if (!angular.isUndefined($scope.formData.cardName)){
            name = $scope.formData.cardName;
          }

          // $scope.saveError(cardID, uid, error_code, error_details, error_redbus_code, name);

          // console.log(response);
          var modalOptions = {
              closeButton: false,
              headerText: '¡Error al cargar la tarjeta!',
              bodyText: 'Por favor, intenta nuevamente',
              error_code: 'Error ('+ response.data.error +'): ' + errores[response.data.error]
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
        bodyText: 'El nuevo nombre de tu tarjeta es:',
        aceptarText: 'Aceptar',
        error_code: $scope.datosTarjeta.nombre
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

app.filter('moment', [
  function () {
    return function (date, method) {
      moment.locale('es-do');
      var momented = moment(date);
      return momented[method].apply(momented, Array.prototype.slice.call(arguments, 2));
    };
  }
]);
