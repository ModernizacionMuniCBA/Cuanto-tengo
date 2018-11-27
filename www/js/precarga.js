var _markers = [];          // Array de marcadores para dibujar en el mapa
var _map = null;            // Referencia al objeto GoogleMap
var _infoWindow = null;     // Referencia a la ventana de información cuando el usuario hace click sobre un marcador

var _storageKeyData = "rpoints";    // Indice / Clave de la información almacenada en localStorage.

// Latitud y Longitud por default de la ciudad de Córdoba
var _lat = -31.411822771446154, _lng = -64.18487548203126;

$(document).ready(function () {
    resizeWnd();

    $(window).on('resize', function () {
        resizeWnd();
    });

    // Solicitamos obtener la posición del usuario
    // Debemos especificar el tiempo de espera para corregir un comportamiento en Android el cual se puede encontrar en los docs de apache-cordova:
    /* If Geolocation service is turned off the onError callback is invoked after timeout interval (if specified).
       If timeout parameter is not specified then no callback is called. */
    var reqTimeout = 1000 * 15; // 15 segundos
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, { timeout: reqTimeout });
});

function resizeWnd() {
    var bottom = $('.navbar.navbar-ctengo.navbar-fixed-top').position().top + $('.navbar.navbar-ctengo.navbar-fixed-top').outerHeight(true);
    $('body').css('padding-top', bottom);
    $('#loading').hide();
}

// Callback una vez que el mapa es obtenido desde maps.googleapi.com
function initMap() {
    // Creamos una nueva instancia de Map
    _map = new google.maps.Map(document.getElementById("GMap"), {
        center: new google.maps.LatLng(_lat, _lng),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
    });

    _infoWindow = new google.maps.InfoWindow();

    getLocations();

    // Para que el mapa se ajuste al 100% de la pantalla del dispositivo, debemos realizar este work-around de manera tal que el height del contenedor
    // sea el mismo que el height de la ventana / pantalla. Esto es así porque al no tener una referencia en pixeles de la altura del contenedor padre,
    // establecer el height en 100% como regla en CSS no da ningún resultado.
    var wndHeight = $(window).height();
    $("#GMap").height(wndHeight);
}

function getLocations() {
    var storage = window.localStorage;
    var shouldRequest = false;
    var storedData = storage.getItem(_storageKeyData);
    var parsedData = null;

    // Verificamos si la información fue añadida. La obtenemos de ser necesario.
    if (!storedData) {
        shouldRequest = true;
    }
    else {
        parsedData = JSON.parse(storedData);
        var elapsedTime = (new Date().getTime() - parsedData.date) / (1000 * 60 * 60 * 24);

        // Pasaron mas de 7 días
        if (elapsedTime > 7) shouldRequest = true;
    }

    if (shouldRequest) {
        // Establecer url de webservice
        var searchUrl = "/genmap.xml";

        downloadUrl(searchUrl, function (pointsData) {
            var dataObj = {
                data: pointsData,
                date: new Date().getTime()
            };

            // Almacenamos la información en localStorage
            storage.setItem(_storageKeyData, JSON.stringify(dataObj));

            getRechargePoints(data);
        });
    }
    else
    {
        getRechargePoints(parsedData.data);
    }
}

// Obtenemos los puntos de recarga
function getRechargePoints(data) {
    var xml = parseXml(data);
    var markerNodes = xml.documentElement.getElementsByTagName("marker");

    for (var i = 0; i < markerNodes.length; i++) {
        var name = markerNodes[i].getAttribute("name");
        var address = markerNodes[i].getAttribute("address");
        var barrio = markerNodes[i].getAttribute("barrio");

        var tipo = markerNodes[i].getAttribute("tipo");
        var boca = markerNodes[i].getAttribute("boca");

        var latlng = new google.maps.LatLng(
            parseFloat(markerNodes[i].getAttribute("lat")),
            parseFloat(markerNodes[i].getAttribute("lng")));

        createMarker(latlng, name, address + "<br />" + barrio + " - (Boca Nro. " + boca + ")", tipo);
    }
}

