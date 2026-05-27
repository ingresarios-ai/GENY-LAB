# 📱 Plantillas de WhatsApp — Listas para GHL

> **Ruta en GHL:** Marketing → Templates → WhatsApp → Create Template
> 
> **Variables:** WhatsApp usa `{{1}}`, `{{2}}`, etc. En GHL al crear el template mapeas cada variable al custom field correspondiente.

---

## Cómo crear cada plantilla en GHL

1. Ve a **Marketing → Templates → WhatsApp**
2. Click **Create Template**
3. Copia el **Template Name** (no se puede cambiar después)
4. Selecciona la **Categoría** indicada
5. Pega el **Cuerpo** del mensaje
6. Añade las **variables de ejemplo** que Meta requiere para aprobar
7. Submit para aprobación

> [!IMPORTANT]
> Meta tarda entre 1 minuto y 24 horas en aprobar plantillas de tipo **UTILITY**.  
> Las de **MARKETING** pueden tardar hasta 48 horas.

---

## FASE 0: BIENVENIDA

---

### Template 1 — Bienvenida Inmediata

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_bienvenida` |
| **Categoría** | UTILITY |
| **Trigger** | Al inscribirse o hacer primer login |
| **Variables** | `{{1}}` = Nombre del contacto |

**Cuerpo:**
```
¡Bienvenid@ a GENY LAB, {{1}}! 🧬

Tu acceso al Reto ya está activo.

Esto es lo que te espera:
→ 7 actividades interactivas
→ Tu Radiografía Financiera completa
→ 1 Sesión Diagnóstico privada 1-a-1 (valor $1,000 USD) — GRATIS al completar todo

⚡ Tu primera misión ya te está esperando.

👉 https://genylab.ingresarios.net/app

No lo dejes para después. El 95% nunca empieza. Tú ya estás aquí.
```

**Ejemplo de variable para Meta:**  
`{{1}}` → `Josue`

---

### Template 2 — Empujón 4 horas

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_empujon_inicio` |
| **Categoría** | MARKETING |
| **Trigger** | 4h después de inscripción, SI no ha completado ninguna actividad |
| **Variables** | `{{1}}` = Nombre del contacto |

**Cuerpo:**
```
{{1}}, tu Reto ya está listo y no has empezado 👀

La primera actividad toma menos de 5 minutos y te va a revelar algo que la mayoría de traders ignora sobre sí mismos.

🧬 Descubre tu ADN Financiero →
https://genylab.ingresarios.net/app

Recuerda: al completar las 7 actividades desbloqueas tu Sesión Diagnóstico privada de $1,000 USD — incluida GRATIS en tu acceso.
```

**Ejemplo:** `{{1}}` → `Josue`

---

## FASE 1: PROGRESO POR ACTIVIDAD

---

### Template 3 — ADN Financiero completado 🧬

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_adn_completado` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `activity.id = adn` |
| **Variables** | `{{1}}` = Nombre, `{{2}}` = Arquetipo (`key_metrics.arquetipo`) |

**Cuerpo:**
```
🧬 Tu ADN Financiero ha sido revelado, {{1}}.

Tu arquetipo: {{2}}

Este perfil define cómo tomas decisiones con el dinero. Guárdalo bien — lo vamos a usar en tu Sesión Diagnóstico.

⏭️ Siguiente misión: Gastos Hormiga 🐜
Descubre cuánto dinero pierdes al año sin darte cuenta.

👉 https://genylab.ingresarios.net/app

Progreso: ██░░░░░ 1/7
```

**Ejemplo:** `{{1}}` → `Josue`, `{{2}}` → `Inversionista Estratégico`

---

### Template 4 — Gastos Hormiga completado 🐜

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_gastos_completado` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `activity.id = gastos` |
| **Variables** | `{{1}}` = Nombre, `{{2}}` = Fuga mensual (`key_metrics.fuga_mensual`), `{{3}}` = Fuga anual (`key_metrics.fuga_anual`) |

**Cuerpo:**
```
🐜 Actividad completada: Gastos Hormiga

{{1}}, acabas de descubrir que estás perdiendo ${{2}} al mes en fugas invisibles.

Eso es más de ${{3}} al año que podrías estar invirtiendo.

La buena noticia: ahora lo sabes.

⏭️ Siguiente: Termostato Financiero 🌡️

👉 https://genylab.ingresarios.net/app

Progreso: ████░░░ 2/7
```

**Ejemplo:** `{{1}}` → `Josue`, `{{2}}` → `350`, `{{3}}` → `4200`

---

