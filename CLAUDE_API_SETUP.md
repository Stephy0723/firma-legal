# 🤖 Configuración del Asistente Legal IA con Claude API

## Pasos para activar el asistente legal con Claude:

### 1. Obtener API Key de Claude
1. Visita: https://console.anthropic.com
2. Inicia sesión o crea una cuenta
3. Ve a **API keys**
4. Haz clic en **Create Key**
5. Copia tu clave API

### 2. Configurar .env.local
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza `tu_api_key_claude_aqui` con tu clave real:

```
VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxx
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

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

✅ **Respuestas seguras**
- Siempre recomienda consultcon un abogado para asuntos graves
- Advierte sobre limitaciones
- No proporciona asesoramiento específico de casos reales

✅ **Interfaz fluida**
- Chat en tiempo real
- Escritura suave de respuestas
- Historial de conversación
- Minimizable y flotante

## 🔐 Seguridad

⚠️ **IMPORTANTE**: 
- **NUNCA** compartir tu API key en repositorios públicos
- El archivo `.env.local` está en `.gitignore` (no se sube a Git)
- Mantén tu key segura

## 💰 Costos

- Claude API es de pago por uso
- Aproximadamente $0.003 por 1K tokens (entrada)
- Consulta precios en: https://www.anthropic.com/pricing

## 🐛 Troubleshooting

### "API key no configurada"
→ Verifica que `.env.local` existe y tiene la key correcta

### "Error 401 Unauthorized"
→ Tu API key es inválida. Genera una nueva en console.anthropic.com

### "Error de conexión"
→ Verifica tu conexión a internet y que el servidor esté corriendo

### La respuesta es muy lenta
→ Es normal. Claude puede tardar 2-5 segundos en responder

## 📝 Customización

Puedes editar el `LEGAL_ASSISTANT_SYSTEM_PROMPT` en `src/services/claudeLegalAssistant.ts` para:
- Cambiar tono o estilo
- Agregar contexto específico
- Definir límites de respuesta
- Ajustar especialización

---

¿Preguntas? Revisa la documentación de Claude: https://docs.anthropic.com
