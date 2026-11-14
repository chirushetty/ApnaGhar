using ApnaGhar.Api.Dtos;
using FluentValidation;

namespace ApnaGhar.Api.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120);
    }
}
