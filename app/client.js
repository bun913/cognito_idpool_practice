import AWS from 'aws-sdk';
import AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import dotenv from 'dotenv';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
dotenv.config();

AWS.config.region = 'ap-northeast-1';

class Auth {
  /**
   * @param  {string} userPoolId
   * @param  {string} clientId
   */
  constructor(userPoolId, clientId) {
    // UserPoolの設定
    const userPool = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    });
    this.userPool = userPool;
  }

  /**
   * ユーザープールへのログイン処理
   * @param  {string} userName
   * @param  {string} password
   */
  async login(userName, password) {
    const authData = {
      Username: userName,
      Password: password,
    };
    const authenticationDetails =
      new AmazonCognitoIdentity.AuthenticationDetails(authData);
    const userData = {
      Username: userName,
      Pool: this.userPool,
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (result) => {
          resolve(result);
        },
        onFailure: async (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * ユーザープールから取得したIDTokenのJwtを取得する
   * @param  {AmazonCognitoIdentity.CognitoUserSession} userPoolSession
   */
  getIdToken(userPoolSession) {
    const token = userPoolSession.getIdToken().getJwtToken();
    return token;
  }

  /**
   * getIdTokenで取得したToken情報からjwtTokenを取得
   * @param  {string} idTokenJwt
   */
  async getTempCredintials(idTokenJwt) {
    const idPoolEndpoint = `cognito-idp.ap-northeast-1.amazonaws.com/${process.env.USER_POOL_ID}`;
    const credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.ID_POOL_ID,
      Logins: {
        [idPoolEndpoint]: idTokenJwt,
      },
    });
    await credentials.getPromise();
    const credentialInfo = {};
    credentialInfo.AccessKeyID = credentials.accessKeyId;
    credentialInfo.SecretAccessKey = credentials.secretAccessKey;
    credentialInfo.SessionToken = credentials.sessionToken;
    return credentialInfo;
  }
}

class Dynamo {
  /**
   * @param  {object} tempCredentials
   */
  constructor(tempCredentials) {
    const client = new DynamoDBClient({
      accessKeyId: tempCredentials.AccessKeyID,
      secretAccessKey: tempCredentials.SecretAccessKey,
      region: 'ap-northeast-1',
    });
    this.client = client;
    this.tableName = process.env.DYNAMO_TABLE;
  }
  /**
   * DynamoDBのテーブルをScanする
   */
  async scan() {
    const params = {
      TableName: this.tableName,
    };
    try {
      const result = await this.client.send(new ScanCommand(params));
      return result;
    } catch (e) {
      console.log(e);
    }
  }
}

async function getTempCredintials() {
  const auth = new Auth(process.env.USER_POOL_ID, process.env.CLIENT_ID);
  const authResult = await auth.login(process.env.USER_NAME, process.env.PASS);
  const idToken = auth.getIdToken(authResult);
  const credentials = await auth.getTempCredintials(idToken);
  return credentials;
}

async function scanDynamo(tempCredentials) {
  const dynamo = new Dynamo(tempCredentials);
  const result = await dynamo.scan();
  return result.Items;
}

const credentials = await getTempCredintials();
const scanResult = await scanDynamo(credentials);
console.log(scanResult);
