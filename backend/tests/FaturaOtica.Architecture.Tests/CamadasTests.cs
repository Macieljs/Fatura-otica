using AwesomeAssertions;
using NetArchTest.Rules;

namespace FaturaOtica.Architecture.Tests;

public sealed class CamadasTests
{
    private const string Domain = "FaturaOtica.Domain";
    private const string Application = "FaturaOtica.Application";
    private const string Infrastructure = "FaturaOtica.Infrastructure";
    private const string Api = "FaturaOtica.Api";

    [Fact]
    public void Domain_NaoDeveDependerDeNenhumaOutraCamadaOuFramework()
    {
        var resultado = Types.InAssembly(typeof(Domain.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(Application, Infrastructure, Api,
                "Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore", "Npgsql")
            .GetResult();

        resultado.IsSuccessful.Should().BeTrue(string.Join(", ", resultado.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_NaoDeveDependerDeInfrastructureNemApi()
    {
        var resultado = Types.InAssembly(typeof(Application.DependencyInjection).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(Infrastructure, Api, "Microsoft.EntityFrameworkCore", "Npgsql")
            .GetResult();

        resultado.IsSuccessful.Should().BeTrue(string.Join(", ", resultado.FailingTypeNames ?? []));
    }

    [Fact]
    public void Infrastructure_NaoDeveDependerDaApi()
    {
        var resultado = Types.InAssembly(typeof(Infrastructure.DependencyInjection).Assembly)
            .ShouldNot()
            .HaveDependencyOn(Api)
            .GetResult();

        resultado.IsSuccessful.Should().BeTrue(string.Join(", ", resultado.FailingTypeNames ?? []));
    }
}
