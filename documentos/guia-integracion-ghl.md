# 🧬 Guía de Integración: CRM GoHighLevel (GHL) ↔ GENY LAB

Esta guía te indica cómo configurar la automatización en tu CRM para dar de alta usuarios de forma segura y permanente cuando se les aplique una etiqueta.

---

## Paso 1: Configurar el Workflow en GHL

1. Entra a tu cuenta de **GHL / LeadConnector**.
2. Ve a **Automation → Workflows** y haz clic en **Create Workflow** (o edita uno existente).
3. Agrega el **Trigger** (Disparador):
   * Selecciona: **Contact Tag** (Etiqueta de contacto).
   * Filtro: **Tag Added** (Etiqueta añadida) → Selecciona la etiqueta determinada que quieras usar (ejemplo: `GenyLab-Acceso` o similar).
4. Agrega una **Action** (Acción):
   * Selecciona: **Custom Webhook**.
   * Configura la acción con los siguientes datos:
     * **Method:** `POST`
     * **URL:** `https://tfwvvsvoimgnwjodfwlh.supabase.co/functions/v1/ghl-webhook?token=ghl_webhook_sec_8f93bead61f8a8470ac00`
     * **Cuerpo (JSON):**
       ```json
       {
         "name": "{{contact.name}}",
         "email": "{{contact.email}}",
         "phone": "{{contact.phone}}"
       }
       ```
5. Guarda y publica el Workflow.

---

## Paso 2: Configurar la Recepción del Enlace Mágico en GHL

Cuando la app procesa el webhook, registra al usuario en la base de datos, crea su cuenta de seguridad en la aplicación y genera un **Enlace de Acceso Permanente** (que nunca expira).

Luego, la app envía este enlace de vuelta a tu webhook receptor global de LeadConnector:
* **Webhook Receptor de Retorno:** `https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/9354f7a9-2c5f-4ad8-99b9-cd8714874ca5`

En tu workflow de GHL que recibe ese retorno (usualmente el que gestiona la entrega de accesos), mapea el campo recibido de la siguiente forma:
* Mapea el campo `magic_link_url` del webhook a tu custom field del contacto de GHL (ejemplo: `{{contact.magic_link_url}}` o el campo de enlace de login que uses).

---

## Paso 3: Envío del Enlace al Usuario

En tu automatización de GHL, ya puedes enviar este enlace al contacto de forma dinámica por **WhatsApp** o **Email**:

* **WhatsApp/Email Body (Ejemplo):**
  > ¡Hola, {{contact.first_name}}! Tu acceso permanente al Reto ya está listo.
  >
  > 👉 Haz clic aquí para entrar: **{{contact.magic_link_url}}**

---

## 🔒 Seguridad y Robustez del Enlace Permanente
* **Sin Expiración:** El enlace enviado al cliente es del tipo `https://genylab.ingresarios.net/acceso/[access_code]`. Este enlace es único y no expira.
* **Inicio de Sesión Automático:** Al hacer clic en este enlace, el navegador del usuario invoca una petición segura al backend, genera dinámicamente un token de sesión temporal de Supabase de un solo uso y lo loguea en la aplicación redirigiéndolo de inmediato al panel de `/app`.
* **Protección del Webhook:** El parámetro `?token=ghl_webhook_sec_8f93bead61f8a8470ac00` asegura que solo tus workflows autorizados de GHL puedan registrar nuevos usuarios.
