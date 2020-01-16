# Webservice RedBus
Sobre una URL base se pueden aplicar los siguientes llamadas.  
URL base: https://mrb.red-bus.com.ar:443

## Llamadas
/captcha.png: Devuelve un captcha válido para una sesion de consulta  
/rest/getSaldoCaptcha/CODIGO-TARJETA/TEXTO-CAPTCHA: llamada para obtener el saldo de la tarjeta  

## Respuesta
Ejemplo respuesta OK
```
{"nroExternoTarjeta":"CODIGO-TARJETA",
 "tipoTarjeta":"COMUN",
 "estado":"ACTIVA",
 "saldos":[
    {"saldo":17.3,
    "monedero":{
       "id":1,
       "unidadPasajes":false,
       "nombre":"tarjeta",
       "prefijoSaldo":"$ ",
       "sufijoSaldo":""}
    }],
 "fechaSaldo":1470736849000,
 "error":0}
```

## Córdigos de error
Codigos de error del API
 - 0: Sin error
 - 1: Captcha incorrecto
 - 2: Tarjeta inexistente
 - 3: Tarjeta duplicada
 - 98: Usuario o IP temporalmente suspendido
 - 99: Sesión de usuario inexistente
 - 100: Otro
