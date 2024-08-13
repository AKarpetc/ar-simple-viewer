namespace BackgroundSupportApi.Models
{
    public class AppSettings
    {
        public SmtpInfo Smtp { get; set; }
    }

    public class SmtpInfo
    {
        public string Login { get; set; }
        public string Password { get; set; }
    }
}
