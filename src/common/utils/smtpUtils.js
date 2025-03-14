import conf from "../../config/config.js"

async function send(userInput, subject) {
    const httpOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': conf.smtpSecretAccessKey
        }
    };
    const body = {
        from: 'info@art-vision-tech.ru',
        subject: subject,
        to: 'lyubitelev@hotmail.com',
        html: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Заказ</title>
        </head>
        <body>
          <p>Хочет получить информацию</p>
          <p><pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${JSON.stringify(userInput, null, 2)}</pre></p>
        </body>
        </html>`
    }
    return fetch(`${conf.smtpApiUrl}/v1/smtp/send`, {
        method: 'POST',
        headers: httpOptions.headers,
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(_ => _)
        .catch(error => {
            throw error;
        });
}

export default {
    send,
};