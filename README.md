# Honey Bee - Portal de pedidos

Portal de pedidos para **Honey Bee**, un emprendimiento de café y bagels. Este sitio es el proyecto final del curso de Introducción a la IA y Vibecoding de Tecnolochicas.

## Descripción y objetivo

El portal permite consultar el menú, armar un pedido para recoger en tienda, enviarlo y seguir su estado hasta que esté listo. Incluye una administración privada para revisar pedidos, cambiar estados y abrir o cerrar la recepción.

## Funciones implementadas

### Etapa 1: menú y carrito

- Encabezado con la marca Honey Bee, enlace al menú y botón de carrito con contador de unidades.
- Menú con filtros: Todo, Café, Matcha y Bagels.
- Selección de producto en ventana modal: temperatura, tamaño (16 u 32 oz en bebidas frías), cantidad y notas opcionales.
- Reglas de bebidas: las calientes solo permiten 16 oz.
- Carrito con cambio de cantidades, eliminación de productos y total en MXN. Se guarda en el navegador y se revalida con el catálogo al cargar.

### Etapa 2: pedidos reales, seguimiento y administración

- **Envío del pedido** desde "Revisar pedido": nombre obligatorio, teléfono de 10 dígitos con mensaje claro, notas generales opcionales y modalidad "Recoger en tienda". Botones "Seguir editando" y "Enviar pedido" (muestra "Enviando…" durante el proceso).
- **Validación en el servidor**: recepción abierta, cantidades enteras de 1 a 99, productos y variantes existentes, 32 oz solo en bebidas frías. Precios y total se calculan con el catálogo de la base de datos; los importes del navegador se ignoran.
- **Guardado atómico** del pedido y sus productos en una sola operación, con clave de idempotencia validada en el servidor. Un doble clic o un reintento devuelven el mismo pedido.
- **Carrito y datos del formulario** se conservan si el envío falla. El carrito se vacía solo después de confirmar que el pedido se guardó.
- **Confirmación**: "¡Pedido recibido!", folio, resumen, total, estado "Recibido" y enlace privado de seguimiento con botón para copiarlo.
- **Seguimiento** en `/seguimiento/<token>`: el token es aleatorio (64 caracteres hexadecimales). Un folio por sí solo no permite consultar un pedido. La página no muestra teléfono ni datos de otros clientes. Se actualiza cada 25 segundos hasta llegar a un estado final.
- **Estados**: Recibido, Confirmado, En preparación, Listo para recoger, Entregado y Cancelado. La cancelación exige un motivo, que el cliente ve en su enlace. Al llegar a "Listo para recoger" aparece el aviso "¡Tu pedido está listo! Ya puedes pasar a recogerlo". No hay cambios automáticos por tiempo, notificaciones, WhatsApp ni SMS.
- **Recepción cerrada**: el menú y el carrito siguen disponibles, el envío se bloquea también en el servidor y aparece "Por ahora no estamos recibiendo pedidos". La recepción inicia cerrada.
- **Panel `/admin`**: inicio de sesión con correo y contraseña, cierre de sesión, lista de pedidos con los más recientes primero, filtros por estado, detalle con productos, variantes, notas, cliente, teléfono, fecha y total, botones solo para transiciones válidas, y un interruptor "Recepción de pedidos abierta/cerrada". La lista se actualiza cada 30 segundos. Cada cambio muestra confirmación solo después de guardarse; si falla, se muestra el error y se mantiene el estado anterior.

## Pendiente

- Tiempo real (Realtime): hoy se usan consultas periódicas.
- Pruebas en navegador de todos los flujos de la etapa 2 (ver "Pruebas").
- Pagos en línea: fuera de alcance por ahora.

### Pendientes de contenido

- Descripción de Toffee Nut (vacía a propósito, pendiente de confirmar).
- Fotografías pendientes: Banana Latte, Banana Matcha, Caramel Latte, Vanilla Sea Matcha, Pumpkin Spice, Toffee Nut y Morning Bee Bagel. Mientras tanto aparece un marcador "Foto pendiente".
- Confirmar si el vaso con etiqueta Honey Bee corresponde a Caramel Latte frío. Actualmente se usa en la presentación.

