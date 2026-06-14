using ApnaGhar.Api.Auth;
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Services;
using ApnaGhar.Api.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _service;
    private readonly ICurrentUser _currentUser;
    private readonly IImageStorage _imageStorage;

    public PropertiesController(IPropertyService service, ICurrentUser currentUser, IImageStorage imageStorage)
    {
        _service = service;
        _currentUser = currentUser;
        _imageStorage = imageStorage;
    }

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

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PropertyResponse>> Create(CreatePropertyRequest request, CancellationToken ct)
    {
        if (_currentUser.Id is not { } userId) return Unauthorized();
        var created = await _service.CreateAsync(request, userId, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<PropertyResponse>> Update(Guid id, UpdatePropertyRequest request, CancellationToken ct)
    {
        if (_currentUser.Id is not { } userId) return Unauthorized();
        var (outcome, property) = await _service.UpdateAsync(id, request, userId, ct);
        return outcome switch
        {
            WriteOutcome.Updated => Ok(property),
            WriteOutcome.NotFound => NotFound(),
            WriteOutcome.Forbidden => Forbid(),
            _ => BadRequest()
        };
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (_currentUser.Id is not { } userId) return Unauthorized();
        var outcome = await _service.DeleteAsync(id, userId, ct);
        return outcome switch
        {
            WriteOutcome.Deleted => NoContent(),
            WriteOutcome.NotFound => NotFound(),
            WriteOutcome.Forbidden => Forbid(),
            _ => BadRequest()
        };
    }

    private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/webp" };
    private const long MaxImageBytes = 5 * 1024 * 1024;

    [HttpPost("{id:guid}/images")]
    [Authorize]
    public async Task<ActionResult<PropertyResponse>> UploadImage(Guid id, IFormFile file, CancellationToken ct)
    {
        if (_currentUser.Id is not { } userId) return Unauthorized();
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });
        if (file.Length > MaxImageBytes) return BadRequest(new { message = "File too large (max 5MB)." });
        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Unsupported image type." });

        await using var stream = file.OpenReadStream();
        var url = await _imageStorage.SaveAsync(stream, file.FileName, ct);
        var (outcome, property) = await _service.AddImageAsync(id, url, userId, ct);
        return outcome switch
        {
            WriteOutcome.Updated => Ok(property),
            WriteOutcome.NotFound => NotFound(),
            WriteOutcome.Forbidden => Forbid(),
            _ => BadRequest()
        };
    }
}
