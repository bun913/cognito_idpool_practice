# CognitoによるDynamoDBへのアクセス制限

Cognitoのユーザープールの機能を利用して、ユーザーがログインできるようにする。

また、IDプールの機能により認可を導入して、DynamoDBへのアクセスを制限する

![構成図](/infra/docs/images/system_configuration.png)

今回すること

- Terraformでユーザープール・IDプールのリソースを追加
- ログインした後のユーザーがDynamoDBにアクセスできることを確認(AWS CLIによる確認)
- JavaScriptを使ってDynamoDBにアクセスできることを確認

## AWS CLIによる認可の確認

- まずAWSマネジメントコンソールからユーザーを作成する
- 次にホストされたUIからログインを試す
- ログイン後パスワードの初回変更を行う

ホストされたUIの確認手順はこちらを参照

https://zenn.dev/bun913/articles/cognito-google-auth#%E3%83%9B%E3%82%B9%E3%83%88%E3%81%95%E3%82%8C%E3%81%9Fui%E3%81%8B%E3%82%89%E7%A2%BA%E8%AA%8D

- AWSマネジメントコンソールで作成したユーザーの確認ステータスが `確認済み` になっていればOK

### 認証済みユーザーの認可確認

```bash
# ユーザー認証・Accessトークンの取得
aws cognito-idp admin-initiate-auth \
--user-pool-id ap-northeast-1_xxxxx \
--client-id xxxxx \
--auth-flow ADMIN_USER_PASSWORD_AUTH \
--region ap-northeast-1 \
--auth-parameters USERNAME=bun,PASSWORD=xxxxx \
--query 'AuthenticationResult.IdToken'

# 取得したIDトークンからIdentity IDを取得
aws cognito-identity get-id \
--account-id XXXXXXXXXXXX \
--region ap-northeast-1 \
--identity-pool-id ap-northeast-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
--logins cognito-idp.ap-northeast-1.amazonaws.com/ユーザープールID=IDトークン \
--query 'IdentityId'

# IdentifyIDからCredintialsを取得
aws cognito-identity get-credentials-for-identity \
--region ap-northeast-1 \
--identity-id ap-northeast-1:xxxxx \
--logins cognito-idp.ap-northeast-1.amazonaws.com/ユーザープールID=IDトークン

# Credintlasで返却されたAccessKeyIdとSecretAccesKeyとSecurityTokenを利用してDynamoDBにアクセスしてみる
AWS_ACCESS_KEY_ID=xxxxx \
AWS_SECRET_ACCESS_KEY=xxxxx \
AWS_SECURITY_TOKEN=xxxxx \
aws dynamodb scan --region ap-norhteast-1 --table-name idpool-practice-dev-Score
```

以下のようにDynamoDBにアクセスできていればOK

```
{
    "Items": [],
    "Count": 0,
    "ScannedCount": 0,
    "ConsumedCapacity": null
}
```