## Base de datos y acceso

La base de datos está en Supabase. Las migraciones están en `supabase/migrations/`:

1. `honey_bee_order_schema`: tablas de productos, variantes, configuración del negocio, administradoras, pedidos y productos del pedido. Activa RLS en todas las tablas.
2. `honey_bee_menu_catalog_seed`: carga el catálogo y deja la recepción cerrada.
3. `honey_bee_order_functions`: funciones para enviar pedidos, consultar seguimiento, cambiar estados y abrir o cerrar la recepción.
4. `honey_bee_revoke_default_privileges`: quita los permisos por defecto. Los visitantes no pueden leer pedidos ni tablas internas.

Modelo de acceso:

- Visitantes: solo pueden llamar a `place_order`, `get_order_by_token` y `get_order_intake_status`. El seguimiento devuelve únicamente el pedido de ese token.
- Administradora: `is_admin()` verifica la tabla `admin_users` con el usuario autenticado. Las funciones de cambio de estado y de recepción comprueban el rol en la base de datos. Solo puede leer pedidos y productos mediante políticas con ese rol.
- Ningún usuario puede agregarse a `admin_users` desde la aplicación. La tabla no tiene permisos para navegadores.
- La aplicación no incluye registro público. Las cuentas de administración se crean desde el panel de Supabase.

### Variables de entorno

Configúralas en el archivo `.env` local y en el entorno de publicación. No se incluyen valores en el código.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

La clave anon es pública y solo permite lo que las políticas de la base de datos autorizan. Nunca pongas la clave de servicio (service role) en la aplicación.

Si faltan estas variables, el panel y el envío muestran un mensaje de configuración y no guardan nada.

### Crear la primera cuenta de administradora

1. En Supabase, abre **Authentication > Users** y crea un usuario con correo y contraseña. Usa una contraseña fuerte y guárdala en un gestor de contraseñas.
2. Verifica que **Authentication > Providers > Email** tenga desactivada la confirmación de correo (Confirm email), según la configuración del proyecto.
3. Copia el UUID del usuario desde la lista de usuarios.
4. En **SQL Editor**, ejecuta como dueña del proyecto:

   ```sql
   insert into public.admin_users (user_id) values ('UUID-DEL-USUARIO');
   ```

   Reemplaza `UUID-DEL-USUARIO` con el UUID copiado. Este paso nunca se hace desde la aplicación.
5. Entra a `/admin` con ese correo y contraseña.

Para autorizar a otra persona, repite los pasos 1, 3 y 4. Para retirar el acceso, elimina su fila de `admin_users`.

## Pruebas

### Realizadas (nivel base de datos, en transacciones revertidas)

- Con la recepción cerrada, `place_order` responde `intake_closed`.
- Precios correctos: Banana Latte frío 32 oz = $75; 2 × Banana Matcha frío 32 oz + Morning Bee = $230.
- Caramel Latte caliente de 32 oz responde `cold_only_32`. Toffee Nut frío responde `invalid_item`.
- Un total enviado desde el navegador (50) se ignora; el total autorizado no cambia.
- Cantidades 0, 100 y 1.5 responden `invalid_quantity`.
- Mismo `idempotency_key` dos veces: mismo folio y una sola fila.
- El seguimiento por token devuelve el pedido sin teléfono ni token. Un folio o un token inválido devuelven nulo.
- Un usuario sin rol de administradora recibe `not_authorized` al cambiar estados o la recepción.
- Transiciones inválidas (saltar "Listo para recoger") y cancelación sin motivo están bloqueadas. Cancelar con motivo funciona. No se puede reabrir un pedido cancelado.
- La administradora cierra la recepción y el siguiente envío se bloquea.
- Prueba de apertura (usuario temporal con rol de administradora, revertido sin guardar): abrir devuelve verdadero, la consulta pública lo refleja, cerrar devuelve falso y un usuario sin rol recibe `not_authorized`.
- Consulta pública de apertura con rol anónimo: devuelve el valor de la configuración sin exponer otros datos.
- Un visitante anónimo no puede leer `orders` ni `admin_users` ni el catálogo, y no puede insertarse en `admin_users`.

