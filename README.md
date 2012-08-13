[argenmap.jquery](http://www.ign.gob.ar/argenmap/argenmap.jquery/docs) - Mapas web del IGN y jQuery
===================================================

Presentación
------------

argenmap.jquery es un plugin para jQuery que te permite usar la API de Google Maps
pero superponiendo fácilmente los datos vectoriales del Instituto Geográfico Nacional
de la República Argentina.

Te ofrece funciones potentes (clustering, resolución de direcciones...) y simples que te evitan tener que escribir mucho código
repetitivo.
Sin embargo te da acceso a la API completa de Google Maps.


¿Por qué usar argenmap.jquery ?
-----------------

1. Mapas con los nombres oficiales en lugas de los nombres que usa Google Maps : 
 - El mapa de argenmap presenta las capas base de Google Maps o las del IGN pero siempre con nombres oficialmente reconocidos por Argentina.

2. Completa compatibilidad con jQuery : 
 - Miles de sitios utilizan jQuery para mejorar la experiencia del usuario. argenmap.jquery se monta sobre jquery y agrega funcionalidad compatible con el sitio construido con jQuery.
 - El mismo mapa puede ser accedido por todos los selectores posibles.
 - Las llamadas a jQuery pueden ser apiladas.

3. Acceso completo a la API de Google Maps
 - Aunque argenmap.jquery presenta tipos de datos simplificados, podés usar los formatos de Google Maps.

4. Uso transparente de los servicios del IGN y de Google Maps.
 - Los servicios del IGN (WMS, ...) y de Google Maps son aprovechables sin código extra (geocodificación, datos de elevación ...) ([ejemplo de geocodificación transparente] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/agregarMarcador.html))

5. Etiquetas y datos personalizados
 - Todos los objetos agregados (marcadores, overlays ...) pueden ser etiquetados para usarlos más adelante por medio de la funcion "get"  filtrados por una o más etiquetas ([ejemplo de etiquetado] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/agregarCapaKml) )
 - Todos los objetos pueden tener asociados datos personalizados que son enviados a los eventos ([ejemplo de datos personaliazdos] (http://www.ign.gob.ar/agenmap/argenmap.jquery/docs/agregarMarcadores.html) )
 
6. Muchos ejemplos
 - En el sitio [API] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/api.html) y [Ejemplos] (http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/ejemplos.html)