### Template 5 — Termostato Financiero completado 🌡️

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_termostato_completado` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `activity.id = termostato` |
| **Variables** | `{{1}}` = Nombre, `{{2}}` = Puntaje (`key_metrics.puntaje_termostato`) |

**Cuerpo:**
```
🌡️ Tu Termostato Financiero: {{2}}°

{{1}}, este número define el techo invisible que tu mente le pone a tus ingresos.

El termostato se puede recalibrar. Pero primero hay que verlo.

Ya llevas 3 de 7 actividades. Mitad del camino.

⏭️ Siguiente: Trampas del Dinero 🧠

👉 https://genylab.ingresarios.net/app

Progreso: █████░░ 3/7
```

**Ejemplo:** `{{1}}` → `Josue`, `{{2}}` → `42`

---

### Template 6 — Trampas del Dinero completado 🧠

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_trampas_completado` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `activity.id = trampas` |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
🧠 Trampas del Dinero — completado.

{{1}}, ya identificaste los sesgos que sabotean tus decisiones financieras.

La mayoría de los traders operan en piloto automático sin saber que su cerebro los engaña. Tú ya no.

Ahora entramos a la Fase 2: Dominio.

⏭️ Siguiente: Mi Primer PEDEM 📋
El framework de planificación de los traders consistentes.

👉 https://genylab.ingresarios.net/app

Progreso: ██████░ 4/7
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 7 — Mi Primer PEDEM completado 📋

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_pedem_completado` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `activity.id = pedem` |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
📋 PEDEM construido.

{{1}}, acabas de crear tu Plan Estratégico de Dinero personal.

Metas, deudas priorizadas, ingresos y egresos — todo estructurado. Ya tienes más claridad financiera que el 95% de las personas.

⏭️ Siguiente: Mis Emociones 🤯
El mayor obstáculo no es la estrategia — son tus emociones.

👉 https://genylab.ingresarios.net/app

Progreso: ███████ 5/7 — ¡Casi llegas!
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 8 — Mis Emociones completado 🤯

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_sombra_completado` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `activity.id = sombra` |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
🤯 Tu Sombra Financiera ha sido revelada.

{{1}}, enfrentaste lo que la mayoría evita: tus patrones emocionales con el dinero.

⏭️ ÚLTIMA MISIÓN: Reto del Flow ⚡

Completar esta actividad desbloquea tu Sesión Diagnóstico privada 1-a-1 (valor $1,000 USD).

👉 https://genylab.ingresarios.net/app

Progreso: ████████ 6/7 — ¡UNA MÁS!
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 9 — ALL COMPLETED 🏆

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_all_completed` |
| **Categoría** | UTILITY |
| **Trigger** | Webhook `event = all_completed` |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
🏆 ¡LO LOGRASTE, {{1}}!

Has completado las 7 actividades del Reto GENY LAB.

Eres parte del 5% de los traders que realmente hacen el trabajo.

🎁 Tu recompensa está desbloqueada:
→ Sesión Diagnóstico privada 1-a-1
→ Valor: $1,000 USD — INCLUIDA GRATIS
→ Plan de acción personalizado

📅 AGÉNDALA AHORA:
👉 https://genylab.ingresarios.net/app/diagnostico

Los espacios son limitados. No lo dejes para después.
```

**Ejemplo:** `{{1}}` → `Josue`

---

## FASE 2: RECORDATORIOS DE INACTIVIDAD

---

### Template 10 — 24h sin avanzar

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_recordatorio_24h` |
| **Categoría** | MARKETING |
| **Trigger** | 24h después de última actividad, SI no avanzó |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, ayer le diste duro al Reto y avanzaste increíble 💪

Hoy tu siguiente actividad te está esperando. Son menos de 10 minutos.

Recuerda: al completar las 7 desbloqueas tu Sesión Diagnóstico de $1,000 USD.

👉 https://genylab.ingresarios.net/app

El momentum importa. No lo pierdas.
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 11 — 3 días sin avanzar

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_recordatorio_3d` |
| **Categoría** | MARKETING |
| **Trigger** | 72h de inactividad |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, llevas 3 días sin entrar al Reto 👀

Tu progreso está guardado. No tienes que empezar de cero.

La siguiente actividad toma menos de 10 minutos.

👉 https://genylab.ingresarios.net/app

¿Qué le dirías a tu yo del futuro si hoy decides no continuar?
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 12 — 7 días sin avanzar

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_recordatorio_7d` |
| **Categoría** | MARKETING |
| **Trigger** | 7 días de inactividad |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, hace una semana que no entras al Reto.

La Sesión Diagnóstico 1-a-1 (valor $1,000 USD) está incluida GRATIS. Pero solo la desbloqueas al completar las 7 actividades.

Tu progreso sigue ahí. Solo necesitas 30 minutos para terminar.

👉 https://genylab.ingresarios.net/app

¿Vas a dejar pasar esto?
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 13 — 14 días (último intento)

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_recordatorio_14d` |
| **Categoría** | MARKETING |
| **Trigger** | 14 días de inactividad |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, este es mi último mensaje sobre el Reto.

