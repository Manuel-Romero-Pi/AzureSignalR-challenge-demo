using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using OpenAI;
using System.Text;

namespace AIStreaming.Hubs
{
    public class GroupChatHub : Hub
    {
        private readonly GroupAccessor _groupAccessor;
        private readonly GroupHistoryStore _history;
        private readonly OpenAIClient _openAI;
        private readonly OpenAIOptions _options;

        public GroupChatHub(GroupAccessor groupAccessor, GroupHistoryStore history, OpenAIClient openAI, IOptions<OpenAIOptions> options)
        {
            _groupAccessor = groupAccessor ?? throw new ArgumentNullException(nameof(groupAccessor));
            _history = history ?? throw new ArgumentNullException(nameof(history));
            _openAI = openAI ?? throw new ArgumentNullException(nameof(openAI));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _groupAccessor.Join(Context.ConnectionId, groupName);
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            _groupAccessor.Leave(Context.ConnectionId);
            return Task.CompletedTask;
        }

        public async Task Chat(string userName, string message)
        {
            if (!_groupAccessor.TryGetGroup(Context.ConnectionId, out var groupName))
            {
                throw new InvalidOperationException("Not in a group.");
            }

            if (message.StartsWith("@gpt"))
            {
                var id = Guid.NewGuid().ToString();
                var actualMessage = message.Substring(4).Trim();
                var messagesIncludeHistory = _history.GetOrAddGroupHistory(groupName ?? throw new InvalidOperationException("Group name is required"), userName, actualMessage);
                await Clients.OthersInGroup(groupName).SendAsync("newMessage", userName, message);

                var chatClient = _openAI.GetChatClient(_options.Model);
                var totalCompletion = new StringBuilder();
                
                await foreach (var completion in chatClient.CompleteChatStreamingAsync(messagesIncludeHistory))
                {
                    foreach (var content in completion.ContentUpdate)
                    {
                        totalCompletion.Append(content);
                    }
                }
                
                // Send complete message for typewriter effect
                await Clients.Group(groupName).SendAsync("newMessageWithId", "ChatGPT", id, totalCompletion.ToString());
                _history.UpdateGroupHistoryForAssistant(groupName, totalCompletion.ToString());
            }
            else
            {
                _history.GetOrAddGroupHistory(groupName ?? throw new InvalidOperationException("Group name is required"), userName, message);
                await Clients.OthersInGroup(groupName).SendAsync("newMessage", userName, message);
            }
        }
    }
}
