# 🤖 Configuración del Asistente Legal IA con OpenAI (ChatGPT)

## Pasos para activar el asistente legal con OpenAI:

### 1. Obtener API Key de OpenAI
1. Visita: https://platform.openai.com/api-keys
2. Inicia sesión con tu cuenta de OpenAI
3. Si no tienes cuenta, crea una en https://platform.openai.com/signup
4. Ve a **API keys** en el menú lateral
5. Haz clic en **Create new secret key**
6. Copia tu clave API

### 2. Configurar .env.local
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza `sk-proj-xxxxxxxxxxxxxxxxxxxxxx` con tu clave real:

```
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-4o-mini
```

**Modelos disponibles:**
- `gpt-4o-mini` - Ligero y rápido (recomendado para el bot)
- `gpt-4o` - Más potente pero lento
- `gpt-4-turbo` - Balance entre velocidad y potencia
- `gpt-3.5-turbo` - Más barato pero menos preciso

3. Guarda el archivo

### 3. Reinicia el servidor
```bash
npm run dev
```

### 4. Prueba el asistente
1. Ve a `/admin`
2. Inicia sesión con:
   - Email: `admin@jrlinversiones.com`
   - Contraseña: `admin123`
3. Haz clic en el botón rojo de robot en la esquina inferior derecha
4. Envía una pregunta legal

## ✨ Características del Asistente

✅ **Respuestas especializadas en derecho**
- Derecho corporativo y empresarial
- Procedimientos legales
- Interpretación de leyes
- Asesoría jurídica
- Respuestas rápidas y precisas

✅ **Respuestas seguras**
- Siempre recomienda consulta con un abogado para asuntos graves
- Advierte sobre limitaciones
- No proporciona asesoramiento específico de casos reales

✅ **Interfaz fluida**
- Chat en tiempo real
- Respuestas instantáneas
- Historial de conversación
- Minimizable y flotante

## 🔐 Seguridad

⚠️ **IMPORTANTE**: 
- **NUNCA** compartir tu API key en repositorios públicos
- El archivo `.env.local` está en `.gitignore` (no se sube a Git)
- Mantén tu key segura
- Si accidentalmente subes tu key, desactívala inmediatamente en OpenAI

## 💰 Costos

**Precios de OpenAI (aproximados):**
- **gpt-4o-mini**: $0.15 por 1M tokens entrada / $0.60 por 1M salida
- **gpt-4o**: $5 por 1M tokens entrada / $15 por 1M salida

**Estimaciones:**
- Un mensaje típico de abogacía: ~300 tokens = $0.05 (con gpt-4o-mini)
- 100 preguntas al mes: ~$5

Consulta precios actuales en: https://openai.com/pricing

## 📋 Configurar Límite de Gastos (Recomendado)

1. Ve a https://platform.openai.com/account/billing/overview
2. Ve a **Usage limits**
3. Establece un límite de gastos mensual (ej: $10)
4. Activa las alertas

## 🐛 Troubleshooting

### "API key no configurada"
→ Verifica que `.env.local` existe y tiene la key correcta
→ Reinicia el servidor: `npm run dev`

### "Error 401 Unauthorized"
→ Tu API key es inválida o expirada. Genera una nueva en platform.openai.com

### "Error 429 - Rate limit exceeded"
→ Estás enviando demasiadas solicitudes. Espera un minuto e intenta de nuevo

### "Error de conexión"
→ Verifica tu conexión a internet
→ Verifica que el servidor está corriendo
→ Comprueba que no estés usando VPN (algunos restringen OpenAI)

### La respuesta es muy lenta
→ Prueba con `gpt-4o-mini` en lugar de `gpt-4o`
→ OpenAI puede estar lento. Intenta después

## 📝 Customización

Puedes editar el `LEGAL_ASSISTANT_SYSTEM_PROMPT` en `src/services/claudeLegalAssistant.ts` para:
- Cambiar tono o estilo
- Agregar contexto específico
- Definir límites de respuesta
- Ajustar especialización
- Cambiar idioma o nivel de formalidad

## 💡 Mejores Prácticas

✅ **Usar gpt-4o-mini para producción** - Excelente relación costo/calidad
✅ **Monitorear gastos** - Establece límites en OpenAI
✅ **Actualizar .env.local con frecuencia** - Mantén las keys seguras
✅ **Registrar intentos fallidos** - Ayuda con debugging

---

**¿Preguntas?**
- Documentación OpenAI: https://platform.openai.com/docs
- Modelos disponibles: https://platform.openai.com/docs/models
- Chat de soporte: https://help.openai.com
