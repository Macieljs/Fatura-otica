using Microsoft.Extensions.DependencyInjection;
using FaturaOtica.Application.Identity;
using FluentValidation;

namespace FaturaOtica.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IValidator<CreatePendingProfileCommand>, CreatePendingProfileValidator>();
        services.AddScoped<CreatePendingProfileHandler>();
        return services;
    }
}
