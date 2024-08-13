import conf from "../../config/config.js"

async function send(userInput, subj, value) {
    console.log(conf)
    return fetch(conf.smtpApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: userInput,
            subject: subj,
            otherText: value
        })
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