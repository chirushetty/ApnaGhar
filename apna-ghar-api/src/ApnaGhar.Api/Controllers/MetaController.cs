using ApnaGhar.Api.Data.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/meta")]
[AllowAnonymous]
public class MetaController : ControllerBase
{
    [HttpGet("amenities")]
    public ActionResult<IEnumerable<string>> Amenities() => Ok(ReferenceData.Amenities);

    [HttpGet("cities")]
    public ActionResult<IEnumerable<string>> Cities() => Ok(ReferenceData.PopularCities);
}
