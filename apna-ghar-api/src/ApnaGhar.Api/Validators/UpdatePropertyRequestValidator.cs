using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using FluentValidation;

namespace ApnaGhar.Api.Validators;

public class UpdatePropertyRequestValidator : AbstractValidator<UpdatePropertyRequest>
{
    public UpdatePropertyRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.ListingType).Must(v => Enum.TryParse<ListingType>(v, true, out _)).WithMessage("Invalid listing type.");
        RuleFor(x => x.PropertyType).Must(v => Enum.TryParse<PropertyType>(v, true, out _)).WithMessage("Invalid property type.");
        RuleFor(x => x.OwnerType).Must(v => Enum.TryParse<OwnerType>(v, true, out _)).WithMessage("Invalid owner type.");
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.AreaSqft).GreaterThan(0);
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Locality).NotEmpty();
        RuleFor(x => x.State).NotEmpty();
        RuleFor(x => x.OwnerName).NotEmpty();
    }
}