// Solicitamos la descarga del contenido de una web mediante el metodo GET
function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
        new ActiveXObject("Microsoft.XMLHTTP") :
        new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            request.onreadystatechange = function () { };
            callback(request.responseText, request.status);
        }
    };

    request.open("GET", url, true);
    request.send(null);
}

// Parseamos una cadena en formato XML
function parseXml(str) {
    if (window.ActiveXObject) {
        var doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.loadXML(str);
        return doc;
    } else if (window.DOMParser) {
        return (new DOMParser).parseFromString(str, "text/xml");
    }
}

// Gráfico del marcador según el tipo de boca de expendio / punto de recarga.
function createMarker(latlng, name, address, tipo) {
    var html = "";
    var iGrafico = "/www/img/redbusIcon.png";

    switch (tipo) {
        case "cau": {
            html = "<br /><b>CENTRO DE ATENCIÓN AL USUARIO REDBUS</b><br />Tel. 0800-444-6740 l&iacute;nea gratuita<br />" + address;
            //iGrafico = "markerIco/redbusIconCAU.png";
            break;
        }
        case "pdv": {
            html = "<br /><b>VENTA Y CARGA DE TARJETAS REDBUS</b><br />" + address + "<br><img src='/www/img/logCba2.png' />";
            //iGrafico = "markerIco/redbusIcon.png";
            break;
        }

        case "ers": {
            html = "<br /><b>CENTRO DE ABONOS AUTOBUSES SANTA FE/ERSA</b><br />Tel. 4213429<br /><br />" + address;
            //iGrafico = "markerIco/redbusIconCIUDAD.png";
            break;
        }
        case "con": {
            html = "<br /><b>CENTRO DE ABONOS CONIFERAL</b><br />Tel. 4260093<br /><a href='http://www.coniferalsacif.com.ar/web-abonos-colectivos-coniferal-sacif-cordoba-capital.asp' target='_blank'>Sitio web</a><br />" + address;
            //iGrafico = "markerIco/redbusIconCONIFERAL.png";
            break;
        }
        case "tam": {
            html = "<br /><b>CENTRO DE ABONOS T.A.M. S.E.</b><br />Tel. 4342373 / 74 int. 232<br /><a href='http://www.tam-se.com.ar/es/Usuarios-abonos-29' target='_blank'>Sitio web</a><br />" + address;
            //iGrafico = "markerIco/redbusIconTAMSE.png";
            break;
        }
        case "atm": {
            html = "<br /><b>BOCA DE RECARGA AUTOMÁTICA</b><br />" + address + "<br><img src='markerIco/atm_img.jpg' />";
            //iGrafico = "markerIco/redbusATMicon.png";
            break;
        }
    }
    var marker = new google.maps.Marker({
        map: _map,
        position: latlng,
        icon: iGrafico
    });

    google.maps.event.addListener(marker, "click", function () {
        _infoWindow.setContent(html);
        _infoWindow.open(_map, marker);
    });

    _markers.push(marker);
}

// Callback cuando se pudo obtener la posición del usuario
function onGeoSuccess(position) {
    // Obtenemos la posición actual
    var curPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    // Es posible que al momento de obtener la posicion del usuario
    // el mapa de google no haya sido cargado aun. Por lo tanto verificaremos cada 100ms el estado 
    // del mapa
    var mapInitInterval = setInterval(function () {
        // Si el mapa ya ha sido cargado, actualizamos la posición del mismo y limpiamos el timer
        if (_infoWindow !== null && _map !== null) {
            updateMapPosition(curPos);
            clearInterval(mapInitInterval);
        }
    }, 100);
}

// Actualiza la posición del mapa
function updateMapPosition(newPos) {
    _infoWindow.setPosition(newPos);
    _map.setCenter(newPos);
    _map.setZoom(16);

    var curPosMarker = new google.maps.Marker({
        position: newPos,
        title: "Tu posición",
        label: "A"
    });

    curPosMarker.setMap(_map);
}

// Callback cuando no se pudo obtener la posición del usuario.
function onGeoError() {

    // Hacer: Personalizar mensaje de error
    console.log("Geo error");
}