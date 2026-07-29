// 直接调腾讯云 SCF UpdateFunctionCode（TC3-HMAC-SHA256 签名），
// 用本地打好的 scf-deploy.zip（含 scf_bootstrap 执行权限位）更新函数代码。
// 凭证读自 CloudBase CLI 本地登录文件（~/.config/.cloudbase/auth.json），不经过对话。
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const authPath = path.join(os.homedir(), '.config', '.cloudbase', 'auth.json');
const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const { secretId, secretKey } = auth.credential;
if (!secretId || !secretKey) { console.error('no credential in auth.json'); process.exit(1); }

// 二选一：ZipFile 直传（小包）或 COS 中转（大包）
const useCos = process.argv.includes('--cos');
const payload = useCos
  ? JSON.stringify({
      FunctionName: 'yxyy-api',
      Namespace: 'happyenglish-d1gda90e97d02a8c6',
      CosBucketName: 'happyenglish-d1gda90e97d02a8c6-1428246333',
      CosObjectName: '/scf-tmp/scf-deploy.zip',
      CosBucketRegion: 'ap-shanghai',
    })
  : JSON.stringify({
      FunctionName: 'yxyy-api',
      Namespace: 'happyenglish-d1gda90e97d02a8c6',
      ZipFile: fs.readFileSync(path.join(__dirname, '..', 'scf-deploy.zip')).toString('base64'),
    });

const service = 'scf';
const host = 'scf.tencentcloudapi.com';
const region = 'ap-shanghai';
const action = 'UpdateFunctionCode';
const version = '2018-04-16';
const algorithm = 'TC3-HMAC-SHA256';
const timestamp = Math.floor(Date.now() / 1000);
const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

const sha256hex = (d) => crypto.createHash('sha256').update(d).digest('hex');
const hmac = (k, d) => crypto.createHmac('sha256', k).update(d).digest();

const canonicalRequest = [
  'POST', '/', '',
  'content-type:application/json; charset=utf-8',
  'host:' + host,
  'x-tc-action:' + action.toLowerCase(),
  '',
  'content-type;host;x-tc-action',
  sha256hex(payload),
].join('\n');
const credentialScope = `${date}/${service}/tc3_request`;
const stringToSign = [algorithm, timestamp, credentialScope, sha256hex(canonicalRequest)].join('\n');
const kDate = hmac('TC3' + secretKey, date);
const kService = hmac(kDate, service);
const kSigning = hmac(kService, 'tc3_request');
const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host;x-tc-action, Signature=${signature}`;

const req = https.request(
  {
    hostname: host,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Host: host,
      'X-TC-Action': action,
      'X-TC-Version': version,
      'X-TC-Region': region,
      'X-TC-Timestamp': String(timestamp),
      Authorization: authorization,
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => console.log('status:', res.statusCode, '\nbody:', data.slice(0, 1000)));
  }
);
req.on('error', (e) => console.error('request error:', e.message));
req.write(payload);
req.end();
