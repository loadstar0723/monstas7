import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 모든 스크립트보다 먼저 실행되는 안전 숫자 처리 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var originalToFixed = Number.prototype.toFixed;
              Number.prototype.toFixed = function(fractionDigits) {
                try {
                  if (this == null || this == undefined || isNaN(Number(this))) {
                    return '0';
                  }
                  return originalToFixed.call(Number(this), fractionDigits);
                } catch (e) {
                  return '0';
                }
              };
              })();
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}