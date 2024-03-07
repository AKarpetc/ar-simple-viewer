import client from '../modules/auth/OAuth2Clent';
import conf from '../config/config'

function getStorage(cookieName) {
  const storageValue = localStorage.getItem(cookieName);

  console.log(storageValue);
  if (storageValue != null) {
    var obj = JSON.parse(storageValue)

    if (new Date(obj.expires) > Date.now()) {
      return obj.value;
    }
  }

  return null;
}

var token = getStorage("arviewer.accessToken");
if (token == null) {
  // In a browser this might work as follows:
  document.location = await client.authorizationCode.getAuthorizeUri({
    // URL in the app that the user should get redirected to after authenticating
    redirectUri: conf.cognito_redirectUrl,
    scope: ['email', 'openid'],

  });

}
