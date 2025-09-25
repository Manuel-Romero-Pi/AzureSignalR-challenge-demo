# AI Streaming Chat

Un chat grupal en tiempo real con integración de ChatGPT que permite a los usuarios comunicarse y hacer preguntas a la IA usando el comando `@gpt`.

## ¿Qué hace este proyecto?

- **Chat grupal**: Los usuarios pueden crear o unirse a grupos de chat
- **Tiempo real**: Mensajes instantáneos usando SignalR
- **IA integrada**: Usa `@gpt` para hacer preguntas a ChatGPT
- **Efecto de escritura**: Las respuestas de ChatGPT aparecen carácter por carácter
- **Nombres con colores**: Cada usuario tiene un color único

## Configuración necesaria

### 1. Azure OpenAI
Necesitas configurar tu endpoint y clave de Azure OpenAI en `appsettings.json`:

```json
{
  "OpenAI": {
    "Endpoint": "https://tu-servicio.openai.azure.com/",
    "key": "tu-clave-de-azure-openai",
    "Model": "gpt-4o"
  }
}
```
### 2. Azure SignalR Service
Configura tu ConnectionString en `appsettings.json`:

```json
{
  "Azure": {
    "SignalR": {
      "ConnectionString": "Endpoint=https://tu-servicio.service.signalr.net;AccessKey=tu-clave;Version=1.0;"
    }
  }
}
```

## Cómo levantar el proyecto

### Prerrequisitos
- [.NET 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)

### Pasos
1. **Clona o descarga el proyecto**
2. **Configura las claves** en `appsettings.json` (ver sección anterior)
3. **Ejecuta el proyecto**:
   ```bash
   dotnet run
   ```
4. **Abre tu navegador** en: `http://localhost:5000`

## Cómo funciona

### 1. Inicio
- Ingresa tu nombre
- Crea un nuevo grupo o únete a uno existente

### 2. Chat normal
- Escribe mensajes normalmente
- Los mensajes aparecen en tiempo real para todos los usuarios del grupo

### 3. Usar ChatGPT
- Escribe `@gpt` seguido de tu pregunta
- Ejemplo: `@gpt ¿Cuál es la capital de Francia?`
- La respuesta aparece con efecto de escritura carácter por carácter

## Solución de problemas

### Error 403 al acceder
- Verifica que el ConnectionString de SignalR esté correcto
- Asegúrate de tener permisos en Azure SignalR

### ChatGPT no responde
- Verifica que el endpoint y clave de Azure OpenAI sean correctos
- Confirma que el nombre del modelo coincida con tu deployment

### Mensajes no aparecen
- Revisa la consola del navegador (F12) para errores
- Verifica que estés conectado (debe aparecer "Connected" en verde)

## Notas adicionales

- El proyecto usa Azure SignalR para comunicación en tiempo real
- Las respuestas de ChatGPT se almacenan en el historial del grupo
- Cada grupo mantiene su propio historial de conversación