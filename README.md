[argenmap.jquery](http://www.ign.gob.ar/argenmap/argenmap.jquery/) - Mapas web del IGN y jQuery
===================================================

Presentación
------------

argenmap.jquery es un plugin para jQuery que te permite usar la API de Google
pero superponiendo fácilmente los datos vectoriales del Instituto Geográfico Nacional
de la República Argentina.

Te ofrece funciones potentes (clustering...) y simples que te evitan tener que escribir mucho código
repetitivo.
Sin embargo te da acceso a la API completa de Google Maps.


¿Por qué usar argenmap.jquery ?
-----------------

1. Completa compatibilidad con jQuery : 
 - el mismo mapa puede ser accedido por todos los selectores posibles
 - las llamadas a jQuery pueden ser apialadas

2. Acceso completo a la API de Google Maps
 - aunque argenmap.jquery presenta tipos de datos simplificados, podés usar los formatos de Google Maps

3. Uso transparente de los servicios del IGN y de Google Maps.
 - Los servicios del IGN (WMS, ...) y de Google Maps son aprovechables sin código extra (geocodificación, datos de elevación ...) ([ejemplo de geocodificación transparente] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/api_agregarMarcador.html))

4. Etiquetas y datos personalizados
 - Todos los objetos agregados (marcadores, overlays ...) pueden ser etiquetados para usarlos m'as adelante por medio de la funcion "get"  filtrados por una o más etiquetas ([ejemplo de etiquetado] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/api_agregarCapaKml) )
 - Todos los objetos pueden tener asociados datos personalizados que son enviados a los eventos ([ejemplo de datos personaliazdos] (http://www.ign.gob.ar/agenmap/argenmap.jquery/docs/api_agregarMarcadores.html) )
 
5. Muchos ejemplos
 - en el sitio [API] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/api.html) y [Ejemplos] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/ejemplos.html)