### Realizadas (compilación)

- `npm run typecheck`, `npx eslint src` y `npm run build` pasan sin errores.

### Pendientes (requieren navegador con datos reales de prueba)

- Enviar un pedido desde el sitio, verlo en `/admin` y confirmar que persiste al recargar.
- Abrir el enlace de seguimiento en otro navegador y comprobar que el cambio de estado de la administradora llega al cliente.
- Probar el panel con una cuenta sin permisos.
- Probar el cierre de la recepción desde el panel y el bloqueo del envío.
- Probar el respaldo de copiado del enlace y el carrito conservado tras un error de red.
- Revisar advertencias de seguridad del asesor de Supabase después de las pruebas en navegador.

## Errores encontrados y correcciones

- **"No pudimos comprobar si estamos recibiendo pedidos" al abrir Revisar pedido**: la consulta pública de apertura (`get_order_intake_status`) funciona en la base de datos. Verificado: el registro de configuración existe con recepción cerrada, la función devuelve el valor correcto con el rol anónimo y tiene permiso de ejecución para visitantes. El fallo estaba en el navegador, que no mostraba la causa exacta y trataba cualquier error igual. Corrección: la consulta registra el error real en la consola, el mensaje muestra un motivo comprensible (configuración faltante, respuesta del servidor o dato inesperado) y el envío sigue bloqueado mientras no se confirme que la recepción está abierta. Si el mensaje indica falta de configuración, recarga la vista previa para que cargue las variables de entorno; si persiste, revisa la consola del navegador.
- **Lectura pública de pedidos**: la plataforma otorga permisos de tabla por defecto, y el rol anónimo podía leer `orders` y `admin_users`. Se corrigió con la migración `honey_bee_revoke_default_privileges`. Después de la corrección, el rol anónimo no puede leer esas tablas y la administradora solo ve las columnas necesarias (sin el token de seguimiento ni la clave de idempotencia).
- **Colores fuera de la paleta**: algunos tonos de estado (`sage-200`, `brick-800`, `amber-900`) no existían en la paleta. Se reemplazaron por tonos definidos en el diseño.
- **Clases de Tailwind no válidas** (Etapa 1): se reemplazaron por valores válidos.
- **Advertencias del asesor de seguridad**: las funciones públicas de envío, seguimiento y recepción aparecen como ejecutables por visitantes; es intencional. Las funciones de administración también aparecen como ejecutables por usuarios autenticados; comprueban el rol internamente. Las notas de RLS en tablas internas sin políticas también son intencionales, porque los navegadores no acceden a ellas.
- **Limitación conocida**: el límite de envíos por teléfono (5 cada 10 minutos) y el total por minuto (30) se verifican con conteos, no con bloqueo estricto. Bajo envíos simultáneos el límite es aproximado. Es una protección básica contra abuso, no un control perfecto.


## Herramientas utilizadas

- React 18 y TypeScript
- Vite
- Tailwind CSS
- lucide-react (íconos)
- Supabase (base de datos, autenticación y seguridad por filas)
- Fraunces y Nunito (tipografías, Google Fonts)
- ImageMagick (optimización de fotografías a WebP)

## Instrucciones para ejecutar el proyecto

1. Instala las dependencias: `npm install`
2. Configura las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Inicia el servidor de desarrollo: `npm run dev`
4. Para verificar la compilación: `npm run build`

## Registro de prompts

### Versión 1 (2026-10-31)

Prompt inicial: construcción de la primera etapa del portal de pedidos de Honey Bee (menú, selección de productos, carrito y revisión local), con referencias de diseño, menú y fotografías.

### Versión 2 (2026-10-31)

Prompt de la segunda etapa: pedidos reales en base de datos, envío con validación en el servidor, confirmación y seguimiento privado con token, panel de administración con inicio de sesión real, recepción abierta o cerrada, seguridad, verificación y documentación.

<!-- Agregar aquí el texto completo de las siguientes versiones del prompt. -->

## Enlaces del proyecto

- Enlace público: _pendiente_
- Repositorio: _pendiente_
