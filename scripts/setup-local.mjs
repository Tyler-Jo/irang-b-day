import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (!existsSync('.dev.vars')) {
  writeFileSync('.dev.vars', `ADMIN_KEY=${randomBytes(18).toString('base64url')}\n`, {mode:0o600});
  console.log('관리자 비밀번호를 .dev.vars에 생성했습니다.');
} else console.log('기존 .dev.vars를 유지합니다.');