Tienes acceso a una herramienta que reveló tu ADN financiero, tus fugas de dinero y tu termostato de riqueza.

Y al final: una Sesión Diagnóstico privada de $1,000 USD. Incluida. Gratis.

Solo tienes que terminar.

👉 https://genylab.ingresarios.net/app

Si decides no continuar, lo respeto. Pero no quiero que sea porque se te olvidó.
```

**Ejemplo:** `{{1}}` → `Josue`

---

## FASE 3: POST-COMPLETADO

---

### Template 14 — Recordatorio de agendar (24h después)

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_agendar_sesion` |
| **Categoría** | UTILITY |
| **Trigger** | 24h después de `all_completed`, SI no ha agendado |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, completaste las 7 actividades pero aún no has agendado tu Sesión Diagnóstico 🏆

Los espacios se llenan rápido. Asegura el tuyo:

📅 https://genylab.ingresarios.net/app/diagnostico

Un experto analiza tu radiografía completa y te da un plan de acción personalizado. Es como tener un estratega financiero privado por 45 minutos.

No dejes pasar esto.
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 15 — Sesión en vivo (sábados)

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_sesion_en_vivo` |
| **Categoría** | MARKETING |
| **Trigger** | Viernes por la tarde (recurrente semanal) |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, mañana sábado a las 11am (hora Colombia) tenemos Sesión en Vivo 🔴

Es tu espacio para resolver dudas y calibrar tu termostato financiero en grupo.

🔗 Únete aquí:
https://us06web.zoom.us/meeting/register/FLIyJ1NiSEuu-bDPXHSzHg

🔑 Si te pide clave: 612978

Te esperamos.
```

**Ejemplo:** `{{1}}` → `Josue`

---

### Template 16 — Invitación a Geny Opciones

| Campo | Valor |
|---|---|
| **Template Name** | `genylab_geny_opciones` |
| **Categoría** | MARKETING |
| **Trigger** | 48h después de `all_completed` |
| **Variables** | `{{1}}` = Nombre |

**Cuerpo:**
```
{{1}}, ya desbloqueaste tu Sesión Diagnóstico. ¿Quieres ir un paso más allá?

En Geny Opciones tienes un simulador con:
→ 11 lecciones paso a paso
→ Cadena de opciones en tiempo real
→ Coach con IA que te guía
→ Misiones y XP

👉 https://genylab.ingresarios.net/app/geny-opciones

100% seguro. $0 de riesgo real. Todo el aprendizaje.
```

**Ejemplo:** `{{1}}` → `Josue`

---

## Resumen de Templates

| # | Nombre | Categoría | Variables | Trigger |
|---|---|---|---|---|
| 1 | `genylab_bienvenida` | UTILITY | nombre | Inscripción |
| 2 | `genylab_empujon_inicio` | MARKETING | nombre | 4h sin actividad |
| 3 | `genylab_adn_completado` | UTILITY | nombre, arquetipo | Webhook `adn` |
| 4 | `genylab_gastos_completado` | UTILITY | nombre, fuga_mensual, fuga_anual | Webhook `gastos` |
| 5 | `genylab_termostato_completado` | UTILITY | nombre, puntaje | Webhook `termostato` |
| 6 | `genylab_trampas_completado` | UTILITY | nombre | Webhook `trampas` |
| 7 | `genylab_pedem_completado` | UTILITY | nombre | Webhook `pedem` |
| 8 | `genylab_sombra_completado` | UTILITY | nombre | Webhook `sombra` |
| 9 | `genylab_all_completed` | UTILITY | nombre | Webhook `all_completed` |
| 10 | `genylab_recordatorio_24h` | MARKETING | nombre | 24h inactividad |
| 11 | `genylab_recordatorio_3d` | MARKETING | nombre | 3 días inactividad |
| 12 | `genylab_recordatorio_7d` | MARKETING | nombre | 7 días inactividad |
| 13 | `genylab_recordatorio_14d` | MARKETING | nombre | 14 días inactividad |
| 14 | `genylab_agendar_sesion` | UTILITY | nombre | 24h post all_completed |
| 15 | `genylab_sesion_en_vivo` | MARKETING | nombre | Viernes recurrente |
| 16 | `genylab_geny_opciones` | MARKETING | nombre | 48h post all_completed |
