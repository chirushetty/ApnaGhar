using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _service;
    public PropertiesController(IPropertyService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PropertyListResponse>> List(
        [FromQuery] PropertyQuery query, CancellationToken ct) =>
        Ok(await _service.ListAsync(query, ct));

    [HttpGet("featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PropertyResponse>>> Featured(CancellationToken ct) =>
        Ok(await _service.GetFeaturedAsync(ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<PropertyResponse>> GetById(Guid id, CancellationToken ct)
    {
        var p = await _service.GetAsync(id, ct);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("{id:guid}/similar")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PropertyResponse>>> Similar(Guid id, CancellationToken ct) =>
        Ok(await _service.GetSimilarAsync(id, ct));
}
