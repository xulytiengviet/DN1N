#!/usr/bin/env node
/**
 * Prepare DN1N's static browser application for Cloudflare Pages.
 * No remote dependencies or build-time access to user credentials.
 * Only the source needed to run the site is published.
 */
import {existsSync, mkdirSync, copyFileSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist');
const paths=[
  'index.html',
  'ai/engine.mjs',
  'ai/mcp.mjs',
  'ai/workbench.css',
  'ai/workbench.mjs',
  'ai/workspace.mjs'
];
rmSync(dist,{recursive:true,force:true});
mkdirSync(dist,{recursive:true});
for(const file of paths){
  const from=resolve(root,file),to=resolve(dist,file);
  assert.ok(existsSync(from),'Missing static asset: '+file);
  mkdirSync(dirname(to),{recursive:true});
  copyFileSync(from,to);
}
const html=readFileSync(resolve(dist,'index.html'),'utf8');
assert.match(html,/\.\/ai\/workbench\.mjs/);
assert.match(html,/\.\/ai\/workbench\.css/);
assert.ok(!html.includes('xulytiengviet.github.io/ai/'),'No hardcoded GitHub hosting in asset paths');
writeFileSync(resolve(dist,'_headers'),[
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  X-Frame-Options: DENY',
  "  Content-Security-Policy: object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  '  Cache-Control: no-cache',
  ''
].join('\n'));
writeFileSync(resolve(dist,'404.html'),'<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DN1N · 404</title><body style="font:16px system-ui;padding:4rem"><h1>Không tìm thấy trang</h1><p>DN1N · GIS / WebGIS / AI</p><a href="/">Trở về trang chính</a></body></html>');
console.log('DN1N Cloudflare Pages build succeeded: '+paths.length+' app files and _headers in dist/');
