using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Iimst.Api.Data;
using Iimst.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<MongoDbService>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "IimstSecretKeyForJwtTokenGeneration2024!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "IimstApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "IimstPortal",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration["Cors:Origins"]?.Split(',') ?? new[] { "http://localhost:3000" })
            .AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

var db = app.Services.GetRequiredService<MongoDbService>();
await SeedData.InitializeAsync(db);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
