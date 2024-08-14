namespace BackgroundSupportApi.Models
{
    public class MessageDto
    {
        public string Email { get; set; }
        public SubjectType Subject { get; set; }
        public string? OtherText { get; set; }
    }

    public enum SubjectType
    {
        Lite,
        Pro,
        CallBack
    }
}
