using AIStreaming;
using AIStreaming.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddSignalR().AddAzureSignalR();
builder.Services.AddSingleton<GroupAccessor>()
    .AddSingleton<GroupHistoryStore>()
    .AddAzureOpenAI(builder.Configuration);

var app = builder.Build();

app.UseCors();
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.MapHub<GroupChatHub>("/groupChat");
app.Run();
