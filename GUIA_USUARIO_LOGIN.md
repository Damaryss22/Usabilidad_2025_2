# 🚀 Guía Rápida de Usuario - Sistema de Login Mejorado

## 📖 Índice
1. [Inicio de Sesión](#inicio-de-sesión)
2. [Recuperación de Contraseña](#recuperación-de-contraseña)
3. [Sistema de Ayuda](#sistema-de-ayuda)
4. [Manejo de Errores](#manejo-de-errores)
5. [Seguridad](#seguridad)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🔐 Inicio de Sesión

### Paso a Paso:

1. **Abre la aplicación**
   - Verás la pantalla de login con el logo y formulario

2. **Ingresa tus credenciales:**
   - **Usuario:** Tu email de registro o nombre de usuario
   - **Contraseña:** Tu contraseña personal

3. **Opciones disponibles:**
   - 👁️ **Ver contraseña:** Click en el icono del ojo para mostrar/ocultar
   - ❓ **Ayuda:** Click en el signo de interrogación para ver ayuda
   - ⌨️ **Teclado:** Presiona Tab para navegar, Enter para enviar

4. **Enviar:**
   - Click en "INICIAR SESIÓN" o presiona Enter

### Credenciales de Prueba:

**Administrador:**
```
Usuario: admin
Contraseña: admin123
```

**Estudiante:**
```
Usuario: tu-email@ejemplo.com
Contraseña: (la que registraste)
```

---

## 🔑 Recuperación de Contraseña

### ¿Olvidaste tu contraseña?

#### **Paso 1: Solicitar Código**

1. Click en **"¿Olvidaste tu contraseña?"**
2. Se abrirá un modal (ventana emergente)
3. Ingresa tu **email de registro**
4. Click en **"Enviar Código"**
5. Espera la confirmación (verás el código en la consola en desarrollo)

**⚠️ Importante:** 
- El email debe estar registrado en el sistema
- Recibirás un código de 6 dígitos
- El código es válido por 10 minutos

#### **Paso 2: Verificar Código**

1. Ingresa el **código de 6 dígitos** que recibiste
2. Click en **"Verificar Código"**
3. Si el código es correcto, avanzarás al siguiente paso

**💡 Consejo:**
- Si te equivocas, puedes hacer click en "Volver" para solicitar un nuevo código

#### **Paso 3: Nueva Contraseña**

1. Ingresa tu **nueva contraseña**
   - Mínimo 6 caracteres
2. **Confirma** tu nueva contraseña
   - Debe ser exactamente igual
3. Click en **"Restablecer Contraseña"**

**✅ ¡Listo!**
- Tu contraseña ha sido actualizada
- Puedes iniciar sesión con la nueva contraseña

### Cerrar el Modal:
- Click en la **X** en la esquina superior derecha
- Presiona la tecla **Escape** (Esc)
- Click fuera del modal (en el fondo oscuro)

---

## 💡 Sistema de Ayuda

### Ayuda Contextual

Cada campo tiene un botón de ayuda (icono **?**):

#### **Campo Usuario:**
```
✓ Ingresa tu email de registro
✓ Para admin usa: admin
✓ Mínimo 3 caracteres
```

#### **Campo Contraseña:**
```
✓ Mínimo 6 caracteres
✓ Para admin: admin123
✓ ¿Olvidaste tu contraseña? Usa el enlace de recuperación
```

### Cómo Usar:
1. Click en el **icono ?** junto al campo
2. Lee la información
3. Click nuevamente para ocultar

---

## ❌ Manejo de Errores

### Validaciones en Tiempo Real

El sistema te avisará inmediatamente si:

❌ **Usuario vacío:**
```
"El usuario es obligatorio"
```

❌ **Usuario muy corto:**
```
"El usuario debe tener al menos 3 caracteres"
```

❌ **Contraseña vacía:**
```
"La contraseña es obligatoria"
```

❌ **Contraseña muy corta:**
```
"La contraseña debe tener al menos 6 caracteres"
```

### Errores de Autenticación

❌ **Usuario no encontrado:**
```
"Usuario no encontrado"
```
**Solución:** Verifica tu email o regístrate si no tienes cuenta

❌ **Contraseña incorrecta:**
```
"Contraseña incorrecta. Te quedan X intento(s)"
```
**Solución:** Revisa tu contraseña o usa "Olvidaste tu contraseña"

### Notificaciones Visuales

Las notificaciones aparecen en la **esquina superior derecha**:

- 🟢 **Verde (Éxito):** Todo salió bien
- 🔴 **Rojo (Error):** Algo salió mal
- 🟡 **Amarillo (Advertencia):** Ten cuidado
- 🔵 **Azul (Información):** Información general

**Características:**
- Se cierran automáticamente después de 5 segundos
- Puedes cerrarlas manualmente con la X
- Pueden aparecer múltiples notificaciones

---

## 🔒 Seguridad

### Sistema de Bloqueo Temporal

Para proteger tu cuenta, el sistema implementa **bloqueo temporal** después de múltiples intentos fallidos.

#### ¿Cómo Funciona?

1. **3 intentos fallidos** consecutivos
2. **Bloqueo de 30 segundos** automático
3. **Contador visible** que muestra el tiempo restante
4. **Desbloqueo automático** cuando termina el tiempo

#### Durante el Bloqueo:

- ❌ No puedes intentar iniciar sesión
- 🔒 Los campos están deshabilitados
- ⏱️ Ves el tiempo restante en segundos
- 🚫 El botón de login está deshabilitado

#### Mensaje Típico:
```
⚠️ Cuenta bloqueada temporalmente
Demasiados intentos fallidos. Espera 30 segundos.
```

#### ¿Qué Hacer?

1. **Espera** el tiempo indicado
2. **Observa** el contador regresivo
3. **Recibirás** una notificación de desbloqueo
4. **Intenta** nuevamente con las credenciales correctas

### Persistencia del Bloqueo

⚠️ **Importante:** 
- El bloqueo **persiste** incluso si cierras o recargas la página
- El tiempo se calcula correctamente al volver
- No puedes evadir el bloqueo limpiando el caché durante los 30 segundos

### Consejos de Seguridad:

✅ **Haz:**
- Usa contraseñas seguras
- Usa la recuperación de contraseña si olvidaste la tuya
- Verifica que estás ingresando el email correcto

❌ **Evita:**
- Intentar adivinar contraseñas repetidamente
- Compartir tus credenciales
- Usar contraseñas muy simples

---

## ❓ Preguntas Frecuentes

### 1. **¿Por qué mi cuenta está bloqueada?**
**R:** Después de 3 intentos fallidos de inicio de sesión, tu cuenta se bloquea temporalmente por 30 segundos como medida de seguridad.

### 2. **¿Cuánto dura el bloqueo?**
**R:** El bloqueo dura exactamente 30 segundos. Puedes ver el tiempo restante en pantalla.

### 3. **¿Puedo recuperar mi contraseña?**
**R:** Sí, usa el enlace "¿Olvidaste tu contraseña?" y sigue los 3 pasos del proceso de recuperación.

### 4. **¿El código de recuperación expira?**
**R:** Sí, el código es válido por 10 minutos. Si expira, deberás solicitar uno nuevo.

### 5. **¿Puedo ver mi contraseña mientras escribo?**
**R:** Sí, haz click en el icono del ojo (👁️) junto al campo de contraseña.

### 6. **¿Qué hago si no recuerdo mi email de registro?**
**R:** Contacta al administrador del sistema a través del enlace "Ayuda y Soporte" en el pie de página.

### 7. **¿Puedo cerrar el modal de recuperación?**
**R:** Sí, puedes:
- Click en la X
- Presionar Escape
- Click fuera del modal

### 8. **¿Por qué veo notificaciones?**
**R:** Las notificaciones te informan sobre el estado de tus acciones (éxito, error, advertencia, información).

### 9. **¿Cómo navego con el teclado?**
**R:** 
- **Tab:** Mover entre campos
- **Enter:** Enviar formulario
- **Escape:** Cerrar modal
- **Espacio:** Activar botones

### 10. **¿Es seguro el sistema?**
**R:** Sí, implementa:
- Bloqueo temporal
- Validación de contraseñas
- Recuperación segura
- Protección contra ataques de fuerza bruta

---

## 🎨 Características de Interfaz

### Colores y Significados:

| Color | Significado | Uso |
|-------|------------|-----|
| 🟢 Verde | Éxito | Campo válido, operación exitosa |
| 🔴 Rojo | Error | Campo inválido, error de autenticación |
| 🟡 Amarillo | Advertencia | Pocos intentos restantes, campos requeridos |
| 🔵 Azul | Información | Tooltips de ayuda, información general |
| ⚫ Gris | Deshabilitado | Campos bloqueados durante el bloqueo |

### Iconos Comunes:

| Icono | Significado |
|-------|------------|
| 👤 | Usuario |
| 🔒 | Contraseña |
| 👁️ | Mostrar/Ocultar |
| ❓ | Ayuda |
| ✅ | Correcto |
| ❌ | Incorrecto |
| 🔑 | Recuperación |
| ✉️ | Email |
| 🛡️ | Seguridad |
| ⏱️ | Tiempo |

---

## 📱 Uso en Diferentes Dispositivos

### 💻 **Desktop/Laptop:**
- Interfaz completa con todos los elementos visibles
- Notificaciones en esquina superior derecha
- Hover effects en botones y enlaces

### 📱 **Tablet:**
- Diseño adaptado con elementos ajustados
- Notificaciones en ancho completo
- Touch-friendly buttons

### 📲 **Móvil:**
- Diseño compacto optimizado
- Elementos más grandes para touch
- Notificaciones responsivas
- Teclado virtual se adapta automáticamente

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| **Tab** | Navegar entre campos |
| **Shift + Tab** | Navegar hacia atrás |
| **Enter** | Enviar formulario |
| **Escape** | Cerrar modal de recuperación |
| **Espacio** | Activar botón enfocado |

---

## 🔄 Flujos de Trabajo

### Flujo Normal:
```
Abrir App → Ingresar Credenciales → Click Login → Éxito → Dashboard
```

### Flujo con Error:
```
Ingresar Credenciales → Error → Ver Notificación → Corregir → Reintentar
```

### Flujo de Recuperación:
```
Click "¿Olvidaste?" → Ingresa Email → Código → Nueva Contraseña → Login
```

### Flujo de Bloqueo:
```
3 Intentos Fallidos → Bloqueo 30s → Esperar → Desbloqueo → Reintentar
```

---

## 💪 Mejores Prácticas

### ✅ Recomendaciones:

1. **Lee las ayudas contextuales** si tienes dudas
2. **Usa contraseñas seguras** (mínimo 6 caracteres)
3. **Verifica tus credenciales** antes de enviar
4. **No compartas** tu contraseña
5. **Usa la recuperación** si olvidaste tu contraseña
6. **Lee las notificaciones** para entender qué sucedió
7. **Espera pacientemente** durante el bloqueo

### ❌ Evita:

1. Intentar repetidamente con contraseñas incorrectas
2. Ignorar las validaciones
3. Cerrar el navegador durante la recuperación
4. Usar contraseñas muy simples como "123456"

---

## 🆘 Soporte

¿Necesitas ayuda adicional?

1. **Ayuda en línea:** Click en el **?** junto a cada campo
2. **Soporte técnico:** Enlace "Ayuda y Soporte" en el footer
3. **Documentación completa:** Ver archivo `MEJORAS_LOGIN.md`

---

## 📚 Recursos Adicionales

- **Política de Privacidad:** Ver en footer
- **Términos y Condiciones:** Ver en footer  
- **Documentación Técnica:** `MEJORAS_LOGIN.md`

---

**Última actualización:** Noviembre 2025  
**Versión del sistema:** 2.0  
**Desarrollado con ❤️ siguiendo principios de usabilidad**

---

## 🎓 Aprende Más

### Conceptos Aplicados:
- ✅ Accesibilidad (WCAG 2.1)
- ✅ Usabilidad (Nielsen's Heuristics)
- ✅ Seguridad (OWASP)
- ✅ UX/UI moderno
- ✅ Responsive Design

**¡Gracias por usar nuestro sistema!** 🚀
