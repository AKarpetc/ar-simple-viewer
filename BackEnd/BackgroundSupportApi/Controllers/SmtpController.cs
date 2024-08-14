using BackgroundSupportApi.Models;
using BackgroundSupportApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackgroundSupportApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SmtpController : ControllerBase
    {
        private readonly ISmtpService _smtpService;

        public SmtpController(ISmtpService smtpService)
        {
            _smtpService = smtpService;
        }

        [HttpPost(nameof(SendMessage))]
        public async Task<OkObjectResult> SendMessage([FromBody] MessageDto messageDto, CancellationToken cancellationToken) =>
            Ok(await _smtpService.SendMessageAsync(messageDto, cancellationToken));
    }
}
