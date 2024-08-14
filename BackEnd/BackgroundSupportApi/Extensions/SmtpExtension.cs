using BackgroundSupportApi.Models;
using MimeKit;

namespace BackgroundSupportApi.Extensions
{
    public static class SmtpExtension
    {
        public static MimeMessage Enrich(this MimeMessage mimeMessage, string toEmail)
        {
            mimeMessage.From.Add(new MailboxAddress("info@art-vision-tech.ru", toEmail));
            mimeMessage.To.Add(new MailboxAddress("Уважаемый!", toEmail));
            return mimeMessage;
        }

        public static string GetSubjectDescription(this SubjectType subjectType) =>
            subjectType switch
            {
                SubjectType.Lite => "Подписка Lite",
                SubjectType.Pro => "Подписка Pro",
                SubjectType.CallBack => "Обратная связь",
                _ => "Тема не распознана",
            };

        public static string CreateHtmlBody(this MessageDto messageDto) =>
            "Заявка с сайта.<br />" +
            $"Почта клиента: {messageDto.Email}<br />" +
            $"Отправлено: {DateTime.UtcNow} в UTC<br />" +
            $"Дополнительный текст: {messageDto.OtherText}";
    }
}
