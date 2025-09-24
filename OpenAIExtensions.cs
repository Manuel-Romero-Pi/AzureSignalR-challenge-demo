using Azure.AI.OpenAI;
using Microsoft.Extensions.Options;
using OpenAI;
using System.ClientModel;

namespace AIStreaming
{
    public static class OpenAIExtensions
    {
        public static IServiceCollection AddAzureOpenAI(this IServiceCollection services, IConfiguration configuration)
        {
            return services
                .Configure<OpenAIOptions>(configuration.GetSection("OpenAI"))
                .AddSingleton<OpenAIClient>(provider =>
                {
                    var options = provider.GetRequiredService<IOptions<OpenAIOptions>>().Value;
                    return new AzureOpenAIClient(
                        new Uri(options.Endpoint ?? throw new InvalidOperationException("OpenAI Endpoint is required")), 
                        new ApiKeyCredential(options.Key ?? throw new InvalidOperationException("OpenAI Key is required"))
                    );
                });
        }

        public static IServiceCollection AddOpenAI(this IServiceCollection services, IConfiguration configuration)
        {
            return services
                .Configure<OpenAIOptions>(configuration.GetSection("OpenAI"))
                .AddSingleton<OpenAIClient>(provider =>
                {
                    var options = provider.GetRequiredService<IOptions<OpenAIOptions>>().Value;
                    return new OpenAIClient(new ApiKeyCredential(options.Key ?? throw new InvalidOperationException("OpenAI Key is required")));
                });
        }
    }
}
