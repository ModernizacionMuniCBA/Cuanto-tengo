## De HTML5 a APK vía Cordova

Instalar [android-sdk-linux](https://developer.android.com/studio/index.html).   

Instalar cordova, crear el entorno y agregarle la plataforma Android cómo salida.  

```
npm install -g cordova
# ir al directorio donde quiero poner mi app
cordova create cuantotengo

# asegurarse de definir las variables de entorno.
export ANDROID_HOME=/<installation location>/android-sdk-linux
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

cordova platform add android
```

Colocar el html en la carpeta _www_ que se creó en el entorno. Asegurarse de usar los metas y JS de _cordova_.  
El que define las políticas de seguridad es importante.  
```
<meta http-equiv="Content-Security-Policy" 
        content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval' https://gobiernoabierto.cordoba.gob.ar; 
                    style-src 'self' 'unsafe-inline';
                    media-src *; 
                    script-src 'self' https://gobiernoabierto.cordoba.gob.ar;
                    font-src 'self' https://fonts.gstatic.com">
```


Compilar sin firma para el market y tener un APK para probar en el teléfono.  
```
cordova build android
```

Para probar la app en una maquina virtual. Requiere instalar mas de 1GB en repos y maquinas virtuales.  
Se requerirá android-sdk-tools, android-build-tools, java8 (la de Oracle, OpenJDK para no funcionar) y muchas otras cosas.  
No es necesario, el APK ya es funcional

```
cordova run agendacultural
```
 
Para compilar con las llaves necesarias y [firmar para el market de android](https://developer.android.com/studio/publish/app-signing.html).  

```
#Solo una vez, crear la llave
keytool -genkey -v -keystore agenda-cultural.keystore -alias AgendaCultural -keyalg RSA -keysize 2048 -validity 10000
cordova build android --release
# queda en platforms/android/build/outputs/apk/android-release-unsigned.apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore agenda-cultural-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk AgendaCultural

# borrar el anterior comppilado
rm platforms/android/build/outputs/apk/AgendaCultural-release.apk

# revisar el path de zipalign uno por cada version del sdk, em mi caso _android-sdk-linux/build-tools/23.0.3/zipalign_   
zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/AgendaCultural-release.apk
```