using OpenAI.Chat;
using System.Collections.Concurrent;

namespace AIStreaming
{
    public class GroupHistoryStore
    {
        private readonly ConcurrentDictionary<string, IList<ChatMessage>> _store = new();

        public IReadOnlyList<ChatMessage> GetOrAddGroupHistory(string groupName, string userName, string message)
        {
            var chatMessages = _store.GetOrAdd(groupName, _ => InitiateChatMessages());
            chatMessages.Add(new UserChatMessage(GenerateUserChatMessage(userName, message)));
            return chatMessages.AsReadOnly();
        }

        public void UpdateGroupHistoryForAssistant(string groupName, string message)
        {
            var chatMessages = _store.GetOrAdd(groupName, _ => InitiateChatMessages());
            chatMessages.Add(new AssistantChatMessage(message));
        }

        private IList<ChatMessage> InitiateChatMessages()
        {
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage("Sos un asistente amigable y conocedor que participa en una conversación grupal." +
                " Tu rol es brindar información útil, precisa y concisa cuando se te hable directamente." +
                " Mantené un tono respetuoso, asegurate de que tus respuestas sean claras y relevantes para la conversación en curso del grupo, y ayudá a facilitar discusiones productivas." +
                " Los mensajes de los usuarios estarán en el formato 'NombreUsuario: mensaje de chat'." +
                " Prestá atención al 'NombreUsuario' para entender quién está hablando y adaptá tus respuestas en consecuencia."),
            };
            return messages;
        }

        private string GenerateUserChatMessage(string userName, string message)
        {
            return $"{userName}: {message}";
        }
    }
}
