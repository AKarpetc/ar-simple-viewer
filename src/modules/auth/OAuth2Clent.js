import { OAuth2Client } from '@badgateway/oauth2-client';
import conf from '../../config/config'



const client = new OAuth2Client({

    // The base URI of your OAuth2 server
    server: conf.cognito_server,

    // OAuth2 client id
    clientId: conf.cognito_clietn_id,


    // Token endpoint. Most flows need this.
    // If not specified we'll use the information for the discovery document
    // first, and otherwise default to /token
    tokenEndpoint: conf.cognito_tokenEndpoint,

    // Authorization endpoint.
    //
    // You only need this to generate URLs for authorization_code flows.
    // If not specified we'll use the information for the discovery document
    // first, and otherwise default to /authorize
    authorizationEndpoint: conf.cognito_authorizationEndpoint,

    // OAuth2 Metadata discovery endpoint.
    //
    // This document is used to determine various server features.
    // If not specified, we assume it's on /.well-known/oauth2-authorization-server
    discoveryEndpoint: conf.cognito_discoveryEndpoint,

    grant_type: "authorization_code"

});

export default client;