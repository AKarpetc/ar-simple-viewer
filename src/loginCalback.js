import client from './modules/auth/OAuth2Clent';
import conf from '../src/config/config'

const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(
    document.location,
    {
        redirectUri: conf.cognito_redirectUrl,
    }
);


localStorage.setItem("arviewer.accessToken", JSON.stringify({
    value: oauth2Token.accessToken,
    expires: new Date(oauth2Token.expiresAt)
}));

localStorage.setItem("arviewer.refreshToken", JSON.stringify({
    value: oauth2Token.accessToken,
    expires: new Date(oauth2Token.refreshToken)
}));


document.location = document.location.origin;