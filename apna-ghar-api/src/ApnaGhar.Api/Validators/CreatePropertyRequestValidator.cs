using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using FluentValidation;

namespace ApnaGhar.Api.Validators;

public class CreatePropertyRequestValidator : AbstractValidator<CreatePropertyRequest>
{
    public CreatePropertyRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.ListingType).Must(BeEnum<ListingType>).WithMessage("Invalid listing type.");
        RuleFor(x => x.PropertyType).Must(BeEnum<PropertyType>).WithMessage("Invalid property type.");
        RuleFor(x => x.OwnerType).Must(BeEnum<OwnerType>).WithMessage("Invalid owner type.");
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.AreaSqft).GreaterThan(0);
        RuleFor(x => x.Bedrooms).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Bathrooms).GreaterThanOrEqualTo(0);
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Locality).NotEmpty();
        RuleFor(x => x.State).NotEmpty();
        RuleFor(x => x.OwnerName).NotEmpty();
    }

    private static bool BeEnum<TEnum>(string value) where TEnum : struct =>
        Enum.TryParse<TEnum>(value, true, out _);
}
