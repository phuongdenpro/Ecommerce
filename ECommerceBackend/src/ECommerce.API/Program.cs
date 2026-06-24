using ECommerce.API.Extensions;
using ECommerce.API.Middleware;
using ECommerce.Application;
using ECommerce.Infrastructure;
using ECommerce.Infrastructure.Persistence.Seed;
using FluentValidation.AspNetCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://192.168.1.252:3000", "http://172.18.240.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "E-Commerce API v1"));
}


app.UseHttpsRedirection();
app.UseStaticFiles();


app.UseCors("AllowNextJs");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

//await DatabaseSeeder.SeedAsync(app.Services);
try
{
    await DatabaseSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    Console.WriteLine("Database seed failed:");
    Console.WriteLine(ex.Message);
    Console.WriteLine(ex.ToString());
}


app.Run();
